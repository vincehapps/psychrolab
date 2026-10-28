<script lang="ts">
	import { ArrowLeft, ArrowRight } from '@lucide/svelte';
	import PhChart from '$lib/components/PhChart.svelte';
	import { REFRIGERANTS, type RefrigerantId } from '$lib/refrig/engine';

	const SITE_URL = 'https://www.psychrolab.org';

	let refrigerant: RefrigerantId = 'R134a';

	const faqs = [
		{
			q: 'What is a pressure-enthalpy (p–h) diagram?',
			a: 'A p–h diagram plots pressure against specific enthalpy for a refrigerant. The saturation dome separates subcooled liquid, two-phase mixture and superheated vapour. The area under the evaporation line is the refrigerating effect, and the horizontal distance across the compression process is the compressor work — which is why the vapour compression cycle reads directly off this chart.'
		},
		{
			q: 'Why is the pressure axis logarithmic?',
			a: 'Refrigerant pressures span two or more orders of magnitude between a low-temperature evaporator and a high-temperature condenser. A logarithmic axis keeps the low-pressure region readable while still fitting the critical point — the same convention used on published p–h charts.'
		},
		{
			q: 'What are the horizontal lines inside the dome?',
			a: 'Inside the saturation dome, temperature and pressure are locked together, so each horizontal line is an isotherm-isobar: refrigerant evaporates or condenses at constant temperature while enthalpy increases from hf (saturated liquid) to hg (saturated vapour).'
		},
		{
			q: 'How do I read quality (x) on the chart?',
			a: 'Quality is the vapour mass fraction. At the saturated liquid line x = 0, at the saturated vapour line x = 1. The dashed quality lines between them interpolate linearly in enthalpy: h = hf + x·hfg. Hover the chart to read x at any point inside the dome.'
		},
		{
			q: 'Can I export the chart?',
			a: 'Yes — the PNG and SVG buttons above the diagram download the current chart, including any overlaid cycle from the calculator. SVG is resolution-independent and ideal for reports and lecture slides.'
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
	<title>Interactive Refrigerant p–h Diagram (Pressure-Enthalpy Chart) | PsychroLab</title>
	<meta
		name="description"
		content="Free interactive pressure-enthalpy diagram for R-134a, R-22, R-410A, ammonia, R-290 and R-32: saturation dome, isotherms, quality lines, hover property inspector and PNG/SVG export."
	/>
	<link rel="canonical" href="{SITE_URL}/ph-chart" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Interactive Refrigerant p–h Diagram" />
	<meta
		property="og:description"
		content="Explore the pressure-enthalpy chart for six refrigerants with a live property inspector and image export."
	/>
	<meta property="og:url" content="{SITE_URL}/ph-chart" />
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
			Interactive Refrigerant p–h Diagram
		</h1>
		<p class="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
			Pressure–enthalpy chart with saturation dome, isotherms and quality lines for six common
			refrigerants. Hover anywhere to read temperature, pressure, enthalpy and quality; export the
			chart as PNG or SVG for reports. Properties computed live by the CoolProp database.
		</p>
	</div>

	<!-- Refrigerant selector -->
	<div class="glass-panel rounded-2xl border border-slate-800 p-4">
		<div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Select refrigerant">
			{#each REFRIGERANTS as r (r.id)}
				<button
					type="button"
					role="radio"
					aria-checked={refrigerant === r.id}
					on:click={() => (refrigerant = r.id)}
					class="px-3.5 py-2 rounded-lg text-xs font-semibold transition-all border {refrigerant === r.id
						? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30'
						: 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-white hover:border-slate-500'}"
				>
					{r.name}
				</button>
			{/each}
		</div>
		<p class="mt-3 text-[11px] font-mono text-slate-500">
			{REFRIGERANTS.find((r) => r.id === refrigerant)?.chemical} —
			{REFRIGERANTS.find((r) => r.id === refrigerant)?.note}
		</p>
	</div>

	<!-- Chart -->
	<PhChart {refrigerant} />

	<!-- CTA to calculator -->
	<div class="glass-panel rounded-2xl border border-slate-800 p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
		<p class="text-xs text-slate-400">
			Overlay a real vapour compression cycle on the chart — enter your operating temperatures and get
			COP, state points and mass flow.
		</p>
		<a
			href="/vapor-compression"
			class="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 shrink-0"
		>
			<span>Open the cycle calculator</span>
			<ArrowRight class="w-3.5 h-3.5" />
		</a>
	</div>

	<!-- FAQ -->
	<section class="space-y-4">
		<div class="border-b border-slate-800 pb-3">
			<h2 class="text-lg font-bold text-white tracking-tight">Frequently asked questions</h2>
			<p class="text-xs text-slate-400">Reading pressure-enthalpy charts</p>
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