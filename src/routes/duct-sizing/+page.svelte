<script lang="ts">
	import { ArrowLeft, ArrowRight, Calculator } from '@lucide/svelte';

	const SITE_URL = 'https://www.psychrolab.org';

	// Inputs
	let flow = 1; // in selected unit
	let flowUnit: 'm3s' | 'm3h' | 'lps' = 'm3s';
	let method: 'equalFriction' | 'velocity' = 'equalFriction';
	let friction = 0.25; // mm w.g. / m
	let velocity = 5; // m/s
	let shape: 'round' | 'rect' = 'round';
	let aspect = 2; // width / height
	let length = 20; // m of duct
	let fittingsLeq = 10; // m equivalent length of fittings
	let fanEff = 60; // %

	const fmt = (v: number, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : '—');

	$: q = flowUnit === 'm3s' ? flow : flowUnit === 'm3h' ? flow / 3600 : flow / 1000;

	// Altshul-Tikhomirov friction relation (guide formula): mm w.g. per m, Q in m³/s, D in m
	function frictionMmPerM(q: number, d: number): number {
		if (q <= 0 || d <= 0) return NaN;
		return (0.002268 * Math.pow(q, 1.852)) / Math.pow(d, 4.973);
	}
	function diameterForFriction(q: number, a: number): number {
		if (q <= 0 || a <= 0) return NaN;
		return Math.pow((0.002268 * Math.pow(q, 1.852)) / a, 1 / 4.973);
	}

	const STD_D = [100, 125, 150, 200, 250, 315, 350, 400, 450, 500, 560, 630, 710, 800, 900, 1000, 1120, 1250];

	$: calc = (() => {
		if (!(q > 0)) return null;
		const dExact =
			method === 'equalFriction' ? diameterForFriction(q, friction) : Math.sqrt((4 * q) / Math.PI / velocity);
		if (!Number.isFinite(dExact) || dExact <= 0) return null;

		const area = (Math.PI * dExact * dExact) / 4;
		const v = q / area;
		const a = frictionMmPerM(q, dExact);

		let w = NaN;
		let h = NaN;
		if (shape === 'rect' && aspect > 0) {
			w = Math.sqrt(area * aspect);
			h = Math.sqrt(area / aspect);
		}

		const totalM = Math.max(0, length) + Math.max(0, fittingsLeq);
		const dpm = a * totalM; // mm w.g. total
		const pa = dpm * 9.81;
		const cmWg = dpm / 10;
		const powerW = (pa * q) / Math.max(0.1, fanEff / 100);

		const velocityClass = v <= 10 ? (cmWg <= 5 ? 'Low' : cmWg <= 15 ? 'Medium' : 'High') : 'High';

		const nearest = STD_D.reduce((best, d) =>
			Math.abs(d / 1000 - dExact) < Math.abs(best / 1000 - dExact) ? d : best
		);

		const target = method === 'equalFriction' ? friction : velocity;
		const scored = STD_D.map((d) => {
			const dm = d / 1000;
			const dv = q / ((Math.PI * dm * dm) / 4);
			const da = frictionMmPerM(q, dm);
			return { d, v: dv, a: da, diff: Math.abs(method === 'equalFriction' ? da - friction : dv - velocity) };
		});
		const recommended = scored.reduce((best, s) => (s.diff < best.diff ? s : best), scored[0]);

		return { dExact, area, v, a, w, h, dpm, pa, cmWg, powerW, velocityClass, nearest, recommended, scored, target };
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
			q: 'What is the equal friction method?',
			a: 'You choose one pressure drop per metre of duct (commonly 0.1–0.3 mm w.g./m, i.e. 1–3 Pa/m) and size every run from it: D = (0.002268·Q^1.852 / a)^(1/4.973). Ducts get larger as airflow falls, velocities stay reasonable, and the fan head is the friction along the index run plus fitting losses.'
		},
		{
			q: 'What is the velocity reduction method?',
			a: 'You pick an acceptable velocity for mains and branches, then size from A = Q/v (and D = √(4A/π)). It guarantees comfortable noise and velocity levels but often produces uneven friction rates, so the resulting duct sizes and fan power may be less economical than equal friction.'
		},
		{
			q: 'What velocity should I design for?',
			a: 'As a rule of thumb from the guide: low-pressure systems stay at or below about 10 m/s with static pressure under 5 cm w.g.; medium pressure up to 15 cm w.g.; high pressure above that. In practice, main ducts in offices run 5–8 m/s and branches 3–5 m/s to keep noise acceptable.'
		},
		{
			q: 'How do fittings affect the fan size?',
			a: 'Every elbow, tee, damper and grille adds a loss expressed as equivalent straight duct. The calculator adds that equivalent length to the real length before converting friction into total static pressure — often fittings account for half or more of the system pressure drop.'
		},
		{
			q: 'Round or rectangular ducts?',
			a: 'Round duct is the most economical per unit of airflow: least material, lowest friction and best leak tightness for a given cross-section. Rectangular duct is used where ceiling void depth is limited — size it from the same free area, keeping the aspect ratio near 1:1 to 4:1 so friction and material cost stay reasonable.'
		}
	];
</script>

<svelte:head>
	<title>Duct Sizing Calculator: Equal Friction & Velocity Reduction | PsychroLab</title>
	<meta
		name="description"
		content="Free duct sizing calculator using the equal friction and velocity reduction methods: enter airflow to get round or rectangular duct dimensions, velocity, friction loss, total static pressure and fan power."
	/>
	<link rel="canonical" href="{SITE_URL}/duct-sizing" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Duct Sizing Calculator: Equal Friction & Velocity Reduction" />
	<meta
		property="og:description"
		content="Size air ducts by equal friction or velocity method: diameter or rectangular dimensions, velocity, friction rate, static pressure and fan static power."
	/>
	<meta property="og:url" content="{SITE_URL}/duct-sizing" />
	<meta name="twitter:card" content="summary" />
	{@html `<script type="application/ld+json">${jsonLdStr}</script>`}
</svelte:head>

<div class="space-y-5">
	<div class="border-b border-slate-800 pb-4 space-y-2">
		<a href="/guides" class="inline-flex items-center space-x-1.5 text-xs font-mono font-medium text-blue-400 hover:text-blue-300 transition-colors">
			<ArrowLeft class="w-3.5 h-3.5" /><span>Engineering guides</span>
		</a>
		<h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Duct Sizing Calculator</h1>
		<p class="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
			Size air ducts by the two classic methods — equal friction and velocity reduction — for round or
			rectangular sections, with friction loss, total static pressure and fan power from the standard
			friction relation.
		</p>
	</div>

	<!-- Inputs -->
	<div class="glass-panel rounded-2xl border border-slate-800 p-5">
		<div class="flex items-center space-x-2 mb-4">
			<Calculator class="w-4 h-4 text-blue-400" />
			<h2 class="text-sm font-bold text-white uppercase tracking-wider">Design Parameters</h2>
		</div>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<label class="block space-y-1.5">
				<span class="text-xs font-mono text-slate-400">Airflow</span>
				<div class="flex space-x-2">
					<input type="number" bind:value={flow} step="0.1" min="0" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
					<select bind:value={flowUnit} class="bg-slate-950/70 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white focus:border-blue-500 focus:outline-none">
						<option value="m3s">m³/s</option>
						<option value="m3h">m³/h</option>
						<option value="lps">L/s</option>
					</select>
				</div>
			</label>

			<label class="block space-y-1.5">
				<span class="text-xs font-mono text-slate-400">Method</span>
				<select bind:value={method} class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
					<option value="equalFriction">Equal friction</option>
					<option value="velocity">Velocity reduction</option>
				</select>
			</label>

			{#if method === 'equalFriction'}
				<label class="block space-y-1.5">
					<span class="text-xs font-mono text-slate-400">Friction rate (mm w.g./m)</span>
					<input type="number" bind:value={friction} step="0.005" min="0.01" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
					<span class="block text-[10px] text-slate-500">0.1–0.3 is the usual design range</span>
				</label>
			{:else}
				<label class="block space-y-1.5">
					<span class="text-xs font-mono text-slate-400">Design velocity (m/s)</span>
					<input type="number" bind:value={velocity} step="0.5" min="0.5" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
					<span class="block text-[10px] text-slate-500">Mains 5–8 m/s, branches 3–5 m/s</span>
				</label>
			{/if}

			<label class="block space-y-1.5">
				<span class="text-xs font-mono text-slate-400">Duct shape</span>
				<select bind:value={shape} class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
					<option value="round">Round</option>
					<option value="rect">Rectangular</option>
				</select>
			</label>

			{#if shape === 'rect'}
				<label class="block space-y-1.5">
					<span class="text-xs font-mono text-slate-400">Aspect ratio W : H</span>
					<input type="number" bind:value={aspect} step="0.5" min="1" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
				</label>
			{:else}
				<div></div>
			{/if}

			<label class="block space-y-1.5">
				<span class="text-xs font-mono text-slate-400">Duct run length (m)</span>
				<input type="number" bind:value={length} step="1" min="0" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
			</label>

			<label class="block space-y-1.5">
				<span class="text-xs font-mono text-slate-400">Fittings — equivalent length (m)</span>
				<input type="number" bind:value={fittingsLeq} step="1" min="0" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
			</label>

			<label class="block space-y-1.5">
				<span class="text-xs font-mono text-slate-400">Fan static efficiency (%)</span>
				<input type="number" bind:value={fanEff} step="5" min="10" max="100" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
			</label>
		</div>
	</div>

	<!-- Results -->
	{#if calc}
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
			<div class="glass-panel rounded-2xl border border-slate-800 p-5 space-y-3">
				<h2 class="text-sm font-bold text-white uppercase tracking-wider mb-2">Duct Size</h2>
				{#each [
					{ label: 'Free area', value: `${fmt(calc.area * 10000, 0)} cm²`, accent: 'text-white' },
					{ label: 'Velocity', value: `${fmt(calc.v, 2)} m/s`, accent: 'text-blue-300' },
					{ label: 'Friction rate', value: `${fmt(calc.a, 4)} mm/m`, accent: 'text-cyan-300' },
					{ label: 'Friction rate', value: `${fmt(calc.a * 9.81, 3)} Pa/m`, accent: 'text-cyan-300' },
					{ label: 'Pressure class', value: calc.velocityClass, accent: 'text-emerald-400' }
				] as row (row.label + row.value)}
					<div class="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
						<span class="text-xs text-slate-400">{row.label}</span>
						<span class="text-sm font-mono font-bold {row.accent}">{row.value}</span>
					</div>
				{/each}
				{#if shape === 'round'}
					<p class="text-lg font-mono font-bold text-white pt-1">
						Ø {fmt(calc.dExact * 1000, 0)} mm
						<span class="text-xs font-normal text-slate-400">— nearest standard Ø {calc.nearest} mm</span>
					</p>
				{:else}
					<p class="text-lg font-mono font-bold text-white pt-1">
						{fmt(calc.w * 1000, 0)} × {fmt(calc.h * 1000, 0)} mm
						<span class="text-xs font-normal text-slate-400">(aspect {fmt(calc.w / calc.h, 1)}:1)</span>
					</p>
				{/if}
			</div>

			<div class="glass-panel rounded-2xl border border-slate-800 p-5 space-y-3">
				<h2 class="text-sm font-bold text-white uppercase tracking-wider mb-2">System Pressure</h2>
				{#each [
					{ label: 'Total equivalent length', value: `${fmt(length + fittingsLeq, 1)} m`, accent: 'text-white' },
					{ label: 'Friction loss', value: `${fmt(calc.dpm, 2)} mm w.g.`, accent: 'text-blue-300' },
					{ label: 'Friction loss', value: `${fmt(calc.pa, 1)} Pa`, accent: 'text-blue-300' },
					{ label: 'Static pressure', value: `${fmt(calc.cmWg, 2)} cm w.g.`, accent: 'text-cyan-300' },
					{ label: 'Fan static power', value: `${fmt(calc.powerW / 1000, 2)} kW`, accent: 'text-amber-300' }
				] as row (row.label + row.value)}
					<div class="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
						<span class="text-xs text-slate-400">{row.label}</span>
						<span class="text-sm font-mono font-bold {row.accent}">{row.value}</span>
					</div>
				{/each}
			</div>

			<!-- Standard size table -->
			<div class="glass-panel rounded-2xl border border-slate-800 p-5 lg:col-span-3 overflow-x-auto">
				<h2 class="text-sm font-bold text-white uppercase tracking-wider mb-3">Standard Round Sizes at {fmt(q, 3)} m³/s</h2>
				<table class="w-full text-xs font-mono">
					<thead>
						<tr class="text-slate-400 border-b border-slate-800">
							<th class="text-left py-2 pr-3">Ø (mm)</th>
							<th class="text-right py-2 pr-3">Velocity (m/s)</th>
							<th class="text-right py-2 pr-3">Friction (mm/m)</th>
							<th class="text-right py-2">Friction (Pa/m)</th>
						</tr>
					</thead>
					<tbody class="text-slate-200">
						{#each calc.scored as row (row.d)}
							<tr class="border-b border-slate-800/60 {row.d === calc.recommended.d ? 'bg-blue-600/10' : ''}">
								<td class="py-2 pr-3 font-bold {row.d === calc.recommended.d ? 'text-blue-300' : ''}">{row.d}</td>
								<td class="py-2 pr-3 text-right">{fmt(row.v, 2)}</td>
								<td class="py-2 pr-3 text-right">{fmt(row.a, 4)}</td>
								<td class="py-2 text-right text-cyan-300">{fmt(row.a * 9.81, 3)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<p class="mt-3 text-[10px] font-mono text-slate-500">
					Highlighted row is the closest standard size to the {method === 'equalFriction' ? `target friction of ${friction} mm/m` : `target velocity of ${velocity} m/s`}. Rectangular sizing uses the same free area with your aspect ratio.
				</p>
			</div>
		</div>
	{:else}
		<div class="glass-panel rounded-2xl border border-slate-800 p-8 text-center text-xs font-mono text-amber-400">
			Enter an airflow greater than zero to size the duct.
		</div>
	{/if}

	<!-- Learn more -->
	<div class="glass-panel rounded-2xl border border-slate-800 p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
		<p class="text-xs text-slate-400">
			Both methods, the friction chart and index-run fan head are covered step by step in the fan
			systems and duct design guide.
		</p>
		<div class="flex items-center gap-4 shrink-0">
			<a href="/guides/hvac-fan-systems-duct-design" class="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300">
				<span>Read: fan systems & duct design</span><ArrowRight class="w-3.5 h-3.5" />
			</a>
			<a href="/cooling-load" class="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300">
				<span>Size the airflow first</span><ArrowRight class="w-3.5 h-3.5" />
			</a>
		</div>
	</div>

	<!-- FAQ -->
	<section class="space-y-4">
		<div class="border-b border-slate-800 pb-3">
			<h2 class="text-lg font-bold text-white tracking-tight">Frequently asked questions</h2>
			<p class="text-xs text-slate-400">Duct sizing methods at a glance</p>
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