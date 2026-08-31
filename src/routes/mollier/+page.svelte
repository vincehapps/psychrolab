<script lang="ts">
  import MollierChart from '$lib/components/MollierChart.svelte';
  import StatePointInputs from '$lib/components/StatePointInputs.svelte';
  import DataSummaryTable from '$lib/components/DataSummaryTable.svelte';
  import DeltaCalculator from '$lib/components/DeltaCalculator.svelte';
  import MollierTechnicalGuide from '$lib/components/MollierTechnicalGuide.svelte';
  import AdSlot from '$lib/components/AdSlot.svelte';
</script>

<svelte:head>
  <title>Mollier Diagram (h-x) | PsychroLab</title>
  <meta name="description" content="Interactive European standard DIN 4107 Mollier h-x diagram with oblique enthalpy guidelines, isotherms, and moist air state analysis." />
</svelte:head>

<div class="space-y-5">
  
  <!-- Interactive Mollier Diagram View -->
  <MollierChart />

  <!-- Ad Banner Slot -->
  <AdSlot slotId="mollier-top" label="Engineering Sponsor" />

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
