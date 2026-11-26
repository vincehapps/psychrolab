/**
 * Air-side HVAC process calculations built on the ASHRAE psychrometric engine:
 * airstream mixing, coil sensible/latent split, SHR, and airflow / capacity
 * unit conversions.
 */
import { solveStatePointFromPairSI } from './engine';

export const AIR_CP = 1.006; // kJ/(kg·K) dry air
export const WATER_HFG = 2500.5; // kJ/kg at ~15 °C
export const KW_PER_TR = 3.5168525; // kW per refrigeration ton
export const M3S_PER_CFM = 0.00047194745; // 1 cfm = 0.000471947 m³/s

export interface AirStream {
  tC: number;
  rhPercent: number;
  /** Volume flow in m³/s */
  flowM3s: number;
}

export interface MixedAirResult {
  dbt: number;
  w: number;
  h: number;
  rh: number;
  dpt: number;
  vol: number;
  massFlow: number; // kg dry air / s
  totalFlowM3s: number;
}

/**
 * Mass-weighted mixing of moist-air streams. Volume flow is converted to mass
 * flow using each stream's own specific volume, so the mixed state is exact
 * even when the streams are far apart in temperature.
 */
export function mixAirstreams(streams: AirStream[], pPa: number): MixedAirResult | null {
  const valid = streams.filter((s) => Number.isFinite(s.tC) && s.rhPercent > 0 && s.rhPercent <= 100 && s.flowM3s > 0);
  if (valid.length < 1) return null;

  let mTotal = 0;
  let mw = 0;
  let mh = 0;
  let volTotal = 0;

  for (const s of valid) {
    const st = solveStatePointFromPairSI('DBT', s.tC, 'RH', s.rhPercent, pPa);
    const m = s.flowM3s / st.vol;
    mTotal += m;
    mw += m * st.humRat;
    mh += m * st.enthalpy;
    volTotal += s.flowM3s;
  }

  if (!Number.isFinite(mTotal) || mTotal <= 0) return null;

  const w = mw / mTotal;
  const h = mh / mTotal;
  const mixed = solveStatePointFromPairSI('ENTHALPY', h, 'HUMRAT', w, pPa);

  return {
    dbt: mixed.dbt,
    w: mixed.humRat,
    h: mixed.enthalpy,
    rh: mixed.rh,
    dpt: mixed.dpt,
    vol: mixed.vol,
    massFlow: mTotal,
    totalFlowM3s: volTotal
  };
}

export interface CoilLoadResult {
  totalKW: number;
  sensibleKW: number;
  latentKW: number;
  shr: number;
  tons: number;
  massFlow: number;
}

/**
 * Coil (or any process) load between two states at a known dry-air mass flow.
 * Sensible uses cp·ΔT, latent uses the humidity-ratio change, and total is
 * the enthalpy difference — the three agree because h is linear in T and W.
 */
export function coilLoad(
  massFlowKgS: number,
  entering: { tC: number; w: number; h: number },
  leaving: { tC: number; w: number; h: number }
): CoilLoadResult {
  const sensibleKW = massFlowKgS * AIR_CP * (entering.tC - leaving.tC);
  const latentKW = massFlowKgS * WATER_HFG * (entering.w - leaving.w);
  const totalKW = massFlowKgS * (entering.h - leaving.h);
  const shr = totalKW !== 0 ? sensibleKW / totalKW : Number.NaN;
  return {
    totalKW,
    sensibleKW,
    latentKW,
    shr,
    tons: totalKW / KW_PER_TR,
    massFlow: massFlowKgS
  };
}

/**
 * Sensible Heat Ratio of a straight line on the chart.
 * SHR = cp·ΔT / (cp·ΔT + hfg·ΔW)
 */
export function sensibleHeatRatio(dT: number, dW: number): number {
  const qs = AIR_CP * dT;
  const ql = WATER_HFG * dW;
  const total = qs + ql;
  if (!Number.isFinite(total) || total === 0) return Number.NaN;
  return qs / total;
}

export const cfmToM3s = (cfm: number) => cfm * M3S_PER_CFM;
export const m3sToCfm = (m3s: number) => m3s / M3S_PER_CFM;
export const lpsToM3s = (lps: number) => lps / 1000;
export const m3sToLps = (m3s: number) => m3s * 1000;
export const kwToTons = (kw: number) => kw / KW_PER_TR;
export const tonsToKw = (tr: number) => tr * KW_PER_TR;
export const kwToBtuh = (kw: number) => kw * 3412.142;
