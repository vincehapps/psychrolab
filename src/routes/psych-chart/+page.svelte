<script lang="ts">
  import PsychroChart from '$lib/components/PsychroChart.svelte';
  import StatePointInputs from '$lib/components/StatePointInputs.svelte';
  import DataSummaryTable from '$lib/components/DataSummaryTable.svelte';
  import DeltaCalculator from '$lib/components/DeltaCalculator.svelte';
  import TechnicalGuide from '$lib/components/TechnicalGuide.svelte';
  import SavedScenarios from '$lib/components/SavedScenarios.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import AdSlot from '$lib/components/AdSlot.svelte';
</script>

<Seo route="psych-chart" />

<div class="space-y-5">

  <!-- Page heading: adds the document H1 and the save/share actions -->
  <div class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
    <div class="space-y-1">
      <h1 class="text-2xl font-extrabold tracking-tight text-white">Interactive Psychrometric Chart</h1>
      <p class="text-xs text-slate-400 max-w-2xl leading-relaxed">
        Solve any two moist-air properties, read wet bulb, dew point and enthalpy, overlay ASHRAE 55 comfort
        zones and export the chart as PNG, SVG or a spreadsheet table.
      </p>
    </div>
    <SavedScenarios />
  </div>

  <!-- Interactive Psychrometric Chart View -->
  <PsychroChart />

  <!-- Ad Banner Slot -->
  <!-- <AdSlot slotId="psych-top" label="Engineering Sponsor" /> -->

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
    <TechnicalGuide />
  </div>

</div>
