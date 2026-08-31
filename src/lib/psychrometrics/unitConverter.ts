/**
 * Unit conversion helper functions for PsychroLab (SI <-> IP)
 */

export function cToF(c: number): number {
  return (c * 9) / 5 + 32;
}

export function fToC(f: number): number {
  return ((f - 32) * 5) / 9;
}

export function metersToFeet(m: number): number {
  return m * 3.28084;
}

export function feetToMeters(ft: number): number {
  return ft / 3.28084;
}

export function kPaToPsi(kPa: number): number {
  return kPa * 0.1450377;
}

export function psiTokPa(psi: number): number {
  return psi / 0.1450377;
}

export function kPaToInHg(kPa: number): number {
  return kPa * 0.2952998;
}

export function inHgTokPa(inHg: number): number {
  return inHg / 0.2952998;
}

export function kJPerKgToBtuPerLb(kJ: number): number {
  return kJ * 0.4299226;
}

export function btuPerLbTokJPerKg(btu: number): number {
  return btu / 0.4299226;
}

export function m3PerKgToFt3PerLb(m3: number): number {
  return m3 * 16.018463;
}

export function ft3PerLbToM3PerKg(ft3: number): number {
  return ft3 / 16.018463;
}

/**
 * Standard Barometric Pressure at Elevation (ASHRAE equation)
 * @param elevationMeters Altitude in meters
 * @returns Pressure in Pascals (Pa)
 */
export function getStandardAtmosphericPressureSI(elevationMeters: number): number {
  // P = 101325 * (1 - 2.25577e-5 * Z)^5.2559
  const p = 101325 * Math.pow(1 - 2.25577e-5 * elevationMeters, 5.2559);
  return p;
}
