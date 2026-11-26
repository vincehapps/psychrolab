import { describe, expect, it } from 'vitest';
import PL from 'psychrolib';
import {
  getDewPointSI,
  getEnthalpySI,
  getHumRatioFromVapPress,
  getSatVaporPressureSI,
  getSpecificVolumeSI,
  getVapPressFromHumRatio,
  getWetBulbSI
} from './engine';

PL.SetUnitSystem(PL.SI);

const P = 101325;
const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b);

/**
 * Cross-validation against PsychroLib, the reference ASHRAE Fundamentals
 * implementation and a direct dependency of this project. These sweeps catch
 * formula or unit errors that a handful of hand-typed reference points miss,
 * because they compare the whole working range rather than three spot values.
 */
describe('psychrometric engine vs PsychroLib (ASHRAE reference)', () => {
  it('agrees on saturation vapour pressure from -20 °C to 60 °C', () => {
    for (let t = -20; t <= 60; t += 5) {
      expect(rel(getSatVaporPressureSI(t), PL.GetSatVapPres(t)), `${t} °C`).toBeLessThan(2e-4);
    }
    // Both use the Hyland–Wexler formulation, so the 20 °C value is exact.
    expect(getSatVaporPressureSI(20)).toBeCloseTo(2338.8037, 3);
  });

  it('agrees on humidity ratio for every RH from 10% to 90%', () => {
    for (let t = 0; t <= 45; t += 5) {
      for (const rh of [10, 30, 50, 70, 90]) {
        const pv = PL.GetVapPresFromRelHum(t, rh / 100);
        const mine = getHumRatioFromVapPress(pv, P);
        const ref = PL.GetHumRatioFromVapPres(pv, P);
        expect(rel(mine, ref), `${t} °C / ${rh}%`).toBeLessThan(1e-4);
      }
    }
  });

  it('round-trips vapour pressure through the humidity ratio', () => {
    for (const pv of [200, 800, 1500, 2500, 4000]) {
      expect(getVapPressFromHumRatio(getHumRatioFromVapPress(pv, P), P)).toBeCloseTo(pv, 6);
    }
  });

  it('agrees on moist-air enthalpy and specific volume', () => {
    for (let t = 0; t <= 45; t += 5) {
      for (const rh of [20, 50, 80]) {
        const w = PL.GetHumRatioFromRelHum(t, rh / 100, P);
        // PsychroLib returns J/kg; the engine returns kJ/kg.
        expect(rel(getEnthalpySI(t, w) * 1000, PL.GetMoistAirEnthalpy(t, w))).toBeLessThan(1e-9);
        expect(rel(getSpecificVolumeSI(t, w, P), PL.GetMoistAirVolume(t, w, P))).toBeLessThan(1e-5);
      }
    }
  });

  it('agrees on dew point to within a millionth of a degree', () => {
    for (let t = 5; t <= 45; t += 5) {
      for (const rh of [20, 50, 80]) {
        const pv = PL.GetVapPresFromRelHum(t, rh / 100);
        expect(Math.abs(getDewPointSI(pv) - PL.GetTDewPointFromVapPres(t, pv)), `${t} °C / ${rh}%`).toBeLessThan(1e-6);
      }
    }
  });

  it('agrees on wet bulb wherever the wet bulb stays above freezing', () => {
    for (let t = 5; t <= 45; t += 5) {
      for (const rh of [10, 30, 50, 70, 90, 100]) {
        const ref = PL.GetTWetBulbFromRelHum(t, rh / 100, P);
        if (ref <= 1) continue; // the ice branch below 0 °C is out of scope, see next test
        expect(Math.abs(getWetBulbSI(t, rh, P) - ref), `${t} °C / ${rh}%`).toBeLessThan(0.02);
      }
    }
  });

  it('uses the water curve below freezing, so wet bulb runs up to ~0.5 K warm', () => {
    // PsychroLib switches to saturation over ice below 0 °C. This engine models
    // water only, which is the documented behaviour of a single-branch curve.
    // Pinning the size of the difference keeps the limitation visible.
    for (const [t, rh] of [
      [0, 10],
      [0, 50],
      [5, 10],
      [5, 30]
    ]) {
      const diff = getWetBulbSI(t, rh, P) - PL.GetTWetBulbFromRelHum(t, rh / 100, P);
      expect(diff, `${t} °C / ${rh}%`).toBeGreaterThan(0);
      expect(diff).toBeLessThan(0.6);
    }
  });
});
