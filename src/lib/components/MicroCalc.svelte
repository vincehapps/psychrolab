<script lang="ts">
  import { solveStatePointFromPairSI } from '$lib/psychrometrics/engine';
  import {
    getStandardAtmosphericPressureSI,
    cToF,
    kJPerKgToBtuPerLb,
    m3PerKgToFt3PerLb
  } from '$lib/psychrometrics/unitConverter';
  import { SEO } from '$lib/seo';
  import { ArrowRight, Calculator, Thermometer, Droplets } from '@lucide/svelte';

  export let kind: 'wet-bulb' | 'dew-point' | 'enthalpy' | 'humidity-ratio';

  let tdb = 30;
  let rh = 60;
  let elevation = 0;

  $: pPa = getStandardAtmosphericPressureSI(elevation);
  $: valid = Number.isFinite(tdb) && Number.isFinite(rh) && rh > 0 && rh <= 100;
  $: st = valid ? solveStatePointFromPairSI('DBT', tdb, 'RH', rh, pPa) : null;
  $: faq = SEO[kind]?.faq ?? [];
  $: hero = st ? buildHero(kind, st, tdb) : null;

  interface Hero {
    label: string;
    primary: string;
    secondary: string;
    note: string;
  }

  function buildHero(k: typeof kind, state: ReturnType<typeof solveStatePointFromPairSI>, dryBulb: number): Hero {
    switch (k) {
      case 'wet-bulb':
        return {
          label: 'Thermodynamic wet-bulb temperature',
          primary: `${state.wbt.toFixed(2)} °C`,
          secondary: `${cToF(state.wbt).toFixed(1)} °F`,
          note: `Wet-bulb depression ${(dryBulb - state.wbt).toFixed(2)} K — the drier the air, the larger the depression.`
        };
      case 'dew-point':
        return {
          label: 'Dew point temperature',
          primary: `${state.dpt.toFixed(2)} °C`,
          secondary: `${cToF(state.dpt).toFixed(1)} °F`,
          note:
            state.dpt >= 16
              ? 'Above ~16 °C dew point the air feels muggy and surfaces below this temperature will sweat.'
              : 'Condensation occurs on any surface colder than this temperature.'
        };
      case 'enthalpy':
        return {
          label: 'Moist-air specific enthalpy',
          primary: `${state.enthalpy.toFixed(2)} kJ/kg`,
          secondary: `${kJPerKgToBtuPerLb(state.enthalpy).toFixed(2)} Btu/lb`,
          note: `Includes ${(state.humRat * 2501).toFixed(1)} kJ/kg of latent heat carried by the water vapour.`
        };
      default:
        return {
          label: 'Humidity ratio (absolute humidity)',
          primary: `${(state.humRat * 1000).toFixed(2)} g/kg`,
          secondary: `${(state.humRat * 7000).toFixed(1)} gr/lb · ${state.humRat.toFixed(5)} kg/kg`,
          note: 'Mass of water vapour per kilogram of dry air — unchanged by heating or cooling until condensation begins.'
        };
    }
  }

  const stateRows = [
    { key: 'dbt', label: 'Dry bulb', unit: '°C', ipUnit: '°F', ip: (v: number) => cToF(v), digits: 2 },
    { key: 'wbt', label: 'Wet bulb', unit: '°C', ipUnit: '°F', ip: (v: number) => cToF(v), digits: 2 },
    { key: 'dpt', label: 'Dew point', unit: '°C', ipUnit: '°F', ip: (v: number) => cToF(v), digits: 2 },
    { key: 'rh', label: 'Relative humidity', unit: '%', ipUnit: '%', ip: (v: number) => v, digits: 1 },
    { key: 'humRat', label: 'Humidity ratio', unit: 'kg/kg', ipUnit: 'gr/lb', ip: (v: number) => v * 7000, digits: 5 },
    { key: 'enthalpy', label: 'Enthalpy', unit: 'kJ/kg', ipUnit: 'Btu/lb', ip: (v: number) => kJPerKgToBtuPerLb(v), digits: 2 },
    { key: 'vol', label: 'Specific volume', unit: 'm³/kg', ipUnit: 'ft³/lb', ip: (v: number) => m3PerKgToFt3PerLb(v), digits: 3 },
    { key: 'vapPress', label: 'Vapour pressure', unit: 'kPa', ipUnit: 'psi', ip: (v: number) => v * 0.1450377, digits: 3 }
  ] as const;
</script>

<div class="space-y-5">
  <div class="space-y-2 border-b border-slate-800 pb-4">
    <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{SEO[kind].title.split('|')[0].trim()}</h1>
    <p class="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">{SEO[kind].description}</p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-5 gap-5">
    <!-- Inputs -->
    <div class="lg:col-span-2 glass-panel rounded-2xl border border-slate-800 p-5 space-y-4">
      <div class="flex items-center gap-2">
        <Calculator class="w-4 h-4 text-blue-400" />
        <h2 class="text-sm font-bold text-white uppercase tracking-wider">Inputs</h2>
      </div>

      <label class="block space-y-1.5">
        <span class="text-xs font-mono text-slate-400 flex items-center gap-1.5">
          <Thermometer class="w-3.5 h-3.5 text-amber-400" /> Dry-bulb temperature (°C)
        </span>
        <input
          type="number"
          bind:value={tdb}
          step="0.5"
          class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
        />
      </label>

      <label class="block space-y-1.5">
        <span class="text-xs font-mono text-slate-400 flex items-center gap-1.5">
          <Droplets class="w-3.5 h-3.5 text-cyan-400" /> Relative humidity (%)
        </span>
        <input
          type="number"
          bind:value={rh}
          step="1"
          min="1"
          max="100"
          class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
        />
        <input type="range" bind:value={rh} min="1" max="100" step="1" class="w-full accent-cyan-500" aria-label="Relative humidity slider" />
      </label>

      <label class="block space-y-1.5">
        <span class="text-xs font-mono text-slate-400">Site elevation (m)</span>
        <input
          type="number"
          bind:value={elevation}
          step="50"
          class="w-full bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
        />
        <span class="block text-[10px] font-mono text-slate-500">Barometric pressure {((pPa / 1000)).toFixed(2)} kPa</span>
      </label>

      {#if !valid}
        <p class="text-[11px] font-mono text-amber-400">Relative humidity must be between 0 and 100%.</p>
      {/if}
    </div>

    <!-- Result -->
    <div class="lg:col-span-3 glass-panel rounded-2xl border border-slate-800 p-5 space-y-4 flex flex-col">
      <h2 class="text-sm font-bold text-white uppercase tracking-wider">Result</h2>
      {#if hero && st}
        <div class="rounded-xl border border-blue-500/30 bg-blue-500/5 p-5 space-y-1.5">
          <p class="text-[11px] font-mono uppercase tracking-wider text-blue-300">{hero.label}</p>
          <p class="text-3xl sm:text-4xl font-extrabold font-mono text-white">{hero.primary}</p>
          <p class="text-sm font-mono text-cyan-300">{hero.secondary}</p>
          <p class="text-[11px] text-slate-400 leading-relaxed pt-1">{hero.note}</p>
        </div>

        <div class="overflow-x-auto rounded-xl border border-slate-800">
          <table class="w-full text-[11px] font-mono">
            <thead class="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th class="text-left p-2">Property</th>
                <th class="text-right p-2">SI</th>
                <th class="text-right p-2">IP</th>
              </tr>
            </thead>
            <tbody>
              {#each stateRows as row (row.key)}
                <tr class="border-b border-slate-800/60">
                  <td class="p-2 text-slate-400">{row.label}</td>
                  <td class="p-2 text-right text-slate-100">{st[row.key].toFixed(row.digits)} {row.unit}</td>
                  <td class="p-2 text-right text-slate-300">{row.ip(st[row.key]).toFixed(row.digits)} {row.ipUnit}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <div class="mt-auto flex flex-wrap items-center gap-3 pt-1">
          <a
            href="/psych-chart"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
          >
            <span>Open the full psychrometric chart</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </a>
          <span class="text-[10px] font-mono text-slate-500">ASHRAE 2017 Fundamentals formulations</span>
        </div>
      {/if}
    </div>
  </div>

  {#if faq.length}
    <section class="space-y-3">
      <h2 class="text-lg font-bold text-white tracking-tight">Frequently asked questions</h2>
      {#each faq as item (item.q)}
        <details class="glass-panel rounded-xl border border-slate-800 p-4 group">
          <summary class="text-sm font-semibold text-white cursor-pointer list-none flex items-center justify-between">
            <span>{item.q}</span>
            <span class="text-blue-400 group-open:rotate-45 transition-transform">+</span>
          </summary>
          <p class="mt-3 text-xs text-slate-400 leading-relaxed">{item.a}</p>
        </details>
      {/each}
    </section>
  {/if}
</div>
