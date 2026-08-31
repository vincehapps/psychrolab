import { writable, derived } from 'svelte/store';
import { settingsStore, getPrimaryShadeColor } from '../stores/appStore';
import {
  solveSteamStatePointSI,
  getSaturatedPropertiesSI,
  getSatTemperatureC,
  getSatPressureBar,
  getSuperheatedPropertiesSI,
  CRITICAL_T_C,
  type SteamRegion,
  type SteamStateCalculated,
  type SaturationPointSI
} from './steamEngine';

export type SteamInputMode = 'PT' | 'Px' | 'Tx' | 'Ph';

export interface SteamPointInput {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
  mode: SteamInputMode;
  param1: number;
  param2: number;
}

// Default initial state points representing a standard Rankine Steam Cycle:
// 1. High Pressure Superheated Steam (Boiler Outlet)
// 2. Low Pressure Expanded Mixture (Turbine Outlet)
// 3. Saturated Liquid (Condenser Outlet)
// 4. Compressed Subcooled Liquid (Pump Outlet)
export const defaultSteamPoints: SteamPointInput[] = [
  {
    id: 'SP1',
    name: 'State 1 (Turbine Inlet)',
    color: '#3b82f6', // Primary Blue
    enabled: true,
    mode: 'PT',
    param1: 40.0, // 40 bar
    param2: 400.0 // 400 °C
  },
  {
    id: 'SP2',
    name: 'State 2 (Turbine Exit)',
    color: '#60a5fa', // Light Blue
    enabled: true,
    mode: 'Px',
    param1: 0.1,  // 0.1 bar (10 kPa condenser)
    param2: 0.88  // 88% quality
  },
  {
    id: 'SP3',
    name: 'State 3 (Condenser Exit)',
    color: '#2563eb', // Royal Blue
    enabled: true,
    mode: 'Px',
    param1: 0.1,  // 0.1 bar
    param2: 0.0   // Saturated liquid
  },
  {
    id: 'SP4',
    name: 'State 4 (Boiler Feed)',
    color: '#38bdf8', // Cyan Blue
    enabled: true,
    mode: 'PT',
    param1: 40.0, // 40 bar
    param2: 50.0  // 50 °C subcooled
  }
];

export const steamPointsStore = writable<SteamPointInput[]>(defaultSteamPoints);

export const activeSteamPointId = writable<string>('SP1');

// Derived store to calculate full thermodynamic state for all points
export const calculatedSteamPointsStore = derived(
  [steamPointsStore, settingsStore],
  ([$steamPoints, $settings]): SteamStateCalculated[] => {
    const isIP = $settings.unitSystem === 'IP';

    return $steamPoints.map((pt) => {
      let pBar = 1.0;
      let tC = 100.0;
      let x = 1.0;
      let hVal = 2675;

      if (pt.mode === 'PT') {
        pBar = isIP ? pt.param1 / 14.5038 : pt.param1;
        tC = isIP ? ((pt.param2 - 32) * 5) / 9 : pt.param2;
        const res = solveSteamStatePointSI('P', pBar, 'T', tC);
        return formatCalculated(pt, res, isIP);
      } else if (pt.mode === 'Px') {
        pBar = isIP ? pt.param1 / 14.5038 : pt.param1;
        x = pt.param2;
        const res = solveSteamStatePointSI('P', pBar, 'x', x);
        return formatCalculated(pt, res, isIP);
      } else if (pt.mode === 'Tx') {
        tC = isIP ? ((pt.param1 - 32) * 5) / 9 : pt.param1;
        x = pt.param2;
        const res = solveSteamStatePointSI('T', tC, 'x', x);
        return formatCalculated(pt, res, isIP);
      } else {
        // Ph
        pBar = isIP ? pt.param1 / 14.5038 : pt.param1;
        hVal = isIP ? pt.param2 / 0.4299 : pt.param2;
        const res = solveSteamStatePointSI('P', pBar, 'h', hVal);
        return formatCalculated(pt, res, isIP);
      }
    });
  }
);

function formatCalculated(
  pt: SteamPointInput,
  raw: { region: SteamRegion; pBar: number; tC: number; x: number; v: number; h: number; s: number; u: number },
  isIP: boolean
): SteamStateCalculated {
  // Conversions for IP:
  // P: bar -> psi (x 14.5038)
  // T: °C -> °F (x 1.8 + 32)
  // v: m3/kg -> ft3/lb (x 16.0185)
  // h, u: kJ/kg -> Btu/lb (x 0.429923)
  // s: kJ/(kg*K) -> Btu/(lb*R) (x 0.238846)

  const pDisp = isIP ? Number((raw.pBar * 14.5038).toFixed(2)) : Number(raw.pBar.toFixed(3));
  const tDisp = isIP ? Number(((raw.tC * 9) / 5 + 32).toFixed(1)) : Number(raw.tC.toFixed(1));
  const vDisp = isIP ? Number((raw.v * 16.0185).toFixed(4)) : Number(raw.v.toFixed(5));
  const hDisp = isIP ? Number((raw.h * 0.429923).toFixed(1)) : Number(raw.h.toFixed(1));
  const sDisp = isIP ? Number((raw.s * 0.238846).toFixed(4)) : Number(raw.s.toFixed(4));
  const xDisp = raw.x >= 0 ? (raw.x * 100).toFixed(1) + '%' : '— (Pure Phase)';

  return {
    id: pt.id,
    name: pt.name,
    color: pt.color,
    region: raw.region,
    pBar: raw.pBar,
    tC: raw.tC,
    x: raw.x,
    v: raw.v,
    h: raw.h,
    s: raw.s,
    u: raw.u,
    pDisp,
    tDisp,
    vDisp,
    hDisp,
    sDisp,
    xDisp
  };
}

// Add state point
export function addSteamPoint() {
  steamPointsStore.update((pts) => {
    const nextIdx = pts.length + 1;
    const newPt: SteamPointInput = {
      id: `SP${nextIdx}`,
      name: `State ${nextIdx}`,
      color: getPrimaryShadeColor(pts.length),
      enabled: true,
      mode: 'PT',
      param1: 10.0,
      param2: 250.0
    };
    return [...pts, newPt];
  });
}

// Remove state point
export function removeSteamPoint(id: string) {
  steamPointsStore.update((pts) => {
    if (pts.length <= 1) return pts;
    const filtered = pts.filter((p) => p.id !== id);
    return filtered.map((pt, idx) => ({
      ...pt,
      color: getPrimaryShadeColor(idx)
    }));
  });
}

// Update state point
export function updateSteamPoint(id: string, partial: Partial<SteamPointInput>) {
  steamPointsStore.update((pts) =>
    pts.map((p) => (p.id === id ? { ...p, ...partial } : p))
  );
}

// Generate pre-calculated Saturation Table rows for the Table Explorer
export function generateSaturationTableByTemperature(): SaturationPointSI[] {
  const temps = [
    0.01, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
    110, 120, 130, 140, 150, 160, 170, 180, 190, 200,
    220, 240, 260, 280, 300, 320, 340, 360, 373.95
  ];
  return temps.map((t) => getSaturatedPropertiesSI(t));
}

export function generateSaturationTableByPressure(): SaturationPointSI[] {
  const pressuresBar = [
    0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1.0, 1.01325, 2.0, 3.0, 4.0, 5.0, 7.0, 10.0,
    15.0, 20.0, 30.0, 40.0, 50.0, 70.0, 100.0, 150.0, 200.0, 220.64
  ];
  return pressuresBar.map((p) => {
    const t = getSatTemperatureC(p);
    return getSaturatedPropertiesSI(t);
  });
}
