import { describe, expect, it } from 'vitest';
import {
  AIR_CP,
  WATER_HFG,
  cfmToM3s,
  coilLoad,
  kwToTons,
  mixAirstreams,
  m3sToCfm,
  sensibleHeatRatio,
  tonsToKw
} from './process';
import { solveStatePointFromPairSI } from './engine';

const P = 101325;

describe('airstream mixing', () => {
  it('lands between two equal-volume streams', () => {
    const mixed = mixAirstreams(
      [
        { tC: 20, rhPercent: 50, flowM3s: 1 },
        { tC: 30, rhPercent: 50, flowM3s: 1 }
      ],
      P
    )!;

    expect(mixed).not.toBeNull();
    expect(mixed.dbt).toBeGreaterThan(20);
    expect(mixed.dbt).toBeLessThan(30);
    expect(mixed.totalFlowM3s).toBeCloseTo(2, 6);
    expect(mixed.rh).toBeGreaterThan(40);
    expect(mixed.rh).toBeLessThan(60);
  });

  it('weights the mixture towards the larger stream', () => {
    const mixed = mixAirstreams(
      [
        { tC: 10, rhPercent: 80, flowM3s: 1 },
        { tC: 35, rhPercent: 30, flowM3s: 3 }
      ],
      P
    )!;
    expect(mixed.dbt).toBeGreaterThan(28);
    expect(mixed.dbt).toBeLessThan(30);
  });

  it('rejects empty and invalid input', () => {
    expect(mixAirstreams([], P)).toBeNull();
    expect(mixAirstreams([{ tC: 20, rhPercent: 0, flowM3s: 1 }], P)).toBeNull();
    expect(mixAirstreams([{ tC: 20, rhPercent: 50, flowM3s: 0 }], P)).toBeNull();
  });

  it('conserves dry-air mass flow', () => {
    const streams = [
      { tC: 22, rhPercent: 55, flowM3s: 0.8 },
      { tC: 32, rhPercent: 45, flowM3s: 0.4 }
    ];
    const mixed = mixAirstreams(streams, P)!;
    const expected = streams.reduce((sum, s) => {
      const state = solveStatePointFromPairSI('DBT', s.tC, 'RH', s.rhPercent, P);
      return sum + s.flowM3s / state.vol;
    }, 0);
    expect(mixed.massFlow).toBeCloseTo(expected, 6);
  });
});

describe('coil load', () => {
  // coilLoad takes the compact { tC, w, h } state, not the full solver output.
  const air = (dbt: number, rh: number) => {
    const st = solveStatePointFromPairSI('DBT', dbt, 'RH', rh, P);
    return { tC: st.dbt, w: st.humRat, h: st.enthalpy };
  };
  const entering = air(26, 60);
  const leaving = air(13, 90);

  it('splits total load into sensible and latent parts', () => {
    const load = coilLoad(1, entering, leaving);
    expect(load.totalKW).toBeGreaterThan(0);
    expect(load.sensibleKW).toBeCloseTo(AIR_CP * (entering.tC - leaving.tC), 6);
    expect(load.latentKW).toBeCloseTo(WATER_HFG * (entering.w - leaving.w), 6);
    // The latent hfg approximation differs slightly from h's 1.86·T term.
    const split = load.sensibleKW + load.latentKW;
    expect(Math.abs(split - load.totalKW) / load.totalKW).toBeLessThan(0.05);
    expect(load.shr).toBeGreaterThan(0.5);
    expect(load.shr).toBeLessThan(0.8);
  });

  it('scales linearly with mass flow', () => {
    const single = coilLoad(1, entering, leaving);
    const double = coilLoad(2, entering, leaving);
    expect(double.totalKW).toBeCloseTo(2 * single.totalKW, 6);
    expect(double.shr).toBeCloseTo(single.shr, 6);
  });

  it('reports no load for an identical state', () => {
    const load = coilLoad(1, entering, entering);
    expect(load.totalKW).toBeCloseTo(0, 10);
    expect(Number.isNaN(load.shr)).toBe(true);
  });
});

describe('sensible heat ratio', () => {
  it('is 1 for a purely sensible process', () => {
    expect(sensibleHeatRatio(5, 0)).toBeCloseTo(1, 10);
  });

  it('is 0 for a purely latent process', () => {
    expect(sensibleHeatRatio(0, 0.001)).toBeCloseTo(0, 10);
  });

  it('returns NaN for a zero process', () => {
    expect(Number.isNaN(sensibleHeatRatio(0, 0))).toBe(true);
  });

  it('matches cp·ΔT / (cp·ΔT + hfg·ΔW)', () => {
    expect(sensibleHeatRatio(8, 0.002)).toBeCloseTo(
      (AIR_CP * 8) / (AIR_CP * 8 + WATER_HFG * 0.002),
      10
    );
  });
});

describe('unit conversions', () => {
  it('converts airflow both ways', () => {
    expect(cfmToM3s(400)).toBeCloseTo(0.1888, 4);
    expect(m3sToCfm(cfmToM3s(400))).toBeCloseTo(400, 6);
  });

  it('treats one refrigeration ton as 3.5169 kW', () => {
    expect(kwToTons(3.5168525)).toBeCloseTo(1, 9);
    expect(tonsToKw(1)).toBeCloseTo(3.5168525, 9);
    expect(kwToTons(42)).toBeCloseTo(11.94, 1);
  });
});
