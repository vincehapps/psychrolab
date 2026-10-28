/**
 * Vapor Compression Cycle solver (ideal + isentropic-efficiency variant).
 * All enthalpies kJ/kg, pressures bar internally, temperatures °C.
 */
import {
	getPsatBar,
	getSat,
	getH,
	getS,
	getHfromPS,
	getTfromPH,
	getQfromPH,
	getV,
	ensureRefrigerantReady,
	type RefrigerantId
} from './engine';

export interface CycleInput {
	refrigerant: RefrigerantId;
	teC: number; // evaporating temperature °C
	tcC: number; // condensing temperature °C
	subcoolK: number; // liquid subcooling K below Tc
	superheatK: number; // suction superheat K above Te
	isenEff: number; // compressor isentropic efficiency 0..1
	capacityKW: number; // required refrigerating capacity kW (0 = specific basis only)
}

export interface CycleState {
	label: string;
	name: string;
	pBar: number;
	tC: number;
	h: number;
	s: number;
	v: number;
	q: number; // quality, -1 if not two-phase
	region: string;
}

export interface CycleResult {
	refrigerant: RefrigerantId;
	states: CycleState[];
	qa: number; // refrigerating effect kJ/kg
	wc: number; // compressor work kJ/kg
	qr: number; // condenser heat kJ/kg
	cop: number;
	massFlow: number; // kg/s (0 when no capacity given)
	volumeFlow: number; // m³/s suction vapor
	condDuty: number; // kW
	compressorKW: number; // kW
	tr: number; // capacity in tons
	peBar: number;
	pcBar: number;
}

function regionOf(q: number, tC: number, tcC: number, teC: number): string {
	if (q < 0) return tC < teC ? 'Subcooled liquid' : 'Superheated vapor';
	if (q <= 0.0001) return 'Saturated liquid';
	if (q >= 0.9999) return 'Saturated vapor';
	return `Two-phase (x = ${(q * 100).toFixed(1)}%)`;
}

/**
 * Compute the four-state vapor compression cycle.
 * Requires ensureRefrigerantReady() to have resolved.
 */
export function computeCycle(input: CycleInput): CycleResult {
	const { refrigerant: f, teC, tcC, subcoolK, superheatK, isenEff, capacityKW } = input;

	const peBar = getPsatBar(f, teC);
	const pcBar = getPsatBar(f, tcC);
	const pe = peBar * 1e5;
	const pc = pcBar * 1e5;

	// State 1 — compressor suction
	const t1 = teC + superheatK;
	const h1 = getH(f, pe, t1);
	const s1 = getS(f, pe, t1);
	const v1 = getV(f, pe, t1);
	const q1 = getQfromPH(f, pe, h1);

	// State 2 — compressor discharge (isentropic to Pc, then efficiency correction)
	const h2s = getHfromPS(f, pc, s1);
	const h2 = h1 + (h2s - h1) / Math.max(0.1, isenEff);
	const t2 = getTfromPH(f, pc, h2);
	const q2 = getQfromPH(f, pc, h2);

	// State 3 — condenser outlet (subcooled liquid)
	const t3 = tcC - subcoolK;
	const h3 = getH(f, pc, t3);
	const s3 = getS(f, pc, t3);
	const v3 = getV(f, pc, t3);

	// State 4 — evaporator inlet (after isenthalpic expansion)
	const h4 = h3;
	const q4 = getQfromPH(f, pe, h4);
	const t4 = getTfromPH(f, pe, h4);
	const s4 = q4 >= 0 ? getSat(f, teC).sf + q4 * (getSat(f, teC).sg - getSat(f, teC).sf) : NaN;

	const qa = h1 - h4;
	const wc = h2 - h1;
	const qr = h2 - h3;

	const massFlow = capacityKW > 0 ? capacityKW / qa : 0;

	const mk = (label: string, name: string, pBar: number, tC: number, h: number, s: number, v: number, q: number): CycleState => ({
		label,
		name,
		pBar,
		tC,
		h,
		s,
		v,
		q,
		region: regionOf(q, tC, tcC, teC)
	});

	return {
		refrigerant: f,
		states: [
			mk('1', 'Compressor suction', peBar, t1, h1, s1, v1, q1),
			mk('2', 'Compressor discharge', pcBar, t2, h2, q2 >= 0 ? NaN : getS(f, pc, t2), getV(f, pc, t2), q2),
			mk('3', 'Condenser outlet', pcBar, t3, h3, s3, v3, -1),
			mk('4', 'Evaporator inlet', peBar, t4, h4, s4, getV(f, pe, t4), q4)
		],
		qa,
		wc,
		qr,
		cop: wc > 0 ? qa / wc : 0,
		massFlow,
		volumeFlow: massFlow * v1,
		condDuty: massFlow * qr,
		compressorKW: massFlow * wc,
		tr: capacityKW > 0 ? capacityKW / 3.5167 : 0,
		peBar,
		pcBar
	};
}

export { ensureRefrigerantReady };