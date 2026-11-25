/**
 * Hydronic pipe sizing: Darcy–Weisbach pressure drop with Colebrook–White
 * friction factors, temperature-dependent water properties, and standard
 * nominal-bore selection.
 *
 * All internal units are SI: m³/s, m, Pa, K, W.
 */

export const G = 9.80665;

export interface WaterProps {
  /** kg/m³ */
  density: number;
  /** dynamic viscosity, Pa·s */
  viscosity: number;
  /** specific heat, kJ/(kg·K) */
  cp: number;
}

/**
 * Liquid water properties from 0–100 °C.
 * Density: Kell (1975) polynomial for pure water at 1 atm.
 * Viscosity: Vogel-type correlation μ = 2.414e-5 · 10^(247.8/(T−140)).
 */
export function waterAt(tempC: number): WaterProps {
  const t = Math.min(100, Math.max(0, tempC));
  const tk = t + 273.15;
  const density =
    1000 * (1 - ((t + 288.9414) / (508929.2 * (t + 68.12963))) * Math.pow(t - 3.9863, 2));
  const viscosity = 2.414e-5 * Math.pow(10, 247.8 / (tk - 140));
  const cp = 4.2174 - 0.0022 * t + 0.0000158 * t * t;
  return { density, viscosity, cp };
}

export interface PipeMaterial {
  id: string;
  label: string;
  /** absolute roughness, mm */
  roughnessMm: number;
}

export const PIPE_MATERIALS: PipeMaterial[] = [
  { id: 'steel', label: 'Black steel (new)', roughnessMm: 0.045 },
  { id: 'steel-old', label: 'Steel (used / scaled)', roughnessMm: 0.5 },
  { id: 'copper', label: 'Copper', roughnessMm: 0.0015 },
  { id: 'pex', label: 'PEX / PPR plastic', roughnessMm: 0.007 },
  { id: 'galv', label: 'Galvanised steel', roughnessMm: 0.15 },
  { id: 'cast', label: 'Cast iron', roughnessMm: 0.26 }
];

/** Nominal bore with internal diameter for steel Schedule 40 (mm). */
export const DN_SIZES: { dn: number; idMm: number }[] = [
  { dn: 15, idMm: 15.8 },
  { dn: 20, idMm: 20.9 },
  { dn: 25, idMm: 26.6 },
  { dn: 32, idMm: 35.1 },
  { dn: 40, idMm: 40.9 },
  { dn: 50, idMm: 52.5 },
  { dn: 65, idMm: 62.7 },
  { dn: 80, idMm: 77.9 },
  { dn: 100, idMm: 102.3 },
  { dn: 125, idMm: 128.2 },
  { dn: 150, idMm: 154.1 },
  { dn: 200, idMm: 202.7 },
  { dn: 250, idMm: 254.5 },
  { dn: 300, idMm: 303.2 }
];

export type Regime = 'laminar' | 'transitional' | 'turbulent';

/** Colebrook–White friction factor, solved by fixed-point iteration. */
export function colebrook(reynolds: number, relativeRoughness: number): { f: number; regime: Regime } {
  if (reynolds <= 0) return { f: NaN, regime: 'laminar' };
  if (reynolds < 2300) return { f: 64 / reynolds, regime: 'laminar' };

  // Swamee–Jain explicit start, then Colebrook refinement.
  let f =
    0.25 /
    Math.pow(Math.log10(relativeRoughness / 3.7 + 5.74 / Math.pow(reynolds, 0.9)), 2);

  for (let i = 0; i < 40; i += 1) {
    const rhs = -2 * Math.log10(relativeRoughness / 3.7 + 2.51 / (reynolds * Math.sqrt(f)));
    const next = 1 / (rhs * rhs);
    if (Math.abs(next - f) < 1e-12) {
      f = next;
      break;
    }
    f = next;
  }

  return { f, regime: reynolds < 4000 ? 'transitional' : 'turbulent' };
}

export interface PipeFlow {
  /** internal diameter, m */
  diameter: number;
  velocity: number;
  reynolds: number;
  frictionFactor: number;
  regime: Regime;
  /** Pa per metre of straight pipe */
  paPerM: number;
  /** mm water gauge per metre */
  mmWgPerM: number;
}

/** Evaluate one diameter at a given volumetric flow. */
export function evaluateDiameter(
  flowM3s: number,
  diameterM: number,
  roughnessMm: number,
  tempC: number
): PipeFlow | null {
  if (!(flowM3s > 0) || !(diameterM > 0)) return null;
  const { density, viscosity } = waterAt(tempC);
  const area = (Math.PI * diameterM * diameterM) / 4;
  const velocity = flowM3s / area;
  const reynolds = (density * velocity * diameterM) / viscosity;
  const { f, regime } = colebrook(reynolds, roughnessMm / 1000 / diameterM);
  const paPerM = (f * density * velocity * velocity) / (2 * diameterM);
  return {
    diameter: diameterM,
    velocity,
    reynolds,
    frictionFactor: f,
    regime,
    paPerM,
    mmWgPerM: paPerM / (density * G) * 1000
  };
}

/** Diameter that gives the requested mean velocity. */
export function diameterForVelocity(flowM3s: number, velocity: number): number {
  if (!(flowM3s > 0) || !(velocity > 0)) return NaN;
  return Math.sqrt((4 * flowM3s) / (Math.PI * velocity));
}

/**
 * Diameter that gives the requested pressure gradient. The gradient falls
 * monotonically as diameter grows at fixed flow, so plain bisection is safe.
 */
export function diameterForGradient(
  flowM3s: number,
  targetPaPerM: number,
  roughnessMm: number,
  tempC: number
): number {
  if (!(flowM3s > 0) || !(targetPaPerM > 0)) return NaN;

  let lo = 0.004;
  let hi = 1.5;
  const at = (d: number) => evaluateDiameter(flowM3s, d, roughnessMm, tempC)?.paPerM ?? Infinity;

  if (at(lo) < targetPaPerM) return lo;
  if (at(hi) > targetPaPerM) return hi;

  for (let i = 0; i < 80; i += 1) {
    const mid = (lo + hi) / 2;
    if (at(mid) > targetPaPerM) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export interface PipeRun {
  /** total pressure drop, Pa */
  totalPa: number;
  /** pump head required, m of water */
  headM: number;
  /** hydraulic power transmitted to the fluid, W */
  hydraulicW: number;
  /** shaft power at the given pump efficiency, W */
  pumpW: number;
  /** heat carried at the design ΔT, kW */
  capacityKw: number;
  capacityTons: number;
}

/** Losses for a complete run plus the heat the flow represents. */
export function evaluateRun(
  flow: PipeFlow,
  equivalentLengthM: number,
  pumpEfficiencyPct: number,
  deltaTK: number,
  tempC: number
): PipeRun {
  const { density, cp } = waterAt(tempC);
  const totalPa = flow.paPerM * Math.max(0, equivalentLengthM);
  const flowM3s = (flow.velocity * Math.PI * flow.diameter * flow.diameter) / 4;
  const hydraulicW = totalPa * flowM3s;
  const eff = Math.min(100, Math.max(1, pumpEfficiencyPct)) / 100;
  // cp is kJ/(kg·K), so kg/s · kJ/(kg·K) · K already gives kW.
  const capacityKw = density * flowM3s * cp * deltaTK;
  return {
    totalPa,
    headM: totalPa / (density * G),
    hydraulicW,
    pumpW: hydraulicW / eff,
    capacityKw,
    capacityTons: capacityKw / 3.517
  };
}

export function velocityVerdict(velocity: number): 'low' | 'good' | 'high' | 'excess' {
  if (velocity > 3) return 'excess';
  if (velocity > 2.4) return 'high';
  if (velocity < 0.6) return 'low';
  return 'good';
}

export const VELOCITY_NOTE =
  'Keep mains at roughly 1.2–2.4 m/s and branches at 0.6–1.5 m/s. Above 3 m/s noise and erosion-corrosion rise sharply; below 0.6 m/s air and sediment can settle in horizontal runs.';
