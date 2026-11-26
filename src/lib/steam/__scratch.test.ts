import { it } from 'vitest';
import { region1, region2 } from './iapws';
import * as data from './if97Data';

it('dump', () => {
  console.log(JSON.stringify({
    r1_500_3: region1(3, 500),
    r2_300_0035: region2(0.0035, 300),
    r2_700_0035: region2(0.0035, 700),
    r2_700_30: region2(30, 700),
    n1: data.REGION1_N.length,
    n2: data.REGION2_N.length,
    n2ideal: data.REGION2_IDEAL_N.length,
    firstN2: data.REGION2_N.slice(0, 5),
    firstI2: data.REGION2_I.slice(0, 5),
    firstJ2: data.REGION2_J.slice(0, 5),
    idealN: data.REGION2_IDEAL_N,
    idealJ: data.REGION2_IDEAL_J
  }, null, 2));
});
