/**
 * Minimal ambient declaration for the `psychrolib` CommonJS package, which
 * ships no typings. Only the members the test suite uses are described.
 */
declare module 'psychrolib' {
  interface PsychroLib {
    readonly SI: number;
    readonly IP: number;
    SetUnitSystem(unitSystem: number): void;
    GetUnitSystem(): number;
    GetSatVapPres(tDryBulb: number): number;
    GetSatHumRatio(tDryBulb: number, pressure: number): number;
    GetHumRatioFromVapPres(vapPres: number, pressure: number): number;
    GetVapPresFromHumRatio(humRatio: number, pressure: number): number;
    GetHumRatioFromRelHum(tDryBulb: number, relHum: number, pressure: number): number;
    GetRelHumFromHumRatio(tDryBulb: number, humRatio: number, pressure: number): number;
    GetVapPresFromRelHum(tDryBulb: number, relHum: number): number;
    GetMoistAirEnthalpy(tDryBulb: number, humRatio: number): number;
    GetMoistAirVolume(tDryBulb: number, humRatio: number, pressure: number): number;
    GetTDewPointFromVapPres(tDryBulb: number, vapPres: number): number;
    GetTWetBulbFromRelHum(tDryBulb: number, relHum: number, pressure: number): number;
    GetTWetBulbFromHumRatio(tDryBulb: number, humRatio: number, pressure: number): number;
    GetStandardAtmPressure(altitudeMeters: number): number;
  }

  const psychrolib: PsychroLib;
  export default psychrolib;
}
