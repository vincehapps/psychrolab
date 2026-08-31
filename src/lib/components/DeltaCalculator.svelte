<script lang="ts">
  import { computedPointsStore, deltaSelectionStore, deltaResultStore, settingsStore } from '../stores/appStore';
  import { ArrowRightLeft, Activity, Flame, Snowflake, Droplets, Wind } from '@lucide/svelte';

  $: isSI = $settingsStore.unitSystem === 'SI';
  $: activePoints = $computedPointsStore.filter((p) => p.enabled);

  function handlePtAChange(e: Event) {
    const val = (e.target as HTMLSelectElement).value;
    deltaSelectionStore.update((s) => ({ ...s, ptAId: val }));
  }

  function handlePtBChange(e: Event) {
    const val = (e.target as HTMLSelectElement).value;
    deltaSelectionStore.update((s) => ({ ...s, ptBId: val }));
  }

  // Determine psychrometric process characterization
  $: processType = (() => {
    if (!$deltaResultStore) return 'No selection';
    const dT = $deltaResultStore.dbtDelta;
    const dW = $deltaResultStore.humRatDelta;

    if (Math.abs(dT) < 0.1 && Math.abs(dW) < 0.0001) return 'Identical States';
    if (dT > 0.1 && Math.abs(dW) < 0.0001) return 'Sensible Heating';
    if (dT < -0.1 && Math.abs(dW) < 0.0001) return 'Sensible Cooling';
    if (Math.abs(dT) < 0.1 && dW > 0.0001) return 'Humidification';
    if (Math.abs(dT) < 0.1 && dW < -0.0001) return 'Dehumidification';
    if (dT < -0.1 && dW < -0.0001) return 'Cooling & Dehumidification';
    if (dT > 0.1 && dW > 0.0001) return 'Heating & Humidification';
    if (dT > 0.1 && dW < -0.0001) return 'Heating & Dehumidification';
    if (dT < -0.1 && dW > 0.0001) return 'Evaporative Cooling';
    return 'Combined Thermodynamic Process';
  })();
</script>

<div class="glass-panel rounded-2xl p-4 border border-slate-800 shadow-lg">
  
  <div class="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
    <div class="flex items-center space-x-2">
      <ArrowRightLeft class="w-4 h-4 text-cyan-400" />
      <h3 class="text-sm font-semibold text-slate-100 uppercase tracking-wide">Point Delta Process Analyzer</h3>
    </div>
    <span class="text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">
      {processType}
    </span>
  </div>

  <!-- Selectors for Point A and Point B -->
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
    <div>
      <label for="delta-select-pt-a" class="block text-[10px] font-mono uppercase text-slate-400 mb-1">Start Point (Point A)</label>
      <select
        id="delta-select-pt-a"
        value={$deltaSelectionStore.ptAId}
        on:change={handlePtAChange}
        class="w-full bg-slate-950 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700/80 focus:border-cyan-500 focus:outline-none"
      >
        {#each activePoints as pt}
          <option value={pt.id}>{pt.name}</option>
        {/each}
      </select>
    </div>

    <div>
      <label for="delta-select-pt-b" class="block text-[10px] font-mono uppercase text-slate-400 mb-1">End Point (Point B)</label>
      <select
        id="delta-select-pt-b"
        value={$deltaSelectionStore.ptBId}
        on:change={handlePtBChange}
        class="w-full bg-slate-950 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700/80 focus:border-cyan-500 focus:outline-none"
      >
        {#each activePoints as pt}
          <option value={pt.id}>{pt.name}</option>
        {/each}
      </select>
    </div>
  </div>

  {#if $deltaResultStore}
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
      
      <!-- Temperature Delta -->
      <div class="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-center">
        <div class="text-[10px] text-slate-400 uppercase mb-1">Δ Dry-Bulb Temp</div>
        <div class="text-sm font-bold {$deltaResultStore.dbtDelta >= 0 ? 'text-amber-400' : 'text-cyan-400'}">
          {$deltaResultStore.dbtDelta > 0 ? '+' : ''}{$deltaResultStore.dbtDelta} {isSI ? '°C' : '°F'}
        </div>
      </div>

      <!-- Humidity Ratio Delta -->
      <div class="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-center">
        <div class="text-[10px] text-slate-400 uppercase mb-1">Δ Humidity Ratio</div>
        <div class="text-sm font-bold {$deltaResultStore.humRatDelta >= 0 ? 'text-cyan-400' : 'text-blue-400'}">
          {$deltaResultStore.humRatDelta > 0 ? '+' : ''}{$deltaResultStore.humRatDelta} {isSI ? 'kg/kg' : 'gr/lb'}
        </div>
      </div>

      <!-- Enthalpy Delta -->
      <div class="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-center">
        <div class="text-[10px] text-slate-400 uppercase mb-1">Δ Enthalpy</div>
        <div class="text-sm font-bold {$deltaResultStore.enthalpyDelta >= 0 ? 'text-emerald-400' : 'text-purple-400'}">
          {$deltaResultStore.enthalpyDelta > 0 ? '+' : ''}{$deltaResultStore.enthalpyDelta} {isSI ? 'kJ/kg' : 'Btu/lb'}
        </div>
      </div>

      <!-- RH Delta -->
      <div class="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-center">
        <div class="text-[10px] text-slate-400 uppercase mb-1">Δ Rel. Humidity</div>
        <div class="text-sm font-bold {$deltaResultStore.rhDelta >= 0 ? 'text-blue-400' : 'text-slate-300'}">
          {$deltaResultStore.rhDelta > 0 ? '+' : ''}{$deltaResultStore.rhDelta} %
        </div>
      </div>

    </div>
  {/if}
</div>
