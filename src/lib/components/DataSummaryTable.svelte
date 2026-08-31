<script lang="ts">
  import { computedPointsStore, settingsStore } from '../stores/appStore';
  import { Table, Copy, Check } from '@lucide/svelte';

  $: isSI = $settingsStore.unitSystem === 'SI';
  $: activePoints = $computedPointsStore.filter((p) => p.enabled);

  let copied = false;

  function copyTableCSV() {
    const headers = ['Property', ...activePoints.map((p) => p.name)];
    const rows = [
      ['Dry-Bulb Temp (' + (isSI ? '°C' : '°F') + ')', ...activePoints.map((p) => p.dbt)],
      ['Wet-Bulb Temp (' + (isSI ? '°C' : '°F') + ')', ...activePoints.map((p) => p.wbt)],
      ['Dew Point Temp (' + (isSI ? '°C' : '°F') + ')', ...activePoints.map((p) => p.dpt)],
      ['Relative Humidity (%)', ...activePoints.map((p) => p.rh)],
      ['Humidity Ratio (' + (isSI ? 'kg/kg' : 'grains/lb') + ')', ...activePoints.map((p) => p.humRat)],
      ['Enthalpy (' + (isSI ? 'kJ/kg' : 'Btu/lb') + ')', ...activePoints.map((p) => p.enthalpy)],
      ['Specific Volume (' + (isSI ? 'm³/kg' : 'ft³/lb') + ')', ...activePoints.map((p) => p.vol)],
      ['Vapor Pressure (' + (isSI ? 'kPa' : 'psi') + ')', ...activePoints.map((p) => p.vapPress)]
    ];

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    navigator.clipboard.writeText(csvContent);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }
</script>

<div class="glass-panel rounded-2xl p-4 border border-slate-800 shadow-lg">
  
  <div class="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
    <div class="flex items-center space-x-2">
      <Table class="w-4 h-4 text-emerald-400" />
      <h3 class="text-sm font-semibold text-slate-100 uppercase tracking-wide">Thermodynamic State Data Summary</h3>
    </div>
    <button
      type="button"
      on:click={copyTableCSV}
      class="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs font-mono text-slate-300 transition-colors"
    >
      {#if copied}
        <Check class="w-3.5 h-3.5 text-emerald-400" />
        <span class="text-emerald-400">Copied CSV</span>
      {:else}
        <Copy class="w-3.5 h-3.5 text-slate-400" />
        <span>Export CSV</span>
      {/if}
    </button>
  </div>

  <div class="overflow-x-auto">
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
          <th class="py-2.5 px-3">Property Name</th>
          <th class="py-2.5 px-2 text-center">Symbol</th>
          <th class="py-2.5 px-2 text-center">Unit</th>
          {#each activePoints as pt}
            <th class="py-2.5 px-3 text-right">
              <span class="inline-flex items-center space-x-1.5">
                <span class="w-2 h-2 rounded-full" style="background-color: {pt.color};"></span>
                <span class="text-slate-100 font-bold">{pt.name}</span>
              </span>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-800/60 font-mono text-xs text-slate-200">
        
        <tr class="hover:bg-slate-900/40 transition-colors">
          <td class="py-2 px-3 font-sans font-medium text-slate-300">Dry-Bulb Temperature</td>
          <td class="py-2 px-2 text-center text-slate-400">T_db</td>
          <td class="py-2 px-2 text-center text-slate-400">{isSI ? '°C' : '°F'}</td>
          {#each activePoints as pt}
            <td class="py-2 px-3 text-right font-bold text-emerald-400">{pt.dbt}</td>
          {/each}
        </tr>

        <tr class="hover:bg-slate-900/40 transition-colors">
          <td class="py-2 px-3 font-sans font-medium text-slate-300">Wet-Bulb Temperature</td>
          <td class="py-2 px-2 text-center text-slate-400">T_wb</td>
          <td class="py-2 px-2 text-center text-slate-400">{isSI ? '°C' : '°F'}</td>
          {#each activePoints as pt}
            <td class="py-2 px-3 text-right text-blue-300">{pt.wbt}</td>
          {/each}
        </tr>

        <tr class="hover:bg-slate-900/40 transition-colors">
          <td class="py-2 px-3 font-sans font-medium text-slate-300">Dew Point Temperature</td>
          <td class="py-2 px-2 text-center text-slate-400">T_dp</td>
          <td class="py-2 px-2 text-center text-slate-400">{isSI ? '°C' : '°F'}</td>
          {#each activePoints as pt}
            <td class="py-2 px-3 text-right text-purple-300">{pt.dpt}</td>
          {/each}
        </tr>

        <tr class="hover:bg-slate-900/40 transition-colors">
          <td class="py-2 px-3 font-sans font-medium text-slate-300">Relative Humidity</td>
          <td class="py-2 px-2 text-center text-slate-400">RH</td>
          <td class="py-2 px-2 text-center text-slate-400">%</td>
          {#each activePoints as pt}
            <td class="py-2 px-3 text-right font-bold text-cyan-400">{pt.rh} %</td>
          {/each}
        </tr>

        <tr class="hover:bg-slate-900/40 transition-colors">
          <td class="py-2 px-3 font-sans font-medium text-slate-300">Humidity Ratio</td>
          <td class="py-2 px-2 text-center text-slate-400">W</td>
          <td class="py-2 px-2 text-center text-slate-400">{isSI ? 'kg/kg' : 'grains/lb'}</td>
          {#each activePoints as pt}
            <td class="py-2 px-3 text-right font-bold text-cyan-300">{pt.humRat}</td>
          {/each}
        </tr>

        <tr class="hover:bg-slate-900/40 transition-colors">
          <td class="py-2 px-3 font-sans font-medium text-slate-300">Specific Enthalpy</td>
          <td class="py-2 px-2 text-center text-slate-400">h</td>
          <td class="py-2 px-2 text-center text-slate-400">{isSI ? 'kJ/kg' : 'Btu/lb'}</td>
          {#each activePoints as pt}
            <td class="py-2 px-3 text-right font-bold text-amber-400">{pt.enthalpy}</td>
          {/each}
        </tr>

        <tr class="hover:bg-slate-900/40 transition-colors">
          <td class="py-2 px-3 font-sans font-medium text-slate-300">Specific Volume</td>
          <td class="py-2 px-2 text-center text-slate-400">v</td>
          <td class="py-2 px-2 text-center text-slate-400">{isSI ? 'm³/kg' : 'ft³/lb'}</td>
          {#each activePoints as pt}
            <td class="py-2 px-3 text-right text-slate-300">{pt.vol}</td>
          {/each}
        </tr>

        <tr class="hover:bg-slate-900/40 transition-colors">
          <td class="py-2 px-3 font-sans font-medium text-slate-300">Vapor Partial Pressure</td>
          <td class="py-2 px-2 text-center text-slate-400">p_v</td>
          <td class="py-2 px-2 text-center text-slate-400">{isSI ? 'kPa' : 'psi'}</td>
          {#each activePoints as pt}
            <td class="py-2 px-3 text-right text-slate-300">{pt.vapPress}</td>
          {/each}
        </tr>

      </tbody>
    </table>
  </div>
</div>
