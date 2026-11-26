import { beforeEach, describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import {
  addSteamPoint,
  calculatedSteamPointsStore,
  defaultSteamPoints,
  generateSaturationTableByPressure,
  generateSaturationTableByTemperature,
  removeSteamPoint,
  steamPointsStore,
  updateSteamPoint
} from './steamStore';
import { settingsStore } from '../stores/appStore';

beforeEach(() => {
  steamPointsStore.set(defaultSteamPoints);
  settingsStore.set({ unitSystem: 'SI', elevation: 0, pressure: 101.325 });
});

describe('default Rankine cycle', () => {
  it('solves all four states', () => {
    const states = get(calculatedSteamPointsStore);
    expect(states).toHaveLength(4);
    expect(states.map((s) => s.id)).toEqual(['SP1', 'SP2', 'SP3', 'SP4']);
  });

  it('matches the steam-table values for the default points', () => {
    const [s1, s2, s3, s4] = get(calculatedSteamPointsStore);

    // 40 bar / 400 °C superheated inlet.
    expect(s1.region).toBe('Superheated');
    expect(s1.tC).toBeCloseTo(400, 1);
    expect(s1.h).toBeCloseTo(3214.4, 0);

    // 0.1 bar at 88% quality.
    expect(s2.region).toBe('Saturated');
    expect(s2.x).toBeCloseTo(0.88, 6);
    expect(s2.h).toBeGreaterThan(2200);
    expect(s2.h).toBeLessThan(2350);

    // 0.1 bar saturated liquid.
    expect(s3.x).toBeCloseTo(0, 6);
    expect(s3.tC).toBeCloseTo(45.8, 1);
    expect(s3.h).toBeCloseTo(191.8, 0);

    // 40 bar / 50 °C feedwater.
    expect(s4.region).toBe('Subcooled');
    expect(s4.h).toBeCloseTo(212.8, 0);
  });

  it('formats SI display values', () => {
    const [s1, s2, s3] = get(calculatedSteamPointsStore);
    expect(s1.pDisp).toBeCloseTo(40, 3);
    expect(s1.tDisp).toBeCloseTo(400, 1);
    expect(s1.hDisp).toBeCloseTo(3214.4, 1);
    expect(s2.xDisp).toBe('88.0%');
    expect(s3.xDisp).toBe('0.0%');
    expect(s1.xDisp).toBe('— (Pure Phase)');
  });

  it('reads and displays a state entered in IP units', () => {
    settingsStore.set({ unitSystem: 'IP', elevation: 0, pressure: 14.696 });
    // The same physical state, entered the way an IP reader would: 580.15 psi / 752 °F.
    updateSteamPoint('SP1', { param1: 580.15, param2: 752 });
    const [s1] = get(calculatedSteamPointsStore);

    // The calculation itself stays in SI.
    expect(s1.pBar).toBeCloseTo(40, 1);
    expect(s1.tC).toBeCloseTo(400, 1);

    // Display values come back in IP units.
    expect(s1.pDisp).toBeCloseTo(580.15, 1);
    expect(s1.tDisp).toBeCloseTo(752, 1);
    expect(s1.hDisp).toBeCloseTo(1382, 0); // kJ/kg in Btu/lb
    expect(s1.hDisp).toBeCloseTo(s1.h * 0.429923, 1);
  });
});

describe('state point editing', () => {
  it('adds a point and recomputes it', () => {
    addSteamPoint();
    expect(get(steamPointsStore)).toHaveLength(5);
    expect(get(steamPointsStore)[4].id).toBe('SP5');
    expect(get(calculatedSteamPointsStore)).toHaveLength(5);
  });

  it('removes a point and keeps at least one', () => {
    removeSteamPoint('SP2');
    expect(get(steamPointsStore).map((p) => p.id)).toEqual(['SP1', 'SP3', 'SP4']);

    steamPointsStore.set([defaultSteamPoints[0]]);
    removeSteamPoint('SP1');
    expect(get(steamPointsStore)).toHaveLength(1);
  });

  it('updates a single point', () => {
    updateSteamPoint('SP1', { param1: 60 });
    expect(get(steamPointsStore)[0].param1).toBe(60);
    expect(get(steamPointsStore)[1].param1).toBe(0.1);
  });

  it('solves Tx and Ph input modes', () => {
    updateSteamPoint('SP1', { mode: 'Ph', param1: 40, param2: 3214.4 });
    expect(get(calculatedSteamPointsStore)[0].h).toBeCloseTo(3214.4, 2);

    updateSteamPoint('SP1', { mode: 'Tx', param1: 200, param2: 0.5 });
    const s1 = get(calculatedSteamPointsStore)[0];
    expect(s1.tC).toBeCloseTo(200, 1);
    expect(s1.x).toBeCloseTo(0.5, 6);
  });
});

describe('saturation tables', () => {
  it('builds a temperature table with increasing liquid enthalpy', () => {
    const rows = generateSaturationTableByTemperature();
    expect(rows).toHaveLength(30);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].hf).toBeGreaterThan(rows[i - 1].hf);
      expect(rows[i].tC).toBeGreaterThan(rows[i - 1].tC);
    }
    for (const row of rows) {
      expect(row.hfg).toBeGreaterThan(0);
      expect(row.hg).toBeGreaterThan(row.hf);
    }
  });

  it('builds a pressure table with increasing saturation temperature', () => {
    const rows = generateSaturationTableByPressure();
    expect(rows).toHaveLength(24);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].tC).toBeGreaterThan(rows[i - 1].tC);
    }
    expect(rows[0].tC).toBeCloseTo(6.97, 0); // 0.01 bar
    expect(rows[rows.length - 1].tC).toBeGreaterThan(370); // 220.64 bar, near critical
  });
});
