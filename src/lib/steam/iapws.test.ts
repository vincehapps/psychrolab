import { describe, expect, it } from 'vitest';
import { region1, region2 } from './iapws';

/**
 * Official verification values from IAPWS-IF97 Table 5 (region 1) and
 * Table 15 (region 2). Both regions must reproduce them to ~1e-9 relative.
 */
const close = (actual: number, expected: number, relTol = 1e-7) => {
  expect(Math.abs(actual - expected) / Math.abs(expected)).toBeLessThan(relTol);
};

describe('IAPWS-IF97 region 1 (compressed liquid)', () => {
  it('matches the 300 K / 3 MPa reference point', () => {
    const { v, h, s, u } = region1(3, 300);
    close(v, 0.100215168e-2);
    close(h, 0.115331273e3);
    close(s, 0.392294792);
    close(u, 0.112324818e3);
  });

  it('matches the 300 K / 80 MPa reference point', () => {
    const { v, h, s } = region1(80, 300);
    close(v, 0.971180894e-3);
    close(h, 0.184142828e3);
    close(s, 0.368563852);
  });

  it('matches the 500 K / 3 MPa reference point', () => {
    const { v, h, s } = region1(3, 500);
    close(v, 0.120241800e-2);
    close(h, 0.975542239e3);
    close(s, 1.07478257);
  });
});

describe('IAPWS-IF97 region 2 (vapour)', () => {
  it('matches the 300 K / 0.0035 MPa reference point', () => {
    const { v, h, s } = region2(0.0035, 300);
    close(v, 0.394913866e2);
    close(h, 0.254991145e4);
    close(s, 0.852238967);
  });

  it('matches the 700 K / 0.0035 MPa reference point', () => {
    const { v, h, s } = region2(0.0035, 700);
    close(v, 0.923015898e2);
    close(h, 0.333568375e4);
    close(s, 1.94617551);
  });

  it('matches the 700 K / 30 MPa reference point', () => {
    const { v, h, s } = region2(30, 700);
    close(v, 0.542946619e-2);
    close(h, 0.263149474e4);
    close(s, 1.94128728);
  });
});

describe('thermodynamic consistency', () => {
  it('satisfies u = h - p·v in both regions', () => {
    const liquid = region1(10, 400);
    const vapour = region2(10, 700);
    expect(liquid.u).toBeCloseTo(liquid.h - 10_000 * liquid.v, 6);
    expect(vapour.u).toBeCloseTo(vapour.h - 10_000 * vapour.v, 6);
  });
});
