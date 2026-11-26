import type { SteamPointInput } from './steamStore';

export interface RankinePreset {
  id: string;
  label: string;
  note: string;
  /** Four state points: turbine inlet, turbine exit, condenser exit, boiler feed. */
  points: SteamPointInput[];
}

function cycle(
  p1: number,
  t1: number,
  p2: number,
  x2: number,
  t4: number
): SteamPointInput[] {
  return [
    {
      id: 'SP1',
      name: 'State 1 (Turbine Inlet)',
      color: '#3b82f6',
      enabled: true,
      mode: 'PT',
      param1: p1,
      param2: t1
    },
    {
      id: 'SP2',
      name: 'State 2 (Turbine Exit)',
      color: '#60a5fa',
      enabled: true,
      mode: 'Px',
      param1: p2,
      param2: x2
    },
    {
      id: 'SP3',
      name: 'State 3 (Condenser Exit)',
      color: '#2563eb',
      enabled: true,
      mode: 'Px',
      param1: p2,
      param2: 0
    },
    {
      id: 'SP4',
      name: 'State 4 (Boiler Feed)',
      color: '#38bdf8',
      enabled: true,
      mode: 'PT',
      param1: p1,
      param2: t4
    }
  ];
}

export const RANKINE_PRESETS: RankinePreset[] = [
  {
    id: 'condensing',
    label: 'Condensing 40 bar / 400 °C',
    note: 'Textbook condensing cycle: 40 bar, 400 °C superheat, 0.1 bar condenser, 88% exit quality.',
    points: cycle(40, 400, 0.1, 0.88, 50)
  },
  {
    id: 'high-pressure',
    label: 'High pressure 100 bar / 500 °C',
    note: 'Utility-style steam conditions with a deep vacuum condenser and 60 °C feedwater.',
    points: cycle(100, 500, 0.05, 0.85, 60)
  },
  {
    id: 'back-pressure',
    label: 'Back-pressure 20 bar / 3 bar',
    note: 'Industrial CHP cycle exhausting to a 3 bar process main at 95% quality.',
    // Feedwater must sit above the 133.5 °C saturation temperature at 3 bar,
    // otherwise the pump would have to cool the liquid to reach the boiler.
    points: cycle(20, 350, 3, 0.95, 140)
  },
  {
    id: 'low-temperature',
    label: 'Low temperature 10 bar / 250 °C',
    note: 'Small low-temperature cycle, 0.15 bar condenser and 60 °C feedwater, for waste-heat and biomass duties.',
    // 0.15 bar saturates at 54 °C, so 60 °C is the coolest feedwater that still
    // leaves the pump doing positive work.
    points: cycle(10, 250, 0.15, 0.9, 60)
  }
];
