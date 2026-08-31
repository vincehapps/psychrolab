<script lang="ts">
  import { showShareModal, sharedUrlStore } from '../stores/appStore';
  import { Check, Copy, X, Share2, Link } from '@lucide/svelte';

  let copied = true; // Auto-copied when modal opens

  function copyAgain() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText($sharedUrlStore);
    }
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }

  function handleClose() {
    showShareModal.set(false);
  }
</script>

{#if $showShareModal}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    on:click|self={handleClose}
    on:keydown={(e) => e.key === 'Escape' && handleClose()}
  >
    <div class="glass-widget rounded-2xl p-5 w-full max-w-md border border-blue-500/40 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 relative">
      
      <!-- Top Close Button -->
      <button
        type="button"
        on:click={handleClose}
        class="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        aria-label="Close share dialog"
      >
        <X class="w-4 h-4" />
      </button>

      <!-- Modal Header with Success Badge -->
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md flex-shrink-0">
          <Check class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-white">Share Link Copied!</h3>
          <p class="text-[11px] text-slate-400 font-sans">URL copied to clipboard with all state points & settings</p>
        </div>
      </div>

      <!-- URL Input & Copy Button Box -->
      <div class="space-y-1.5 font-sans">
        <label for="share-url-input" class="block text-[10px] font-mono uppercase text-slate-400">
          Direct Share URL
        </label>
        <div class="flex items-center space-x-2">
          <div class="relative flex-1">
            <input
              id="share-url-input"
              type="text"
              readonly
              value={$sharedUrlStore}
              class="w-full bg-slate-950 text-slate-300 font-mono text-[11px] rounded-lg pl-8 pr-2.5 py-2 border border-slate-700/80 focus:border-blue-500 focus:outline-none select-all"
            />
            <Link class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>

          <button
            type="button"
            on:click={copyAgain}
            class="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors flex-shrink-0"
          >
            {#if copied}
              <Check class="w-3.5 h-3.5 text-emerald-300" />
              <span>Copied</span>
            {:else}
              <Copy class="w-3.5 h-3.5" />
              <span>Copy</span>
            {/if}
          </button>
        </div>
      </div>

      <!-- Description note -->
      <p class="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
        Anyone opening this link will immediately load your exact thermodynamic state points, custom property pairs, unit system, and elevation settings.
      </p>

      <!-- Footer Button -->
      <div class="flex items-center justify-end pt-1">
        <button
          type="button"
          on:click={handleClose}
          class="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
        >
          Done
        </button>
      </div>

    </div>
  </div>
{/if}
