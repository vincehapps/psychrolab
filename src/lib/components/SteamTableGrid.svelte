<script lang="ts">
  import { onMount } from 'svelte';
  import { generateSaturationTableByTemperature, generateSaturationTableByPressure } from '../steam/steamStore';
  import { settingsStore } from '../stores/appStore';
  import type { SaturationPointSI } from '../steam/steamEngine';
  import { Table, Search, Download, Filter, Droplets } from '@lucide/svelte';

  let activeTab: 'temp' | 'pressure' = 'temp';
  let searchTerm = '';

  let tempTable: SaturationPointSI[] = [];
  let pressTable: SaturationPointSI[] = [];

  onMount(() => {
    tempTable = generateSaturationTableByTemperature();
    pressTable = generateSaturationTableByPressure();
  });

  $: isIP = $settingsStore.unitSystem === 'IP';

  $: rawData = activeTab === 'temp' ? tempTable : pressTable;

  $: filteredData = rawData.filter((row) => {
    if (!searchTerm) return true;
    const tVal = isIP ? ((row.tC * 9) / 5 + 32).toFixed(1) : row.tC.toFixed(1);
    const pVal = isIP ? ((row.pPa / 1e5) * 14.5038).toFixed(2) : (row.pPa / 1e5).toFixed(3);
    return tVal.includes(searchTerm) || pVal.includes(searchTerm);
  });

  function exportTableCSV() {
    const headers = [
      `Temperature (${isIP ? '°F' : '°C'})`,
      `Pressure (${isIP ? 'psi' : 'bar'})`,
      `Liquid Vol vf (${isIP ? 'ft3/lb' : 'm3/kg'})`,
      `Vapor Vol vg (${isIP ? 'ft3/lb' : 'm3/kg'})`,
      `Liquid Enthalpy hf (${isIP ? 'Btu/lb' : 'kJ/kg'})`,
      `Evap Enthalpy hfg (${isIP ? 'Btu/lb' : 'kJ/kg'})`,
      `Vapor Enthalpy hg (${isIP ? 'Btu/lb' : 'kJ/kg'})`,
      `Liquid Entropy sf (${isIP ? 'Btu/lb*R' : 'kJ/kg*K'})`,
      `Vapor Entropy sg (${isIP ? 'Btu/lb*R' : 'kJ/kg*K'})`
    ];

    const rows = filteredData.map((row) => {
      const pBar = row.pPa / 1e5;
      const tDisp = isIP ? ((row.tC * 9) / 5 + 32).toFixed(1) : row.tC.toFixed(2);
      const pDisp = isIP ? (pBar * 14.5038).toFixed(2) : pBar.toFixed(4);
      const vfDisp = isIP ? (row.vf * 16.0185).toFixed(5) : row.vf.toFixed(6);
      const vgDisp = isIP ? (row.vg * 16.0185).toFixed(4) : row.vg.toFixed(5);
      const hfDisp = isIP ? (row.hf * 0.4299).toFixed(1) : row.hf.toFixed(1);
      const hfgDisp = isIP ? (row.hfg * 0.4299).toFixed(1) : row.hfg.toFixed(1);
      const hgDisp = isIP ? (row.hg * 0.4299).toFixed(1) : row.hg.toFixed(1);
      const sfDisp = isIP ? (row.sf * 0.2388).toFixed(4) : row.sf.toFixed(4);
      const sgDisp = isIP ? (row.sg * 0.2388).toFixed(4) : row.sg.toFixed(4);

      return [tDisp, pDisp, vfDisp, vgDisp, hfDisp, hfgDisp, hgDisp, sfDisp, sgDisp];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `saturated-steam-table-${activeTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
</script>

<div class="glass-panel rounded-2xl p-4 md:p-6 border border-slate-800 space-y-4">
  
  <!-- Top Title & Search Controls -->
  <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
    <div class="flex items-center space-x-2">
      <Droplets class="w-4 h-4 text-cyan-400" />
      <h3 class="text-sm font-bold text-white uppercase tracking-wider">
        Saturated Water & Steam Property Tables
      </h3>
    </div>

    <div class="flex items-center space-x-2 flex-wrap gap-2">
      <!-- Search Input -->
      <div class="relative">
        <input
          type="text"
          bind:value={searchTerm}
          placeholder="Filter table by T or P..."
          class="bg-slate-950 text-slate-200 text-xs rounded-lg pl-7 pr-2.5 py-1.5 border border-slate-700/80 focus:border-cyan-500 focus:outline-none w-44 sm:w-56"
        />
        <Search class="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2 pointer-events-none" />
      </div>

      <!-- Export CSV -->
      <button
        type="button"
        on:click={exportTableCSV}
        class="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors"
      >
        <Download class="w-3.5 h-3.5 text-cyan-400" />
        <span>Export CSV</span>
      </button>
    </div>
  </div>

  <!-- Tab Switcher: By Temperature vs By Pressure -->
  <div class="flex items-center space-x-2 border-b border-slate-800/80 pb-2">
    <button
      type="button"
      on:click={() => (activeTab = 'temp')}
      class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors {activeTab === 'temp' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}"
    >
      Saturated Steam (by Temperature)
    </button>
    <button
      type="button"
      on:click={() => (activeTab = 'pressure')}
      class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors {activeTab === 'pressure' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}"
    >
      Saturated Steam (by Pressure)
    </button>
  </div>

  <!-- Interactive High-Density Data Table -->
  <div class="overflow-x-auto max-h-[420px] rounded-xl border border-slate-800">
    <table class="w-full text-left text-xs font-mono text-slate-300">
      <thead class="sticky top-0 bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] z-10 shadow">
        <tr>
          <th class="p-2.5">T ({isIP ? '°F' : '°C'})</th>
          <th class="p-2.5">P ({isIP ? 'psi' : 'bar'})</th>
          <th class="p-2.5">v<sub>f</sub> ({isIP ? 'ft³/lb' : 'm³/kg'})</th>
          <th class="p-2.5">v<sub>g</sub> ({isIP ? 'ft³/lb' : 'm³/kg'})</th>
          <th class="p-2.5">h<sub>f</sub> ({isIP ? 'Btu/lb' : 'kJ/kg'})</th>
          <th class="p-2.5">h<sub>fg</sub> ({isIP ? 'Btu/lb' : 'kJ/kg'})</th>
          <th class="p-2.5">h<sub>g</sub> ({isIP ? 'Btu/lb' : 'kJ/kg'})</th>
          <th class="p-2.5">s<sub>f</sub> ({isIP ? 'Btu/lb·R' : 'kJ/kg·K'})</th>
          <th class="p-2.5">s<sub>g</sub> ({isIP ? 'Btu/lb·R' : 'kJ/kg·K'})</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-800/60 bg-slate-900/40">
        {#each filteredData as row}
          {@const pBar = row.pPa / 1e5}
          {@const tDisp = isIP ? ((row.tC * 9) / 5 + 32).toFixed(1) : row.tC.toFixed(1)}
          {@const pDisp = isIP ? (pBar * 14.5038).toFixed(2) : (pBar >= 1 ? pBar.toFixed(3) : pBar.toFixed(4))}
          {@const vfDisp = isIP ? (row.vf * 16.0185).toFixed(4) : row.vf.toFixed(6)}
          {@const vgDisp = isIP ? (row.vg * 16.0185).toFixed(3) : row.vg.toFixed(4)}
          {@const hfDisp = isIP ? (row.hf * 0.4299).toFixed(1) : row.hf.toFixed(1)}
          {@const hfgDisp = isIP ? (row.hfg * 0.4299).toFixed(1) : row.hfg.toFixed(1)}
          {@const hgDisp = isIP ? (row.hg * 0.4299).toFixed(1) : row.hg.toFixed(1)}
          {@const sfDisp = isIP ? (row.sf * 0.2388).toFixed(4) : row.sf.toFixed(4)}
          {@const sgDisp = isIP ? (row.sg * 0.2388).toFixed(4) : row.sg.toFixed(4)}
          <tr class="hover:bg-slate-800/40 transition-colors">
            <td class="p-2.5 font-bold text-amber-400">{tDisp}</td>
            <td class="p-2.5 text-cyan-400 font-semibold">{pDisp}</td>
            <td class="p-2.5 text-slate-400">{vfDisp}</td>
            <td class="p-2.5 text-slate-300">{vgDisp}</td>
            <td class="p-2.5 text-emerald-400">{hfDisp}</td>
            <td class="p-2.5 text-slate-300">{hfgDisp}</td>
            <td class="p-2.5 text-emerald-400 font-semibold">{hgDisp}</td>
            <td class="p-2.5 text-blue-400">{sfDisp}</td>
            <td class="p-2.5 text-blue-400 font-semibold">{sgDisp}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
