<script lang="ts">
  import {
    savedScenariosStore,
    saveScenario,
    applyScenario,
    deleteScenario
  } from '$lib/stores/appStore';
  import { X, Check, Copy, Eye } from '@lucide/svelte';

  let open = false;
  let name = '';
  let flash = false;

  function handleSave() {
    if (saveScenario(name)) {
      name = '';
      flash = true;
      setTimeout(() => (flash = false), 1800);
    }
  }

  function handleLoad(id: string) {
    applyScenario(id);
    open = false;
  }

  $: count = $savedScenariosStore.length;
</script>

<button
  type="button"
  on:click={() => (open = true)}
  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors"
  title="Save and reload named chart states in this browser"
>
  <Eye class="w-3.5 h-3.5 text-emerald-400" />
  <span>Saved scenarios</span>
  <span class="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400">{count}</span>
</button>

{#if open}
  <div
    class="fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-label="Saved scenarios"
    tabindex="-1"
    on:click|self={() => (open = false)}
    on:keydown={(e) => e.key === 'Escape' && (open = false)}
  >
    <aside class="h-full w-full max-w-sm bg-[#0b1326] border-l border-slate-800 p-5 space-y-4 overflow-y-auto shadow-2xl">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-bold text-white uppercase tracking-wider">Saved scenarios</h2>
          <p class="text-[11px] text-slate-500">Stored only in this browser — no account needed.</p>
        </div>
        <button
          type="button"
          on:click={() => (open = false)}
          class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Close saved scenarios"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="space-y-2 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
        <label for="scenario-name" class="block text-[10px] font-mono uppercase text-slate-400">
          Name current state
        </label>
        <div class="flex gap-2">
          <input
            id="scenario-name"
            type="text"
            bind:value={name}
            placeholder="e.g. AHU-2 summer design"
            maxlength="60"
            on:keydown={(e) => e.key === 'Enter' && handleSave()}
            class="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
          />
          <button
            type="button"
            on:click={handleSave}
            disabled={!name.trim()}
            class="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold"
          >
            {#if flash}<Check class="w-3.5 h-3.5" />{:else}<Copy class="w-3.5 h-3.5" />{/if}
            <span>{flash ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {#if count === 0}
        <p class="text-xs text-slate-500 font-mono leading-relaxed">
          No saved states yet. Configure your state points, then save the scenario here to reload it later.
        </p>
      {:else}
        <ul class="space-y-2">
          {#each $savedScenariosStore as scenario (scenario.id)}
            <li class="rounded-xl border border-slate-800 bg-slate-950/40 p-3 space-y-2">
              <div>
                <p class="text-xs font-semibold text-white truncate">{scenario.name}</p>
                <p class="text-[10px] font-mono text-slate-500">
                  {new Date(scenario.createdAt).toLocaleString()} · {scenario.payload.pts.length} point{scenario.payload.pts.length === 1 ? '' : 's'}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  on:click={() => handleLoad(scenario.id)}
                  class="px-2.5 py-1 rounded-md bg-blue-600/20 border border-blue-500/40 text-blue-300 text-[11px] font-semibold hover:bg-blue-600/30"
                >
                  Load
                </button>
                <button
                  type="button"
                  on:click={() => deleteScenario(scenario.id)}
                  class="px-2.5 py-1 rounded-md border border-slate-700 text-slate-400 text-[11px] font-semibold hover:text-red-300 hover:border-red-500/40"
                >
                  Delete
                </button>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </aside>
  </div>
{/if}
