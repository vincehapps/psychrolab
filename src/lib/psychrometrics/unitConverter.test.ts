import { describe, expect, it } from 'vitest';
import PL from 'psychrolib';
import {
  btuPerLbTokJPerKg,
  cToF,
  fToC,
  feetToMeters,
  ft3PerLbToM3PerKg,
  getStandardAtmosphericPressureSI,
  inHgTokPa,
  kJPerKgToBtuPerLb,
  kPaToInHg,
  kPaToPsi,
  m3PerKgToFt3PerLb,
  metersToFeet,
  psiTokPa
} from './unitConverter';

PL.SetUnitSystem(PL.SI);

describe('temperature', () => {
  it('hits the fixed points of the Fahrenheit scale', () => {
    expect(cToF(0)).toBeCloseTo(32, 10);
    expect(cToF(100)).toBeCloseTo(212, 10);
    expect(cToF(-40)).toBeCloseTo(-40, 10);
    expect(fToC(32)).toBeCloseTo(0, 10);
    expect(fToC(212)).toBeCloseTo(100, 10);
  });
});

describe('pressure', () => {
  it('matches the standard atmosphere in psi and inches of mercury', () => {
    expect(kPaToPsi(101.325)).toBeCloseTo(14.6959, 3);
    expect(psiTokPa(14.6959)).toBeCloseTo(101.325, 3);
    expect(kPaToInHg(101.325)).toBeCloseTo(29.9213, 3);
    expect(inHgTokPa(29.9213)).toBeCloseTo(101.325, 3);
  });

  it('round-trips both directions', () => {
    for (const kPa of [1, 50, 101.325, 250]) {
      expect(psiTokPa(kPaToPsi(kPa))).toBeCloseTo(kPa, 9);
      expect(inHgTokPa(kPaToInHg(kPa))).toBeCloseTo(kPa, 9);
    }
  });
});

describe('length, energy and specific volume', () => {
  it('uses the standard conversion factors', () => {
    expect(metersToFeet(1)).toBeCloseTo(3.28084, 6);
    expect(kJPerKgToBtuPerLb(1)).toBeCloseTo(0.429923, 6);
    expect(m3PerKgToFt3PerLb(1)).toBeCloseTo(16.0185, 4);
  });

  it('round-trips both directions', () => {
    for (const m of [0.5, 1, 1500]) expect(feetToMeters(metersToFeet(m))).toBeCloseTo(m, 9);
    for (const kJ of [1, 250, 2257]) expect(btuPerLbTokJPerKg(kJPerKgToBtuPerLb(kJ))).toBeCloseTo(kJ, 6);
    for (const v of [0.001, 0.86, 16]) expect(ft3PerLbToM3PerKg(m3PerKgToFt3PerLb(v))).toBeCloseTo(v, 9);
  });
});

describe('standard atmosphere', () => {
  it('is 101 325 Pa at sea level', () => {
    expect(getStandardAtmosphericPressureSI(0)).toBeCloseTo(101325, 6);
  });

  it('matches the ASHRAE barometric formula that PsychroLib implements', () => {
    for (const z of [0, 500, 1500, 3000]) {
      expect(getStandardAtmosphericPressureSI(z), `${z} m`).toBeCloseTo(PL.GetStandardAtmPressure(z), 6);
    }
  });

  it('falls monotonically with altitude', () => {
    let previous = Infinity;
    for (let z = 0; z <= 5000; z += 250) {
      const p = getStandardAtmosphericPressureSI(z);
      expect(p).toBeLessThan(previous);
      previous = p;
    }
  });
});
