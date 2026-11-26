import { beforeAll, describe, expect, it } from 'vitest';
import { computeCycle, ensureRefrigerantReady, type CycleInput } from './cycle';
import { REFRIGERANTS, getCritical, getSat } from './engine';

/**
 * The cycle is solved with CoolProp (HEOS) through the WASM build that the app
 * itself uses, so these tests check the cycle algebra on top of it: energy
 * conservation, isenthalpic expansion, capacity sizing, the direction of every
 * control, and saturation anchors taken from printed refrigerant tables.
 */
beforeAll(async () => {
  await ensureRefrigerantReady();
}, 60_000);

const BASE: CycleInput = {
  refrigerant: 'R134a',
  teC: 0,
  tcC: 40,
  subcoolK: 5,
  superheatK: 5,
  isenEff: 0.7,
  capacityKW: 10
};

const cycle = (over: Partial<CycleInput> = {}) => computeCycle({ ...BASE, ...over });

describe('R-134a cycle at 0 / 40 °C', () => {
  it('sits on the tabulated saturation pressures', () => {
    const r = cycle();
    // ASHRAE tables: R-134a Psat is 2.928 bar at 0 °C and 10.166 bar at 40 °C.
    expect(r.peBar).toBeCloseTo(2.928, 1);
    expect(r.pcBar).toBeCloseTo(10.166, 1);
    expect(Math.abs(r.peBar - 2.928) / 2.928).toBeLessThan(0.01);
    expect(Math.abs(r.pcBar - 10.166) / 10.166).toBeLessThan(0.01);
  });

  it('places the four states at the expected temperatures', () => {
    const r = cycle();
    expect(r.states).toHaveLength(4);
    expect(r.states[0].tC).toBeCloseTo(5, 6); // te + superheat
    expect(r.states[1].pBar).toBeCloseTo(r.pcBar, 9);
    expect(r.states[2].tC).toBeCloseTo(35, 6); // tc - subcool
    expect(r.states[3].tC).toBeCloseTo(0, 6);
  });

  it('labels each state by its phase', () => {
    const r = cycle();
    expect(r.states[0].region).toBe('Superheated vapor'); // suction, superheated 5 K
    expect(r.states[1].region).toBe('Superheated vapor'); // discharge
    expect(r.states[2].region).toBe('Subcooled liquid'); // condenser outlet, 5 K subcooled
    expect(r.states[3].region).toMatch(/^Two-phase/); // after the expansion valve
    expect(r.states[3].q).toBeGreaterThan(0.2);
    expect(r.states[3].q).toBeLessThan(0.3);
  });

  it('closes the energy balance around the loop', () => {
    const r = cycle();
    expect(r.qr).toBeCloseTo(r.qa + r.wc, 9);
    expect(r.cop).toBeCloseTo(r.qa / r.wc, 9);
    expect(r.qa).toBeCloseTo(r.states[0].h - r.states[3].h, 9);
    expect(r.wc).toBeCloseTo(r.states[1].h - r.states[0].h, 9);
    expect(r.qr).toBeCloseTo(r.states[1].h - r.states[2].h, 9);
  });

  it('expands isenthalpically through the valve', () => {
    const r = cycle();
    expect(r.states[3].h).toBe(r.states[2].h);
  });

  it('sizes the machine from the required capacity', () => {
    const r = cycle();
    expect(r.massFlow).toBeCloseTo(10 / r.qa, 9);
    expect(r.compressorKW).toBeCloseTo(r.massFlow * r.wc, 9);
    expect(r.condDuty).toBeCloseTo(r.massFlow * r.qr, 9);
    expect(r.condDuty).toBeCloseTo(10 + r.compressorKW, 6);
    expect(r.tr).toBeCloseTo(10 / 3.5167, 6);
    expect(r.volumeFlow).toBeCloseTo(r.massFlow * r.states[0].v, 9);
  });

  it('lands inside the band bounded by the Carnot COP', () => {
    const r = cycle();
    const carnot = (BASE.teC + 273.15) / (BASE.tcC - BASE.teC);
    expect(r.cop).toBeLessThan(carnot);
    expect(r.cop).toBeGreaterThan(0.5 * carnot);
    // Regression anchor for the 0.7 isentropic efficiency baseline.
    expect(r.cop).toBeCloseTo(4.05, 1);
  });
});

describe('control directions', () => {
  it('improves COP as isentropic efficiency rises', () => {
    const poor = cycle({ isenEff: 0.4 });
    const base = cycle({ isenEff: 0.7 });
    const ideal = cycle({ isenEff: 1 });
    expect(ideal.cop).toBeGreaterThan(base.cop);
    expect(base.cop).toBeGreaterThan(poor.cop);
    expect(ideal.wc).toBeLessThan(base.wc);
  });

  it('loses COP as the condensing temperature rises', () => {
    const cool = cycle({ tcC: 35 });
    const warm = cycle({ tcC: 45 });
    expect(warm.cop).toBeLessThan(cool.cop);
    expect(warm.pcBar).toBeGreaterThan(cool.pcBar);
  });

  it('gains COP as the evaporating temperature rises', () => {
    const low = cycle({ teC: -10, tcC: 40 });
    const high = cycle({ teC: 5, tcC: 40 });
    expect(high.cop).toBeGreaterThan(low.cop);
    expect(high.peBar).toBeGreaterThan(low.peBar);
  });

  it('raises the refrigerating effect with subcooling', () => {
    const none = cycle({ subcoolK: 0 });
    const deep = cycle({ subcoolK: 10 });
    expect(deep.qa).toBeGreaterThan(none.qa);
    expect(deep.states[2].tC).toBeCloseTo(30, 6);
  });

  it('reports saturation for an unsuperheated suction state', () => {
    const r = cycle({ superheatK: 0 });
    expect(r.states[0].tC).toBeCloseTo(BASE.teC, 6);
    expect(r.states[0].region).toBe('Saturated vapor');
  });

  it('falls back to a specific-basis result without a capacity', () => {
    const r = cycle({ capacityKW: 0 });
    expect(r.massFlow).toBe(0);
    expect(r.tr).toBe(0);
    expect(r.condDuty).toBe(0);
    expect(r.qa).toBeGreaterThan(0);
    expect(r.wc).toBeGreaterThan(0);
    expect(r.cop).toBeGreaterThan(1);
  });
});

describe('refrigerant data', () => {
  it('matches published critical points', () => {
    const published: Record<string, [number, number]> = {
      R134a: [101.06, 40.59],
      R22: [96.15, 49.9],
      R410A: [71.34, 49.0],
      R717: [132.25, 113.33],
      R290: [96.74, 42.51],
      R32: [78.11, 57.82]
    };
    for (const { id } of REFRIGERANTS) {
      const crit = getCritical(id);
      const [tC, pBar] = published[id];
      expect(Math.abs(crit.tC - tC), `${id} Tcrit`).toBeLessThan(0.5);
      expect(Math.abs(crit.pBar - pBar) / pBar, `${id} Pcrit`).toBeLessThan(0.01);
    }
  });

  it('gives saturated R-134a properties that close on hfg', () => {
    const sat = getSat('R134a', 0);
    expect(sat.hf).toBeCloseTo(200.0, 1);
    expect(sat.hfg).toBeCloseTo(198.7, 0);
    expect(sat.hfg).toBeGreaterThan(190);
    expect(sat.hfg).toBeLessThan(205);
    expect(sat.vf).toBeLessThan(sat.vg);
    expect(sat.sg).toBeGreaterThan(sat.sf);
    expect(sat.pBar).toBeCloseTo(2.928, 1);
  });

  it('solves a cycle for every advertised refrigerant', () => {
    for (const { id } of REFRIGERANTS) {
      const r = computeCycle({ ...BASE, refrigerant: id, teC: -5, tcC: 35 });
      expect(r.cop, id).toBeGreaterThan(1.5);
      expect(r.qa, id).toBeGreaterThan(50);
      expect(r.wc, id).toBeGreaterThan(0);
      expect(r.qr, id).toBeCloseTo(r.qa + r.wc, 9);
    }
  });
});
