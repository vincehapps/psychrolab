<script lang="ts">
  import { calculatedSteamPointsStore } from '../steam/steamStore';
  import { settingsStore } from '../stores/appStore';
  import { Table, Download, Zap, Flame, ShieldAlert, Cpu } from '@lucide/svelte';

  $: isIP = $settingsStore.unitSystem === 'IP';

  // Calculate Rankine cycle values if at least 4 state points exist
  $: pts = $calculatedSteamPointsStore;
  $: hasRankineCycle = pts.length >= 4;

  $: wTurbine = hasRankineCycle ? (pts[0].h - pts[1].h) : 0;
  $: qBoiler = hasRankineCycle ? (pts[0].h - pts[3].h) : 0;
  $: qCondenser = hasRankineCycle ? (pts[1].h - pts[2].h) : 0;
  $: wPump = hasRankineCycle ? (pts[3].h - pts[2].h) : 0;
  $: wNet = wTurbine - wPump;
  $: thermalEfficiency = qBoiler > 0 ? (wNet / qBoiler) * 100 : 0;

  function exportCSV() {
    const headers = [
      'State Point ID',
      'Name',
      'Fluid Region',
      `Pressure (${isIP ? 'psi' : 'bar'})`,
      `Temperature (${isIP ? '°F' : '°C'})`,
      `Enthalpy (${isIP ? 'Btu/lb' : 'kJ/kg'})`,
      `Entropy (${isIP ? 'Btu/lb*R' : 'kJ/kg*K'})`,
      `Specific Volume (${isIP ? 'ft3/lb' : 'm3/kg'})`,
      'Vapor Quality (x)'
    ];

    const rows = $calculatedSteamPointsStore.map((p) => [
      p.id,
      `"${p.name}"`,
      p.region,
      p.pDisp,
      p.tDisp,
      p.hDisp,
      p.sDisp,
      p.vDisp,
      `"${p.xDisp}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'steam-states-analysis.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
</script>

<div class="space-y-4">
  
  <!-- Calculated Properties Summary Table -->
  <div class="glass-panel rounded-2xl p-4 md:p-6 border border-slate-800 space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
      <div class="flex items-center space-x-2">
        <Table class="w-4 h-4 text-emerald-400" />
        <h3 class="text-sm font-bold text-white uppercase tracking-wider">
          Calculated Thermodynamic Steam Properties Table
        </h3>
      </div>

      <button
        type="button"
        on:click={exportCSV}
        class="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors"
      >
        <Download class="w-3.5 h-3.5 text-emerald-400" />
        <span>Export CSV</span>
      </button>
    </div>

    <div class="overflow-x-auto rounded-xl border border-slate-800">
      <table class="w-full text-left text-xs font-mono text-slate-300">
        <thead class="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
          <tr>
            <th class="p-3">State</th>
            <th class="p-3">Region</th>
            <th class="p-3">Pressure ({isIP ? 'psi' : 'bar'})</th>
            <th class="p-3">Temp ({isIP ? '°F' : '°C'})</th>
            <th class="p-3">Enthalpy ({isIP ? 'Btu/lb' : 'kJ/kg'})</th>
            <th class="p-3">Entropy ({isIP ? 'Btu/lb·R' : 'kJ/kg·K'})</th>
            <th class="p-3">Specific Vol ({isIP ? 'ft³/lb' : 'm³/kg'})</th>
            <th class="p-3">Quality (x)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60 bg-slate-900/40">
          {#each $calculatedSteamPointsStore as pt (pt.id)}
            <tr class="hover:bg-slate-800/40 transition-colors">
              <td class="p-3 font-bold text-white flex items-center space-x-2">
                <span class="w-2.5 h-2.5 rounded-full" style="background-color: {pt.color};"></span>
                <span>{pt.name}</span>
              </td>
              <td class="p-3">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-semibold {pt.region === 'Superheated'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    : pt.region === 'Saturated'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}"
                >
                  {pt.region}
                </span>
              </td>
              <td class="p-3 text-cyan-400 font-semibold">{pt.pDisp}</td>
              <td class="p-3 text-amber-400 font-semibold">{pt.tDisp}</td>
              <td class="p-3 text-emerald-400 font-semibold">{pt.hDisp}</td>
              <td class="p-3 text-blue-400 font-semibold">{pt.sDisp}</td>
              <td class="p-3 text-slate-300">{pt.vDisp}</td>
              <td class="p-3 text-purple-400">{pt.xDisp}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Rankine Cycle / Process Analysis Widget -->
  {#if hasRankineCycle}
    <div class="glass-panel rounded-2xl p-4 md:p-6 border border-slate-800 space-y-3">
      <div class="flex items-center space-x-2 text-cyan-400 font-semibold text-sm">
        <Zap class="w-4 h-4" />
        <span class="uppercase tracking-wider">Rankine Steam Power Cycle Diagnostics</span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs text-center">
        <div class="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
          <div class="text-[10px] text-slate-400 uppercase">Turbine Work (W<sub>t</sub>)</div>
          <div class="text-base font-bold text-emerald-400 mt-1">
            {isIP ? (wTurbine * 0.4299).toFixed(1) + ' Btu/lb' : wTurbine.toFixed(1) + ' kJ/kg'}
          </div>
        </div>

        <div class="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
          <div class="text-[10px] text-slate-400 uppercase">Boiler Heat In (Q<sub>in</sub>)</div>
          <div class="text-base font-bold text-amber-400 mt-1">
            {isIP ? (qBoiler * 0.4299).toFixed(1) + ' Btu/lb' : qBoiler.toFixed(1) + ' kJ/kg'}
          </div>
        </div>

        <div class="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
          <div class="text-[10px] text-slate-400 uppercase">Condenser Out (Q<sub>out</sub>)</div>
          <div class="text-base font-bold text-blue-400 mt-1">
            {isIP ? (qCondenser * 0.4299).toFixed(1) + ' Btu/lb' : qCondenser.toFixed(1) + ' kJ/kg'}
          </div>
        </div>

        <div class="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
          <div class="text-[10px] text-slate-400 uppercase">Pump Work (W<sub>p</sub>)</div>
          <div class="text-base font-bold text-cyan-400 mt-1">
            {isIP ? (wPump * 0.4299).toFixed(1) + ' Btu/lb' : wPump.toFixed(1) + ' kJ/kg'}
          </div>
        </div>

        <div class="p-3 bg-slate-950/80 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
          <div class="text-[10px] text-slate-400 uppercase">Cycle Efficiency (η<sub>th</sub>)</div>
          <div class="text-lg font-extrabold text-white mt-0.5">
            {thermalEfficiency.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  {/if}

</div>
