<script lang="ts">
	import { onMount } from 'svelte';
	import { ArrowLeft, ArrowRight, Calculator, Loader2 } from '@lucide/svelte';
	import PhChart from '$lib/components/PhChart.svelte';
	import {
		REFRIGERANTS,
		ensureRefrigerantReady,
		getCritical,
		type RefrigerantId
	} from '$lib/refrig/engine';
	import { computeCycle, type CycleResult } from '$lib/refrig/cycle';

	const SITE_URL = 'https://www.psychrolab.org';

	let refrigerant: RefrigerantId = 'R134a';
	let teC = -10;
	let tcC = 40;
	let subcoolK = 5;
	let superheatK = 5;
	let isenEff = 100;
	let capacityKW = 10;

	let engineReady = false;
	let engineError = '';

	onMount(() => {
		ensureRefrigerantReady()
			.then(() => (engineReady = true))
			.catch((err: unknown) => (engineError = String(err)));
	});

	$: critical = engineReady ? getCritical(refrigerant) : null;
	$: invalid =
		!engineReady ||
		!!engineError ||
		teC >= tcC - 3 ||
		teC < -65 ||
		(critical ? tcC > critical.tC - 3 : false) ||
		capacityKW < 0;

	$: result =
		engineReady && !invalid
			? computeCycle({
					refrigerant,
					teC,
					tcC,
					subcoolK,
					superheatK,
					isenEff: Math.min(1, Math.max(0.1, isenEff / 100)),
					capacityKW
				})
			: null;

	$: valid = !!result && Number.isFinite(result.cop) && result.cop > 0;

	const fmt = (v: number, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : '—');

	const faqs = [
		{
			q: 'What is the COP of a vapor compression cycle?',
			a: 'The coefficient of performance is the refrigerating effect divided by the compressor work: COP = QA / Wc. It answers how many kilowatts of cooling you get per kilowatt of compressor power. Typical values are 2–6; every point of COP saved is a direct operating-cost reduction.'
		},
		{
			q: 'Why is superheat added to the suction vapor?',
			a: 'Superheat guarantees the refrigerant is fully vaporised before entering the compressor, preventing liquid slugging that can destroy valves and pistons. Superheat generated inside the evaporator adds useful refrigerating effect, while superheat picked up in the suction line only wastes capacity.'
		},
		{
			q: 'Does liquid subcooling improve the cycle?',
			a: 'Yes. Subcooling the condensate before the expansion valve lowers the enthalpy entering the evaporator, which increases refrigerating effect, reduces required refrigerant flow, lowers compressor work and raises COP — essentially free capacity from a properly sized condenser.'
		},
		{
			q: 'How does compressor isentropic efficiency affect the results?',
			a: 'Real compression is not isentropic: valve losses, heat transfer and leakage raise the discharge enthalpy above the ideal value. Set the isentropic efficiency below 100% in this calculator to see how work rises, COP falls and discharge temperature climbs.'
		},
		{
			q: 'Which refrigerant should I model?',
			a: 'R-134a remains standard for comfort and commercial refrigeration, R-410A dominates residential air conditioning, R-22 appears in legacy equipment, and R-717 (ammonia) is preferred for large industrial plants due to its high efficiency — though it is toxic and requires steel piping. R-290 and R-32 represent the lower-GWP direction of the industry.'
		}
	];

	$: jsonLdStr = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs.map((f) => ({
			'@type': 'Question',
			name: f.q,
			acceptedAnswer: { '@type': 'Answer', text: f.a }
		}))
	}).replace(/</g, '\\u003c');
</script>

<svelte:head>
	<title>Vapor Compression Cycle Calculator & p–h Diagram | PsychroLab</title>
	<meta
		name="description"
		content="Interactive vapor compression refrigeration cycle calculator: pick a refrigerant, evaporating and condensing temperatures, superheat and subcooling to get COP, state points, mass flow and a live p–h diagram."
	/>
	<link rel="canonical" href="{SITE_URL}/vapor-compression" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Vapor Compression Cycle Calculator & p–h Diagram" />
	<meta
		property="og:description"
		content="Solve the four-state vapor compression cycle for any refrigerant and plot it on an interactive pressure-enthalpy diagram."
	/>
	<meta property="og:url" content="{SITE_URL}/vapor-compression" />
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
			Vapor Compression Cycle Calculator
		</h1>
		<p class="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
			Solve the four-state vapour compression cycle for any refrigerant — suction superheat,
			isentropic compression, condenser subcooling and throttling — and plot it live on the
			pressure–enthalpy diagram. All properties from the CoolProp thermodynamic database.
		</p>
	</div>

	<!-- Inputs -->
	<div class="glass-panel rounded-2xl border border-slate-800 p-5">
		<div class="flex items-center space-x-2 mb-4">
			<Calculator class="w-4 h-4 text-blue-400" />
			<h2 class="text-sm font-bold text-white uppercase tracking-wider">Cycle Parameters</h2>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<label class="block space-y-1.5">
				<span class="text-xs font-mono text-slate-400">Refrigerant</span>
				<select
					bind:value={refrigerant}
					class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
				>
					{#each REFRIGERANTS as r (r.id)}
						<option value={r.id}>{r.name}</option>
					{/each}
				</select>
				<span class="block text-[10px] text-slate-500">{REFRIGERANTS.find((r) => r.id === refrigerant)?.note}</span>
			</label>

			<label class="block space-y-1.5">
				<span class="text-xs font-mono text-slate-400">Evaporating temperature Te (°C)</span>
				<input
					type="number"
					bind:value={teC}
					step="1"
					class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
				/>
			</label>

			<label class="block space-y-1.5">
				<span class="text-xs font-mono text-slate-400">Condensing temperature Tc (°C)</span>
				<input
					type="number"
					bind:value={tcC}
					step="1"
					class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
				/>
				{#if critical}<span class="block text-[10px] text-slate-500">Critical point: {critical.tC.toFixed(1)} °C</span>{/if}
			</label>

			<label class="block space-y-1.5">
				<span class="text-xs font-mono text-slate-400">Refrigerating capacity (kW)</span>
				<input
					type="number"
					bind:value={capacityKW}
					step="1"
					min="0"
					class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
				/>
			</label>

			<label class="block space-y-1.5">
				<span class="text-xs font-mono text-slate-400">Liquid subcooling (K)</span>
				<input
					type="number"
					bind:value={subcoolK}
					step="1"
					min="0"
					max="30"
					class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
				/>
			</label>

			<label class="block space-y-1.5">
				<span class="text-xs font-mono text-slate-400">Suction superheat (K)</span>
				<input
					type="number"
					bind:value={superheatK}
					step="1"
					min="0"
					max="40"
					class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
				/>
			</label>

			<label class="block space-y-1.5">
				<span class="text-xs font-mono text-slate-400">Compressor isentropic efficiency (%)</span>
				<input
					type="number"
					bind:value={isenEff}
					step="1"
					min="10"
					max="100"
					class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
				/>
			</label>
		</div>

		{#if engineError}
			<p class="mt-4 text-xs text-amber-400 font-mono">Property database failed to load: {engineError}</p>
		{:else if !engineReady}
			<p class="mt-4 text-xs text-slate-400 font-mono flex items-center space-x-2">
				<Loader2 class="w-3.5 h-3.5 animate-spin" />
				<span>Loading refrigerant property database…</span>
			</p>
		{:else if invalid}
			<p class="mt-4 text-xs text-amber-400 font-mono">
				Check inputs: evaporating must be at least 3 K below condensing, Tc below {(critical?.tC ?? 0).toFixed(1)} °C, and Te above −65 °C.
			</p>
		{/if}
	</div>

	<!-- Results -->
	{#if valid && result}
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
			<!-- State points -->
			<div class="glass-panel rounded-2xl border border-slate-800 p-5 lg:col-span-2 overflow-x-auto">
				<h2 class="text-sm font-bold text-white uppercase tracking-wider mb-4">Cycle State Points</h2>
				<table class="w-full text-xs font-mono">
					<thead>
						<tr class="text-slate-400 border-b border-slate-800">
							<th class="text-left py-2 pr-3">#</th>
							<th class="text-left py-2 pr-3">Location</th>
							<th class="text-right py-2 pr-3">P (bar)</th>
							<th class="text-right py-2 pr-3">T (°C)</th>
							<th class="text-right py-2 pr-3">h (kJ/kg)</th>
							<th class="text-right py-2 pr-3">s (kJ/kg·K)</th>
							<th class="text-right py-2">x</th>
						</tr>
					</thead>
					<tbody class="text-slate-200">
						{#each result.states as st (st.label)}
							<tr class="border-b border-slate-800/60">
								<td class="py-2 pr-3 text-blue-400 font-bold">{st.label}</td>
								<td class="py-2 pr-3 text-slate-400">{st.name}</td>
								<td class="py-2 pr-3 text-right text-cyan-300">{fmt(st.pBar, 3)}</td>
								<td class="py-2 pr-3 text-right">{fmt(st.tC, 1)}</td>
								<td class="py-2 pr-3 text-right text-amber-300">{fmt(st.h, 1)}</td>
								<td class="py-2 pr-3 text-right">{fmt(st.s, 4)}</td>
								<td class="py-2 text-right text-emerald-300">{st.q >= 0 ? `${(st.q * 100).toFixed(1)}%` : '—'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<p class="mt-3 text-[10px] font-mono text-slate-500">
					Region: {result.states.map((s) => `state ${s.label} — ${s.region}`).join(' · ')}
				</p>
			</div>

			<!-- Performance -->
			<div class="glass-panel rounded-2xl border border-slate-800 p-5 space-y-3">
				<h2 class="text-sm font-bold text-white uppercase tracking-wider mb-2">Performance</h2>
				{#each [
					{ label: 'COP', value: fmt(result.cop, 2), accent: 'text-emerald-400' },
					{ label: 'Refrigerating effect', value: `${fmt(result.qa, 1)} kJ/kg`, accent: 'text-blue-300' },
					{ label: 'Compressor work', value: `${fmt(result.wc, 1)} kJ/kg`, accent: 'text-amber-300' },
					{ label: 'Heat rejected', value: `${fmt(result.qr, 1)} kJ/kg`, accent: 'text-orange-300' },
					{ label: 'Evaporating pressure', value: `${fmt(result.peBar, 3)} bar`, accent: 'text-cyan-300' },
					{ label: 'Condensing pressure', value: `${fmt(result.pcBar, 3)} bar`, accent: 'text-cyan-300' },
					{ label: 'Refrigerant flow', value: `${fmt(result.massFlow, 4)} kg/s`, accent: 'text-slate-200' },
					{ label: 'Suction volume flow', value: `${fmt(result.volumeFlow * 3600, 1)} m³/h`, accent: 'text-slate-200' },
					{ label: 'Compressor power', value: `${fmt(result.compressorKW, 2)} kW`, accent: 'text-amber-300' },
					{ label: 'Condenser duty', value: `${fmt(result.condDuty, 2)} kW`, accent: 'text-orange-300' },
					{ label: 'Capacity', value: `${fmt(result.tr, 2)} TR`, accent: 'text-blue-300' }
				] as row (row.label)}
					<div class="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
						<span class="text-xs text-slate-400">{row.label}</span>
						<span class="text-sm font-mono font-bold {row.accent}">{row.value}</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- p-h chart with cycle overlay -->
		<PhChart {refrigerant} cycle={result} />
	{:else if engineReady && !invalid}
		<div class="glass-panel rounded-2xl border border-slate-800 p-8 text-center text-xs font-mono text-slate-400">
			Waiting for valid property data…
		</div>
	{/if}

	<!-- Learn more -->
	<div class="glass-panel rounded-2xl border border-slate-800 p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
		<p class="text-xs text-slate-400">
			New to the cycle? The full theory — four processes, Ph/Ts diagrams and improvement effects — is in the guide.
		</p>
		<a
			href="/guides/vapor-compression-refrigeration-cycle"
			class="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 shrink-0"
		>
			<span>Read: the vapor compression cycle explained</span>
			<ArrowRight class="w-3.5 h-3.5" />
		</a>
	</div>

	<!-- FAQ -->
	<section class="space-y-4">
		<div class="border-b border-slate-800 pb-3">
			<h2 class="text-lg font-bold text-white tracking-tight">Frequently asked questions</h2>
			<p class="text-xs text-slate-400">Cycle fundamentals at a glance</p>
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