<script lang="ts">
	import { ArrowLeft, ArrowRight, Calculator } from '@lucide/svelte';
	import { solveStatePointFromPairSI } from '$lib/psychrometrics/engine';
	import { getStandardAtmosphericPressureSI } from '$lib/psychrometrics/unitConverter';

	const SITE_URL = 'https://www.psychrolab.org';
	const CP = 1.0062; // kJ/(kg·K)
	const HFG = 2454; // kJ/kg

	// Space & design conditions
	let area = 100; // m²
	let height = 3; // m
	let elevation = 0; // m
	let tRoom = 25; // °C
	let rhRoom = 50; // %
	let tOut = 35; // °C
	let rhOut = 40; // %
	let tSupply = 15; // °C

	// Internal gains
	let people = 20;
	let sensPerPerson = 75; // W
	let latPerPerson = 55; // W
	let lightPerM2 = 10; // W/m²
	let equipW = 5000; // W
	let fabricKW = 8; // kW

	// Infiltration & ventilation
	let ach = 0.5; // air changes per hour
	let lpsPerPerson = 10; // L/s outdoor air per person

	const fmt = (v: number, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : '—');

	$: pPa = getStandardAtmosphericPressureSI(elevation);

	$: room =
		rhRoom > 0 && rhRoom <= 100
			? solveStatePointFromPairSI('DBT', tRoom, 'RH', rhRoom, pPa)
			: null;
	$: outdoors =
		rhOut > 0 && rhOut <= 100
			? solveStatePointFromPairSI('DBT', tOut, 'RH', rhOut, pPa)
			: null;

	$: volume = Math.max(0, area) * Math.max(0, height);

	$: calc = (() => {
		if (!room || !outdoors) return null;
		if (!(tRoom > tSupply)) return null;
		if (!(volume > 0) || !(people >= 0)) return null;

		// Infiltration mass flow (kg/s) from outdoor air changes
		const vi = outdoors.vol > 0 ? outdoors.vol : 0.86;
		const mInf = (Math.max(0, ach) * volume) / (3600 * vi);

		// Sensible gains (kW)
		const qsOcc = (people * sensPerPerson) / 1000;
		const qsLight = (Math.max(0, lightPerM2) * Math.max(0, area)) / 1000;
		const qsEquip = Math.max(0, equipW) / 1000;
		const qsFabric = Math.max(0, fabricKW);
		const qsInf = mInf * CP * (tOut - tRoom);
		const qs = qsOcc + qsLight + qsEquip + qsFabric + qsInf;

		// Latent gains (kW)
		const qlOcc = (people * latPerPerson) / 1000;
		const qlInf = mInf * (outdoors.humRat - room.humRat) * HFG;
		const ql = qlOcc + qlInf;

		const total = qs + ql;
		const shr = total > 0 ? qs / total : NaN;

		// Supply air from the room sensible balance
		const ms = qs / (CP * (tRoom - tSupply));
		if (!Number.isFinite(ms) || ms <= 0) return null;

		const wSupply = room.humRat - ql / (ms * HFG);
		if (!Number.isFinite(wSupply) || wSupply <= 0) return null;

		const supply = solveStatePointFromPairSI('DBT', tSupply, 'HUMRAT', wSupply, pPa);

		// Ventilation (outdoor) air for the coil
		const mVentVol = (people * Math.max(0, lpsPerPerson)) / 1000; // m³/s
		const mVent = mVentVol / vi;
		const mReturn = Math.max(0, ms - mVent);
		const wMixed = (mVent * outdoors.humRat + mReturn * room.humRat) / ms;
		const hMixed = (mVent * outdoors.enthalpy + mReturn * room.enthalpy) / ms;
		const mixed = solveStatePointFromPairSI('ENTHALPY', hMixed, 'HUMRAT', wMixed, pPa);

		const coilKW = ms * (hMixed - supply.enthalpy);
		const ventKW = mVent * (outdoors.enthalpy - room.enthalpy);

		return {
			mInf,
			qsOcc,
			qsLight,
			qsEquip,
			qsFabric,
			qsInf,
			qs,
			qlOcc,
			qlInf,
			ql,
			total,
			shr,
			ms,
			wSupply,
			supply,
			supplyVolH: ms * supply.vol * 3600,
			mVent,
			mVentVol,
			wMixed,
			hMixed,
			mixed,
			coilKW,
			coilTR: coilKW / 3.517,
			ventKW,
			humidifyNeeded: wSupply > room.humRat + 1e-6,
			ventExceedsSupply: mVent > ms
		};
	})();

	$: jsonLdStr = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs.map((f) => ({
			'@type': 'Question',
			name: f.q,
			acceptedAnswer: { '@type': 'Answer', text: f.a }
		}))
	}).replace(/</g, '\\u003c');

	const faqs = [
		{
			q: 'How is a cooling load calculated?',
			a: 'Add up every sensible heat gain (occupants, lighting, equipment, solar/fabric conduction and infiltration) and every latent heat gain (occupants and outdoor moisture). The sensible total sets the supply airflow through Qs = ṁ·cp·(Troom − Tsupply); the latent total sets how dry the supply air must be, and their ratio is the sensible heat ratio (SHR).'
		},
		{
			q: 'What is a good supply air temperature?',
			a: 'For comfort cooling 14–16 °C is typical (roughly 8–11 K below room). Colder supply reduces airflow and duct size but risks cold drafts, short-cycling and, below the room dew point, condensation on diffusers. Very low SHR loads tolerate colder supply; high latent loads need more air, not colder air.'
		},
		{
			q: 'What does SHR tell me?',
			a: 'The sensible heat ratio is sensible load divided by total load. Values near 0.8–0.9 (offices, auditoriums) call for a dry cooling coil; values near 0.6–0.7 (humid climates, kitchens, restaurants) need coils that reach well below the room dew point to remove moisture.'
		},
		{
			q: 'Why does infiltration matter if the building is sealed?',
			a: 'Even 0.5 air changes per hour of leakage carries outdoor enthalpy into the space. In hot-humid weather most of that load is latent: infiltration can add a meaningful share of the coil duty without anyone feeling a draft. In dry climates the same air can actually help dehumidify.'
		},
		{
			q: 'How much outdoor air per person do I need?',
			a: 'ASHRAE 62.1 typically requires about 10 L/s per person plus a small area component for offices. Outdoor air adds a ventilation load proportional to the enthalpy difference between outside and room — in hot-humid design conditions it is often the single largest component of refrigeration capacity.'
		}
	];
</script>

<svelte:head>
	<title>Cooling Load Calculator: Sensible, Latent & Supply Air | PsychroLab</title>
	<meta
		name="description"
		content="Free online cooling load calculator: enter room size, occupants, lighting, equipment, infiltration and design conditions to get sensible and latent heat gains, SHR, supply airflow and coil capacity."
	/>
	<link rel="canonical" href="{SITE_URL}/cooling-load" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Cooling Load Calculator: Sensible, Latent & Supply Air" />
	<meta
		property="og:description"
		content="Calculate sensible and latent cooling loads, SHR, supply air conditions and coil capacity for any room in seconds."
	/>
	<meta property="og:url" content="{SITE_URL}/cooling-load" />
	<meta name="twitter:card" content="summary" />
	{@html `<script type="application/ld+json">${jsonLdStr}</script>`}
</svelte:head>

<div class="space-y-5">
	<!-- Header -->
	<div class="border-b border-slate-800 pb-4 space-y-2">
		<a
			href="/guides"
			class="inline-flex items-center space-x-1.5 text-xs font-mono font-medium text-blue-400 hover:text-blue-300 transition-colors"
		>
			<ArrowLeft class="w-3.5 h-3.5" />
			<span>Engineering guides</span>
		</a>
		<h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
			Cooling Load Calculator
		</h1>
		<p class="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
			Build a room cooling load from its sensible and latent gains — occupants, lighting, equipment,
			fabric, infiltration and ventilation — then get supply airflow, supply state, SHR and coil
			capacity. Psychrometrics from the ASHRAE property routines.
		</p>
	</div>

	<!-- Inputs -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
		<!-- Design conditions -->
		<div class="glass-panel rounded-2xl border border-slate-800 p-5">
			<div class="flex items-center space-x-2 mb-4">
				<Calculator class="w-4 h-4 text-blue-400" />
				<h2 class="text-sm font-bold text-white uppercase tracking-wider">Space & Conditions</h2>
			</div>
			<div class="grid grid-cols-2 gap-3">
				<label class="block space-y-1.5">
					<span class="text-xs font-mono text-slate-400">Floor area (m²)</span>
					<input type="number" bind:value={area} step="5" min="1" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
				</label>
				<label class="block space-y-1.5">
					<span class="text-xs font-mono text-slate-400">Ceiling height (m)</span>
					<input type="number" bind:value={height} step="0.5" min="1" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
				</label>
				<label class="block space-y-1.5">
					<span class="text-xs font-mono text-slate-400">Elevation (m)</span>
					<input type="number" bind:value={elevation} step="50" min="0" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
				</label>
				<label class="block space-y-1.5">
					<span class="text-xs font-mono text-slate-400">Supply air temp (°C)</span>
					<input type="number" bind:value={tSupply} step="1" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
				</label>
				<label class="block space-y-1.5">
					<span class="text-xs font-mono text-slate-400">Room DB (°C)</span>
					<input type="number" bind:value={tRoom} step="1" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
				</label>
				<label class="block space-y-1.5">
					<span class="text-xs font-mono text-slate-400">Room RH (%)</span>
					<input type="number" bind:value={rhRoom} step="5" min="1" max="100" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
				</label>
				<label class="block space-y-1.5">
					<span class="text-xs font-mono text-slate-400">Outdoor DB (°C)</span>
					<input type="number" bind:value={tOut} step="1" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
				</label>
				<label class="block space-y-1.5">
					<span class="text-xs font-mono text-slate-400">Outdoor RH (%)</span>
					<input type="number" bind:value={rhOut} step="5" min="1" max="100" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
				</label>
			</div>
			<p class="mt-3 text-[10px] font-mono text-slate-500">Room volume: {fmt(volume, 0)} m³ · barometric pressure {fmt(pPa / 1000, 2)} kPa</p>
		</div>

		<!-- Internal gains -->
		<div class="glass-panel rounded-2xl border border-slate-800 p-5">
			<h2 class="text-sm font-bold text-white uppercase tracking-wider mb-4">Internal Gains</h2>
			<div class="grid grid-cols-2 gap-3">
				<label class="block space-y-1.5">
					<span class="text-xs font-mono text-slate-400">Occupants</span>
					<input type="number" bind:value={people} step="1" min="0" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
				</label>
				<label class="block space-y-1.5">
					<span class="text-xs font-mono text-slate-400">Sensible / person (W)</span>
					<input type="number" bind:value={sensPerPerson} step="5" min="0" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
				</label>
				<label class="block space-y-1.5">
					<span class="text-xs font-mono text-slate-400">Latent / person (W)</span>
					<input type="number" bind:value={latPerPerson} step="5" min="0" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
				</label>
				<label class="block space-y-1.5">
					<span class="text-xs font-mono text-slate-400">Lighting (W/m²)</span>
					<input type="number" bind:value={lightPerM2} step="1" min="0" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
				</label>
				<label class="block space-y-1.5">
					<span class="text-xs font-mono text-slate-400">Equipment (W)</span>
					<input type="number" bind:value={equipW} step="100" min="0" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
				</label>
				<label class="block space-y-1.5">
					<span class="text-xs font-mono text-slate-400">Solar / fabric (kW)</span>
					<input type="number" bind:value={fabricKW} step="1" min="0" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
				</label>
				<label class="block space-y-1.5">
					<span class="text-xs font-mono text-slate-400">Infiltration (ACH)</span>
					<input type="number" bind:value={ach} step="0.1" min="0" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
				</label>
				<label class="block space-y-1.5">
					<span class="text-xs font-mono text-slate-400">Outdoor air (L/s·person)</span>
					<input type="number" bind:value={lpsPerPerson} step="1" min="0" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
				</label>
			</div>
		</div>

		<!-- Gain breakdown -->
		<div class="glass-panel rounded-2xl border border-slate-800 p-5 space-y-2.5">
			<h2 class="text-sm font-bold text-white uppercase tracking-wider mb-3">Gain Breakdown</h2>
			{#if calc}
				{#each [
					{ label: 'Occupants (sensible)', v: calc.qsOcc },
					{ label: 'Lighting', v: calc.qsLight },
					{ label: 'Equipment', v: calc.qsEquip },
					{ label: 'Solar / fabric', v: calc.qsFabric },
					{ label: 'Infiltration (sensible)', v: calc.qsInf }
				] as row (row.label)}
					<div class="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
						<span class="text-xs text-slate-400">{row.label}</span>
						<span class="text-xs font-mono font-bold text-blue-300">{fmt(row.v, 2)} kW</span>
					</div>
				{/each}
				<div class="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
					<span class="text-xs text-slate-400">Occupants (latent)</span>
					<span class="text-xs font-mono font-bold text-cyan-300">{fmt(calc.qlOcc, 2)} kW</span>
				</div>
				<div class="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
					<span class="text-xs text-slate-400">Infiltration (latent)</span>
					<span class="text-xs font-mono font-bold text-cyan-300">{fmt(calc.qlInf, 2)} kW</span>
				</div>
				<div class="flex items-center justify-between pt-1">
					<span class="text-xs font-semibold text-slate-300">Infiltration airflow</span>
					<span class="text-xs font-mono font-bold text-slate-200">{fmt(calc.mInf * 3600 * 0.86, 1)} m³/h*</span>
				</div>
				<p class="text-[10px] text-slate-500 font-mono">*approximate volume at outdoor density</p>
			{:else}
				<p class="text-xs text-amber-400 font-mono">Fix the highlighted inputs to compute the breakdown.</p>
			{/if}
		</div>
	</div>

	<!-- Results -->
	{#if calc}
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
			<!-- Room load -->
			<div class="glass-panel rounded-2xl border border-slate-800 p-5 space-y-3">
				<h2 class="text-sm font-bold text-white uppercase tracking-wider mb-2">Room Load</h2>
				{#each [
					{ label: 'Sensible load', value: `${fmt(calc.qs, 2)} kW`, accent: 'text-blue-300' },
					{ label: 'Latent load', value: `${fmt(calc.ql, 2)} kW`, accent: 'text-cyan-300' },
					{ label: 'Total load', value: `${fmt(calc.total, 2)} kW`, accent: 'text-white' },
					{ label: 'SHR', value: fmt(calc.shr, 3), accent: 'text-emerald-400' },
					{ label: 'In refrigeration tons', value: `${fmt(calc.total / 3.517, 2)} TR`, accent: 'text-amber-300' }
				] as row (row.label)}
					<div class="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
						<span class="text-xs text-slate-400">{row.label}</span>
						<span class="text-sm font-mono font-bold {row.accent}">{row.value}</span>
					</div>
				{/each}
			</div>

			<!-- Supply air -->
			<div class="glass-panel rounded-2xl border border-slate-800 p-5 space-y-3">
				<h2 class="text-sm font-bold text-white uppercase tracking-wider mb-2">Supply Air</h2>
				{#each [
					{ label: 'Mass flow', value: `${fmt(calc.ms, 3)} kg/s`, accent: 'text-white' },
					{ label: 'Volume flow', value: `${fmt(calc.supplyVolH, 0)} m³/h`, accent: 'text-white' },
					{ label: 'Dry bulb', value: `${fmt(tSupply, 1)} °C`, accent: 'text-blue-300' },
					{ label: 'Relative humidity', value: `${fmt(calc.supply.rh, 1)} %`, accent: 'text-cyan-300' },
					{ label: 'Wet bulb', value: `${fmt(calc.supply.wbt, 1)} °C`, accent: 'text-cyan-300' },
					{ label: 'Dew point', value: `${fmt(calc.supply.dpt, 1)} °C`, accent: 'text-cyan-300' },
					{ label: 'Humidity ratio', value: fmt(calc.wSupply, 5), accent: 'text-emerald-300' },
					{ label: 'Enthalpy', value: `${fmt(calc.supply.enthalpy, 1)} kJ/kg`, accent: 'text-amber-300' }
				] as row (row.label)}
					<div class="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
						<span class="text-xs text-slate-400">{row.label}</span>
						<span class="text-sm font-mono font-bold {row.accent}">{row.value}</span>
					</div>
				{/each}
			</div>

			<!-- Coil / ventilation -->
			<div class="glass-panel rounded-2xl border border-slate-800 p-5 space-y-3">
				<h2 class="text-sm font-bold text-white uppercase tracking-wider mb-2">Coil & Ventilation</h2>
				{#each [
					{ label: 'Outdoor air', value: `${fmt(calc.mVentVol * 1000, 1)} L/s`, accent: 'text-white' },
					{ label: 'Mixed air temp', value: `${fmt(calc.mixed.dbt, 1)} °C`, accent: 'text-blue-300' },
					{ label: 'Mixed air humidity ratio', value: fmt(calc.wMixed, 5), accent: 'text-cyan-300' },
					{ label: 'Ventilation load', value: `${fmt(calc.ventKW, 2)} kW`, accent: 'text-orange-300' },
					{ label: 'Coil (conditioner) capacity', value: `${fmt(calc.coilKW, 2)} kW`, accent: 'text-emerald-400' },
					{ label: 'Coil capacity', value: `${fmt(calc.coilTR, 2)} TR`, accent: 'text-amber-300' }
				] as row (row.label)}
					<div class="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
						<span class="text-xs text-slate-400">{row.label}</span>
						<span class="text-sm font-mono font-bold {row.accent}">{row.value}</span>
					</div>
				{/each}
				{#if calc.humidifyNeeded}
					<p class="text-[11px] font-mono text-amber-400 leading-relaxed">
						Required supply humidity ratio exceeds room air — this load needs humidification, which a
						cooling coil cannot provide.
					</p>
				{/if}
				{#if calc.ventExceedsSupply}
					<p class="text-[11px] font-mono text-amber-400 leading-relaxed">
						Outdoor air requested is greater than the total supply flow — reduce the ventilation rate
						or the supply temperature.
					</p>
				{/if}
			</div>
		</div>
	{:else}
		<div class="glass-panel rounded-2xl border border-slate-800 p-8 text-center text-xs font-mono text-amber-400">
			Enter valid design conditions — room dry bulb must be above the supply temperature, humidity
			between 1 and 100%.
		</div>
	{/if}

	<!-- Learn more -->
	<div class="glass-panel rounded-2xl border border-slate-800 p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
		<p class="text-xs text-slate-400">
			The method behind this calculator — gain components, SHR lines and the supply-air procedure — is
			walked through in the guide, with three fully worked problems.
		</p>
		<div class="flex items-center gap-4 shrink-0">
			<a
				href="/guides/cooling-load-calculations"
				class="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300"
			>
				<span>Read: cooling load calculations</span>
				<ArrowRight class="w-3.5 h-3.5" />
			</a>
			<a
				href="/psych-chart"
				class="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
			>
				<span>Plot on the psychrometric chart</span>
				<ArrowRight class="w-3.5 h-3.5" />
			</a>
		</div>
	</div>

	<!-- FAQ -->
	<section class="space-y-4">
		<div class="border-b border-slate-800 pb-3">
			<h2 class="text-lg font-bold text-white tracking-tight">Frequently asked questions</h2>
			<p class="text-xs text-slate-400">Cooling load fundamentals at a glance</p>
		</div>
		<div class="space-y-3">
			{#each faqs as f (f.q)}
				<details class="glass-panel rounded-xl border border-slate-800 p-4 group">
					<summary class="text-sm font-semibold text-white cursor-pointer list-none flex items-center justify-between">
						<span>{f.q}</span>
						<span class="text-blue-400 group-open:rotate-45 transition-transform">+</span>
					</summary>
					<p class="mt-3 text-xs text-slate-400 leading-relaxed">{f.a}</p>
				</details>
			{/each}
		</div>
	</section>
</div>