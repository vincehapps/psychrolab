/**
 * Refrigerant Property Engine
 * Wraps CoolProp (HEOS backend) compiled to WASM for browser use.
 * All temperatures in °C, pressures in kPa (input) / bar (display),
 * energies in kJ/kg. Loaded lazily — call ensureRefrigerantReady() first.
 */

export type RefrigerantId = 'R134a' | 'R22' | 'R410A' | 'R717' | 'R290' | 'R32';

export interface RefrigerantInfo {
	id: RefrigerantId;
	name: string;
	chemical: string;
	note: string;
}

export const REFRIGERANTS: RefrigerantInfo[] = [
	{ id: 'R134a', name: 'R-134a', chemical: '1,1,1,2-Tetrafluoroethane', note: 'Standard HFC for comfort and commercial refrigeration' },
	{ id: 'R22', name: 'R-22', chemical: 'Chlorodifluoromethane', note: 'HCFC — widely present in existing equipment, being phased out' },
	{ id: 'R410A', name: 'R-410A', chemical: 'R-32/R-125 blend', note: 'Current standard for residential and commercial AC' },
	{ id: 'R717', name: 'R-717 (Ammonia)', chemical: 'NH₃', note: 'High-efficiency industrial refrigerant — toxic, steel piping only' },
	{ id: 'R290', name: 'R-290 (Propane)', chemical: 'C₃H₈', note: 'Natural refrigerant — low GWP, flammable' },
	{ id: 'R32', name: 'R-32', chemical: 'Difluoromethane', note: 'Lower-GWP HFC replacing R-410A in new equipment' }
];

let cp: any = null;
let readyPromise: Promise<void> | null = null;

/** Initialize the WASM property database (singleton). */
export async function ensureRefrigerantReady(): Promise<void> {
	if (cp) return;
	if (!readyPromise) {
		// coolprop-wasm's typings are `export =` while its runtime build is an ESM
		// default export, so resolve the factory through a dynamic import.
		readyPromise = (async () => {
			const mod: any = await import('coolprop-wasm/coolprop');
			const factory = typeof mod === 'function' ? mod : mod.default;
			cp = await factory();
		})().catch((err: unknown) => {
			readyPromise = null;
			throw err;
		});
	}
	await readyPromise;
}

function ps(
	out: string,
	in1: string,
	v1: number,
	in2: string,
	v2: number,
	fluid: RefrigerantId
): number {
	if (!cp) return NaN;
	try {
		const val: unknown = cp.PropsSI(out, in1, v1, in2, v2, fluid);
		return typeof val === 'number' && Number.isFinite(val) ? val : NaN;
	} catch {
		return NaN;
	}
}

export interface CriticalPoint {
	tC: number;
	pBar: number;
}

const criticalCache = new Map<RefrigerantId, CriticalPoint>();

/** Critical point of the refrigerant. */
export function getCritical(f: RefrigerantId): CriticalPoint {
	const hit = criticalCache.get(f);
	if (hit) return hit;
	// CoolProp returns critical constants for Tcrit/Pcrit regardless of input state.
	const tC = ps('Tcrit', 'T', 300, 'P', 101.325, f) - 273.15;
	const pBar = ps('Pcrit', 'T', 300, 'P', 101.325, f) / 1e5;
	const cp = { tC, pBar };
	criticalCache.set(f, cp);
	return cp;
}

/** Saturation temperature (°C) at pressure pPa (Pa). */
export function getTsatC(f: RefrigerantId, pPa: number): number {
	return ps('T', 'P', pPa, 'Q', 0, f) - 273.15;
}

/** Saturation pressure (bar) at temperature tC (°C). */
export function getPsatBar(f: RefrigerantId, tC: number): number {
	return ps('P', 'T', tC + 273.15, 'Q', 0, f) / 1e5;
}

export interface SatProps {
	tC: number;
	pBar: number;
	hf: number; // kJ/kg
	hg: number;
	hfg: number;
	sf: number; // kJ/(kg·K)
	sg: number;
	vf: number; // m³/kg
	vg: number;
}

/** Full saturated-liquid / saturated-vapor properties at tC. */
export function getSat(f: RefrigerantId, tC: number): SatProps {
	const T = tC + 273.15;
	const hf = ps('H', 'T', T, 'Q', 0, f) / 1000;
	const hg = ps('H', 'T', T, 'Q', 1, f) / 1000;
	const pBar = ps('P', 'T', T, 'Q', 0, f) / 1e5;
	const sf = ps('S', 'T', T, 'Q', 0, f) / 1000;
	const sg = ps('S', 'T', T, 'Q', 1, f) / 1000;
	const df = ps('D', 'T', T, 'Q', 0, f);
	const dg = ps('D', 'T', T, 'Q', 1, f);
	return {
		tC,
		pBar,
		hf,
		hg,
		hfg: hg - hf,
		sf,
		sg,
		vf: df > 0 ? 1 / df : NaN,
		vg: dg > 0 ? 1 / dg : NaN
	};
}

/** Enthalpy (kJ/kg) at pressure pPa and temperature tC — works in any region. */
export function getH(f: RefrigerantId, pPa: number, tC: number): number {
	return ps('H', 'P', pPa, 'T', tC + 273.15, f) / 1000;
}

/** Entropy (kJ/(kg·K)) at pressure pPa and temperature tC. */
export function getS(f: RefrigerantId, pPa: number, tC: number): number {
	return ps('S', 'P', pPa, 'T', tC + 273.15, f) / 1000;
}

/** Enthalpy (kJ/kg) at pressure pPa and entropy s (kJ/kg·K) — isentropic states. */
export function getHfromPS(f: RefrigerantId, pPa: number, s: number): number {
	return ps('H', 'P', pPa, 'S', s * 1000, f) / 1000;
}

/** Temperature (°C) at pressure pPa and enthalpy h (kJ/kg). */
export function getTfromPH(f: RefrigerantId, pPa: number, h: number): number {
	return ps('T', 'P', pPa, 'H', h * 1000, f) - 273.15;
}

/** Vapor quality at pressure pPa and enthalpy h (kJ/kg); returns -1 outside the dome. */
export function getQfromPH(f: RefrigerantId, pPa: number, h: number): number {
	const q = ps('Q', 'P', pPa, 'H', h * 1000, f);
	if (Number.isNaN(q)) return -1;
	return q;
}

/** Specific volume (m³/kg) at pPa / tC. */
export function getV(f: RefrigerantId, pPa: number, tC: number): number {
	const d = ps('D', 'P', pPa, 'T', tC + 273.15, f);
	return d > 0 ? 1 / d : NaN;
}

/** Lowest saturation temperature the chart needs: where Psat reaches ~0.3 bar. */
export function getChartTmin(f: RefrigerantId): number {
	for (let t = 0; t >= -70; t -= 1) {
		if (getPsatBar(f, t) < 0.3) return t + 1;
	}
	return -60;
}