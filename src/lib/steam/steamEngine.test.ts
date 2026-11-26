import { describe, expect, it } from 'vitest';
import {
  CRITICAL_P_BAR,
  CRITICAL_T_C,
  getSatPressureBar,
  getSatTemperatureC,
  getSaturatedPropertiesSI,
  getSuperheatedPropertiesSI,
  solveSteamStatePointSI
} from './steamEngine';

const ATM = 101325;

describe('saturation curve', () => {
  it('puts atmospheric boiling at ~100 °C', () => {
    expect(getSatTemperatureC(ATM / 1e5)).toBeCloseTo(100, 1);
    // The region-4 saturation curve reproduces 1 atm to within ~0.1%.
    expect(Math.abs(getSatPressureBar(100) * 1e5 - ATM) / ATM).toBeLessThan(0.002);
  });

  it('is monotonic in temperature', () => {
    const temps = [0.01, 50, 100, 200, 300, 350];
    const pressures = temps.map(getSatPressureBar);
    for (let i = 1; i < pressures.length; i++) {
      expect(pressures[i]).toBeGreaterThan(pressures[i - 1]);
    }
  });

  it('clamps to the critical point', () => {
    expect(getSatTemperatureC(CRITICAL_P_BAR + 10)).toBeCloseTo(CRITICAL_T_C, 0);
    expect(getSatPressureBar(CRITICAL_T_C + 5)).toBeCloseTo(CRITICAL_P_BAR, 5);
  });
});

describe('saturated properties', () => {
  it('matches IF97 values at 1 bar', () => {
    const sat = getSaturatedPropertiesSI(getSatTemperatureC(1));
    expect(sat.hf).toBeCloseTo(417.4, 0);
    expect(sat.hg).toBeCloseTo(2674.9, 0);
    expect(sat.hfg).toBeCloseTo(2257.5, 0);
    expect(sat.vf).toBeLessThan(sat.vg);
    expect(sat.sg).toBeGreaterThan(sat.sf);
  });

  it('matches IF97 values at 40 bar', () => {
    const sat = getSaturatedPropertiesSI(getSatTemperatureC(40));
    expect(sat.tC).toBeCloseTo(250.4, 0);
    expect(sat.hf).toBeCloseTo(1087.4, 0);
    expect(Math.abs(sat.hg - 2801.4)).toBeLessThan(1);
  });

  it('keeps hf < hg and uf < ug across the dome', () => {
    for (const t of [0.01, 100, 200, 300, 350, 370]) {
      const sat = getSaturatedPropertiesSI(t);
      expect(sat.hf).toBeLessThan(sat.hg);
      expect(sat.uf).toBeLessThan(sat.ug);
      expect(sat.hfg).toBeGreaterThan(0);
    }
  });
});

describe('superheated steam', () => {
  it('matches steam-table enthalpy at 40 bar / 400 °C', () => {
    const sup = getSuperheatedPropertiesSI(40, 400);
    expect(sup.h).toBeCloseTo(3213.6, -0.5);
    expect(sup.s).toBeCloseTo(6.769, 1);
  });

  it('never reports a temperature below saturation', () => {
    const sup = getSuperheatedPropertiesSI(40, 100);
    expect(sup.tC).toBeCloseTo(getSatTemperatureC(40), 1);
  });
});

describe('state-point solver', () => {
  it('classifies (P, T) states by region', () => {
    expect(solveSteamStatePointSI('P', 40, 'T', 400).region).toBe('Superheated');
    expect(solveSteamStatePointSI('P', 40, 'T', 50).region).toBe('Subcooled');
    expect(solveSteamStatePointSI('P', 40, 'T', getSatTemperatureC(40)).region).toBe('Saturated');
  });

  it('evaluates compressed liquid at the actual pressure', () => {
    const sub = solveSteamStatePointSI('P', 40, 'T', 50);
    // Liquid at 50 °C: hf is 209.3 kJ/kg, and compression to 40 bar adds ~3.5 kJ/kg.
    expect(sub.h).toBeCloseTo(212.8, 0);
    expect(sub.v).toBeLessThan(getSaturatedPropertiesSI(50).vg);
  });

  it('blends quality linearly between hf and hg', () => {
    const sat = getSaturatedPropertiesSI(getSatTemperatureC(0.05));
    const pt = solveSteamStatePointSI('P', 0.05, 'x', 0.9);
    expect(pt.region).toBe('Saturated');
    expect(pt.x).toBeCloseTo(0.9, 6);
    expect(pt.h).toBeCloseTo(sat.hf + 0.9 * sat.hfg, 1);
    expect(pt.s).toBeCloseTo(sat.sf + 0.9 * sat.sfg, 3);
  });

  it('inverts (P, h) back to the generating temperature', () => {
    const generated = solveSteamStatePointSI('P', 40, 'T', 400);
    const inverted = solveSteamStatePointSI('P', 40, 'h', generated.h);
    expect(inverted.region).toBe('Superheated');
    expect(inverted.tC).toBeCloseTo(400, 0);
    expect(inverted.s).toBeCloseTo(generated.s, 1);
  });

  it('reports saturated when (P, h) falls inside the dome', () => {
    const sat = getSaturatedPropertiesSI(getSatTemperatureC(1));
    const midH = (sat.hf + sat.hg) / 2;
    const pt = solveSteamStatePointSI('P', 1, 'h', midH);
    expect(pt.region).toBe('Saturated');
    expect(pt.x).toBeCloseTo(0.5, 2);
  });

  it('produces a physically ordered Rankine cycle', () => {
    const [s1, s2, s3, s4] = [
      solveSteamStatePointSI('P', 40, 'T', 400),
      solveSteamStatePointSI('P', 0.1, 'x', 0.88),
      solveSteamStatePointSI('P', 0.1, 'x', 0),
      solveSteamStatePointSI('P', 40, 'T', 50)
    ];

    const workTurbine = s1.h - s2.h;
    const workPump = s4.h - s3.h;
    const qIn = s1.h - s4.h;
    const efficiency = (workTurbine - workPump) / qIn;

    expect(workTurbine).toBeGreaterThan(700);
    expect(workTurbine).toBeLessThan(1300);
    expect(workPump).toBeGreaterThan(0);
    expect(efficiency).toBeGreaterThan(0.25);
    expect(efficiency).toBeLessThan(0.45);
  });
});
