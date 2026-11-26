<script lang="ts">
  import { page } from '$app/stores';
  import { LineChart, Compass, Activity, Snowflake, Thermometer, Wind, Gauge, Layers, BookOpen, Droplets } from '@lucide/svelte';

  const tools = [
    { href: '/psych-chart', label: 'Psychrometric', icon: LineChart, accent: 'text-blue-400' },
    { href: '/mollier', label: 'Mollier h-x', icon: Compass, accent: 'text-emerald-400' },
    { href: '/ph-chart', label: 'Refrigerant p-h', icon: Activity, accent: 'text-cyan-400' },
    { href: '/vapor-compression', label: 'Vapor Cycle', icon: Snowflake, accent: 'text-sky-400' },
    { href: '/steam-tables', label: 'Steam Tables', icon: Thermometer, accent: 'text-amber-400' },
    { href: '/air-mixing', label: 'Air Mixing', icon: Layers, accent: 'text-indigo-400' },
    { href: '/cooling-load', label: 'Cooling Load', icon: Gauge, accent: 'text-orange-400' },
    { href: '/duct-sizing', label: 'Duct Sizing', icon: Wind, accent: 'text-teal-400' },
    { href: '/pipe-sizing', label: 'Pipe Sizing', icon: Droplets, accent: 'text-cyan-400' },
    { href: '/practice', label: 'Practice', icon: BookOpen, accent: 'text-purple-400' }
  ];

  $: path = $page.url.pathname;
</script>

<nav aria-label="Calculator suite" class="relative z-30 w-full border-b border-slate-800/70 bg-[#0b1326]/95 backdrop-blur">
  <div class="max-w-7xl mx-auto px-2 sm:px-4">
    <div class="flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-thin">
      <span class="hidden md:inline-block pr-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 shrink-0">
        Tools
      </span>
      {#each tools as tool}
        {@const active = path === tool.href}
        <a
          href={tool.href}
          aria-current={active ? 'page' : undefined}
          class="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors {active
            ? 'bg-blue-600/25 border-blue-500/60 text-white'
            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'}"
        >
          <svelte:component this={tool.icon} class="w-3.5 h-3.5 {tool.accent}" />
          <span>{tool.label}</span>
        </a>
      {/each}
    </div>
  </div>
</nav>
