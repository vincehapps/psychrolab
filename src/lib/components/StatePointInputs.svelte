<script lang="ts">
  import { pointsInputStore, updatePointInput, addPointInput, removePointInput, settingsStore, triggerShare } from '../stores/appStore';
  import type { PropertyType } from '../psychrometrics/types';
  import { Sliders, Plus, Trash2, Share2 } from '@lucide/svelte';

  $: isSI = $settingsStore.unitSystem === 'SI';

  const propertyOptions: { value: PropertyType; label: string; unitSI: string; unitIP: string; stepSI: string; stepIP: string }[] = [
    { value: 'DBT', label: 'Dry-Bulb Temp', unitSI: '°C', unitIP: '°F', stepSI: '0.5', stepIP: '0.5' },
    { value: 'WBT', label: 'Wet-Bulb Temp', unitSI: '°C', unitIP: '°F', stepSI: '0.5', stepIP: '0.5' },
    { value: 'DPT', label: 'Dew Point Temp', unitSI: '°C', unitIP: '°F', stepSI: '0.5', stepIP: '0.5' },
    { value: 'RH', label: 'Rel. Humidity', unitSI: '%', unitIP: '%', stepSI: '1', stepIP: '1' },
    { value: 'HUMRAT', label: 'Humidity Ratio', unitSI: 'kg/kg', unitIP: 'grains/lb', stepSI: '0.0005', stepIP: '1' },
    { value: 'ENTHALPY', label: 'Enthalpy', unitSI: 'kJ/kg', unitIP: 'Btu/lb', stepSI: '1', stepIP: '0.5' }
  ];

  function getPropUnit(type: PropertyType, si: boolean): string {
    const opt = propertyOptions.find((o) => o.value === type);
    if (!opt) return '';
    return si ? opt.unitSI : opt.unitIP;
  }

  function getPropStep(type: PropertyType, si: boolean): string {
    const opt = propertyOptions.find((o) => o.value === type);
    if (!opt) return '0.5';
    return si ? opt.stepSI : opt.stepIP;
  }

  function handleType1Change(id: string, currentType2: PropertyType, newType1: PropertyType) {
    let nextType2 = currentType2;
    if (newType1 === currentType2) {
      // Pick next available distinct property
      const alt = propertyOptions.find((o) => o.value !== newType1);
      if (alt) nextType2 = alt.value;
    }
    updatePointInput(id, { type1: newType1, type2: nextType2 });
  }

  function handleType2Change(id: string, currentType1: PropertyType, newType2: PropertyType) {
    let nextType1 = currentType1;
    if (newType2 === currentType1) {
      // Pick next available distinct property
      const alt = propertyOptions.find((o) => o.value !== newType2);
      if (alt) nextType1 = alt.value;
    }
    updatePointInput(id, { type1: nextType1, type2: newType2 });
  }
</script>

<div class="glass-panel rounded-2xl p-4 border border-slate-800">
  <div class="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800/80">
    <div class="flex items-center space-x-2">
      <Sliders class="w-4 h-4 text-blue-400" />
      <h3 class="text-sm font-semibold text-slate-100 uppercase tracking-wide">Custom Pair State Point Setup</h3>
    </div>
    <div class="flex items-center space-x-2">
      <button
        type="button"
        on:click={() => triggerShare()}
        class="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition-colors"
      >
        <Share2 class="w-3.5 h-3.5 text-blue-400" />
        <span>Share</span>
      </button>

      <button
        type="button"
        on:click={addPointInput}
        class="flex items-center space-x-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Add Point</span>
      </button>
    </div>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
    {#each $pointsInputStore as pt (pt.id)}
      <div class="bg-slate-900/60 rounded-xl p-3 border border-slate-800 hover:border-slate-700/80 transition-colors flex flex-col justify-between space-y-2.5">
        
        <!-- Header & Name Input & Delete -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" style="background-color: {pt.color}; border: 1px solid rgba(255,255,255,0.3);"></span>
            <input
              type="text"
              value={pt.name}
              on:input={(e) => updatePointInput(pt.id, { name: e.currentTarget.value })}
              class="bg-transparent text-xs font-semibold text-white focus:outline-none focus:border-b border-blue-500 w-32 sm:w-36"
            />
          </div>

          {#if $pointsInputStore.length > 1}
            <button
              type="button"
              on:click={() => removePointInput(pt.id)}
              title="Delete State Point"
              class="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          {/if}
        </div>

        <div class="space-y-2.5">
          <!-- Property 1 Selector & Input -->
          <div class="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
            <label for="input-type1-{pt.id}" class="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              Property 1
            </label>
            <div class="grid grid-cols-2 gap-2">
              <select
                id="input-type1-{pt.id}"
                value={pt.type1 || 'DBT'}
                on:change={(e) => handleType1Change(pt.id, pt.type2 || 'RH', e.currentTarget.value as PropertyType)}
                class="bg-slate-900 text-slate-200 text-xs rounded-md px-2 py-1 border border-slate-700/80 focus:border-blue-500 focus:outline-none"
              >
                {#each propertyOptions as opt}
                  <option value={opt.value} disabled={opt.value === pt.type2}>{opt.label}</option>
                {/each}
              </select>

              <div class="relative">
                <input
                  type="number"
                  step={getPropStep(pt.type1 || 'DBT', isSI)}
                  value={pt.val1 ?? pt.param1}
                  on:input={(e) => updatePointInput(pt.id, { val1: parseFloat(e.currentTarget.value) || 0 })}
                  class="w-full bg-slate-900 text-emerald-400 font-mono text-xs rounded-md px-2 py-1 border border-slate-700/80 focus:border-blue-500 focus:outline-none"
                />
                <span class="absolute right-2 top-1 text-[10px] text-slate-400 pointer-events-none">
                  {getPropUnit(pt.type1 || 'DBT', isSI)}
                </span>
              </div>
            </div>
          </div>

          <!-- Property 2 Selector & Input -->
          <div class="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
            <label for="input-type2-{pt.id}" class="block text-[10px] font-mono uppercase text-slate-400 mb-1">
              Property 2
            </label>
            <div class="grid grid-cols-2 gap-2">
              <select
                id="input-type2-{pt.id}"
                value={pt.type2 || 'RH'}
                on:change={(e) => handleType2Change(pt.id, pt.type1 || 'DBT', e.currentTarget.value as PropertyType)}
                class="bg-slate-900 text-slate-200 text-xs rounded-md px-2 py-1 border border-slate-700/80 focus:border-blue-500 focus:outline-none"
              >
                {#each propertyOptions as opt}
                  <option value={opt.value} disabled={opt.value === pt.type1}>{opt.label}</option>
                {/each}
              </select>

              <div class="relative">
                <input
                  type="number"
                  step={getPropStep(pt.type2 || 'RH', isSI)}
                  value={pt.val2 ?? pt.param2}
                  on:input={(e) => updatePointInput(pt.id, { val2: parseFloat(e.currentTarget.value) || 0 })}
                  class="w-full bg-slate-900 text-cyan-400 font-mono text-xs rounded-md px-2 py-1 border border-slate-700/80 focus:border-blue-500 focus:outline-none"
                />
                <span class="absolute right-2 top-1 text-[10px] text-slate-400 pointer-events-none">
                  {getPropUnit(pt.type2 || 'RH', isSI)}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    {/each}
  </div>
</div>
