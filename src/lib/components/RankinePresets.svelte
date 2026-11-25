<script lang="ts">
  import { steamPointsStore, activeSteamPointId } from '../steam/steamStore';
  import { RANKINE_PRESETS } from '../steam/rankinePresets';
  import { Zap } from '@lucide/svelte';

  function applyPreset(preset: (typeof RANKINE_PRESETS)[number]) {
    steamPointsStore.set(preset.points.map((pt) => ({ ...pt })));
    activeSteamPointId.set('SP1');
  }
</script>

<div class="flex flex-wrap items-center gap-2">
  <span class="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500">
    <Zap class="w-3 h-3 text-blue-400" />
    Cycle presets (T–s)
  </span>
  {#each RANKINE_PRESETS as preset (preset.id)}
    <button
      type="button"
      on:click={() => applyPreset(preset)}
      title={preset.note}
      class="px-3 py-1 rounded-lg border border-slate-700 bg-slate-900/70 text-xs font-medium text-slate-300 hover:border-blue-500/60 hover:text-white transition-colors"
    >
      {preset.label}
    </button>
  {/each}
</div>
