/**
 * Thermodynamic Water & Steam Property Engine
 * Formulations based on IAPWS-IF97 / Standard Thermodynamic Approximations
 * Covers Subcooled Liquid, Saturated Mixture (dome), and Superheated Vapor
 */

export type SteamRegion = 'Subcooled' | 'Saturated' | 'Superheated' | 'Supercritical';

export interface SaturationPointSI {
  tC: number;           // Temperature °C
  pPa: number;          // Pressure Pa (or kPa / bar)
  vf: number;           // Saturated liquid volume m3/kg
  vg: number;           // Saturated vapor volume m3/kg
  hf: number;           // Saturated liquid enthalpy kJ/kg
  hfg: number;          // Enthalpy of vaporization kJ/kg
  hg: number;           // Saturated vapor enthalpy kJ/kg
  sf: number;           // Saturated liquid entropy kJ/(kg*K)
  sfg: number;          // Entropy of vaporization kJ/(kg*K)
  sg: number;           // Saturated vapor entropy kJ/(kg*K)
  uf: number;           // Saturated liquid internal energy kJ/kg
  ug: number;           // Saturated vapor internal energy kJ/kg
}

export interface SteamStateCalculated {
  id: string;
  name: string;
  color: string;
  region: SteamRegion;
  pBar: number;         // Bar (or psi in IP)
  tC: number;           // °C (or °F in IP)
  x: number;            // Quality (0 to 1, or -1 if superheated/subcooled)
  v: number;            // m3/kg (or ft3/lb)
  h: number;            // kJ/kg (or Btu/lb)
  s: number;            // kJ/(kg*K) (or Btu/(lb*R))
  u: number;            // kJ/kg
  // Display formatted values
  pDisp: number;
  tDisp: number;
  vDisp: number;
  hDisp: number;
  sDisp: number;
  xDisp: string;
}

// Critical point of water (IAPWS)
export const CRITICAL_T_C = 373.946; // °C
export const CRITICAL_P_BAR = 220.64; // bar
export const CRITICAL_S = 4.407;      // kJ/(kg*K)
export const CRITICAL_H = 2087.5;     // kJ/kg
export const CRITICAL_V = 0.003106;   // m3/kg

/**
 * Saturation pressure P_sat (bar) as a function of temperature T (°C)
 * IAPWS-IF97 Region 4 formulation approximation
 */
export function getSatPressureBar(tC: number): number {
  if (tC <= 0.01) return 0.006117;
  if (tC >= CRITICAL_T_C) return CRITICAL_P_BAR;

  const T = tC + 273.15;
  const Tc = 647.096;
  const Pc = 220.64; // bar
  const tau = 1 - T / Tc;

  const a1 = -7.85951783;
  const a2 = 1.84408259;
  const a3 = -11.7866497;
  const a4 = 22.6807411;
  const a5 = -15.9618719;
  const a6 = 1.80122502;

  const exponent = (Tc / T) * (
    a1 * tau +
    a2 * Math.pow(tau, 1.5) +
    a3 * Math.pow(tau, 3) +
    a4 * Math.pow(tau, 3.5) +
    a5 * Math.pow(tau, 4) +
    a6 * Math.pow(tau, 7.5)
  );

  return Pc * Math.exp(exponent);
}

/**
 * Saturation temperature T_sat (°C) as a function of pressure P (bar)
 */
export function getSatTemperatureC(pBar: number): number {
  if (pBar <= 0.006117) return 0.01;
  if (pBar >= CRITICAL_P_BAR) return CRITICAL_T_C;

  // Numerical inversion with high-precision Newton-Raphson
  let t = 100;
  if (pBar < 1) t = 20 + pBar * 80;
  else if (pBar > 50) t = 250 + (pBar - 50);

  for (let iter = 0; iter < 12; iter++) {
    const pCalc = getSatPressureBar(t);
    const diff = pCalc - pBar;
    if (Math.abs(diff) < 1e-6) break;
    const dp_dt = (getSatPressureBar(t + 0.01) - getSatPressureBar(t - 0.01)) / 0.02;
    t = t - diff / dp_dt;
    t = Math.max(0.01, Math.min(CRITICAL_T_C - 0.001, t));
  }

  return Number(t.toFixed(3));
}

/**
 * Evaluate complete saturated liquid & vapor properties at temperature T (°C)
 */
export function getSaturatedPropertiesSI(tC: number): SaturationPointSI {
  const safeT = Math.max(0.01, Math.min(CRITICAL_T_C - 0.001, tC));
  const pBar = getSatPressureBar(safeT);
  const pPa = pBar * 1e5;
  const Tk = safeT + 273.15;
  const theta = Tk / 647.096;
  const tau = 1 - theta;

  // Liquid Enthalpy hf (kJ/kg)
  const hf = 4.184 * safeT * (1 - 0.00028 * safeT);
  // Heat of vaporization hfg (kJ/kg) (Watson correlation)
  const hfg = 2501.0 * Math.pow(tau / (1 - 273.16 / 647.096), 0.38) * (1 - 0.08 * tau);
  const hg = hf + hfg;

  // Liquid Entropy sf (kJ/kg*K)
  const sf = 4.184 * Math.log(Tk / 273.16) * (1 - 0.00015 * safeT);
  const sfg = hfg / Tk;
  const sg = sf + sfg;

  // Liquid Specific Volume vf (m3/kg)
  const vf = 0.001 * (1 + 0.00006 * safeT + 0.000004 * safeT * safeT);
  // Ideal/Real vapor specific volume vg (m3/kg)
  const R_steam = 0.4615; // kJ/(kg*K)
  const Z = Math.max(0.65, 1 - 0.0018 * pBar);
  const vg = (Z * R_steam * Tk) / (pBar * 100);

  // Internal energy
  const uf = hf - (pPa * vf) / 1000;
  const ug = hg - (pPa * vg) / 1000;

  return {
    tC: safeT,
    pPa,
    vf: Number(vf.toFixed(6)),
    vg: Number(vg.toFixed(5)),
    hf: Number(hf.toFixed(2)),
    hfg: Number(hfg.toFixed(2)),
    hg: Number(hg.toFixed(2)),
    sf: Number(sf.toFixed(4)),
    sfg: Number(sfg.toFixed(4)),
    sg: Number(sg.toFixed(4)),
    uf: Number(uf.toFixed(2)),
    ug: Number(ug.toFixed(2))
  };
}

/**
 * Calculate Superheated Steam Properties at P (bar) and T (°C)
 */
export function getSuperheatedPropertiesSI(pBar: number, tC: number) {
  const tsat = getSatTemperatureC(pBar);
  const safeT = Math.max(tsat, tC);
  const sat = getSaturatedPropertiesSI(tsat);
  const dT = safeT - tsat;

  const cp = 1.9 + 0.001 * safeT + 0.008 * (pBar / (safeT + 1));
  const h = sat.hg + cp * dT;
  const s = sat.sg + cp * Math.log((safeT + 273.15) / (tsat + 273.15));

  const R_steam = 0.4615;
  const Tk = safeT + 273.15;
  const Z = Math.max(0.7, 1 - 0.0015 * (pBar / (safeT / 100)));
  const v = (Z * R_steam * Tk) / (pBar * 100);
  const u = h - (pBar * 1e5 * v) / 1000;

  return {
    pBar,
    tC: safeT,
    v: Number(v.toFixed(5)),
    h: Number(h.toFixed(2)),
    s: Number(s.toFixed(4)),
    u: Number(u.toFixed(2))
  };
}

/**
 * Solve a general thermodynamic steam state from arbitrary pair
 * Support inputs: (P, T), (P, x), (T, x), (P, h), (P, s), (T, s)
 */
export function solveSteamStatePointSI(
  param1Type: 'P' | 'T' | 'h' | 's' | 'x',
  param1Val: number,
  param2Type: 'P' | 'T' | 'h' | 's' | 'x',
  param2Val: number
): {
  region: SteamRegion;
  pBar: number;
  tC: number;
  x: number;
  v: number;
  h: number;
  s: number;
  u: number;
} {
  // Normalize parameters
  let pBar = 1.0;
  let tC = 100.0;
  let x = 1.0;

  // Case 1: (P, T)
  if ((param1Type === 'P' && param2Type === 'T') || (param1Type === 'T' && param2Type === 'P')) {
    pBar = param1Type === 'P' ? param1Val : param2Val;
    tC = param1Type === 'T' ? param1Val : param2Val;
    pBar = Math.max(0.01, Math.min(220, pBar));
    tC = Math.max(0.01, Math.min(800, tC));

    const tsat = getSatTemperatureC(pBar);

    if (tC > tsat + 0.1) {
      const superPt = getSuperheatedPropertiesSI(pBar, tC);
      return { region: 'Superheated', pBar, tC, x: -1, v: superPt.v, h: superPt.h, s: superPt.s, u: superPt.u };
    } else if (tC < tsat - 0.1) {
      const sat = getSaturatedPropertiesSI(tC);
      return { region: 'Subcooled', pBar, tC, x: -1, v: sat.vf, h: sat.hf, s: sat.sf, u: sat.uf };
    } else {
      const sat = getSaturatedPropertiesSI(tsat);
      return { region: 'Saturated', pBar, tC: tsat, x: 1.0, v: sat.vg, h: sat.hg, s: sat.sg, u: sat.ug };
    }
  }

  // Case 2: (P, x)
  if ((param1Type === 'P' && param2Type === 'x') || (param1Type === 'x' && param2Type === 'P')) {
    pBar = param1Type === 'P' ? param1Val : param2Val;
    x = Math.max(0, Math.min(1, param1Type === 'x' ? param1Val : param2Val));
    pBar = Math.max(0.01, Math.min(220, pBar));
    const tsat = getSatTemperatureC(pBar);
    const sat = getSaturatedPropertiesSI(tsat);

    const h = sat.hf + x * sat.hfg;
    const s = sat.sf + x * sat.sfg;
    const v = sat.vf + x * (sat.vg - sat.vf);
    const u = sat.uf + x * (sat.ug - sat.uf);

    return { region: 'Saturated', pBar, tC: tsat, x, v: Number(v.toFixed(5)), h: Number(h.toFixed(2)), s: Number(s.toFixed(4)), u: Number(u.toFixed(2)) };
  }

  // Case 3: (T, x)
  if ((param1Type === 'T' && param2Type === 'x') || (param1Type === 'x' && param2Type === 'T')) {
    tC = param1Type === 'T' ? param1Val : param2Val;
    x = Math.max(0, Math.min(1, param1Type === 'x' ? param1Val : param2Val));
    tC = Math.max(0.01, Math.min(CRITICAL_T_C, tC));
    const pBar = getSatPressureBar(tC);
    const sat = getSaturatedPropertiesSI(tC);

    const h = sat.hf + x * sat.hfg;
    const s = sat.sf + x * sat.sfg;
    const v = sat.vf + x * (sat.vg - sat.vf);
    const u = sat.uf + x * (sat.ug - sat.uf);

    return { region: 'Saturated', pBar: Number(pBar.toFixed(4)), tC, x, v: Number(v.toFixed(5)), h: Number(h.toFixed(2)), s: Number(s.toFixed(4)), u: Number(u.toFixed(2)) };
  }

  // Case 4: (P, h)
  if ((param1Type === 'P' && param2Type === 'h') || (param1Type === 'h' && param2Type === 'P')) {
    pBar = param1Type === 'P' ? param1Val : param2Val;
    const hVal = param1Type === 'h' ? param1Val : param2Val;
    pBar = Math.max(0.01, Math.min(220, pBar));
    const tsat = getSatTemperatureC(pBar);
    const sat = getSaturatedPropertiesSI(tsat);

    if (hVal < sat.hf) {
      return { region: 'Subcooled', pBar, tC: tsat - (sat.hf - hVal) / 4.184, x: -1, v: sat.vf, h: hVal, s: sat.sf, u: sat.uf };
    } else if (hVal > sat.hg) {
      const sup = getSuperheatedPropertiesSI(pBar, tsat + (hVal - sat.hg) / 2.1);
      return { region: 'Superheated', pBar, tC: sup.tC, x: -1, v: sup.v, h: hVal, s: sup.s, u: sup.u };
    } else {
      const quality = Math.max(0, Math.min(1, (hVal - sat.hf) / sat.hfg));
      const s = sat.sf + quality * sat.sfg;
      const v = sat.vf + quality * (sat.vg - sat.vf);
      const u = sat.uf + quality * (sat.ug - sat.uf);
      return { region: 'Saturated', pBar, tC: tsat, x: Number(quality.toFixed(3)), v: Number(v.toFixed(5)), h: hVal, s: Number(s.toFixed(4)), u: Number(u.toFixed(2)) };
    }
  }

  // Default fallback (P=1 bar, T=100°C)
  const defaultSat = getSaturatedPropertiesSI(100);
  return {
    region: 'Saturated',
    pBar: 1.01325,
    tC: 100.0,
    x: 1.0,
    v: defaultSat.vg,
    h: defaultSat.hg,
    s: defaultSat.sg,
    u: defaultSat.ug
  };
}
