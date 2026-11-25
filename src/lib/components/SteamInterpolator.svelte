<script lang="ts">
  import { goto } from '$app/navigation';
  import { generateSaturationTableByTemperature, generateSaturationTableByPressure, steamHighlightStore } from '$lib/steam/steamStore';
  import { settingsStore, setSaturationPoint } from '$lib/stores/appStore';
  import { getHumRatioFromVapPress } from '$lib/psychrometrics/engine';
  import { getStandardAtmosphericPressureSI } from '$lib/psychrometrics/unitConverter';
  import type { SaturationPointSI } from '$lib/steam/steamEngine';
  import { Search, ArrowRight, Check } from '@lucide/svelte';

  let axis: 'temp' | 'pressure' = 'temp';
  let target = 150;
  let note = '';

  $: isIP = $settingsStore.unitSystem === 'IP';
  $: rows = axis === 'temp' ? generateSaturationTableByTemperature() : generateSaturationTableByPressure();
  $: keyOf = (r: SaturationPointSI) => (axis === 'temp' ? r.tC : r.pPa / 1e5);
  $: bounds = findBounds(rows, target);
  $: interp = bounds ? interpolateRow(bounds.lower, bounds.upper, keyOf, target) : null;

  // Keep the table grid in sync so the bounding rows are highlighted there too.
  $: steamHighlightStore.set(bounds ? [bounds.lower.tC, bounds.upper.tC] : []);
  $: if (!bounds) {
    note =
      axis === 'temp'
        ? 'Temperature outside the table range (0.01–373.95 °C).'
        : 'Pressure outside the table range (0.01–220.64 bar).';
  } else {
    note = '';
  }

  function findBounds(list: SaturationPointSI[], value: number): { lower: SaturationPointSI; upper: SaturationPointSI } | null {
    if (!Number.isFinite(value) || list.length < 2) return null;
    const key = (r: SaturationPointSI) => (axis === 'temp' ? r.tC : r.pPa / 1e5);
    const first = key(list[0]);
    const last = key(list[list.length - 1]);
    const min = Math.min(first, last);
    const max = Math.max(first, last);
    if (value < min || value > max) return null;

    for (let i = 0; i < list.length - 1; i++) {
      const a = key(list[i]);
      const b = key(list[i + 1]);
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      if (value >= lo && value <= hi) {
        return a <= b ? { lower: list[i], upper: list[i + 1] } : { lower: list[i + 1], upper: list[i] };
      }
    }
    return { lower: list[list.length - 1], upper: list[list.length - 1] };
  }

  function interpolateRow(
    lower: SaturationPointSI,
    upper: SaturationPointSI,
    key: (r: SaturationPointSI) => number,
    value: number
  ): SaturationPointSI {
    const k0 = key(lower);
    const k1 = key(upper);
    const f = k1 === k0 ? 0 : (value - k0) / (k1 - k0);
    const lerp = (a: number, b: number) => a + (b - a) * f;
    return {
      tC: lerp(lower.tC, upper.tC),
      pPa: lerp(lower.pPa, upper.pPa),
      vf: lerp(lower.vf, upper.vf),
      vg: lerp(lower.vg, upper.vg),
      hf: lerp(lower.hf, upper.hf),
      hfg: lerp(lower.hfg, upper.hfg),
      hg: lerp(lower.hg, upper.hg),
      sf: lerp(lower.sf, upper.sf),
      sfg: lerp(lower.sfg, upper.sfg),
      sg: lerp(lower.sg, upper.sg),
      uf: lerp(lower.uf, upper.uf),
      ug: lerp(lower.ug, upper.ug)
    };
  }

  const t = (v: number) => (isIP ? v * 1.8 + 32 : v);
  const p = (pa: number) => (isIP ? (pa / 1e5) * 14.5038 : pa / 1e5);
  const vv = (v: number) => (isIP ? v * 16.0185 : v);
  const hh = (v: number) => (isIP ? v * 0.429923 : v);
  const ss = (v: number) => (isIP ? v * 0.238846 : v);

  function plotOnMollier() {
    if (!interp) return;
    let elevation = $settingsStore.elevation;
    let isSI = $settingsStore.unitSystem === 'SI';
    const elevM = isSI ? elevation : elevation / 3.28084;
    const pTotal = getStandardAtmosphericPressureSI(elevM);
    // Saturated steam pressure is the water-vapour partial pressure; above the
    // barometric pressure the state cannot exist as moist air, so clamp it.
    const pv = Math.min(interp.pPa, pTotal * 0.9);
    const w = getHumRatioFromVapPress(pv, pTotal);
    setSaturationPoint(interp.tC, w, `Steam saturation ${interp.tC.toFixed(1)} °C`);
    goto('/mollier');
  }

  let plotted = false;
  function handlePlot() {
    plotOnMollier();
    plotted = true;
    setTimeout(() => (plotted = false), 2000);
  }
</script>

<div class="glass-panel rounded-2xl border border-slate-800 p-4 md:p-6 space-y-4">
  <div class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3">
    <div class="flex items-center gap-2">
      <Search class="w-4 h-4 text-cyan-400" />
      <div>
        <h3 class="text-sm font-bold text-white uppercase tracking-wider">Exact-value interpolator</h3>
        <p class="text-[11px] text-slate-400">
          Linear interpolation between the two bounding table rows, highlighted in the grid below.
        </p>
      </div>
    </div>
    <div class="flex items-center gap-1 bg-slate-950/70 p-1 rounded-lg border border-slate-800">
      <button
        type="button"
        on:click={() => (axis = 'temp')}
        class="px-2.5 py-1 rounded text-[11px] font-semibold {axis === 'temp' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}"
      >
        by Temperature
      </button>
      <button
        type="button"
        on:click={() => (axis = 'pressure')}
        class="px-2.5 py-1 rounded text-[11px] font-semibold {axis === 'pressure' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}"
      >
        by Pressure
      </button>
    </div>
  </div>

  <div class="flex flex-wrap items-end gap-3">
    <label class="block space-y-1.5">
      <span class="text-[11px] font-mono text-slate-400">
        {axis === 'temp' ? `Saturation temperature (${isIP ? '°F' : '°C'})` : `Saturation pressure (${isIP ? 'psi' : 'bar'})`}
      </span>
      <input
        type="number"
        bind:value={target}
        step={axis === 'temp' ? 1 : 0.5}
        class="w-44 bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-cyan-500 focus:outline-none"
      />
    </label>
    {#if note}
      <p class="text-[11px] font-mono text-amber-400">{note}</p>
    {/if}
    <button
      type="button"
      on:click={handlePlot}
      disabled={!interp}
      class="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-600/30 disabled:opacity-40"
      title="Plot this saturation state on the moist-air Mollier diagram"
    >
      {#if plotted}<Check class="w-3.5 h-3.5" />{:else}<ArrowRight class="w-3.5 h-3.5" />{/if}
      <span>{plotted ? 'Opening…' : 'Plot on Mollier Diagram'}</span>
    </button>
  </div>

  {#if interp && bounds}
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
      {#each [
        { label: 'Temperature', value: `${t(interp.tC).toFixed(2)} ${isIP ? '°F' : '°C'}`, accent: 'text-amber-400' },
        { label: 'Pressure', value: `${p(interp.pPa).toFixed(3)} ${isIP ? 'psi' : 'bar'}`, accent: 'text-cyan-400' },
        { label: 'h', value: `${hh(interp.hf).toFixed(1)} / ${hh(interp.hg).toFixed(1)} ${isIP ? 'Btu/lb' : 'kJ/kg'}`, accent: 'text-emerald-400' },
        { label: 's', value: `${ss(interp.sf).toFixed(4)} / ${ss(interp.sg).toFixed(4)}`, accent: 'text-blue-300' },
        { label: 'v', value: `${vv(interp.vf).toFixed(5)} / ${vv(interp.vg).toFixed(3)}`, accent: 'text-slate-200' }
      ] as card (card.label)}
        <div class="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5">
          <div class="text-[10px] font-mono uppercase text-slate-500">{card.label}</div>
          <div class="text-xs font-mono font-bold {card.accent}">{card.value}</div>
        </div>
      {/each}
    </div>

    <div class="overflow-x-auto rounded-xl border border-slate-800">
      <table class="w-full text-[11px] font-mono">
        <thead class="bg-slate-950 text-slate-400 border-b border-slate-800">
          <tr>
            <th class="text-left p-2">Bounding row</th>
            <th class="text-right p-2">T ({isIP ? '°F' : '°C'})</th>
            <th class="text-right p-2">P ({isIP ? 'psi' : 'bar'})</th>
            <th class="text-right p-2">h<sub>f</sub></th>
            <th class="text-right p-2">h<sub>fg</sub></th>
            <th class="text-right p-2">h<sub>g</sub></th>
            <th class="text-right p-2">s<sub>g</sub></th>
          </tr>
        </thead>
        <tbody>
          {#each [
            { label: 'Lower', row: bounds.lower },
            { label: 'Target', row: interp },
            { label: 'Upper', row: bounds.upper }
          ] as item (item.label)}
            <tr class="border-b border-slate-800/60 {item.label === 'Target' ? 'bg-emerald-500/10' : ''}">
              <td class="p-2 {item.label === 'Target' ? 'text-emerald-300 font-bold' : 'text-slate-400'}">{item.label}</td>
              <td class="p-2 text-right text-amber-300">{t(item.row.tC).toFixed(2)}</td>
              <td class="p-2 text-right text-cyan-300">{p(item.row.pPa).toFixed(3)}</td>
              <td class="p-2 text-right text-slate-300">{hh(item.row.hf).toFixed(1)}</td>
              <td class="p-2 text-right text-slate-300">{hh(item.row.hfg).toFixed(1)}</td>
              <td class="p-2 text-right text-emerald-300">{hh(item.row.hg).toFixed(1)}</td>
              <td class="p-2 text-right text-blue-300">{ss(item.row.sg).toFixed(4)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
