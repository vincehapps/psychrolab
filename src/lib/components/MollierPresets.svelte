<script lang="ts">
  import { applyPointPreset, type PresetPoint } from '$lib/stores/appStore';
  import { Compass, Snowflake, Flame, Layers } from '@lucide/svelte';

  interface Preset {
    name: string;
    hint: string;
    icon: typeof Compass;
    accent: string;
    points: PresetPoint[];
  }

  const presets: Preset[] = [
    {
      name: 'Cooling & dehumidification',
      hint: 'Outdoor air → apparatus dew point → supply air',
      icon: Snowflake,
      accent: 'text-cyan-400',
      points: [
        { dbt: 35, rh: 55, name: 'Outdoor air' },
        { dbt: 12.8, rh: 95, name: 'Apparatus dew point' },
        { dbt: 18, rh: 75, name: 'Supply air' }
      ]
    },
    {
      name: 'Evaporative cooling',
      hint: 'Hot dry air cooled along a constant wet bulb',
      icon: Compass,
      accent: 'text-emerald-400',
      points: [
        { dbt: 38, rh: 20, name: 'Outdoor air' },
        { dbt: 24, rh: 80, name: 'Direct evaporative' },
        { dbt: 22, rh: 92, name: 'Supply air' }
      ]
    },
    {
      name: 'Winter heating & humidification',
      hint: 'Sensible heat, then steam humidification',
      icon: Flame,
      accent: 'text-amber-400',
      points: [
        { dbt: -5, rh: 70, name: 'Outdoor air' },
        { dbt: 21, rh: 12, name: 'After heater' },
        { dbt: 21, rh: 45, name: 'After humidifier' }
      ]
    },
    {
      name: 'Air mixing (30% OA)',
      hint: 'Outdoor + return air mixed before the coil',
      icon: Layers,
      accent: 'text-indigo-400',
      points: [
        { dbt: 35, rh: 55, name: 'Outdoor air' },
        { dbt: 24, rh: 50, name: 'Return air' },
        { dbt: 27.3, rh: 54, name: 'Mixed air' }
      ]
    }
  ];

  let applied = '';
  function apply(name: string, points: PresetPoint[]) {
    applyPointPreset(points);
    applied = name;
  }
</script>

<div class="glass-panel rounded-2xl border border-slate-800 p-4 space-y-3">
  <div class="flex flex-wrap items-center justify-between gap-2">
    <div>
      <h3 class="text-sm font-bold text-white uppercase tracking-wider">Cycle &amp; process presets</h3>
      <p class="text-[11px] text-slate-400">
        One click loads a complete multi-point process onto the diagram — then tweak any state.
      </p>
    </div>
    {#if applied}
      <span class="text-[10px] font-mono text-emerald-400">Loaded: {applied}</span>
    {/if}
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
    {#each presets as preset (preset.name)}
      <button
        type="button"
        on:click={() => apply(preset.name, preset.points)}
        class="text-left rounded-xl border border-slate-800 bg-slate-950/50 hover:border-emerald-500/50 hover:bg-slate-900/80 p-3 transition-colors group"
      >
        <div class="flex items-center gap-1.5 mb-1">
          <svelte:component this={preset.icon} class="w-3.5 h-3.5 {preset.accent}" />
          <span class="text-xs font-semibold text-slate-200 group-hover:text-white">{preset.name}</span>
        </div>
        <p class="text-[10px] text-slate-500 leading-relaxed">{preset.hint}</p>
      </button>
    {/each}
  </div>
</div>
