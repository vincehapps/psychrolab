import { describe, expect, it } from 'vitest';
import {
  DN_SIZES,
  colebrook,
  diameterForGradient,
  diameterForVelocity,
  evaluateDiameter,
  evaluateRun,
  velocityVerdict,
  waterAt,
  G
} from './pipeSizing';

const ROUGHNESS_MM = 0.045; // new black steel
const Q = 0.005; // m³/s = 5 L/s
const TEMP = 20;

describe('water properties', () => {
  it('matches tabulated values at 20 °C', () => {
    const w = waterAt(20);
    expect(w.density).toBeCloseTo(998.2, 0);
    expect(w.viscosity).toBeCloseTo(1.002e-3, 5);
    expect(w.cp).toBeCloseTo(4.18, 1);
  });

  it('matches tabulated values at 60 °C', () => {
    const w = waterAt(60);
    expect(w.density).toBeCloseTo(983.2, 0);
    expect(w.viscosity).toBeCloseTo(4.63e-4, 5);
  });

  it('clamps outside 0–100 °C', () => {
    expect(waterAt(-20).density).toBeCloseTo(waterAt(0).density, 9);
    expect(waterAt(150).density).toBeCloseTo(waterAt(100).density, 9);
  });
});

describe('Colebrook–White', () => {
  it('uses the laminar relation below Re 2300', () => {
    const { f, regime } = colebrook(1000, 0);
    expect(regime).toBe('laminar');
    expect(f).toBeCloseTo(0.064, 9);
  });

  it('flags the transitional band', () => {
    expect(colebrook(3000, 0.001).regime).toBe('transitional');
    expect(colebrook(5000, 0.001).regime).toBe('turbulent');
  });

  it('solves the Colebrook equation in the turbulent regime', () => {
    const re = 120_000;
    const rel = 8.571e-4;
    const { f } = colebrook(re, rel);
    const residual =
      1 / Math.sqrt(f) + 2 * Math.log10(rel / 3.7 + 2.51 / (re * Math.sqrt(f)));
    expect(Math.abs(residual)).toBeLessThan(1e-9);
  });

  it('rises with roughness and falls with Reynolds number', () => {
    expect(colebrook(100_000, 0.005).f).toBeGreaterThan(colebrook(100_000, 0.0001).f);
    expect(colebrook(50_000, 0.001).f).toBeGreaterThan(colebrook(500_000, 0.001).f);
  });
});

describe('flow evaluation', () => {
  const flow = evaluateDiameter(Q, 0.0525, ROUGHNESS_MM, TEMP)!;

  it('derives velocity, Reynolds number and gradient consistently', () => {
    const { density, viscosity } = waterAt(TEMP);
    const area = (Math.PI * 0.0525 * 0.0525) / 4;
    expect(flow.velocity).toBeCloseTo(Q / area, 6);
    expect(flow.reynolds).toBeCloseTo((density * flow.velocity * 0.0525) / viscosity, 3);
    expect(flow.paPerM).toBeCloseTo(
      (flow.frictionFactor * density * flow.velocity ** 2) / (2 * 0.0525),
      6
    );
    expect(flow.mmWgPerM).toBeCloseTo((flow.paPerM / (density * G)) * 1000, 9);
  });

  it('lands in a sensible velocity and pressure-gradient range for DN50', () => {
    expect(flow.velocity).toBeGreaterThan(2.2);
    expect(flow.velocity).toBeLessThan(2.4);
    expect(flow.reynolds).toBeGreaterThan(100_000);
    expect(flow.paPerM).toBeGreaterThan(500);
    expect(flow.paPerM).toBeLessThan(2000);
  });

  it('rejects non-positive inputs', () => {
    expect(evaluateDiameter(0, 0.05, ROUGHNESS_MM, TEMP)).toBeNull();
    expect(evaluateDiameter(Q, 0, ROUGHNESS_MM, TEMP)).toBeNull();
  });

  it('drops pressure gradient as diameter grows', () => {
    const small = evaluateDiameter(Q, 0.03, ROUGHNESS_MM, TEMP)!;
    const large = evaluateDiameter(Q, 0.15, ROUGHNESS_MM, TEMP)!;
    expect(small.paPerM).toBeGreaterThan(large.paPerM);
    expect(small.velocity).toBeGreaterThan(large.velocity);
  });
});

describe('sizing helpers', () => {
  it('returns the diameter for a target velocity', () => {
    const d = diameterForVelocity(Q, 1.5);
    expect(d).toBeCloseTo(Math.sqrt((4 * Q) / (Math.PI * 1.5)), 9);
    expect(evaluateDiameter(Q, d, ROUGHNESS_MM, TEMP)!.velocity).toBeCloseTo(1.5, 6);
  });

  it('inverts the pressure gradient', () => {
    const target = 200;
    const d = diameterForGradient(Q, target, ROUGHNESS_MM, TEMP);
    expect(evaluateDiameter(Q, d, ROUGHNESS_MM, TEMP)!.paPerM).toBeCloseTo(target, 0);
  });

  it('guards invalid inputs', () => {
    expect(Number.isNaN(diameterForVelocity(0, 1))).toBe(true);
    expect(Number.isNaN(diameterForGradient(Q, 0, ROUGHNESS_MM, TEMP))).toBe(true);
  });

  it('exposes a strictly increasing nominal-bore table', () => {
    for (let i = 1; i < DN_SIZES.length; i++) {
      expect(DN_SIZES[i].dn).toBeGreaterThan(DN_SIZES[i - 1].dn);
      expect(DN_SIZES[i].idMm).toBeGreaterThan(DN_SIZES[i - 1].idMm);
    }
  });
});

describe('run evaluation', () => {
  const flow = evaluateDiameter(Q, 0.0525, ROUGHNESS_MM, TEMP)!;

  it('computes head, pump power and capacity from the same flow', () => {
    const run = evaluateRun(flow, 55, 65, 10, TEMP);
    const { density, cp } = waterAt(TEMP);
    const flowM3s = (flow.velocity * Math.PI * flow.diameter ** 2) / 4;

    expect(run.totalPa).toBeCloseTo(flow.paPerM * 55, 6);
    expect(run.headM).toBeCloseTo(run.totalPa / (density * G), 9);
    expect(run.hydraulicW).toBeCloseTo(run.totalPa * flowM3s, 6);
    expect(run.pumpW).toBeCloseTo(run.hydraulicW / 0.65, 6);
    expect(run.capacityKw).toBeCloseTo(density * flowM3s * cp * 10, 6);
    expect(run.capacityTons).toBeCloseTo(run.capacityKw / 3.517, 9);
  });

  it('clamps pump efficiency to 1–100%', () => {
    expect(evaluateRun(flow, 55, 0, 10, TEMP).pumpW).toBeCloseTo(
      evaluateRun(flow, 55, 1, 10, TEMP).pumpW,
      6
    );
    expect(evaluateRun(flow, 55, 150, 10, TEMP).pumpW).toBeCloseTo(
      evaluateRun(flow, 55, 100, 10, TEMP).pumpW,
      6
    );
  });

  it('ignores negative equivalent length', () => {
    expect(evaluateRun(flow, -10, 65, 10, TEMP).totalPa).toBe(0);
  });

  it('flags velocities against the design guidance', () => {
    expect(velocityVerdict(0.4)).toBe('low');
    expect(velocityVerdict(0.6)).toBe('good');
    expect(velocityVerdict(2.4)).toBe('good');
    expect(velocityVerdict(2.5)).toBe('high');
    expect(velocityVerdict(3.5)).toBe('excess');
  });
});
