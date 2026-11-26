<script lang="ts">
  import { goto } from '$app/navigation';
  import Seo from '$lib/components/Seo.svelte';
  import { solveStatePointFromPairSI } from '$lib/psychrometrics/engine';
  import { getStandardAtmosphericPressureSI } from '$lib/psychrometrics/unitConverter';
  import {
    mixAirstreams,
    coilLoad,
    cfmToM3s,
    lpsToM3s,
    m3sToCfm,
    m3sToLps,
    kwToTons,
    kwToBtuh
  } from '$lib/psychrometrics/process';
  import { applyPointPreset } from '$lib/stores/appStore';
  import { ArrowRight, Layers, Calculator, Snowflake } from '@lucide/svelte';

  type FlowUnit = 'm3s' | 'lps' | 'cfm';

  let elevation = 0;

  // Outdoor airstream
  let tA = 35;
  let rhA = 55;
  let flowA = 1.2;
  let unitA: FlowUnit = 'm3s';

  // Return airstream
  let tB = 24;
  let rhB = 50;
  let flowB = 2.8;
  let unitB: FlowUnit = 'm3s';

  // Coil leaving air
  let tLeave = 13;
  let rhLeave = 92;

  const fmt = (v: number, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : '—');

  function toM3s(value: number, unit: FlowUnit): number {
    if (unit === 'cfm') return cfmToM3s(value);
    if (unit === 'lps') return lpsToM3s(value);
    return value;
  }

  $: pPa = getStandardAtmosphericPressureSI(elevation);
  $: mixed = mixAirstreams(
    [
      { tC: tA, rhPercent: rhA, flowM3s: toM3s(flowA, unitA) },
      { tC: tB, rhPercent: rhB, flowM3s: toM3s(flowB, unitB) }
    ],
    pPa
  );
  $: leaving =
    rhLeave > 0 && rhLeave <= 100
      ? solveStatePointFromPairSI('DBT', tLeave, 'RH', rhLeave, pPa)
      : null;
  $: load =
    mixed && leaving
      ? coilLoad(
          mixed.massFlow,
          { tC: mixed.dbt, w: mixed.w, h: mixed.h },
          { tC: leaving.dbt, w: leaving.humRat, h: leaving.enthalpy }
        )
      : null;
  $: totalFlow = mixed ? mixed.totalFlowM3s : 0;
  $: loadPerFlow = load && totalFlow > 0 ? load.totalKW / totalFlow : Number.NaN;
  $: outsideAirFraction = flowA > 0 || flowB > 0 ? toM3s(flowA, unitA) / Math.max(totalFlow, 1e-9) : 0;

  function plotOnChart() {
    if (!mixed || !leaving) return;
    applyPointPreset([
      { dbt: mixed.dbt, rh: mixed.rh, name: 'Mixed air' },
      { dbt: leaving.dbt, rh: leaving.rh, name: 'Coil leaving air' }
    ]);
    goto('/psych-chart');
  }

  const faqs = [
    {
      q: 'How do I calculate mixed air temperature?',
      a: 'Mix by mass flow, not by volume: convert each airstream volume flow to kg/s using its own specific volume, then take the mass-weighted average of enthalpy and humidity ratio. The mixed dry-bulb and relative humidity follow from that state. Volume-weighted averages are only accurate when both streams are at the same density.'
    },
    {
      q: 'What is the sensible heat ratio (SHR)?',
      a: 'SHR is the sensible part of a coil load divided by the total load. It determines the slope of the process line on the psychrometric chart. A coil with SHR 0.8 removes five parts sensible heat for every part latent heat, so the leaving air is cooler and slightly drier than the entering air.'
    },
    {
      q: 'How do I convert CFM to m³/s and kW to tons?',
      a: 'One cubic foot per minute is 0.0004719 m³/s, so 1000 CFM is about 0.472 m³/s. One refrigeration ton is 3.517 kW (12,000 Btu/h), so a 35 kW coil is just under 10 tons.'
    },
    {
      q: 'Why does the coil leaving state need to be below the room dew point?',
      a: 'Moisture only condenses when the coil surface is colder than the entering air dew point. If the leaving air is not saturated (or close to it), the coil is doing sensible cooling only and will not control humidity, which matters in humid climates.'
    }
  ];
</script>

<Seo route="air-mixing" />

<div class="space-y-5">
  <div class="space-y-1 border-b border-slate-800 pb-4">
    <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Air Mixing &amp; Coil Load Calculator</h1>
    <p class="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
      Mix outdoor and return air by mass, then size the cooling/dehumidification coil from the mixed state.
      Includes sensible heat ratio, supply airflow conversions (CFM, L/s, m³/s) and capacity in kW and tons.
    </p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
    <!-- Stream A -->
    <div class="glass-panel rounded-2xl border border-slate-800 p-5 space-y-3">
      <div class="flex items-center gap-2">
        <Layers class="w-4 h-4 text-orange-400" />
        <h2 class="text-sm font-bold text-white uppercase tracking-wider">Stream A — outdoor</h2>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <label class="block space-y-1">
          <span class="text-[11px] font-mono text-slate-400">Dry bulb (°C)</span>
          <input type="number" bind:value={tA} step="1" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2.5 py-2 text-sm font-mono text-white focus:border-blue-500 focus:outline-none" />
        </label>
        <label class="block space-y-1">
          <span class="text-[11px] font-mono text-slate-400">RH (%)</span>
          <input type="number" bind:value={rhA} step="5" min="1" max="100" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2.5 py-2 text-sm font-mono text-white focus:border-blue-500 focus:outline-none" />
        </label>
        <label class="block space-y-1">
          <span class="text-[11px] font-mono text-slate-400">Flow</span>
          <input type="number" bind:value={flowA} step="0.1" min="0" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2.5 py-2 text-sm font-mono text-white focus:border-blue-500 focus:outline-none" />
        </label>
        <label class="block space-y-1">
          <span class="text-[11px] font-mono text-slate-400">Unit</span>
          <select bind:value={unitA} class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
            <option value="m3s">m³/s</option>
            <option value="lps">L/s</option>
            <option value="cfm">CFM</option>
          </select>
        </label>
      </div>
      <p class="text-[10px] font-mono text-slate-500">
        = {fmt(toM3s(flowA, unitA), 3)} m³/s · {fmt(m3sToCfm(toM3s(flowA, unitA)), 0)} CFM
      </p>
    </div>

    <!-- Stream B -->
    <div class="glass-panel rounded-2xl border border-slate-800 p-5 space-y-3">
      <div class="flex items-center gap-2">
        <Layers class="w-4 h-4 text-blue-400" />
        <h2 class="text-sm font-bold text-white uppercase tracking-wider">Stream B — return</h2>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <label class="block space-y-1">
          <span class="text-[11px] font-mono text-slate-400">Dry bulb (°C)</span>
          <input type="number" bind:value={tB} step="1" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2.5 py-2 text-sm font-mono text-white focus:border-blue-500 focus:outline-none" />
        </label>
        <label class="block space-y-1">
          <span class="text-[11px] font-mono text-slate-400">RH (%)</span>
          <input type="number" bind:value={rhB} step="5" min="1" max="100" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2.5 py-2 text-sm font-mono text-white focus:border-blue-500 focus:outline-none" />
        </label>
        <label class="block space-y-1">
          <span class="text-[11px] font-mono text-slate-400">Flow</span>
          <input type="number" bind:value={flowB} step="0.1" min="0" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2.5 py-2 text-sm font-mono text-white focus:border-blue-500 focus:outline-none" />
        </label>
        <label class="block space-y-1">
          <span class="text-[11px] font-mono text-slate-400">Unit</span>
          <select bind:value={unitB} class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
            <option value="m3s">m³/s</option>
            <option value="lps">L/s</option>
            <option value="cfm">CFM</option>
          </select>
        </label>
      </div>
      <p class="text-[10px] font-mono text-slate-500">
        = {fmt(toM3s(flowB, unitB), 3)} m³/s · {fmt(m3sToCfm(toM3s(flowB, unitB)), 0)} CFM
      </p>
    </div>

    <!-- Coil leaving -->
    <div class="glass-panel rounded-2xl border border-slate-800 p-5 space-y-3">
      <div class="flex items-center gap-2">
        <Snowflake class="w-4 h-4 text-cyan-400" />
        <h2 class="text-sm font-bold text-white uppercase tracking-wider">Coil leaving air</h2>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <label class="block space-y-1">
          <span class="text-[11px] font-mono text-slate-400">Dry bulb (°C)</span>
          <input type="number" bind:value={tLeave} step="0.5" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2.5 py-2 text-sm font-mono text-white focus:border-blue-500 focus:outline-none" />
        </label>
        <label class="block space-y-1">
          <span class="text-[11px] font-mono text-slate-400">RH (%)</span>
          <input type="number" bind:value={rhLeave} step="1" min="1" max="100" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2.5 py-2 text-sm font-mono text-white focus:border-blue-500 focus:outline-none" />
        </label>
        <label class="col-span-2 block space-y-1">
          <span class="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Calculator class="w-3 h-3 text-amber-400" /> Site elevation (m)
          </span>
          <input type="number" bind:value={elevation} step="50" class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-2.5 py-2 text-sm font-mono text-white focus:border-blue-500 focus:outline-none" />
        </label>
      </div>
      <p class="text-[10px] font-mono text-slate-500">Barometric pressure {fmt(pPa / 1000, 2)} kPa</p>
    </div>
  </div>

  {#if mixed && leaving && load}
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      {#each [
        { label: 'Mixed dry bulb', value: `${fmt(mixed.dbt, 2)} °C` },
        { label: 'Mixed humidity ratio', value: `${(mixed.w * 1000).toFixed(2)} g/kg` },
        { label: 'Mixed enthalpy', value: `${fmt(mixed.h, 2)} kJ/kg` },
        { label: 'Outside-air fraction', value: `${fmt(outsideAirFraction * 100, 1)} %` }
      ] as card (card.label)}
        <div class="glass-panel rounded-xl border border-slate-800 p-3">
          <p class="text-[10px] font-mono uppercase text-slate-500">{card.label}</p>
          <p class="text-sm font-mono font-bold text-white">{card.value}</p>
        </div>
      {/each}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div class="glass-panel rounded-2xl border border-slate-800 p-5 space-y-2.5">
        <h2 class="text-sm font-bold text-white uppercase tracking-wider mb-2">Coil load</h2>
        {#each [
          { label: 'Total coil load', value: `${fmt(load.totalKW, 2)} kW`, accent: 'text-white' },
          { label: 'In refrigeration tons', value: `${fmt(load.tons, 2)} TR`, accent: 'text-amber-300' },
          { label: 'In Btu/h', value: `${fmt(kwToBtuh(load.totalKW), 0)} Btu/h`, accent: 'text-slate-300' },
          { label: 'Sensible load', value: `${fmt(load.sensibleKW, 2)} kW`, accent: 'text-blue-300' },
          { label: 'Latent load', value: `${fmt(load.latentKW, 2)} kW`, accent: 'text-cyan-300' },
          { label: 'Sensible heat ratio', value: fmt(load.shr, 3), accent: 'text-emerald-400' }
        ] as row (row.label)}
          <div class="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
            <span class="text-xs text-slate-400">{row.label}</span>
            <span class="text-sm font-mono font-bold {row.accent}">{row.value}</span>
          </div>
        {/each}
      </div>

      <div class="glass-panel rounded-2xl border border-slate-800 p-5 space-y-2.5">
        <h2 class="text-sm font-bold text-white uppercase tracking-wider mb-2">Airflow</h2>
        {#each [
          { label: 'Total volume flow', value: `${fmt(totalFlow, 3)} m³/s`, accent: 'text-white' },
          { label: 'In CFM', value: `${fmt(m3sToCfm(totalFlow), 0)} CFM`, accent: 'text-slate-200' },
          { label: 'In L/s', value: `${fmt(m3sToLps(totalFlow), 0)} L/s`, accent: 'text-slate-200' },
          { label: 'In m³/h', value: `${fmt(totalFlow * 3600, 0)} m³/h`, accent: 'text-slate-200' },
          { label: 'Dry air mass flow', value: `${fmt(mixed.massFlow, 3)} kg/s`, accent: 'text-emerald-300' },
          { label: 'Load per unit flow', value: `${fmt(loadPerFlow, 2)} kW/(m³/s)`, accent: 'text-amber-300' }
        ] as row (row.label)}
          <div class="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
            <span class="text-xs text-slate-400">{row.label}</span>
            <span class="text-sm font-mono font-bold {row.accent}">{row.value}</span>
          </div>
        {/each}
      </div>

      <div class="glass-panel rounded-2xl border border-slate-800 p-5 space-y-2.5">
        <h2 class="text-sm font-bold text-white uppercase tracking-wider mb-2">Leaving air</h2>
        {#each [
          { label: 'Dry bulb', value: `${fmt(leaving.dbt, 2)} °C`, accent: 'text-blue-300' },
          { label: 'Relative humidity', value: `${fmt(leaving.rh, 1)} %`, accent: 'text-cyan-300' },
          { label: 'Humidity ratio', value: `${(leaving.humRat * 1000).toFixed(2)} g/kg`, accent: 'text-emerald-300' },
          { label: 'Dew point', value: `${fmt(leaving.dpt, 2)} °C`, accent: 'text-purple-300' },
          { label: 'Enthalpy', value: `${fmt(leaving.enthalpy, 2)} kJ/kg`, accent: 'text-amber-300' },
          { label: 'Apparatus dew point', value: `${fmt(leaving.dpt, 1)} °C`, accent: 'text-slate-300' }
        ] as row (row.label)}
          <div class="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
            <span class="text-xs text-slate-400">{row.label}</span>
            <span class="text-sm font-mono font-bold {row.accent}">{row.value}</span>
          </div>
        {/each}
      </div>
    </div>

    <div class="glass-panel rounded-2xl border border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
      <p class="text-[11px] font-mono text-slate-400">
        SHR {fmt(load.shr, 3)} shapes the coil process line — open the chart to draw it with the SHR guide,
        or compare the two states on the Mollier diagram.
      </p>
      <div class="flex items-center gap-3 shrink-0">
        <button
          type="button"
          on:click={plotOnChart}
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
        >
          <span>Plot both states on the chart</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </button>
        <a href="/psych-chart" class="text-xs font-semibold text-emerald-400 hover:text-emerald-300">SHR protractor</a>
      </div>
    </div>
  {:else}
    <div class="glass-panel rounded-2xl border border-slate-800 p-8 text-center text-xs font-mono text-amber-400">
      Enter valid conditions — relative humidity between 1 and 100%, and at least one airstream with flow.
    </div>
  {/if}

  <section class="space-y-3">
    <h2 class="text-lg font-bold text-white tracking-tight">Frequently asked questions</h2>
    {#each faqs as f (f.q)}
      <details class="glass-panel rounded-xl border border-slate-800 p-4 group">
        <summary class="text-sm font-semibold text-white cursor-pointer list-none flex items-center justify-between">
          <span>{f.q}</span>
          <span class="text-blue-400 group-open:rotate-45 transition-transform">+</span>
        </summary>
        <p class="mt-3 text-xs text-slate-400 leading-relaxed">{f.a}</p>
      </details>
    {/each}
  </section>
</div>
