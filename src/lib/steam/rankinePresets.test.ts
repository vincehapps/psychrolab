import { describe, expect, it } from 'vitest';
import { RANKINE_PRESETS } from './rankinePresets';
import { getSatTemperatureC, solveSteamStatePointSI } from './steamEngine';
import type { SteamPointInput } from './steamStore';

const solve = (pt: SteamPointInput) => {
  if (pt.mode === 'PT') return solveSteamStatePointSI('P', pt.param1, 'T', pt.param2);
  if (pt.mode === 'Px') return solveSteamStatePointSI('P', pt.param1, 'x', pt.param2);
  throw new Error(`Preset ${pt.id} uses unsupported mode ${pt.mode}`);
};

/**
 * A preset is only useful if the four states it encodes form a cycle that a
 * real plant could run. These tests solve each preset through the same IF97
 * engine the UI uses and check the thermodynamics, rather than just checking
 * that the data has the right shape.
 */
describe('Rankine preset data', () => {
  it('defines four well-formed presets', () => {
    expect(RANKINE_PRESETS.length).toBe(4);
    expect(new Set(RANKINE_PRESETS.map((p) => p.id)).size).toBe(RANKINE_PRESETS.length);

    for (const preset of RANKINE_PRESETS) {
      expect(preset.points, preset.id).toHaveLength(4);
      expect(preset.points.map((p) => p.id)).toEqual(['SP1', 'SP2', 'SP3', 'SP4']);
      expect(preset.label.length).toBeGreaterThan(5);
      expect(preset.note.length).toBeGreaterThan(20);
      for (const pt of preset.points) {
        expect(pt.enabled, `${preset.id}/${pt.id}`).toBe(true);
        expect(pt.color, `${preset.id}/${pt.id}`).toMatch(/^#[0-9a-f]{6}$/i);
        expect(['PT', 'Px']).toContain(pt.mode);
      }
      const p2 = preset.points[1].param2;
      expect(p2).toBeGreaterThan(0);
      expect(p2).toBeLessThanOrEqual(1);
      expect(preset.points[2].param2).toBe(0); // condenser exit is saturated liquid
    }
  });

  for (const preset of RANKINE_PRESETS) {
    it(`runs a consistent cycle: ${preset.label}`, () => {
      const [s1, s2, s3, s4] = preset.points.map(solve);
      const [inlet, exit, condenserExit, feed] = preset.points;

      // Turbine inlet is superheated at the top pressure.
      expect(s1.region).toBe('Superheated');
      expect(s1.pBar).toBeCloseTo(inlet.param1, 3);
      expect(s1.tC).toBeCloseTo(inlet.param2, 1);

      // Turbine exit drops to the low pressure with the stated quality.
      expect(s2.pBar).toBeCloseTo(exit.param1, 3);
      expect(s2.x).toBeCloseTo(exit.param2, 6);
      expect(s2.h).toBeLessThan(s1.h);

      // Condenser exit is saturated liquid at the low pressure.
      expect(s3.x).toBeCloseTo(0, 6);
      expect(s3.pBar).toBeCloseTo(exit.param1, 3);

      // The feed state is liquid water hotter than the condenser exit, so the
      // pump does positive work. This is what makes the cycle reversible-ish.
      expect(s4.region).toBe('Subcooled');
      expect(s4.pBar).toBeCloseTo(inlet.param1, 3);
      expect(s4.tC).toBeCloseTo(feed.param2, 1);
      expect(s4.tC, `${preset.id}: feedwater is colder than the condenser`).toBeGreaterThan(
        getSatTemperatureC(exit.param1)
      );

      const workTurbine = s1.h - s2.h;
      const workPump = s4.h - s3.h;
      const qIn = s1.h - s4.h;
      const efficiency = (workTurbine - workPump) / qIn;

      expect(workTurbine).toBeGreaterThan(200);
      expect(workPump).toBeGreaterThan(0);
      expect(workPump).toBeLessThan(workTurbine);
      expect(qIn).toBeGreaterThan(0);
      expect(efficiency, `${preset.id} efficiency`).toBeGreaterThan(0.1);
      expect(efficiency, `${preset.id} efficiency`).toBeLessThan(0.45);
    });
  }
});
