<script lang="ts">
  import { ArrowLeft, ArrowRight, Calculator, Waves } from '@lucide/svelte';
  import Seo from '$lib/components/Seo.svelte';
  import {
    DN_SIZES,
    PIPE_MATERIALS,
    VELOCITY_NOTE,
    diameterForGradient,
    diameterForVelocity,
    evaluateDiameter,
    evaluateRun,
    velocityVerdict,
    waterAt
  } from '$lib/hydronic/pipeSizing';

  let flow = 6;
  let flowUnit: 'm3h' | 'ls' | 'lmin' | 'gpm' = 'm3h';
  let mode: 'velocity' | 'gradient' | 'diameter' = 'gradient';
  let targetVelocity = 1.5;
  let targetGradient = 200;
  let selectedDn = 50;
  let tempC = 7;
  let materialId = 'steel';
  let lengthM = 40;
  let fittingsEqM = 15;
  let pumpEff = 70;
  let deltaT = 6;

  const fmt = (v: number, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : '—');

  $: q =
    flowUnit === 'm3h' ? flow / 3600
    : flowUnit === 'ls' ? flow / 1000
    : flowUnit === 'lmin' ? flow / 60000
    : flow / 15850.323;

  $: material = PIPE_MATERIALS.find((m) => m.id === materialId) ?? PIPE_MATERIALS[0];
  $: water = waterAt(tempC);

  $: exactD =
    mode === 'velocity' ? diameterForVelocity(q, targetVelocity)
    : mode === 'gradient' ? diameterForGradient(q, targetGradient, material.roughnessMm, tempC)
    : (DN_SIZES.find((s) => s.dn === selectedDn)?.idMm ?? 50) / 1000;

  $: flowState = evaluateDiameter(q, exactD, material.roughnessMm, tempC);
  $: eqLength = Math.max(0, lengthM) + Math.max(0, fittingsEqM);
  $: run = flowState ? evaluateRun(flowState, eqLength, pumpEff, deltaT, tempC) : null;

  $: rows = DN_SIZES.map((s) => {
    const e = evaluateDiameter(q, s.idMm / 1000, material.roughnessMm, tempC);
    return {
      ...s,
      velocity: e?.velocity ?? NaN,
      paPerM: e?.paPerM ?? NaN,
      mmWgPerM: e?.mmWgPerM ?? NaN,
      verdict: e ? velocityVerdict(e.velocity) : 'low'
    };
  });

  $: best =
    mode === 'velocity'
      ? rows.reduce((a, b) => (Math.abs(b.velocity - targetVelocity) < Math.abs(a.velocity - targetVelocity) ? b : a))
      : mode === 'gradient'
        ? rows.reduce((a, b) => (Math.abs(b.paPerM - targetGradient) < Math.abs(a.paPerM - targetGradient) ? b : a))
        : (rows.find((r) => r.dn === selectedDn) ?? rows[0]);

  $: nearest =
    flowState && mode !== 'diameter'
      ? rows.reduce((a, b) =>
          Math.abs(b.idMm - flowState.diameter * 1000) < Math.abs(a.idMm - flowState.diameter * 1000) ? b : a
        )
      : null;

  $: verdict = flowState ? velocityVerdict(flowState.velocity) : 'low';

  $: warnings = [
    ...(verdict === 'excess'
      ? [`Velocity ${fmt(flowState?.velocity ?? 0, 2)} m/s exceeds 3 m/s — expect noise and erosion-corrosion; go up a size.`]
      : verdict === 'high'
        ? [`Velocity ${fmt(flowState?.velocity ?? 0, 2)} m/s is above the 2.4 m/s comfort limit for occupied spaces.`]
        : verdict === 'low'
          ? [`Velocity ${fmt(flowState?.velocity ?? 0, 2)} m/s is low — air and sediment can settle and the pump may not clear the line.`]
          : []),
    ...(flowState && flowState.paPerM > 400
      ? [`${fmt(flowState.paPerM, 0)} Pa/m is a high gradient for hydronic distribution; 100–400 Pa/m is typical.`]
      : []),
    ...(flowState && flowState.regime === 'transitional'
      ? ['Flow is in the transitional Reynolds range (2300–4000), where friction is poorly predicted — aim for clearly laminar or turbulent operation.']
      : []),
    ...(tempC > 90 ? ['Above 90 °C the water-property correlation loses accuracy and flashing risk should be checked at the pump suction.'] : [])
  ];

  const faqs = [
    {
      q: 'Should I size hydronic pipe by velocity or by pressure gradient?',
      a: 'Both are legitimate. Velocity sizing keeps noise and erosion under control and is quick for branch lines. Pressure-gradient sizing (100–400 Pa/m) balances capital cost against pump energy and is the usual choice for mains. In practice you size for the gradient, then check that velocity lands between about 0.6 and 2.4 m/s.'
    },
    {
      q: 'Why does water temperature change the pressure drop?',
      a: 'Viscosity falls sharply as water warms: about 1.3 mPa·s at 10 °C against 0.47 mPa·s at 60 °C. Lower viscosity raises the Reynolds number and lowers the friction factor, so the same pipe and flow give less pressure drop in a heating circuit than in a chilled-water circuit. Density also falls slightly, which changes pump head in metres.'
    },
    {
      q: 'What friction factor method is used?',
      a: 'Fully turbulent flow uses the Colebrook–White implicit equation, solved here by fixed-point iteration from a Swamee–Jain starting value. Laminar flow (Re < 2300) uses f = 64/Re. The transitional band between 2300 and 4000 is flagged because friction there is genuinely uncertain and should be avoided in design.'
    },
    {
      q: 'How do fittings get included?',
      a: 'Each elbow, tee, valve and reducer is converted to an equivalent length of straight pipe and added to the real run length. This is the same equivalent-length method used for ductwork. If you only know K-factors, convert with L/D from the fitting tables, or add the fittings’ Δp directly to the pump head.'
    },
    {
      q: 'How is pump power calculated?',
      a: 'Hydraulic power is Q·Δp in watts. Dividing by pump efficiency gives shaft power at the design point; add motor efficiency for electrical input. The figure here excludes part-load behaviour — a variable-speed pump on a balanced system usually draws well under the design value.'
    },
    {
      q: 'What velocity is too high in a chilled-water line?',
      a: 'Above about 3 m/s, noise, erosion-corrosion and water hammer risk climb quickly, and above 2.4 m/s many specifications require extra isolation or thicker walls. Below 0.6 m/s air separation suffers and sediment can settle, so very oversized pipe is not free either.'
    }
  ];
</script>

<Seo route="pipe-sizing" />

<div class="space-y-5">
  <div class="border-b border-slate-800 pb-4 space-y-2">
    <a
      href="/cooling-load"
      class="inline-flex items-center space-x-1.5 text-xs font-mono font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
    >
      <ArrowLeft class="w-3.5 h-3.5" /><span>Size the coil load</span>
    </a>
    <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Hydronic Pipe Sizing Calculator</h1>
    <p class="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
      Size chilled-water and heating-water pipework with the Darcy–Weisbach equation and
      Colebrook–White friction factors, using water properties at your design temperature. Returns
      velocity, Reynolds number, pressure gradient, pump head and power, plus the closest standard
      nominal bore.
    </p>
  </div>

  <!-- Inputs -->
  <div class="glass-panel rounded-2xl border border-slate-800 p-5">
    <div class="flex items-center space-x-2 mb-4">
      <Calculator class="w-4 h-4 text-cyan-400" />
      <h2 class="text-sm font-bold text-white uppercase tracking-wider">Design Parameters</h2>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <label class="block space-y-1.5">
        <span class="text-xs font-mono text-slate-400">Water flow rate</span>
        <div class="flex space-x-2">
          <input
            type="number"
            bind:value={flow}
            step="0.1"
            min="0"
            class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
          />
          <select
            bind:value={flowUnit}
            class="bg-slate-950/70 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="m3h">m³/h</option>
            <option value="ls">L/s</option>
            <option value="lmin">L/min</option>
            <option value="gpm">GPM</option>
          </select>
        </div>
      </label>

      <label class="block space-y-1.5">
        <span class="text-xs font-mono text-slate-400">Sizing basis</span>
        <select
          bind:value={mode}
          class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
        >
          <option value="velocity">Target velocity</option>
          <option value="gradient">Target pressure gradient</option>
          <option value="diameter">Check a known pipe size</option>
        </select>
      </label>

      {#if mode === 'velocity'}
        <label class="block space-y-1.5">
          <span class="text-xs font-mono text-slate-400">Design velocity (m/s)</span>
          <input
            type="number"
            bind:value={targetVelocity}
            step="0.1"
            min="0.1"
            class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
          />
          <span class="block text-[10px] text-slate-500">Mains 1.2–2.4, branches 0.6–1.5</span>
        </label>
      {:else if mode === 'gradient'}
        <label class="block space-y-1.5">
          <span class="text-xs font-mono text-slate-400">Pressure gradient (Pa/m)</span>
          <input
            type="number"
            bind:value={targetGradient}
            step="10"
            min="10"
            class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
          />
          <span class="block text-[10px] text-slate-500">100–400 Pa/m is the usual range</span>
        </label>
      {:else}
        <label class="block space-y-1.5">
          <span class="text-xs font-mono text-slate-400">Nominal bore</span>
          <select
            bind:value={selectedDn}
            class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
          >
            {#each DN_SIZES as s (s.dn)}
              <option value={s.dn}>DN {s.dn} (ID {s.idMm} mm)</option>
            {/each}
          </select>
        </label>
      {/if}

      <label class="block space-y-1.5">
        <span class="text-xs font-mono text-slate-400">Water temperature (°C)</span>
        <input
          type="number"
          bind:value={tempC}
          step="1"
          min="1"
          max="95"
          class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
        />
        <span class="block text-[10px] text-slate-500">{fmt(water.density, 1)} kg/m³ · {fmt(water.viscosity * 1000, 3)} mPa·s</span>
      </label>

      <label class="block space-y-1.5">
        <span class="text-xs font-mono text-slate-400">Pipe material / roughness</span>
        <select
          bind:value={materialId}
          class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
        >
          {#each PIPE_MATERIALS as m (m.id)}
            <option value={m.id}>{m.label}</option>
          {/each}
        </select>
      </label>

      <label class="block space-y-1.5">
        <span class="text-xs font-mono text-slate-400">Straight run length (m)</span>
        <input
          type="number"
          bind:value={lengthM}
          step="1"
          min="0"
          class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
        />
      </label>

      <label class="block space-y-1.5">
        <span class="text-xs font-mono text-slate-400">Fittings — equivalent length (m)</span>
        <input
          type="number"
          bind:value={fittingsEqM}
          step="1"
          min="0"
          class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
        />
      </label>

      <label class="block space-y-1.5">
        <span class="text-xs font-mono text-slate-400">Pump efficiency (%)</span>
        <input
          type="number"
          bind:value={pumpEff}
          step="5"
          min="10"
          max="100"
          class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
        />
      </label>

      <label class="block space-y-1.5">
        <span class="text-xs font-mono text-slate-400">Design ΔT for capacity (K)</span>
        <input
          type="number"
          bind:value={deltaT}
          step="0.5"
          min="0.5"
          class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
        />
        <span class="block text-[10px] text-slate-500">6 K typical chilled water, 10–20 K heating</span>
      </label>
    </div>
  </div>

  {#if flowState && run}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div class="glass-panel rounded-2xl border border-slate-800 p-5 space-y-3">
        <h2 class="text-sm font-bold text-white uppercase tracking-wider mb-2">Pipe & Flow</h2>
        {#each [
          { label: 'Internal diameter', value: `${fmt(flowState.diameter * 1000, 1)} mm`, accent: 'text-white' },
          { label: 'Mean velocity', value: `${fmt(flowState.velocity, 2)} m/s`, accent: verdict === 'good' ? 'text-emerald-400' : verdict === 'excess' ? 'text-red-400' : 'text-amber-300' },
          { label: 'Reynolds number', value: flowState.reynolds > 10000 ? `${fmt(flowState.reynolds / 1000, 1)} ×10³` : fmt(flowState.reynolds, 0), accent: 'text-white' },
          { label: 'Flow regime', value: flowState.regime, accent: flowState.regime === 'turbulent' ? 'text-emerald-400' : 'text-amber-300' },
          { label: 'Friction factor (Colebrook)', value: fmt(flowState.frictionFactor, 4), accent: 'text-cyan-300' }
        ] as row (row.label)}
          <div class="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
            <span class="text-xs text-slate-400">{row.label}</span>
            <span class="text-sm font-mono font-bold {row.accent}">{row.value}</span>
          </div>
        {/each}
        <p class="text-lg font-mono font-bold text-white pt-1">
          DN {nearest?.dn ?? best.dn}
          <span class="text-xs font-normal text-slate-400">
            — {fmt((nearest?.idMm ?? best.idMm), 1)} mm ID{nearest && mode !== 'diameter' ? `, closest standard bore` : ''}
          </span>
        </p>
      </div>

      <div class="glass-panel rounded-2xl border border-slate-800 p-5 space-y-3">
        <h2 class="text-sm font-bold text-white uppercase tracking-wider mb-2">Pressure & Pump</h2>
        {#each [
          { label: 'Pressure gradient', value: `${fmt(flowState.paPerM, 0)} Pa/m`, accent: flowState.paPerM > 400 ? 'text-amber-300' : 'text-cyan-300' },
          { label: 'Pressure gradient', value: `${fmt(flowState.mmWgPerM, 2)} mm w.g./m`, accent: 'text-cyan-300' },
          { label: 'Equivalent length', value: `${fmt(eqLength, 1)} m`, accent: 'text-white' },
          { label: 'Total pressure drop', value: `${fmt(run.totalPa / 1000, 2)} kPa`, accent: 'text-blue-300' },
          { label: 'Pump head', value: `${fmt(run.headM, 2)} m`, accent: 'text-white' },
          { label: 'Pump shaft power', value: `${fmt(run.pumpW / 1000, 3)} kW`, accent: 'text-amber-300' }
        ] as row (row.label + row.value)}
          <div class="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
            <span class="text-xs text-slate-400">{row.label}</span>
            <span class="text-sm font-mono font-bold {row.accent}">{row.value}</span>
          </div>
        {/each}
      </div>

      <div class="glass-panel rounded-2xl border border-slate-800 p-5 space-y-3">
        <h2 class="text-sm font-bold text-white uppercase tracking-wider mb-2">Heat Carried</h2>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-mono font-extrabold text-emerald-400">{fmt(run.capacityKw, 1)}</span>
          <span class="text-xs font-mono text-slate-400">kW at ΔT {fmt(deltaT, 1)} K</span>
        </div>
        <div class="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
          <span class="text-xs text-slate-400">Cooling capacity</span>
          <span class="text-sm font-mono font-bold text-emerald-300">{fmt(run.capacityTons, 2)} TR</span>
        </div>
        <div class="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
          <span class="text-xs text-slate-400">Mass flow</span>
          <span class="text-sm font-mono font-bold text-white">
            {fmt((flowState.velocity * Math.PI * flowState.diameter * flowState.diameter / 4) * water.density, 2)} kg/s
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-400">Water specific heat</span>
          <span class="text-sm font-mono font-bold text-white">{fmt(water.cp, 3)} kJ/kg·K</span>
        </div>
        <p class="text-[10px] text-slate-500 leading-relaxed pt-2">
          Capacity from Q = ṁ·c<sub>p</sub>·ΔT. For heating use the same figure with the temperature rise.
        </p>
      </div>

      {#if warnings.length}
        <div class="glass-panel rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 lg:col-span-3 space-y-2">
          <h2 class="text-sm font-bold text-amber-300 uppercase tracking-wider">Design checks</h2>
          {#each warnings as w (w)}
            <p class="text-xs text-amber-200/90 leading-relaxed flex gap-2">
              <span aria-hidden="true">⚠</span><span>{w}</span>
            </p>
          {/each}
        </div>
      {/if}

      <div class="glass-panel rounded-2xl border border-slate-800 p-5 lg:col-span-3 overflow-x-auto">
        <div class="flex items-center gap-2 mb-3">
          <Waves class="w-4 h-4 text-cyan-400" />
          <h2 class="text-sm font-bold text-white uppercase tracking-wider">
            Standard sizes at {fmt(q * 3600, 2)} m³/h
          </h2>
        </div>
        <table class="w-full text-xs font-mono">
          <thead>
            <tr class="text-slate-400 border-b border-slate-800">
              <th class="text-left py-2 pr-3">DN</th>
              <th class="text-right py-2 pr-3">ID (mm)</th>
              <th class="text-right py-2 pr-3">Velocity (m/s)</th>
              <th class="text-right py-2 pr-3">Gradient (Pa/m)</th>
              <th class="text-right py-2 pr-3">mm w.g./m</th>
              <th class="text-right py-2">Check</th>
            </tr>
          </thead>
          <tbody class="text-slate-200">
            {#each rows as row (row.dn)}
              <tr class="border-b border-slate-800/60 {row.dn === best.dn ? 'bg-cyan-600/10' : ''}">
                <td class="py-2 pr-3 font-bold {row.dn === best.dn ? 'text-cyan-300' : ''}">{row.dn}</td>
                <td class="py-2 pr-3 text-right text-slate-400">{row.idMm}</td>
                <td class="py-2 pr-3 text-right">{fmt(row.velocity, 2)}</td>
                <td class="py-2 pr-3 text-right text-cyan-300">{fmt(row.paPerM, 0)}</td>
                <td class="py-2 pr-3 text-right text-slate-400">{fmt(row.mmWgPerM, 2)}</td>
                <td class="py-2 text-right {row.verdict === 'good' ? 'text-emerald-400' : row.verdict === 'excess' ? 'text-red-400' : 'text-amber-300'}">
                  {row.verdict === 'good' ? 'OK' : row.verdict === 'low' ? 'low' : row.verdict === 'high' ? 'noisy' : 'too fast'}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
        <p class="mt-3 text-[10px] font-mono text-slate-500 leading-relaxed">
          Internal diameters are steel Schedule 40 nominal bores; copper, PEX and heavier schedules
          have smaller bores for the same DN, so check the selected pipe's actual ID. Highlighted row
          is the closest standard bore to your
          {mode === 'velocity' ? `target velocity of ${targetVelocity} m/s` : mode === 'gradient' ? `target gradient of ${targetGradient} Pa/m` : 'selected DN'}.
        </p>
      </div>
    </div>
  {:else}
    <div class="glass-panel rounded-2xl border border-slate-800 p-8 text-center text-xs font-mono text-amber-400">
      Enter a water flow greater than zero to size the pipe.
    </div>
  {/if}

  <!-- Method note + cross-links -->
  <div class="glass-panel rounded-2xl border border-slate-800 p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
    <div class="space-y-1">
      <p class="text-xs text-slate-400 leading-relaxed">
        {VELOCITY_NOTE}
      </p>
      <p class="text-[10px] font-mono text-slate-500">
        Δp/L = f · ρv² / (2D) with f from Colebrook–White; ρ and μ from the design water temperature.
      </p>
    </div>
    <div class="flex items-center gap-4 shrink-0">
      <a href="/cooling-load" class="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300">
        <span>Find the coil load</span><ArrowRight class="w-3.5 h-3.5" />
      </a>
      <a href="/duct-sizing" class="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300">
        <span>Size the air side</span><ArrowRight class="w-3.5 h-3.5" />
      </a>
    </div>
  </div>

  <section class="space-y-4">
    <div class="border-b border-slate-800 pb-3">
      <h2 class="text-lg font-bold text-white tracking-tight">Frequently asked questions</h2>
      <p class="text-xs text-slate-400">Hydronic pipe sizing at a glance</p>
    </div>
    <div class="space-y-3">
      {#each faqs as f (f.q)}
        <details class="glass-panel rounded-xl border border-slate-800 p-4 group">
          <summary class="text-sm font-semibold text-white cursor-pointer list-none flex items-center justify-between">
            <span>{f.q}</span>
            <span class="text-cyan-400 group-open:rotate-45 transition-transform">+</span>
          </summary>
          <p class="mt-3 text-xs text-slate-400 leading-relaxed">{f.a}</p>
        </details>
      {/each}
    </div>
  </section>
</div>
