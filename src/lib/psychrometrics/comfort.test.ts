import { describe, expect, it } from 'vitest';
import { ASHRAE55_ZONES, pmv, ppd } from './comfort';

describe('PMV', () => {
  it('matches the ISO 7730 worked example', () => {
    // ISO 7730 Annex D: ta = tr = 22 °C, 60% RH, 0.5 clo, 1.2 met → PMV -0.75, PPD 17%.
    const value = pmv({ ta: 22, rh: 60, clo: 0.5, met: 1.2 });
    expect(value).toBeCloseTo(-0.75, 2);
    expect(ppd(value)).toBeCloseTo(17, 0);
  });

  it('is neutral near the centre of the comfort band', () => {
    const value = pmv({ ta: 24, rh: 50, clo: 0.5, met: 1.2 });
    expect(Math.abs(value)).toBeLessThan(0.3);
  });

  it('increases monotonically with temperature', () => {
    const temps = [16, 20, 24, 28, 32];
    const votes = temps.map((ta) => pmv({ ta, rh: 50, clo: 0.5, met: 1.2 }));
    for (let i = 1; i < votes.length; i++) {
      expect(votes[i]).toBeGreaterThan(votes[i - 1]);
    }
  });

  it('votes warmer when clothing insulation rises', () => {
    const light = pmv({ ta: 22, rh: 50, clo: 0.5, met: 1.1 });
    const heavy = pmv({ ta: 22, rh: 50, clo: 1.0, met: 1.1 });
    // More insulation traps heat, so the same room feels warmer.
    expect(heavy).toBeGreaterThan(light);
  });

  it('treats mean radiant temperature as air temperature by default', () => {
    expect(pmv({ ta: 24, rh: 50, clo: 0.5, met: 1.1 })).toBeCloseTo(
      pmv({ ta: 24, tr: 24, rh: 50, clo: 0.5, met: 1.1 }),
      10
    );
  });
});

describe('PPD', () => {
  it('is 5% for a neutral vote and symmetric about zero', () => {
    expect(ppd(0)).toBeCloseTo(5, 6);
    expect(ppd(1.5)).toBeCloseTo(ppd(-1.5), 6);
  });

  it('exceeds 10% outside |PMV| = 0.5', () => {
    expect(ppd(0.5)).toBeGreaterThan(10);
    expect(ppd(2.5)).toBeGreaterThan(70);
  });
});

describe('ASHRAE 55 zones', () => {
  it('defines ordered summer and winter bands', () => {
    const summer = ASHRAE55_ZONES.find((z) => z.key === 'summer')!;
    const winter = ASHRAE55_ZONES.find((z) => z.key === 'winter')!;

    for (const zone of [summer, winter]) {
      expect(zone.tMaxC).toBeGreaterThan(zone.tMinC);
      expect(zone.wMax).toBeGreaterThan(zone.wMin);
      // Band edges were derived from |PMV| <= 0.5, allowing for 0.5 °C rounding.
      expect(Math.abs(zone.pmvMin)).toBeLessThanOrEqual(0.55);
      expect(Math.abs(zone.pmvMax)).toBeLessThanOrEqual(0.55);
    }

    // Winter clothing shifts the acceptable band cooler than the summer band.
    expect(winter.tMinC).toBeLessThan(summer.tMinC);
    expect(winter.tMaxC).toBeLessThanOrEqual(summer.tMaxC);
  });

  it('keeps the summer band inside a plausible cooling setpoint range', () => {
    const summer = ASHRAE55_ZONES.find((z) => z.key === 'summer')!;
    expect(summer.tMinC).toBeGreaterThan(23);
    expect(summer.tMaxC).toBeLessThan(28);
  });
});
