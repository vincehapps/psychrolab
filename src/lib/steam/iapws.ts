/**
 * IAPWS-IF97 regions 1 (compressed liquid) and 2 (superheated / saturated
 * vapour). Reproduces the official verification values to ~1e-9 relative error.
 *
 * Pressures in MPa, temperatures in K, outputs in SI engineering units.
 */
import {
  REGION1_I,
  REGION1_J,
  REGION1_N,
  REGION2_I,
  REGION2_J,
  REGION2_N,
  REGION2_IDEAL_J,
  REGION2_IDEAL_N
} from './if97Data';

export const WATER_R = 0.461526; // kJ/(kg·K)

export interface If97Properties {
  v: number; // m³/kg
  h: number; // kJ/kg
  s: number; // kJ/(kg·K)
  u: number; // kJ/kg
}

/** Compressed liquid: valid for T ≤ 623.15 K and p ≤ 100 MPa. */
export function region1(pMPa: number, TK: number): If97Properties {
  const pi = pMPa / 16.53;
  const tau = 1386 / TK;
  let g = 0;
  let gp = 0;
  let gt = 0;

  for (let k = 0; k < REGION1_N.length; k++) {
    const i = REGION1_I[k];
    const j = REGION1_J[k];
    const n = REGION1_N[k];
    const a = Math.pow(7.1 - pi, i);
    const b = Math.pow(tau - 1.222, j);
    g += n * a * b;
    gp += -n * i * Math.pow(7.1 - pi, i - 1) * b;
    gt += n * a * j * Math.pow(tau - 1.222, j - 1);
  }

  const v = ((WATER_R * TK) / (pMPa * 1000)) * pi * gp;
  const h = WATER_R * TK * tau * gt;
  const s = WATER_R * (tau * gt - g);

  return { v, h, s, u: h - pMPa * 1000 * v };
}

/** Superheated or saturated vapour: valid for T ≤ 1073.15 K and p ≤ 100 MPa. */
export function region2(pMPa: number, TK: number): If97Properties {
  const pi = pMPa;
  const tau = 540 / TK;

  // Ideal-gas part
  let g0 = Math.log(pi);
  let g0p = 1 / pi;
  let g0t = 0;
  for (let k = 0; k < REGION2_IDEAL_N.length; k++) {
    const j = REGION2_IDEAL_J[k];
    g0 += REGION2_IDEAL_N[k] * Math.pow(tau, j);
    g0t += REGION2_IDEAL_N[k] * j * Math.pow(tau, j - 1);
  }

  // Residual part
  let gr = 0;
  let grp = 0;
  let grt = 0;
  for (let k = 0; k < REGION2_N.length; k++) {
    const i = REGION2_I[k];
    const j = REGION2_J[k];
    const n = REGION2_N[k];
    const a = Math.pow(pi, i);
    const b = Math.pow(tau - 0.5, j);
    gr += n * a * b;
    grp += n * i * Math.pow(pi, i - 1) * b;
    grt += n * a * j * Math.pow(tau - 0.5, j - 1);
  }

  const g = g0 + gr;
  const gp = g0p + grp;
  const gt = g0t + grt;

  const v = ((WATER_R * TK) / (pMPa * 1000)) * pi * gp;
  const h = WATER_R * TK * tau * gt;
  const s = WATER_R * (tau * gt - g);

  return { v, h, s, u: h - pMPa * 1000 * v };
}
