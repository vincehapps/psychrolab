/**
 * ASHRAE Standard 55 thermal comfort envelopes, expressed as humidity-ratio /
 * dry-bulb rectangles for the graphic-method comfort zone.
 *
 * These are the graphic-method limits for a sedentary office (1.1 met) at the
 * clothing levels noted, with the standard humidity caps. They are a design aid
 * visualisation, not a substitute for the full PMV/PPD calculation.
 */

export interface ComfortZone {
  key: 'summer' | 'winter';
  label: string;
  tMinC: number;
  tMaxC: number;
  wMin: number; // kg/kg
  wMax: number; // kg/kg
  color: string;
}

export const ASHRAE55_ZONES: ComfortZone[] = [
  {
    key: 'summer',
    label: 'ASHRAE 55 summer — 0.5 clo, 1.1 met',
    tMinC: 23,
    tMaxC: 26.5,
    wMin: 0.004,
    wMax: 0.012,
    color: '#22c55e'
  },
  {
    key: 'winter',
    label: 'ASHRAE 55 winter — 1.0 clo, 1.1 met',
    tMinC: 20,
    tMaxC: 24,
    wMin: 0.002,
    wMax: 0.008,
    color: '#38bdf8'
  }
];

export const ASHRAE55_NOTE =
  'ASHRAE 55-2017 graphic method, sedentary office (1.1 met). Shown as an approximation of the comfort envelope on the chart.';
