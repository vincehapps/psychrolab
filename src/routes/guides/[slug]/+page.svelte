<script lang="ts">
	import { ArrowLeft, ArrowRight, Clock, Calendar, Tag, BookOpen } from '@lucide/svelte';

	export let data;

	const SITE_URL = 'https://www.psychrolab.org';

	const TOOL_CTA: Record<string, { href: string; label: string }> = {
		'air-conditioning': { href: '/psych-chart', label: 'Open Psychrometric Chart' },
		'industrial-systems': { href: '/psych-chart', label: 'Open Psychrometric Chart' },
		'power-plants': { href: '/steam-tables', label: 'Open Steam Tables' },
		refrigeration: { href: '/vapor-compression', label: 'Open Cycle Calculator' }
	};

	$: guide = data.guide;
	$: cta = TOOL_CTA[guide.categorySlug] ?? { href: '/', label: 'Open PsychroLab' };

	$: related = data.allGuides
		.filter((g) => g.slug !== guide.slug)
		.sort((a, b) => (a.categorySlug === guide.categorySlug ? -1 : 1) - (b.categorySlug === guide.categorySlug ? -1 : 1))
		.slice(0, 3);

	$: canonical = `${SITE_URL}/guides/${guide.slug}`;

	$: articleLd = {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: guide.title,
		description: guide.description,
		datePublished: guide.date,
		inLanguage: 'en',
		author: { '@type': 'Organization', name: 'PsychroLab' },
		publisher: { '@type': 'Organization', name: 'PsychroLab', url: SITE_URL },
		mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
		keywords: guide.tags.join(', ')
	};

	$: breadcrumbLd = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
			{ '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
			{ '@type': 'ListItem', position: 3, name: guide.title, item: canonical }
		]
	};

	$: articleLdStr = JSON.stringify(articleLd).replace(/</g, '\\u003c');
	$: breadcrumbLdStr = JSON.stringify(breadcrumbLd).replace(/</g, '\\u003c');

	function formatDate(iso: string): string {
		return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			timeZone: 'UTC'
		});
	}
</script>

<svelte:head>
	<title>{guide.title} | PsychroLab Engineering Guide</title>
	<meta name="description" content={guide.description} />
	<link rel="canonical" href={canonical} />
	<meta property="og:type" content="article" />
	<meta property="og:site_name" content="PsychroLab" />
	<meta property="og:title" content={guide.title} />
	<meta property="og:description" content={guide.description} />
	<meta property="og:url" content={canonical} />
	<meta property="article:published_time" content={guide.date} />
	<meta property="article:section" content={guide.category} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={guide.title} />
	<meta name="twitter:description" content={guide.description} />
	<meta name="keywords" content={guide.tags.join(', ')} />
	{@html `<script type="application/ld+json">${articleLdStr}</script>`}
	{@html `<script type="application/ld+json">${breadcrumbLdStr}</script>`}
</svelte:head>

<article class="max-w-4xl mx-auto space-y-8 py-4">
	<!-- Breadcrumb -->
	<nav class="flex items-center space-x-2 text-xs font-mono text-slate-400" aria-label="Breadcrumb">
		<a href="/" class="hover:text-blue-300 transition-colors">Home</a>
		<span>/</span>
		<a href="/guides" class="hover:text-blue-300 transition-colors">Guides</a>
		<span>/</span>
		<span class="text-slate-500 truncate max-w-[14rem]">{guide.title}</span>
	</nav>

	<!-- Header -->
	<header class="relative overflow-hidden rounded-3xl glass-panel p-8 md:p-10 border border-slate-800 shadow-2xl space-y-4">
		<div class="absolute -top-24 -right-24 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

		<div class="relative z-10 space-y-4">
			<span class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono font-medium w-fit">
				<BookOpen class="w-3.5 h-3.5" />
				<span>{guide.category}</span>
			</span>

			<h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
				{guide.title}
			</h1>

			<p class="text-sm text-slate-300 leading-relaxed max-w-3xl">{guide.description}</p>

			<div class="flex flex-wrap items-center gap-4 pt-1 text-xs font-mono text-slate-400">
				<span class="inline-flex items-center space-x-1.5">
					<Calendar class="w-3.5 h-3.5 text-blue-400" />
					<time datetime={guide.date}>{formatDate(guide.date)}</time>
				</span>
				<span class="inline-flex items-center space-x-1.5">
					<Clock class="w-3.5 h-3.5 text-emerald-400" />
					<span>{guide.readingTime}</span>
				</span>
			</div>
		</div>
	</header>

	<!-- Prose content -->
	<div class="glass-panel rounded-2xl border border-slate-800 p-6 md:p-10">
		<div
			class="prose prose-invert prose-lg max-w-none
				prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
				prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-slate-800 prose-h2:pb-2
				prose-h3:text-base prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-blue-300
				prose-p:text-slate-300 prose-p:leading-relaxed
				prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
				prose-strong:text-slate-100
				prose-code:text-cyan-300 prose-code:before:content-none prose-code:after:content-none
				prose-code:bg-slate-950/70 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-slate-800
				prose-li:text-slate-300
				prose-table:text-xs prose-th:text-slate-200 prose-td:text-slate-300
				prose-img:rounded-xl"
		>
			<svelte:component this={data.Content} />
		</div>
	</div>

	<!-- Tags -->
	{#if guide.tags.length > 0}
		<div class="flex flex-wrap items-center gap-2">
			<Tag class="w-4 h-4 text-slate-500" />
			{#each guide.tags as tag (tag)}
				<span class="px-2.5 py-1 text-[11px] font-mono bg-slate-900/80 border border-slate-800 text-slate-400 rounded-lg">
					{tag}
				</span>
			{/each}
		</div>
	{/if}

	<!-- Tool CTA -->
	<section class="rounded-2xl glass-widget p-6 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
		<div class="text-center sm:text-left space-y-1">
			<h3 class="text-sm font-bold text-white">Practice while you learn</h3>
			<p class="text-xs text-slate-400">Run the numbers from this guide in PsychroLab's interactive tools.</p>
		</div>
		<a
			href={cta.href}
			class="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all shrink-0"
		>
			<span>{cta.label}</span>
			<ArrowRight class="w-4 h-4" />
		</a>
	</section>

	<!-- Related guides -->
	<section class="space-y-4">
		<div class="border-b border-slate-800 pb-3">
			<h2 class="text-lg font-bold text-white tracking-tight">Related Guides</h2>
			<p class="text-xs text-slate-400">Continue learning along the same track</p>
		</div>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			{#each related as r (r.slug)}
				<a
					href="/guides/{r.slug}"
					class="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-blue-500/50 transition-all group flex flex-col justify-between space-y-3"
				>
					<div class="space-y-2">
						<span class="text-[10px] font-mono uppercase text-blue-300">{r.category}</span>
						<h3 class="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">{r.title}</h3>
						<p class="text-xs text-slate-400 leading-relaxed line-clamp-3">{r.description}</p>
					</div>
					<span class="inline-flex items-center space-x-1 text-xs font-semibold text-blue-400">
						<span>Read guide</span>
						<ArrowRight class="w-3.5 h-3.5" />
					</span>
				</a>
			{/each}
		</div>
	</section>

	<!-- Back to all guides -->
	<a
		href="/guides"
		class="inline-flex items-center space-x-1.5 text-xs font-mono font-medium text-blue-400 hover:text-blue-300 transition-colors"
	>
		<ArrowLeft class="w-3.5 h-3.5" />
		<span>All engineering guides</span>
	</a>
</article>