import { 
  cToF, fToC, kJPerKgToBtuPerLb, btuPerLbTokJPerKg, 
  m3PerKgToFt3PerLb, ft3PerLbToM3PerKg, kPaToPsi, 
  psiTokPa, metersToFeet, feetToMeters, getStandardAtmosphericPressureSI 
} from './unitConverter';
import type { SystemSettings, StatePointInput, StatePointCalculated, UnitSystem, DeltaResult, PropertyType, InputMode } from './types';

/**
 * Saturation Vapor Pressure (Pa) for temperature in °C
 * ASHRAE 2017 Handbook - Fundamentals (Chapter 1)
 */
export function getSatVaporPressureSI(tC: number): number {
  const tk = tC + 273.15;
  if (tC >= 0) {
    const c8 = -5.8002206e3;
    const c9 = 1.3914993;
    const c10 = -4.8640239e-2;
    const c11 = 4.1764768e-5;
    const c12 = -1.4452093e-8;
    const c13 = 6.5459673;
    const lnPws = c8 / tk + c9 + c10 * tk + c11 * tk * tk + c12 * Math.pow(tk, 3) + c13 * Math.log(tk);
    return Math.exp(lnPws);
  } else {
    const c1 = -5.6745359e3;
    const c2 = 6.3925247;
    const c3 = -9.6778430e-3;
    const c4 = 6.2215701e-7;
    const c5 = 2.0747825e-9;
    const c6 = -9.4840240e-13;
    const c7 = 4.1635019;
    const lnPws = c1 / tk + c2 + c3 * tk + c4 * tk * tk + c5 * Math.pow(tk, 3) + c6 * Math.pow(tk, 4) + c7 * Math.log(tk);
    return Math.exp(lnPws);
  }
}

/**
 * Humidity ratio W (kg water / kg dry air) from vapor pressure (Pa) and total pressure (Pa)
 */
export function getHumRatioFromVapPress(pv: number, pTotPa: number): number {
  if (pTotPa <= pv) return 0.05; // limit boundary
  return 0.62198 * (pv / (pTotPa - pv));
}

/**
 * Vapor pressure (Pa) from Humidity ratio W (kg/kg) and total pressure (Pa)
 */
export function getVapPressFromHumRatio(w: number, pTotPa: number): number {
  return (pTotPa * w) / (0.62198 + w);
}

/**
 * Enthalpy h (kJ/kg) from Dry Bulb Temp (°C) and Humidity Ratio W (kg/kg)
 */
export function getEnthalpySI(tC: number, w: number): number {
  return 1.006 * tC + w * (2501 + 1.86 * tC);
}

/**
 * Specific volume v (m3/kg) from Dry Bulb Temp (°C), Humidity Ratio W, and Pressure (Pa)
 */
export function getSpecificVolumeSI(tC: number, w: number, pTotPa: number): number {
  const tk = tC + 273.15;
  const ra = 287.042; // J/(kg*K)
  const pv = getVapPressFromHumRatio(w, pTotPa);
  const pDry = pTotPa - pv;
  if (pDry <= 0) return 1.0;
  return (ra * tk) / pDry;
}

/**
 * Dew Point Temperature (°C) from Vapor Pressure (Pa)
 */
export function getDewPointSI(pv: number): number {
  if (pv <= 0) return -50;
  const alpha = Math.log(pv / 1000); // pv in kPa for standard approximation seed
  let dp = 6.54 + 14.526 * alpha + 0.7389 * alpha * alpha + 0.09486 * Math.pow(alpha, 3) + 0.4569 * Math.pow(pv / 1000, 0.1984);
  
  // Refine using Newton-Raphson
  for (let i = 0; i < 5; i++) {
    const f = getSatVaporPressureSI(dp) - pv;
    const df = (getSatVaporPressureSI(dp + 0.001) - getSatVaporPressureSI(dp - 0.001)) / 0.002;
    if (Math.abs(df) < 1e-6) break;
    const step = f / df;
    dp -= step;
    if (Math.abs(step) < 1e-4) break;
  }
  return dp;
}

/**
 * Wet Bulb Temperature (°C) using bisection / thermodynamic equilibrium
 */
export function getWetBulbSI(tC: number, rhPercent: number, pTotPa: number): number {
  if (rhPercent >= 99.9) return tC;
  
  const pvTarget = (rhPercent / 100) * getSatVaporPressureSI(tC);
  const wTarget = getHumRatioFromVapPress(pvTarget, pTotPa);
  const hTarget = getEnthalpySI(tC, wTarget);

  let low = getDewPointSI(pvTarget);
  let high = tC;
  let twb = (low + high) / 2;

  for (let i = 0; i < 20; i++) {
    twb = (low + high) / 2;
    const pwsTwb = getSatVaporPressureSI(twb);
    const wSatTwb = getHumRatioFromVapPress(pwsTwb, pTotPa);
    const hSatTwb = getEnthalpySI(twb, wSatTwb);

    // Adiabatic saturation energy balance: h = h_sat(Twb) - (w_sat(Twb) - w)*hw
    const diff = hTarget - (hSatTwb - (wSatTwb - wTarget) * 4.186 * twb);

    if (Math.abs(diff) < 0.01) break;
    if (diff < 0) {
      high = twb;
    } else {
      low = twb;
    }
  }

  return Math.min(twb, tC);
}

/**
 * Core solver calculating full state point from any two property types
 */
export function solveStatePointFromPairSI(
  type1: PropertyType,
  val1: number,
  type2: PropertyType,
  val2: number,
  pTotPa: number
): {
  dbt: number;
  wbt: number;
  dpt: number;
  rh: number;
  humRat: number;
  enthalpy: number;
  vol: number;
  vapPress: number;
} {
  // Convert any property value to SI standard base units
  let dbt = 20;
  let humRat = 0.008;

  // Internal helper to evaluate (dbt, humRat) -> full set of state properties
  const evalFromDBTandW = (tC: number, w: number) => {
    const safeW = Math.max(0.00001, w);
    const pv = getVapPressFromHumRatio(safeW, pTotPa);
    const pws = getSatVaporPressureSI(tC);
    const rh = Math.min(100, Math.max(0.1, (pv / pws) * 100));
    const dpt = getDewPointSI(pv);
    const wbt = getWetBulbSI(tC, rh, pTotPa);
    const enthalpy = getEnthalpySI(tC, safeW);
    const vol = getSpecificVolumeSI(tC, safeW, pTotPa);
    return { dbt: tC, wbt, dpt, rh, humRat: safeW, enthalpy, vol, vapPress: pv / 1000 };
  };

  // Helper to extract SI value for a property from state
  const getPropFromState = (prop: PropertyType, state: ReturnType<typeof evalFromDBTandW>): number => {
    switch (prop) {
      case 'DBT': return state.dbt;
      case 'WBT': return state.wbt;
      case 'DPT': return state.dpt;
      case 'RH': return state.rh;
      case 'HUMRAT': return state.humRat;
      case 'ENTHALPY': return state.enthalpy;
      default: return state.dbt;
    }
  };

  // If input types are identical fallback gracefully
  if (type1 === type2) {
    return evalFromDBTandW(val1, 0.008);
  }

  // 1. Direct combinations with DBT
  if (type1 === 'DBT' || type2 === 'DBT') {
    const dbtVal = type1 === 'DBT' ? val1 : val2;
    const otherType = type1 === 'DBT' ? type2 : type1;
    const otherVal = type1 === 'DBT' ? val2 : val1;

    dbt = dbtVal;
    if (otherType === 'RH') {
      const rh = Math.max(0.1, Math.min(100, otherVal));
      const pws = getSatVaporPressureSI(dbt);
      const pv = (rh / 100) * pws;
      humRat = getHumRatioFromVapPress(pv, pTotPa);
      return evalFromDBTandW(dbt, humRat);
    } else if (otherType === 'WBT') {
      const wbt = Math.min(otherVal, dbt);
      const pwsWbt = getSatVaporPressureSI(wbt);
      const wSatWbt = getHumRatioFromVapPress(pwsWbt, pTotPa);
      humRat = Math.max(0.0001, ((2501 - 2.326 * wbt) * wSatWbt - 1.006 * (dbt - wbt)) / (2501 + 1.86 * dbt - 4.186 * wbt));
      return evalFromDBTandW(dbt, humRat);
    } else if (otherType === 'DPT') {
      const dpt = Math.min(otherVal, dbt);
      const pv = getSatVaporPressureSI(dpt);
      humRat = getHumRatioFromVapPress(pv, pTotPa);
      return evalFromDBTandW(dbt, humRat);
    } else if (otherType === 'HUMRAT') {
      humRat = Math.max(0.0001, otherVal);
      return evalFromDBTandW(dbt, humRat);
    } else if (otherType === 'ENTHALPY') {
      humRat = Math.max(0.0001, (otherVal - 1.006 * dbt) / (2501 + 1.86 * dbt));
      return evalFromDBTandW(dbt, humRat);
    }
  }

  // 2. Direct combinations with Humidity Ratio (HUMRAT)
  if (type1 === 'HUMRAT' || type2 === 'HUMRAT') {
    const wVal = type1 === 'HUMRAT' ? val1 : val2;
    const otherType = type1 === 'HUMRAT' ? type2 : type1;
    const otherVal = type1 === 'HUMRAT' ? val2 : val1;

    humRat = Math.max(0.0001, wVal);
    if (otherType === 'ENTHALPY') {
      dbt = (otherVal - 2501 * humRat) / (1.006 + 1.86 * humRat);
      return evalFromDBTandW(dbt, humRat);
    } else if (otherType === 'DPT') {
      const pv = getSatVaporPressureSI(otherVal);
      humRat = getHumRatioFromVapPress(pv, pTotPa);
      // Solve DBT iteratively using bisection for consistency
    }
  }

  // 3. General Numerical Solver for non-DBT pairs (e.g. WBT+RH, DPT+RH, WBT+Enthalpy, etc.)
  // Iterative bisection search over Dry-Bulb Temperature T in [-40°C, 80°C]
  let lowT = -40;
  let highT = 80;
  let bestState = evalFromDBTandW(20, 0.008);
  let minErr = Infinity;

  for (let i = 0; i < 40; i++) {
    const midT = (lowT + highT) / 2;

    // Estimate W from midT and property 1
    let wEst1 = 0.008;
    if (type1 === 'RH') {
      const pws = getSatVaporPressureSI(midT);
      const pv = (Math.max(0.1, Math.min(100, val1)) / 100) * pws;
      wEst1 = getHumRatioFromVapPress(pv, pTotPa);
    } else if (type1 === 'WBT') {
      const pwsWbt = getSatVaporPressureSI(val1);
      const wSatWbt = getHumRatioFromVapPress(pwsWbt, pTotPa);
      wEst1 = Math.max(0.0001, ((2501 - 2.326 * val1) * wSatWbt - 1.006 * (midT - val1)) / (2501 + 1.86 * midT - 4.186 * val1));
    } else if (type1 === 'DPT') {
      const pv = getSatVaporPressureSI(val1);
      wEst1 = getHumRatioFromVapPress(pv, pTotPa);
    } else if (type1 === 'ENTHALPY') {
      wEst1 = Math.max(0.0001, (val1 - 1.006 * midT) / (2501 + 1.86 * midT));
    } else if (type1 === 'HUMRAT') {
      wEst1 = val1;
    }

    const st = evalFromDBTandW(midT, wEst1);
    const calculatedP2 = getPropFromState(type2, st);
    const err = calculatedP2 - val2;

    if (Math.abs(err) < minErr) {
      minErr = Math.abs(err);
      bestState = st;
    }

    if (err > 0) {
      highT = midT;
    } else {
      lowT = midT;
    }
  }

  return bestState;
}

/**
 * Backward compatibility wrapper for legacy calculateStatePointSI
 */
export function calculateStatePointSI(
  inputMode: InputMode,
  param1: number,
  param2: number,
  pTotPa: number
) {
  const modeMap: Record<InputMode, [PropertyType, PropertyType]> = {
    'DBT_RH': ['DBT', 'RH'],
    'DBT_WBT': ['DBT', 'WBT'],
    'DBT_DP': ['DBT', 'DPT'],
    'DBT_HUMRAT': ['DBT', 'HUMRAT'],
    'DBT_ENTHALPY': ['DBT', 'ENTHALPY']
  };
  const [t1, t2] = modeMap[inputMode] || ['DBT', 'RH'];
  return solveStatePointFromPairSI(t1, param1, t2, param2, pTotPa);
}

/**
 * Main evaluation function handling both SI and IP settings
 */
export function evaluateStatePoint(
  point: StatePointInput,
  settings: SystemSettings
): StatePointCalculated {
  // Pressure in Pascals
  let pPa = 101325;
  if (settings.unitSystem === 'SI') {
    pPa = settings.pressure ? settings.pressure * 1000 : getStandardAtmosphericPressureSI(settings.elevation);
  } else {
    const elevM = feetToMeters(settings.elevation);
    pPa = settings.pressure ? psiTokPa(settings.pressure) * 1000 : getStandardAtmosphericPressureSI(elevM);
  }

  // Extract type1, val1, type2, val2 (supporting legacy fallback)
  const type1: PropertyType = point.type1 || 'DBT';
  const type2: PropertyType = point.type2 || 'RH';
  let v1 = point.val1 ?? point.param1 ?? 20;
  let v2 = point.val2 ?? point.param2 ?? 50;

  // Convert IP inputs to SI base units for calculation
  const toSI = (type: PropertyType, val: number): number => {
    if (settings.unitSystem === 'IP') {
      if (type === 'DBT' || type === 'WBT' || type === 'DPT') {
        return fToC(val);
      } else if (type === 'HUMRAT') {
        return val / 7000;
      } else if (type === 'ENTHALPY') {
        return btuPerLbTokJPerKg(val);
      }
    }
    return val;
  };

  const v1_SI = toSI(type1, v1);
  const v2_SI = toSI(type2, v2);

  const resSI = solveStatePointFromPairSI(type1, v1_SI, type2, v2_SI, pPa);

  if (settings.unitSystem === 'SI') {
    return {
      id: point.id,
      name: point.name,
      color: point.color,
      enabled: point.enabled,
      dbt: Number(resSI.dbt.toFixed(2)),
      wbt: Number(resSI.wbt.toFixed(2)),
      dpt: Number(resSI.dpt.toFixed(2)),
      rh: Number(resSI.rh.toFixed(1)),
      humRat: Number(resSI.humRat.toFixed(5)),
      enthalpy: Number(resSI.enthalpy.toFixed(2)),
      vol: Number(resSI.vol.toFixed(3)),
      vapPress: Number(resSI.vapPress.toFixed(3))
    };
  } else {
    // Convert SI outputs to IP
    return {
      id: point.id,
      name: point.name,
      color: point.color,
      enabled: point.enabled,
      dbt: Number(cToF(resSI.dbt).toFixed(2)),
      wbt: Number(cToF(resSI.wbt).toFixed(2)),
      dpt: Number(cToF(resSI.dpt).toFixed(2)),
      rh: Number(resSI.rh.toFixed(1)),
      humRat: Number((resSI.humRat * 7000).toFixed(2)), // in grains/lb for IP display
      enthalpy: Number(kJPerKgToBtuPerLb(resSI.enthalpy).toFixed(2)),
      vol: Number(m3PerKgToFt3PerLb(resSI.vol).toFixed(3)),
      vapPress: Number(kPaToPsi(resSI.vapPress).toFixed(3))
    };
  }
}

/**
 * Calculate Delta between two state points
 */
export function calculateDelta(
  ptA: StatePointCalculated,
  ptB: StatePointCalculated
): DeltaResult {
  return {
    pA: ptA.name,
    pB: ptB.name,
    dbtDelta: Number((ptB.dbt - ptA.dbt).toFixed(2)),
    humRatDelta: Number((ptB.humRat - ptA.humRat).toFixed(5)),
    enthalpyDelta: Number((ptB.enthalpy - ptA.enthalpy).toFixed(2)),
    rhDelta: Number((ptB.rh - ptA.rh).toFixed(1))
  };
}
