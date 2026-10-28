<script lang="ts">
	import { BookOpen, Clock, ArrowRight, ArrowLeft, Tag } from '@lucide/svelte';
	import { CATEGORIES } from '$lib/guides';

	export let data;

	const SITE_URL = 'https://www.psychrolab.org';

	$: grouped = CATEGORIES.map((c) => ({
		...c,
		guides: data.guides.filter((g) => g.categorySlug === c.slug)
	})).filter((c) => c.guides.length > 0);

	$: total = data.guides.length;

	function formatDate(iso: string): string {
		return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			timeZone: 'UTC'
		});
	}

	$: jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: 'HVAC & Thermodynamics Engineering Guides',
		description:
			'Free written guides and tutorials on psychrometrics, refrigeration, power plant cycles and industrial systems for engineers and students.',
		url: `${SITE_URL}/guides`,
		hasPart: data.guides.map((g) => ({
			'@type': 'Article',
			headline: g.title,
			description: g.description,
			datePublished: g.date,
			url: `${SITE_URL}/guides/${g.slug}`
		}))
	};

	$: jsonLdStr = JSON.stringify(jsonLd).replace(/</g, '\\u003c');
</script>

<svelte:head>
	<title>HVAC & Thermodynamics Engineering Guides & Tutorials | PsychroLab</title>
	<meta
		name="description"
		content="Free engineering guides and tutorials covering psychrometrics, air conditioning processes, refrigeration cycles, Rankine power plants and industrial utility systems."
	/>
	<link rel="canonical" href="{SITE_URL}/guides" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="HVAC & Thermodynamics Engineering Guides & Tutorials | PsychroLab" />
	<meta
		property="og:description"
		content="Free engineering guides and tutorials covering psychrometrics, refrigeration, power cycles and industrial systems."
	/>
	<meta property="og:url" content="{SITE_URL}/guides" />
	<meta property="og:site_name" content="PsychroLab" />
	<meta name="twitter:card" content="summary" />
	{@html `<script type="application/ld+json">${jsonLdStr}</script>`}
</svelte:head>

<div class="max-w-5xl mx-auto space-y-10 py-4">
	<!-- HERO -->
	<section class="relative overflow-hidden rounded-3xl glass-panel p-8 md:p-12 border border-slate-800 shadow-2xl">
		<div class="absolute -top-24 -left-24 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
		<div class="absolute -bottom-24 -right-24 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

		<div class="relative z-10 space-y-4">
			<a
				href="/"
				class="inline-flex items-center space-x-1.5 text-xs font-mono font-medium text-blue-400 hover:text-blue-300 transition-colors"
			>
				<ArrowLeft class="w-3.5 h-3.5" />
				<span>Return to Application</span>
			</a>

			<div class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono font-medium w-fit">
				<BookOpen class="w-3.5 h-3.5 text-blue-400" />
				<span>{total} Free Engineering Guides</span>
			</div>

			<h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
				HVAC & Thermodynamics
				<span class="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
					Guides & Tutorials
				</span>
			</h1>

			<p class="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
				Written, step-by-step tutorials distilled from university-level course material on air
				conditioning, refrigeration, power plants and industrial utility systems — built for
				engineering students and practising HVAC professionals.
			</p>
		</div>
	</section>

	<!-- CATEGORIES -->
	{#each grouped as category (category.slug)}
		<section class="space-y-5" id={category.slug}>
			<div class="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-800 pb-3">
				<div>
					<h2 class="text-xl font-bold text-white tracking-tight">{category.name}</h2>
					<p class="text-xs text-slate-400">{category.blurb}</p>
				</div>
				<span class="text-xs font-mono text-slate-500">{category.guides.length} guide{category.guides.length === 1 ? '' : 's'}</span>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
				{#each category.guides as guide (guide.slug)}
					<article class="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-blue-500/50 transition-all duration-200 flex flex-col justify-between group">
						<div class="space-y-3">
							<div class="flex items-center justify-between gap-3">
								<span class="px-2 py-0.5 text-[10px] font-mono uppercase font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/30 rounded-full w-fit">
									{category.name}
								</span>
								<span class="inline-flex items-center space-x-1 text-[10px] font-mono text-slate-500">
									<Clock class="w-3 h-3" />
									<span>{guide.readingTime}</span>
								</span>
							</div>
							<h3 class="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
								<a href="/guides/{guide.slug}" class="after:absolute after:inset-0">
									{guide.title}
								</a>
							</h3>
							<p class="text-xs text-slate-400 leading-relaxed">{guide.description}</p>
						</div>
						<div class="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between relative z-10">
							<span class="text-[10px] font-mono text-slate-500">{formatDate(guide.date)}</span>
							<span class="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-400 group-hover:text-blue-300">
								<span>Read guide</span>
								<ArrowRight class="w-3.5 h-3.5" />
							</span>
						</div>
					</article>
				{/each}
			</div>
		</section>
	{/each}

	<!-- BOTTOM CTA -->
	<section class="rounded-2xl glass-widget p-8 text-center border border-blue-500/30 space-y-4 shadow-2xl relative overflow-hidden">
		<div class="max-w-2xl mx-auto space-y-3">
			<h3 class="text-2xl font-bold text-white">Put the Theory into Practice</h3>
			<p class="text-xs text-slate-300">
				Every guide connects to PsychroLab's interactive calculators — solve state points, coil
				deltas and steam properties as you read.
			</p>
			<div class="pt-2 flex flex-wrap items-center justify-center gap-3">
				<a
					href="/psych-chart"
					class="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all"
				>
					<span>Open Psychrometric Calculator</span>
					<ArrowRight class="w-4 h-4" />
				</a>
				<a
					href="/steam-tables"
					class="inline-flex items-center space-x-2 px-6 py-3 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 font-semibold text-xs rounded-xl transition-all"
				>
					<span>Open Steam Tables</span>
				</a>
			</div>
		</div>
	</section>
</div>

<style>
	article {
		position: relative;
	}
</style>