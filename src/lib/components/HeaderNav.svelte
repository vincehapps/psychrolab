<script lang="ts">
  import { page } from '$app/stores';
  import { settingsStore, setUnitSystem, showSettingsModal, triggerShare } from '../stores/appStore';
  import { LineChart, Compass, Settings, ChevronDown, Wrench, Thermometer, Share2 } from '@lucide/svelte';

  let exploreDropdownOpen = false;

  function handleUnitChange(unit: 'SI' | 'IP') {
    setUnitSystem(unit);
  }

  $: isPsychPage = $page.url.pathname === '/psych-chart';
  $: isMollierPage = $page.url.pathname === '/mollier';
</script>

<header class="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 py-3">
  <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
    
    <!-- Logo & Main Page Navigation Links -->
    <div class="flex items-center space-x-6">
      <a href="/" class="flex items-center space-x-3 group">
        <div class="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-md group-hover:scale-105 transition-transform">
          <LineChart class="w-5 h-5" />
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <span class="text-lg font-bold tracking-tight text-white group-hover:text-blue-300 transition-colors">PsychroLab</span>
            <span class="px-2 py-0.5 text-[10px] font-mono uppercase font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
              Engineering Suite
            </span>
          </div>
          <p class="text-xs text-slate-400 font-sans">Thermodynamic & HVAC Engineering Tools</p>
        </div>
      </a>
    </div>

    <!-- Page Switcher Tabs: /psych-chart vs /mollier -->
    <div class="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
      <a
        href="/psych-chart"
        class="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 {isPsychPage ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}"
      >
        <LineChart class="w-3.5 h-3.5" />
        <span>Psychrometric Chart</span>
      </a>

      <a
        href="/mollier"
        class="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 {isMollierPage ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}"
      >
        <Compass class="w-3.5 h-3.5" />
        <span>Mollier Diagram</span>
      </a>
    </div>

    <!-- Right Controls: Unit Switcher, Explore Tools, Settings -->
    <div class="flex items-center space-x-3">
      
      <!-- Unit System Switcher -->
      <div class="flex items-center bg-slate-900/90 p-1 rounded-lg border border-slate-800">
        <button
          type="button"
          on:click={() => handleUnitChange('SI')}
          class="px-2.5 py-1 text-xs font-mono font-semibold rounded {$settingsStore.unitSystem === 'SI' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}"
        >
          SI
        </button>
        <button
          type="button"
          on:click={() => handleUnitChange('IP')}
          class="px-2.5 py-1 text-xs font-mono font-semibold rounded {$settingsStore.unitSystem === 'IP' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}"
        >
          IP
        </button>
      </div>

      <!-- Explore Tools Dropdown -->
      <div class="relative">
        <button
          type="button"
          on:click={() => (exploreDropdownOpen = !exploreDropdownOpen)}
          class="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-200 transition-colors"
        >
          <Wrench class="w-3.5 h-3.5 text-blue-400" />
          <span class="hidden sm:inline">Explore Tools</span>
          <ChevronDown class="w-3 h-3 text-slate-400" />
        </button>

        {#if exploreDropdownOpen}
          <div
            role="menu"
            tabindex="-1"
            class="absolute right-0 mt-2 w-56 glass-widget rounded-xl p-2 z-50 shadow-2xl border border-slate-700/60"
            on:mouseleave={() => (exploreDropdownOpen = false)}
          >
            <div class="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 py-1">Mechanical Utilities</div>
            <a
              href="/psych-chart"
              on:click={() => (exploreDropdownOpen = false)}
              class="flex items-center space-x-2 px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:bg-blue-600/20 hover:text-blue-300 transition-colors"
            >
              <LineChart class="w-3.5 h-3.5 text-blue-400" />
              <div>
                <div class="font-semibold">Psychrometric Solver</div>
                <div class="text-[10px] text-slate-400">Carrier-style charts & state solver</div>
              </div>
            </a>
            <a
              href="/mollier"
              on:click={() => (exploreDropdownOpen = false)}
              class="flex items-center space-x-2 px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:bg-blue-600/20 hover:text-blue-300 transition-colors"
            >
              <Compass class="w-3.5 h-3.5 text-emerald-400" />
              <div>
                <div class="font-semibold">Mollier Diagram</div>
                <div class="text-[10px] text-slate-400">DIN 4107 h-x analysis</div>
              </div>
            </a>
            <div class="my-1 border-t border-slate-800"></div>
            <a
              href="#steam-tables"
              on:click|preventDefault={() => alert('Steam Tables Tool module preview in development.')}
              class="flex items-center space-x-2 px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:bg-blue-600/20 hover:text-blue-300 transition-colors"
            >
              <Thermometer class="w-3.5 h-3.5 text-cyan-400" />
              <div>
                <div class="font-semibold">Steam Tables</div>
                <div class="text-[10px] text-slate-400">Thermodynamic water vapor states</div>
              </div>
            </a>
          </div>
        {/if}
      </div>

      <!-- Share State Points & Configuration Button -->
      <button
        type="button"
        on:click={() => triggerShare($page.url.pathname)}
        title="Share state points and parameters"
        class="flex items-center space-x-1.5 px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 hover:text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
      >
        <Share2 class="w-3.5 h-3.5" />
        <span class="hidden sm:inline">Share</span>
      </button>

      <!-- System Parameters Settings Button -->
      <button
        type="button"
        on:click={() => showSettingsModal.set(true)}
        title="Adjust elevation and barometric pressure"
        class="p-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-300 hover:text-white transition-colors"
      >
        <Settings class="w-4 h-4" />
      </button>

    </div>
  </div>
</header>
