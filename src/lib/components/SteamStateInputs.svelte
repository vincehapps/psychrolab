<script lang="ts">
  import {
    steamPointsStore,
    addSteamPoint,
    removeSteamPoint,
    updateSteamPoint,
    type SteamInputMode
  } from '../steam/steamStore';
  import { settingsStore } from '../stores/appStore';
  import { Sliders, Plus, Trash2, Gauge, Flame, Activity } from '@lucide/svelte';

  $: isIP = $settingsStore.unitSystem === 'IP';

  const modeOptions: { value: SteamInputMode; label: string; p1LabelSI: string; p1LabelIP: string; p2LabelSI: string; p2LabelIP: string; p1Step: string; p2Step: string }[] = [
    {
      value: 'PT',
      label: 'Pressure & Temp (P, T)',
      p1LabelSI: 'Pressure (bar)',
      p1LabelIP: 'Pressure (psi)',
      p2LabelSI: 'Temp (°C)',
      p2LabelIP: 'Temp (°F)',
      p1Step: '1',
      p2Step: '5'
    },
    {
      value: 'Px',
      label: 'Pressure & Quality (P, x)',
      p1LabelSI: 'Pressure (bar)',
      p1LabelIP: 'Pressure (psi)',
      p2LabelSI: 'Quality x (0-1)',
      p2LabelIP: 'Quality x (0-1)',
      p1Step: '0.1',
      p2Step: '0.05'
    },
    {
      value: 'Tx',
      label: 'Temp & Quality (T, x)',
      p1LabelSI: 'Temp (°C)',
      p1LabelIP: 'Temp (°F)',
      p2LabelSI: 'Quality x (0-1)',
      p2LabelIP: 'Quality x (0-1)',
      p1Step: '5',
      p2Step: '0.05'
    },
    {
      value: 'Ph',
      label: 'Pressure & Enthalpy (P, h)',
      p1LabelSI: 'Pressure (bar)',
      p1LabelIP: 'Pressure (psi)',
      p2LabelSI: 'Enthalpy (kJ/kg)',
      p2LabelIP: 'Enthalpy (Btu/lb)',
      p1Step: '1',
      p2Step: '50'
    }
  ];

  function getModeConfig(mode: SteamInputMode) {
    return modeOptions.find((m) => m.value === mode) || modeOptions[0];
  }
</script>

<div class="glass-panel rounded-2xl p-4 border border-slate-800 space-y-4">
  <!-- Header -->
  <div class="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
    <div class="flex items-center space-x-2">
      <Sliders class="w-4 h-4 text-blue-400" />
      <h3 class="text-sm font-semibold text-white uppercase tracking-wider">
        Steam State Point Solver (Multi-State)
      </h3>
    </div>
    
    <button
      type="button"
      on:click={addSteamPoint}
      class="flex items-center space-x-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
    >
      <Plus class="w-3.5 h-3.5" />
      <span>Add State Point</span>
    </button>
  </div>

  <!-- Responsive Cards Grid for Steam Points -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
    {#each $steamPointsStore as pt, idx (pt.id)}
      {@const cfg = getModeConfig(pt.mode)}
      <div class="bg-slate-900/60 rounded-xl p-3 border border-slate-800 hover:border-slate-700/80 transition-colors flex flex-col justify-between space-y-2.5">
        
        <!-- Header & Delete Button -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span
              class="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
              style="background-color: {pt.color}; border: 1px solid rgba(255,255,255,0.3);"
            ></span>
            <input
              type="text"
              value={pt.name}
              on:input={(e) => updateSteamPoint(pt.id, { name: e.currentTarget.value })}
              class="bg-transparent text-xs font-bold text-slate-200 focus:outline-none focus:border-b border-blue-400 px-0.5"
            />
          </div>
          
          {#if $steamPointsStore.length > 1}
            <button
              type="button"
              on:click={() => removeSteamPoint(pt.id)}
              class="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
              title="Remove state point"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          {/if}
        </div>

        <!-- Mode Selector -->
        <div>
          <label for="mode-select-{pt.id}" class="block text-[10px] font-mono uppercase text-slate-400 mb-0.5">Input Pair</label>
          <select
            id="mode-select-{pt.id}"
            value={pt.mode}
            on:change={(e) => updateSteamPoint(pt.id, { mode: e.currentTarget.value as SteamInputMode })}
            class="w-full bg-slate-950 text-slate-200 text-xs rounded-lg px-2 py-1 border border-slate-700/80 focus:border-blue-500 focus:outline-none"
          >
            {#each modeOptions as opt}
              <option value={opt.value}>{opt.label}</option>
            {/each}
          </select>
        </div>

        <!-- Param 1 Input -->
        <div>
          <label for="p1-input-{pt.id}" class="block text-[10px] font-mono uppercase text-slate-400 mb-0.5">
            {isIP ? cfg.p1LabelIP : cfg.p1LabelSI}
          </label>
          <input
            id="p1-input-{pt.id}"
            type="number"
            step={cfg.p1Step}
            value={pt.param1}
            on:input={(e) => updateSteamPoint(pt.id, { param1: parseFloat(e.currentTarget.value) || 0 })}
            class="w-full bg-slate-950 text-slate-200 text-xs rounded-lg px-2.5 py-1 border border-slate-700/80 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <!-- Param 2 Input -->
        <div>
          <label for="p2-input-{pt.id}" class="block text-[10px] font-mono uppercase text-slate-400 mb-0.5">
            {isIP ? cfg.p2LabelIP : cfg.p2LabelSI}
          </label>
          <input
            id="p2-input-{pt.id}"
            type="number"
            step={cfg.p2Step}
            value={pt.param2}
            on:input={(e) => updateSteamPoint(pt.id, { param2: parseFloat(e.currentTarget.value) || 0 })}
            class="w-full bg-slate-950 text-slate-200 text-xs rounded-lg px-2.5 py-1 border border-slate-700/80 focus:border-blue-500 focus:outline-none"
          />
        </div>

      </div>
    {/each}
  </div>
</div>
