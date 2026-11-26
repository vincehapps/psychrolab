/**
 * ASHRAE Standard 55 / ISO 7730 thermal comfort.
 *
 * PMV is evaluated with the ISO 7730 iterative clothing-surface-temperature
 * solution; the graphic-method comfort envelopes are then derived from it rather
 * than tabulated by hand, so the zone boundaries respond to clothing and
 * metabolic rate.
 */

export interface PmvInput {
  /** Air temperature, °C. */
  ta: number;
  /** Mean radiant temperature, °C. Defaults to the air temperature. */
  tr?: number;
  /** Relative humidity, %. */
  rh: number;
  /** Clothing insulation, clo. */
  clo: number;
  /** Metabolic rate, met. */
  met: number;
  /** Relative air speed, m/s. */
  var?: number;
}

export interface ComfortZone {
  key: 'summer' | 'winter';
  label: string;
  tMinC: number;
  tMaxC: number;
  wMin: number; // kg/kg
  wMax: number; // kg/kg
  pmvMin: number;
  pmvMax: number;
  color: string;
}

/** Predicted Mean Vote on the ASHRAE 7-point scale (-3 cold … +3 hot). */
export function pmv({ ta, tr = ta, rh, clo, met, var: airSpeed = 0.1 }: PmvInput): number {
  const M = met * 58.15; // W/m²
  const W = 0; // no external work
  const Icl = clo * 0.155; // m²K/W
  const fcl = Icl <= 0.078 ? 1 + 1.29 * Icl : 1.05 + 0.645 * Icl;
  const pSat = 610.5 * Math.exp((17.269 * ta) / (237.3 + ta)); // Pa
  const pa = (rh / 100) * pSat;

  // Solve the clothing surface temperature (ISO 7730 Annex D). The radiation
  // term is stiff enough that a plain fixed-point iteration diverges at high
  // clothing insulation, so relax it with a damping factor.
  const neutral = 35.7 - 0.028 * (M - W);
  let tcl = neutral;
  let hc = 12.1 * Math.sqrt(airSpeed);
  for (let i = 0; i < 800; i++) {
    const natural = 2.38 * Math.pow(Math.abs(tcl - ta), 0.25);
    hc = Math.max(12.1 * Math.sqrt(airSpeed), natural);
    const next =
      35.7 -
      0.028 * (M - W) -
      Icl *
        (3.96e-8 * fcl * (Math.pow(tcl + 273, 4) - Math.pow(tr + 273, 4)) +
          fcl * hc * (tcl - ta));
    const relaxed = tcl + 0.3 * (next - tcl);
    if (Math.abs(relaxed - tcl) < 1e-5) {
      tcl = relaxed;
      break;
    }
    tcl = relaxed;
  }

  const L =
    M -
    W -
    3.96e-8 * fcl * (Math.pow(tcl + 273, 4) - Math.pow(tr + 273, 4)) -
    fcl * hc * (tcl - ta) -
    3.05e-3 * (5733 - 6.99 * (M - W) - pa) -
    0.42 * (M - W - 58.15) -
    1.7e-5 * M * (5867 - pa) -
    0.0014 * M * (34 - ta);

  return (0.303 * Math.exp(-0.036 * M) + 0.028) * L;
}

/** Predicted Percentage Dissatisfied, %. */
export function ppd(pmvValue: number): number {
  return 100 - 95 * Math.exp(-0.03353 * Math.pow(pmvValue, 4) - 0.2179 * Math.pow(pmvValue, 2));
}

/**
 * Dry-bulb band where |PMV| <= 0.5 (PPD <= 10%) at 50% RH, still air and
 * radiant temperature equal to air temperature.
 */
function comfortBand(clo: number, met: number): { tMinC: number; tMaxC: number } {
  let tMin = NaN;
  let tMax = NaN;
  for (let t = 15; t <= 34.0001; t += 0.1) {
    if (Math.abs(pmv({ ta: t, rh: 50, clo, met })) <= 0.5) {
      if (Number.isNaN(tMin)) tMin = t;
      tMax = t;
    }
  }
  // Round inwards so the displayed band still satisfies |PMV| <= 0.5.
  const roundDown = (v: number) => Math.ceil(v * 2) / 2;
  const roundUp = (v: number) => Math.floor(v * 2) / 2;
  return { tMinC: roundDown(tMin), tMaxC: roundUp(tMax) };
}

function zone(
  key: ComfortZone['key'],
  label: string,
  clo: number,
  wMin: number,
  wMax: number,
  color: string
): ComfortZone {
  const { tMinC, tMaxC } = comfortBand(clo, 1.1);
  return {
    key,
    label,
    tMinC,
    tMaxC,
    wMin,
    wMax,
    pmvMin: pmv({ ta: tMinC, rh: 50, clo, met: 1.1 }),
    pmvMax: pmv({ ta: tMaxC, rh: 50, clo, met: 1.1 }),
    color
  };
}

/** Graphic-method humidity caps with PMV-derived temperature limits. */
export const ASHRAE55_ZONES: ComfortZone[] = [
  zone('summer', 'ASHRAE 55 summer — 0.5 clo, 1.1 met', 0.5, 0.004, 0.012, '#22c55e'),
  zone('winter', 'ASHRAE 55 winter — 1.0 clo, 1.1 met', 1.0, 0.002, 0.008, '#38bdf8')
];

export const ASHRAE55_NOTE =
  'ISO 7730 PMV comfort bands (|PMV| ≤ 0.5, PPD ≤ 10%) at 50% RH, 0.1 m/s air speed and 1.1 met, with the ASHRAE 55 graphic-method humidity limits.';
