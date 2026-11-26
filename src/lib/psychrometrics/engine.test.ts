import { describe, expect, it } from 'vitest';
import {
  getDewPointSI,
  getEnthalpySI,
  getHumRatioFromVapPress,
  getSatVaporPressureSI,
  getSpecificVolumeSI,
  getWetBulbSI,
  solveStatePointFromPairSI
} from './engine';
import { getStandardAtmosphericPressureSI } from './unitConverter';

const P = 101325;

describe('saturation vapour pressure', () => {
  it('matches ASHRAE values at 0 °C and 20 °C', () => {
    expect(getSatVaporPressureSI(0)).toBeCloseTo(611, 0);
    expect(getSatVaporPressureSI(20)).toBeCloseTo(2339, -1);
    expect(getSatVaporPressureSI(100)).toBeCloseTo(101325, -3);
  });

  it('has a single physical branch across the freezing point', () => {
    expect(getSatVaporPressureSI(-0.001)).toBeCloseTo(getSatVaporPressureSI(0.001), 0);
  });
});

describe('humidity conversions', () => {
  it('round-trips vapour pressure and humidity ratio', () => {
    const w = getHumRatioFromVapPress(1500, P);
    expect(w).toBeGreaterThan(0.009);
    expect(w).toBeLessThan(0.010);
    expect((w * P) / (0.62198 + w)).toBeCloseTo(1500, 6);
  });

  it('uses the ASHRAE enthalpy relation exactly', () => {
    expect(getEnthalpySI(25, 0.01)).toBeCloseTo(1.006 * 25 + 0.01 * (2501 + 1.86 * 25), 10);
  });

  it('returns specific volume near 0.86 m³/kg at 25 °C / 50% RH', () => {
    const w = solveStatePointFromPairSI('DBT', 25, 'RH', 50, P).humRat;
    expect(getSpecificVolumeSI(25, w, P)).toBeCloseTo(0.858, 1);
  });
});

describe('dew point', () => {
  it('matches the ASHRAE value at 25 °C / 50% RH', () => {
    const pv = 0.5 * getSatVaporPressureSI(25);
    expect(getDewPointSI(pv)).toBeCloseTo(13.9, 0);
  });

  it('equals dry bulb at saturation', () => {
    expect(getDewPointSI(getSatVaporPressureSI(18))).toBeCloseTo(18, 0);
  });
});

describe('wet bulb', () => {
  it('lands below dry bulb and above dew point', () => {
    const twb = getWetBulbSI(25, 50, P);
    expect(twb).toBeCloseTo(17.9, 0);
    expect(twb).toBeLessThan(25);
    expect(twb).toBeGreaterThan(13.5);
  });

  it('collapses to dry bulb at saturation', () => {
    expect(getWetBulbSI(25, 100, P)).toBeCloseTo(25, 6);
  });
});

describe('state-point solver', () => {
  it('solves 25 °C / 50% RH consistently', () => {
    const st = solveStatePointFromPairSI('DBT', 25, 'RH', 50, P);
    expect(st.dbt).toBeCloseTo(25, 6);
    expect(st.rh).toBeCloseTo(50, 6);
    expect(st.humRat).toBeCloseTo(0.00988, 4);
    expect(st.enthalpy).toBeCloseTo(50.3, 0);
    expect(st.dpt).toBeCloseTo(13.9, 0);
  });

  it('round-trips through (DBT, WBT)', () => {
    const target = solveStatePointFromPairSI('DBT', 30, 'RH', 40, P);
    const recovered = solveStatePointFromPairSI('DBT', 30, 'WBT', target.wbt, P);
    expect(recovered.rh).toBeCloseTo(40, 0);
    expect(recovered.humRat).toBeCloseTo(target.humRat, 4);
  });

  it('round-trips through (DBT, enthalpy)', () => {
    const target = solveStatePointFromPairSI('DBT', 22, 'RH', 60, P);
    const recovered = solveStatePointFromPairSI('DBT', 22, 'ENTHALPY', target.enthalpy, P);
    expect(recovered.humRat).toBeCloseTo(target.humRat, 4);
  });

  it('round-trips through (DBT, dew point)', () => {
    const target = solveStatePointFromPairSI('DBT', 28, 'RH', 70, P);
    const recovered = solveStatePointFromPairSI('DBT', 28, 'DPT', target.dpt, P);
    expect(recovered.humRat).toBeCloseTo(target.humRat, 4);
  });
});

describe('standard atmosphere', () => {
  it('gives sea level and altitude pressures', () => {
    expect(getStandardAtmosphericPressureSI(0)).toBeCloseTo(101325, 0);
    // ASHRAE standard atmosphere at 1500 m ≈ 84.6 kPa.
    expect(getStandardAtmosphericPressureSI(1500)).toBeCloseTo(84556, -3);
    expect(getStandardAtmosphericPressureSI(1500)).toBeLessThan(101325);
  });
});
