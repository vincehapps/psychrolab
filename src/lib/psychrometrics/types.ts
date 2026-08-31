export type UnitSystem = 'SI' | 'IP';

export type PropertyType =
  | 'DBT'       // Dry-Bulb Temperature (°C / °F)
  | 'WBT'       // Wet-Bulb Temperature (°C / °F)
  | 'DPT'       // Dew Point Temperature (°C / °F)
  | 'RH'        // Relative Humidity (%)
  | 'HUMRAT'    // Humidity Ratio (kg/kg / grains/lb)
  | 'ENTHALPY'; // Enthalpy (kJ/kg / Btu/lb)

export type InputMode = 
  | 'DBT_RH'
  | 'DBT_WBT'
  | 'DBT_DP'
  | 'DBT_HUMRAT'
  | 'DBT_ENTHALPY';

export interface SystemSettings {
  unitSystem: UnitSystem;
  elevation: number; // in meters (SI) or feet (IP)
  pressure: number;  // in Pa / kPa (SI) or Psi / inHg (IP)
}

export interface StatePointInput {
  id: string; // 'P1' | 'P2' | 'P3'
  name: string;
  color: string;
  enabled: boolean;
  type1: PropertyType;
  val1: number;
  type2: PropertyType;
  val2: number;
  // Legacy inputMode compatibility fallback
  inputMode?: InputMode;
  param1?: number;
  param2?: number;
}

export interface StatePointCalculated {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
  // Calculated Thermodynamic Properties
  dbt: number;       // Dry Bulb Temp (C or F)
  wbt: number;       // Wet Bulb Temp (C or F)
  dpt: number;       // Dew Point Temp (C or F)
  rh: number;        // Relative Humidity (%) [0-100]
  humRat: number;    // Humidity Ratio (kg/kg or lb/lb)
  enthalpy: number;  // Enthalpy (kJ/kg or Btu/lb)
  vol: number;       // Specific Volume (m3/kg or ft3/lb)
  vapPress: number;  // Partial Vapor Pressure (kPa or psi)
}

export interface DeltaResult {
  pA: string;
  pB: string;
  dbtDelta: number;
  humRatDelta: number;
  enthalpyDelta: number;
  rhDelta: number;
}
