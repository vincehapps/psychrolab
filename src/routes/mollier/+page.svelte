<script lang="ts">
  import MollierChart from '$lib/components/MollierChart.svelte';
  import StatePointInputs from '$lib/components/StatePointInputs.svelte';
  import DataSummaryTable from '$lib/components/DataSummaryTable.svelte';
  import DeltaCalculator from '$lib/components/DeltaCalculator.svelte';
  import MollierTechnicalGuide from '$lib/components/MollierTechnicalGuide.svelte';
  import MollierPresets from '$lib/components/MollierPresets.svelte';
  import SavedScenarios from '$lib/components/SavedScenarios.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import AdSlot from '$lib/components/AdSlot.svelte';
</script>

<Seo route="mollier" />

<div class="space-y-5">

  <div class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
    <div class="space-y-1">
      <h1 class="text-2xl font-extrabold tracking-tight text-white">Mollier h-x Diagram</h1>
      <p class="text-xs text-slate-400 max-w-2xl leading-relaxed">
        European DIN 4107 enthalpy–humidity diagram for moist air. Load a cooling, evaporative, heating or
        mixing process with one click, then adjust each state point. Hover anywhere for live properties.
      </p>
    </div>
    <SavedScenarios />
  </div>

  <!-- Interactive Mollier Diagram View -->
  <MollierChart />

  <!-- One-click thermodynamic process overlays -->
  <MollierPresets />

  <!-- Ad Banner Slot -->
  <!-- <AdSlot slotId="mollier-top" label="Engineering Sponsor" /> -->

  <!-- Multi-State Inputs & Delta Analysis Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
    <div class="lg:col-span-2">
      <StatePointInputs />
    </div>
    <div>
      <DeltaCalculator />
    </div>
  </div>

  <!-- High-Density Calculated Data Summary Table -->
  <DataSummaryTable />

  <!-- Technical Guide Section below Data Summary Table -->
  <div id="technical-guide-section">
    <MollierTechnicalGuide />
  </div>

</div>
