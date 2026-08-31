<script lang="ts">
  import { showSettingsModal, settingsStore } from '../stores/appStore';
  import { getStandardAtmosphericPressureSI, kPaToPsi, feetToMeters } from '../psychrometrics/unitConverter';
  import { X, Sliders, Check } from '@lucide/svelte';

  $: isSI = $settingsStore.unitSystem === 'SI';

  let elevation = 0;
  let pressure = 101.325;

  // Initialize values when modal opens
  $: if ($showSettingsModal) {
    elevation = $settingsStore.elevation;
    pressure = $settingsStore.pressure;
  }

  function calculatePressureForElevation(elevVal: number, si: boolean): number {
    if (si) {
      const pPa = getStandardAtmosphericPressureSI(elevVal || 0);
      return Number((pPa / 1000).toFixed(3));
    } else {
      const elevM = feetToMeters(elevVal || 0);
      const pPa = getStandardAtmosphericPressureSI(elevM);
      const pKPa = pPa / 1000;
      return Number(kPaToPsi(pKPa).toFixed(3));
    }
  }

  function handleElevationInput(e: Event) {
    const val = Number((e.target as HTMLInputElement).value) || 0;
    elevation = val;
    pressure = calculatePressureForElevation(val, isSI);
  }

  function handleSave() {
    settingsStore.update((s) => ({
      ...s,
      elevation: Number(elevation) || 0,
      pressure: Number(pressure) || (isSI ? 101.325 : 14.696)
    }));
    showSettingsModal.set(false);
  }

  function handleAutoCalculate() {
    pressure = calculatePressureForElevation(Number(elevation) || 0, isSI);
  }

  function handleClose() {
    showSettingsModal.set(false);
  }
</script>

{#if $showSettingsModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
    <div class="glass-widget rounded-2xl p-6 w-full max-w-md border border-slate-700 shadow-2xl animate-in fade-in zoom-in duration-150">
      
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div class="flex items-center space-x-2">
          <Sliders class="w-5 h-5 text-blue-400" />
          <h3 class="text-base font-bold text-white">System Parameters & Barometric Pressure</h3>
        </div>
        <button
          type="button"
          on:click={handleClose}
          class="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Settings Inputs -->
      <div class="space-y-4 font-sans text-xs">
        
        <div>
          <label for="site-elevation-input" class="block text-slate-300 font-semibold mb-1">
            Site Elevation ({isSI ? 'Meters' : 'Feet'})
          </label>
          <input
            id="site-elevation-input"
            type="number"
            value={elevation}
            on:input={handleElevationInput}
            placeholder="e.g. 0"
            class="w-full bg-slate-950 text-white font-mono rounded-lg px-3 py-2 border border-slate-700 focus:border-blue-500 focus:outline-none"
          />
          <p class="text-[10px] text-slate-400 mt-1">Adjusts standard air density for high altitude calculations.</p>
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <label for="baro-pressure-input" class="block text-slate-300 font-semibold">
              Barometric Pressure ({isSI ? 'kPa' : 'psi'})
            </label>
            <button
              type="button"
              on:click={handleAutoCalculate}
              class="text-[10px] text-blue-400 hover:underline font-mono"
            >
              Auto-calculate from Elevation
            </button>
          </div>
          <input
            id="baro-pressure-input"
            type="number"
            step="0.001"
            bind:value={pressure}
            class="w-full bg-slate-950 text-cyan-400 font-mono rounded-lg px-3 py-2 border border-slate-700 focus:border-blue-500 focus:outline-none"
          />
        </div>

      </div>

      <!-- Footer Buttons -->
      <div class="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-slate-800">
        <button
          type="button"
          on:click={handleClose}
          class="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          on:click={handleSave}
          class="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
        >
          <Check class="w-4 h-4" />
          <span>Apply Parameters</span>
        </button>
      </div>

    </div>
  </div>
{/if}
