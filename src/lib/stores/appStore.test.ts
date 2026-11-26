import { beforeEach, describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import {
  addPointInput,
  applyPointPreset,
  applyScenario,
  buildSharePayload,
  defaultPoints,
  deleteScenario,
  encodeSharePayload,
  generateShareUrl,
  getPrimaryShadeColor,
  loadStateFromUrl,
  pointsInputStore,
  removePointInput,
  saveScenario,
  savedScenariosStore,
  setSaturationPoint,
  setUnitSystem,
  settingsStore,
  updatePointInput,
  type SharePayload
} from './appStore';

const SI = { unitSystem: 'SI' as const, elevation: 0, pressure: 101.325 };
const IP = { unitSystem: 'IP' as const, elevation: 0, pressure: 14.696 };

beforeEach(() => {
  settingsStore.set(SI);
  pointsInputStore.set(defaultPoints);
  savedScenariosStore.set([]);
});

describe('state colours', () => {
  it('gives the first twelve states distinct, stable colours', () => {
    const palette = Array.from({ length: 12 }, (_, i) => getPrimaryShadeColor(i));
    expect(new Set(palette).size).toBe(12);
    expect(palette[0]).toBe('#3b82f6');
    expect(getPrimaryShadeColor(3)).toBe(getPrimaryShadeColor(3));
  });

  it('falls back to deterministic hsl beyond the palette', () => {
    expect(getPrimaryShadeColor(12)).toMatch(/^hsl\(\d{3}, 85%, \d+%\)$/);
    expect(getPrimaryShadeColor(12)).toBe(getPrimaryShadeColor(12));
    expect(getPrimaryShadeColor(12)).not.toBe(getPrimaryShadeColor(13));
  });
});

describe('share payloads', () => {
  it('round-trips settings and points through the URL encoding', () => {
    const payload: SharePayload = {
      u: 'IP',
      elev: 350,
      press: 14.696,
      pts: [
        { id: 'A', n: 'Outdoor', t1: 'DBT', v1: 95, t2: 'RH', v2: 40 },
        { t1: 'DBT', v1: 59, t2: 'WBT', v2: 55 }
      ]
    };

    expect(loadStateFromUrl(new URLSearchParams({ share: encodeSharePayload(payload) }))).toBe(true);

    expect(get(settingsStore)).toMatchObject({ unitSystem: 'IP', elevation: 350, pressure: 14.696 });
    const points = get(pointsInputStore);
    expect(points).toHaveLength(2);
    expect(points[0]).toMatchObject({ id: 'A', name: 'Outdoor', type1: 'DBT', val1: 95, type2: 'RH', val2: 40 });
    expect(points[1].id).toBe('P2'); // unnamed points get positional ids
  });

  it('ignores a missing payload', () => {
    expect(loadStateFromUrl(new URLSearchParams())).toBe(false);
  });

  it('ignores the same payload a second time', () => {
    const encoded = encodeSharePayload({ u: 'SI', pts: [{ t1: 'DBT', v1: 20, t2: 'RH', v2: 50 }] });
    expect(loadStateFromUrl(new URLSearchParams({ share: encoded }))).toBe(true);
    expect(loadStateFromUrl(new URLSearchParams({ share: encoded }))).toBe(false);
  });

  it('leaves the chart untouched when the payload is corrupt', () => {
    const before = get(pointsInputStore);
    expect(loadStateFromUrl(new URLSearchParams({ share: 'definitely-not-base64!!' }))).toBe(false);
    expect(get(pointsInputStore)).toBe(before);
    expect(get(settingsStore)).toEqual(SI);
  });

  it('snapshots the live state for sharing', () => {
    settingsStore.set({ unitSystem: 'SI', elevation: 900, pressure: 90 });
    const payload = buildSharePayload();
    expect(payload).toMatchObject({ u: 'SI', elev: 900, press: 90 });
    expect(payload.pts).toHaveLength(defaultPoints.length);
    expect(payload.pts[0]).toMatchObject({ id: 'P1', t1: 'DBT', v1: 35, t2: 'RH', v2: 60 });
  });

  it('builds a share URL with the payload and source tag', () => {
    const url = generateShareUrl('/psych-chart');
    expect(url.startsWith('/psych-chart?share=')).toBe(true);
    expect(url.endsWith('&src=share')).toBe(true);
  });
});

describe('unit switching', () => {
  it('converts point inputs when the unit system changes', () => {
    setUnitSystem('IP');
    expect(get(settingsStore).pressure).toBeCloseTo(14.696, 6);
    expect(get(pointsInputStore)[0].val1).toBeCloseTo(95, 1); // 35 °C
    expect(get(pointsInputStore)[0].val2).toBeCloseTo(60, 6); // RH is dimensionless
    expect(get(pointsInputStore)[1].val1).toBeCloseTo(53.6, 1); // 12 °C

    setUnitSystem('SI');
    expect(get(pointsInputStore)[0].val1).toBeCloseTo(35, 1);
    expect(get(pointsInputStore)[1].val1).toBeCloseTo(12, 1);
    expect(get(settingsStore).pressure).toBeCloseTo(101.325, 6);
  });

  it('is a no-op when the unit system does not change', () => {
    const before = get(pointsInputStore);
    setUnitSystem('SI');
    expect(get(pointsInputStore)).toEqual(before);
  });
});

describe('point editing', () => {
  it('adds points using the active unit system', () => {
    addPointInput();
    let points = get(pointsInputStore);
    expect(points).toHaveLength(4);
    expect(points[3].id).toBe('P4');
    expect(points[3].val1).toBe(20);

    settingsStore.set(IP);
    addPointInput();
    points = get(pointsInputStore);
    expect(points).toHaveLength(5);
    expect(points[4].val1).toBe(68); // °F default
  });

  it('removes points and always keeps one', () => {
    removePointInput('P2');
    expect(get(pointsInputStore).map((p) => p.id)).toEqual(['P1', 'P3']);

    pointsInputStore.set([defaultPoints[0]]);
    removePointInput('P1');
    expect(get(pointsInputStore)).toHaveLength(1);
  });

  it('updates exactly one point', () => {
    updatePointInput('P2', { val1: 14 });
    expect(get(pointsInputStore)[1].val1).toBe(14);
    expect(get(pointsInputStore)[0].val1).toBe(35);
  });

  it('applies presets in SI and converts them for IP', () => {
    applyPointPreset([
      { dbt: 30, rh: 45, name: 'Hot day' },
      { dbt: 10, rh: 80 }
    ]);
    const points = get(pointsInputStore);
    expect(points).toHaveLength(2);
    expect(points[0]).toMatchObject({ name: 'Hot day', type1: 'DBT', val1: 30, type2: 'RH', val2: 45 });

    settingsStore.set(IP);
    applyPointPreset([{ dbt: 30, rh: 45 }]);
    expect(get(pointsInputStore)[0].val1).toBeCloseTo(86, 1); // 30 °C in °F
  });

  it('bridges a steam saturation state onto the moist-air chart', () => {
    setSaturationPoint(45.8, 0.00988, 'Steam saturation');
    const points = get(pointsInputStore);
    expect(points).toHaveLength(3);
    expect(points[0]).toMatchObject({
      name: 'Steam saturation',
      type1: 'DBT',
      val1: 45.8,
      type2: 'HUMRAT',
      val2: 0.00988
    });
  });
});

describe('saved scenarios', () => {
  it('saves, reapplies and deletes a scenario', () => {
    expect(saveScenario('   ')).toBe(false);

    updatePointInput('P1', { val1: 28 });
    expect(saveScenario('  Office summer  ')).toBe(true);

    const [scenario] = get(savedScenariosStore);
    expect(scenario.name).toBe('Office summer');
    expect(scenario.payload.pts[0].v1).toBe(28);

    updatePointInput('P1', { val1: 11 });
    expect(get(pointsInputStore)[0].val1).toBe(11);

    expect(applyScenario(scenario.id)).toBe(true);
    expect(get(pointsInputStore)[0].val1).toBe(28);

    deleteScenario(scenario.id);
    expect(get(savedScenariosStore)).toHaveLength(0);
    expect(applyScenario(scenario.id)).toBe(false);
  });

  it('keeps only the 25 most recent scenarios', () => {
    for (let i = 0; i < 30; i++) saveScenario(`scenario ${i}`);
    const list = get(savedScenariosStore);
    expect(list).toHaveLength(25);
    expect(list[0].name).toBe('scenario 29');
  });

  it('truncates very long scenario names', () => {
    expect(saveScenario('x'.repeat(120))).toBe(true);
    expect(get(savedScenariosStore)[0].name).toHaveLength(60);
  });
});
