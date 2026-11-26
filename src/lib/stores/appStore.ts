import { writable, derived, get } from 'svelte/store';
import type { SystemSettings, StatePointInput, StatePointCalculated, UnitSystem, PropertyType } from '../psychrometrics/types';
import { evaluateStatePoint, calculateDelta } from '../psychrometrics/engine';
import { cToF } from '../psychrometrics/unitConverter';
import { trackEvent } from '../analytics';

export type ChartView = 'psychrometric' | 'mollier';

// Helper to get different shades of primary blue color
export function getPrimaryShadeColor(index: number): string {
  const primaryPalette = [
    '#3b82f6', // Primary Blue (Blue-500)
    '#60a5fa', // Light Sky Blue (Blue-400)
    '#2563eb', // Vibrant Royal Blue (Blue-600)
    '#38bdf8', // Bright Cyan Blue (Sky-400)
    '#1d4ed8', // Deep Navy Blue (Blue-700)
    '#0284c7', // Rich Ocean Blue (Sky-600)
    '#93c5fd', // Soft Ice Blue (Blue-300)
    '#6366f1', // Indigo Blue (Indigo-500)
    '#06b6d4', // Electric Blue (Cyan-500)
    '#1e40af', // Cobalt Blue (Blue-800)
    '#7dd3fc', // Light Sky (Sky-300)
    '#4f46e5'  // Deep Indigo (Indigo-600)
  ];
  if (index < primaryPalette.length) {
    return primaryPalette[index];
  }
  // Deterministic fallback for unlimited points using blue-hued HSL (hues ~ 195 - 235)
  const lightness = 42 + ((index * 11) % 35);
  const hue = 195 + ((index * 19) % 40);
  return `hsl(${hue}, 85%, ${lightness}%)`;
}

// Initial System Settings
export const settingsStore = writable<SystemSettings>({
  unitSystem: 'SI',
  elevation: 0,
  pressure: 101.325 // kPa
});

// Chart View Mode
export const viewStore = writable<ChartView>('psychrometric');

// State Points Inputs
export const defaultPoints: StatePointInput[] = [
  {
    id: 'P1',
    name: 'State 1 (Outdoor Air)',
    color: getPrimaryShadeColor(0),
    enabled: true,
    type1: 'DBT',
    val1: 35.0,
    type2: 'RH',
    val2: 60.0
  },
  {
    id: 'P2',
    name: 'State 2 (Coil Leaving)',
    color: getPrimaryShadeColor(1),
    enabled: true,
    type1: 'DBT',
    val1: 12.0,
    type2: 'RH',
    val2: 95.0
  },
  {
    id: 'P3',
    name: 'State 3 (Supply / Mixed)',
    color: getPrimaryShadeColor(2),
    enabled: true,
    type1: 'DBT',
    val1: 22.0,
    type2: 'RH',
    val2: 50.0
  }
];

export const pointsInputStore = writable<StatePointInput[]>(defaultPoints);

// Computed State Points (derived from inputs + settings)
export const computedPointsStore = derived(
  [pointsInputStore, settingsStore],
  ([$inputs, $settings]) => {
    return $inputs.map((point) => evaluateStatePoint(point, $settings));
  }
);

// Selected Points for Delta calculation
export const deltaSelectionStore = writable<{ ptAId: string; ptBId: string }>({
  ptAId: 'P1',
  ptBId: 'P2'
});

// Computed Delta
export const deltaResultStore = derived(
  [computedPointsStore, deltaSelectionStore],
  ([$computed, $deltaSel]) => {
    const ptA = $computed.find((p) => p.id === $deltaSel.ptAId);
    const ptB = $computed.find((p) => p.id === $deltaSel.ptBId);
    if (ptA && ptB) {
      return calculateDelta(ptA, ptB);
    }
    return null;
  }
);

// Modals state
export const showSettingsModal = writable<boolean>(false);
export const showGuideModal = writable<boolean>(false);
export const showShareModal = writable<boolean>(false);
export const sharedUrlStore = writable<string>('');

export interface SharePayload {
  u?: UnitSystem;
  elev?: number;
  press?: number;
  pts: {
    id?: string;
    n?: string;
    t1: PropertyType;
    v1: number;
    t2: PropertyType;
    v2: number;
  }[];
}

// Snapshot the current state points + settings for sharing or saving
export function buildSharePayload(): SharePayload {
  let settings: SystemSettings = { unitSystem: 'SI', elevation: 0, pressure: 101.325 };
  let points: StatePointInput[] = [];
  settingsStore.subscribe((s) => (settings = s))();
  pointsInputStore.subscribe((p) => (points = p))();

  return {
    u: settings.unitSystem,
    elev: settings.elevation,
    press: settings.pressure,
    pts: points.map((p) => ({
      id: p.id,
      n: p.name,
      t1: p.type1,
      v1: p.val1,
      t2: p.type2,
      v2: p.val2
    }))
  };
}

// Base64 encode a share payload (UTF-8 safe)
export function encodeSharePayload(payload: SharePayload): string {
  const jsonStr = JSON.stringify(payload);
  const base64 = btoa(
    encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16)))
  );
  return encodeURIComponent(base64);
}

// Generate shareable URL with encoded state points and settings
export function generateShareUrl(currentPath?: string): string {
  const encoded = encodeSharePayload(buildSharePayload());

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const path = currentPath || (typeof window !== 'undefined' ? window.location.pathname : '/psych-chart');
  return `${origin}${path}?share=${encoded}&src=share`;
}

// Function to copy share URL to clipboard and show the share modal
export function triggerShare(currentPath?: string): string {
  const url = generateShareUrl(currentPath);
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(url).catch(() => {});
  }
  sharedUrlStore.set(url);
  showShareModal.set(true);
  trackEvent('share_link_copied', {
    path: currentPath || (typeof window !== 'undefined' ? window.location.pathname : '/psych-chart')
  });
  return url;
}

// Guards against the two call sites (onMount + reactive $page) double-loading
export let lastLoadedShare: string | null = null;

// Function to load state points and parameters from URL query params
export function loadStateFromUrl(searchParams: URLSearchParams): boolean {
  const shareParam = searchParams.get('share');
  if (!shareParam) return false;
  if (lastLoadedShare === shareParam) return false;
  lastLoadedShare = shareParam;

  try {
    const rawBase64 = decodeURIComponent(shareParam);
    const jsonStr = decodeURIComponent(
      Array.prototype.map
        .call(atob(rawBase64), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const data: SharePayload = JSON.parse(jsonStr);

    if (data.u) {
      settingsStore.update((s) => ({
        ...s,
        unitSystem: data.u || s.unitSystem,
        elevation: data.elev ?? s.elevation,
        pressure: data.press ?? s.pressure
      }));
    }

    if (Array.isArray(data.pts) && data.pts.length > 0) {
      const loadedPoints: StatePointInput[] = data.pts.map((p, idx) => ({
        id: p.id || `P${idx + 1}`,
        name: p.n || `State ${idx + 1}`,
        color: getPrimaryShadeColor(idx),
        enabled: true,
        type1: p.t1 || 'DBT',
        val1: Number(p.v1),
        type2: p.t2 || 'RH',
        val2: Number(p.v2)
      }));
      pointsInputStore.set(loadedPoints);
      trackEvent('shared_state_loaded', { points: loadedPoints.length, unit: data.u ?? 'SI' });
      // Strip the share payload from the address bar, keeping the path clean.
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', window.location.pathname + window.location.hash);
      }
      return true;
    }
  } catch (e) {
    console.error('Failed to parse share URL payload:', e);
  }
  return false;
}

// Function to update a specific point input
export function updatePointInput(id: string, partial: Partial<StatePointInput>) {
  pointsInputStore.update((points) =>
    points.map((pt) => (pt.id === id ? { ...pt, ...partial } : pt))
  );
}

// Function to add a new state point (unlimited)
export function addPointInput() {
  pointsInputStore.update((points) => {
    const nextIdx = points.length + 1;
    let currentUnit: UnitSystem = 'SI';
    settingsStore.subscribe((val) => (currentUnit = val.unitSystem))();
    const isSI = currentUnit === 'SI';

    const newPoint: StatePointInput = {
      id: `P${nextIdx}`,
      name: `State ${nextIdx}`,
      color: getPrimaryShadeColor(points.length),
      enabled: true,
      type1: 'DBT',
      val1: isSI ? 20 : 68,
      type2: 'RH',
      val2: 50
    };
    return [...points, newPoint];
  });
}

// Function to remove a state point
export function removePointInput(id: string) {
  pointsInputStore.update((points) => {
    if (points.length <= 1) return points; // Maintain at least 1 point
    const filtered = points.filter((p) => p.id !== id);
    return filtered.map((pt, idx) => ({
      ...pt,
      color: getPrimaryShadeColor(idx)
    }));
  });
}

// Function to toggle unit system and adjust default parameters appropriately
export function setUnitSystem(unitSystem: UnitSystem) {
	// Re-selecting the active unit must not convert the point values again:
	// the conversion below assumes the inputs are still in the other system.
	if (get(settingsStore).unitSystem === unitSystem) return;

	settingsStore.update((s) => {
    const isSI = unitSystem === 'SI';
    return {
      unitSystem,
      elevation: isSI ? 0 : 0,
      pressure: isSI ? 101.325 : 14.696
    };
  });

  // Adjust point input values to match new unit system defaults for user convenience
  pointsInputStore.update((points) => {
    return points.map((pt) => {
      const convertVal = (type: PropertyType, val: number, toIP: boolean) => {
        if (type === 'DBT' || type === 'WBT' || type === 'DPT') {
          return toIP ? Number(((val * 9) / 5 + 32).toFixed(1)) : Number((((val - 32) * 5) / 9).toFixed(1));
        } else if (type === 'HUMRAT') {
          return toIP ? Number((val * 7000).toFixed(1)) : Number((val / 7000).toFixed(4));
        } else if (type === 'ENTHALPY') {
          return toIP ? Number((val * 0.4299).toFixed(1)) : Number((val / 0.4299).toFixed(1));
        }
        return val;
      };

      const isIP = unitSystem === 'IP';
      const t1 = pt.type1 || 'DBT';
      const t2 = pt.type2 || 'RH';
      const v1 = pt.val1 ?? pt.param1 ?? 20;
      const v2 = pt.val2 ?? pt.param2 ?? 50;

      return {
        ...pt,
        type1: t1,
        val1: convertVal(t1, v1, isIP),
        type2: t2,
        val2: convertVal(t2, v2, isIP)
      };
    });
  });
}


// ---------------------------------------------------------------------------
// Saved scenarios — named multi-point states in localStorage (no accounts)
// ---------------------------------------------------------------------------

export interface SavedScenario {
  id: string;
  name: string;
  createdAt: number;
  payload: SharePayload;
}

const SCENARIO_KEY = 'psychrolab:scenarios:v1';

/** Disambiguates ids when two scenarios are saved within the same millisecond. */
let scenarioSeq = 0;

export const savedScenariosStore = writable<SavedScenario[]>([]);

function readScenarios(): SavedScenario[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SCENARIO_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedScenario[]) : [];
  } catch {
    return [];
  }
}

function persistScenarios(list: SavedScenario[]) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(SCENARIO_KEY, JSON.stringify(list));
  } catch {
    // storage full or blocked — scenarios stay in memory for this session
  }
}

export function initSavedScenarios() {
  savedScenariosStore.set(readScenarios());
}

/** Save the current chart state under a user-supplied name. */
export function saveScenario(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;
  const scenario: SavedScenario = {
    id: `s_${Date.now().toString(36)}_${(scenarioSeq++).toString(36)}`,
    name: trimmed.slice(0, 60),
    createdAt: Date.now(),
    payload: buildSharePayload()
  };
  let next: SavedScenario[] = [];
  savedScenariosStore.update((list) => {
    next = [scenario, ...list].slice(0, 25);
    return next;
  });
  persistScenarios(next);
  trackEvent('scenario_saved', { name: scenario.name });
  return true;
}

/** Reload a saved scenario into the live chart. */
export function applyScenario(id: string): boolean {
  let list: SavedScenario[] = [];
  savedScenariosStore.subscribe((v) => (list = v))();
  const scenario = list.find((s) => s.id === id);
  if (!scenario) return false;

  lastLoadedShare = null;
  const params = new URLSearchParams({ share: encodeSharePayload(scenario.payload) });
  const ok = loadStateFromUrl(params);
  if (ok) trackEvent('scenario_loaded', { name: scenario.name });
  return ok;
}

export function deleteScenario(id: string) {
  let next: SavedScenario[] = [];
  savedScenariosStore.update((list) => {
    next = list.filter((s) => s.id !== id);
    return next;
  });
  persistScenarios(next);
}

// ---------------------------------------------------------------------------
// Preset / bridge helpers
// ---------------------------------------------------------------------------

export interface PresetPoint {
  dbt: number; // °C (SI canonical)
  rh: number; // %
  name?: string;
}

/**
 * Replace the chart's points with a named process preset. Presets are defined
 * in SI and converted to the active display units.
 */
export function applyPointPreset(points: PresetPoint[]) {
  let isSI = true;
  settingsStore.subscribe((s) => (isSI = s.unitSystem === 'SI'))();

  const next: StatePointInput[] = points.map((p, idx) => ({
    id: `P${idx + 1}`,
    name: p.name ?? `State ${idx + 1}`,
    color: getPrimaryShadeColor(idx),
    enabled: true,
    type1: 'DBT',
    val1: isSI ? Number(p.dbt.toFixed(1)) : Number(cToF(p.dbt).toFixed(1)),
    type2: 'RH',
    val2: Number(p.rh.toFixed(1))
  }));

  pointsInputStore.set(next);
  trackEvent('preset_applied', { points: next.length });
}

/**
 * Bridge a saturated-steam state onto the moist-air chart: the saturation
 * temperature becomes the dry-bulb temperature and the humidity ratio is the
 * value at 100% RH for the current barometric pressure.
 */
export function setSaturationPoint(tC: number, wSI: number, name = 'Steam saturation state') {
  let isSI = true;
  settingsStore.subscribe((s) => (isSI = s.unitSystem === 'SI'))();

  pointsInputStore.update((points) => {
    const base: StatePointInput = points[0] ?? {
      id: 'P1',
      name,
      color: getPrimaryShadeColor(0),
      enabled: true,
      type1: 'DBT',
      val1: 20,
      type2: 'RH',
      val2: 50
    };
    const updated: StatePointInput = {
      ...base,
      name,
      enabled: true,
      type1: 'DBT',
      val1: isSI ? Number(tC.toFixed(2)) : Number(cToF(tC).toFixed(2)),
      type2: 'HUMRAT',
      val2: isSI ? Number(wSI.toFixed(5)) : Number((wSI * 7000).toFixed(1))
    };
    return [updated, ...points.slice(1)];
  });
}
