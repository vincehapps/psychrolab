<script lang="ts">
  import { SEO, SITE_URL, jsonLdScriptTag } from '$lib/seo';

  export let route: string;

  $: entry = SEO[route] ?? SEO.home;
  $: canonical = `${SITE_URL}${entry.path}`;
  $: schema = jsonLdScriptTag(route in SEO ? route : 'home');
</script>

<svelte:head>
  <title>{entry.title}</title>
  <meta name="description" content={entry.description} />
  <link rel="canonical" href={canonical} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="PsychroLab" />
  <meta property="og:title" content={entry.title} />
  <meta property="og:description" content={entry.description} />
  <meta property="og:url" content={canonical} />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content={entry.title} />
  <meta name="twitter:description" content={entry.description} />
  {@html schema}
</svelte:head>
