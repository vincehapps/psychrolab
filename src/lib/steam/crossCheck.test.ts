import { beforeAll, describe, expect, it } from 'vitest';
import {
  getSaturatedPropertiesSI,
  getSatTemperatureC,
  getSuperheatedPropertiesSI,
  solveSteamStatePointSI
} from './steamEngine';
import { region1, region2 } from './iapws';

/**
 * Cross-validation against CoolProp (IAPWS-95 for water), which is a second,
 * independent implementation of the same thermodynamic standard. IF97 and
 * IAPWS-95 are different formulations, so exact equality is not expected —
 * what matters is that they agree to a small fraction of a percent, which no
 * arithmetic slip or transposed coefficient in a hand-written table would
 * survive.
 */
let cp: any = null;

beforeAll(async () => {
  const mod: any = await import('coolprop-wasm/coolprop');
  const factory = typeof mod === 'function' ? mod : mod.default;
  cp = await factory();
}, 60_000);

const water = (out: string, k1: string, v1: number, k2: string, v2: number): number =>
  cp.PropsSI(out, k1, v1, k2, v2, 'Water');

const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b);

describe('steam engine vs CoolProp IAPWS-95', () => {
  it('agrees on saturated liquid and vapour properties up to 340 °C', () => {
    for (const t of [50, 100, 150, 200, 250, 300, 340]) {
      const mine = getSaturatedPropertiesSI(t);
      const T = t + 273.15;
      const hf = water('H', 'T', T, 'Q', 0) / 1000;
      const hg = water('H', 'T', T, 'Q', 1) / 1000;
      const sf = water('S', 'T', T, 'Q', 0) / 1000;
      const sg = water('S', 'T', T, 'Q', 1) / 1000;
      const vf = 1 / water('D', 'T', T, 'Q', 0);
      const vg = 1 / water('D', 'T', T, 'Q', 1);

      expect(rel(mine.hf, hf), `hf at ${t} °C`).toBeLessThan(1e-3);
      expect(rel(mine.hg, hg), `hg at ${t} °C`).toBeLessThan(1e-3);
      expect(Math.abs(mine.sf - sf), `sf at ${t} °C`).toBeLessThan(1e-3);
      expect(Math.abs(mine.sg - sg), `sg at ${t} °C`).toBeLessThan(1e-3);
      expect(rel(mine.vf, vf), `vf at ${t} °C`).toBeLessThan(1e-3);
      expect(rel(mine.vg, vg), `vg at ${t} °C`).toBeLessThan(1e-3);
    }
  });

  it('agrees with IAPWS-95 on superheated steam', () => {
    for (const [pBar, tC] of [
      [1, 200],
      [10, 250],
      [40, 400],
      [100, 500]
    ]) {
      const mine = getSuperheatedPropertiesSI(pBar, tC);
      const h = water('H', 'P', pBar * 1e5, 'T', tC + 273.15) / 1000;
      const s = water('S', 'P', pBar * 1e5, 'T', tC + 273.15) / 1000;
      expect(rel(mine.h, h), `h at ${pBar} bar / ${tC} °C`).toBeLessThan(1e-4);
      expect(rel(mine.s, s), `s at ${pBar} bar / ${tC} °C`).toBeLessThan(1e-4);
    }
  });

  it('agrees on the state-point solver for superheated and compressed states', () => {
    const sup = solveSteamStatePointSI('P', 40, 'T', 400);
    expect(rel(sup.h, water('H', 'P', 40e5, 'T', 673.15) / 1000)).toBeLessThan(1e-4);

    const sub = solveSteamStatePointSI('P', 40, 'T', 50);
    expect(rel(sub.h, water('H', 'P', 40e5, 'T', 323.15) / 1000)).toBeLessThan(1e-3);
  });

  it('agrees on the raw region equations at their verification points', () => {
    const r1 = region1(3, 500);
    expect(rel(r1.h, water('H', 'P', 3e6, 'T', 500) / 1000)).toBeLessThan(1e-4);

    const r2 = region2(30, 700);
    expect(rel(r2.h, water('H', 'P', 30e6, 'T', 700) / 1000)).toBeLessThan(1e-4);
    expect(rel(r2.s, water('S', 'P', 30e6, 'T', 700) / 1000)).toBeLessThan(1e-4);
  });

  it('agrees on saturation temperature from a pressure', () => {
    for (const pBar of [0.1, 1, 10, 40, 100]) {
      const mine = getSatTemperatureC(pBar);
      const ref = water('T', 'P', pBar * 1e5, 'Q', 0) - 273.15;
      expect(Math.abs(mine - ref), `${pBar} bar`).toBeLessThan(0.1);
    }
  });

  it('degrades near the critical point, a known IF97 region-4 limitation', () => {
    // The saturation curve is a backward-fit equation that loses accuracy inside
    // roughly 15 K of the critical point. Pinning the size of that deviation
    // documents the limit instead of hiding it behind a loose global tolerance.
    const mine = getSaturatedPropertiesSI(370);
    const hf = water('H', 'T', 643.15, 'Q', 0) / 1000;
    expect(Math.abs(mine.hf - hf) / hf).toBeGreaterThan(0.03);
  });
});
