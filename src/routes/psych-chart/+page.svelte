<script lang="ts">
  import PsychroChart from '$lib/components/PsychroChart.svelte';
  import StatePointInputs from '$lib/components/StatePointInputs.svelte';
  import DataSummaryTable from '$lib/components/DataSummaryTable.svelte';
  import DeltaCalculator from '$lib/components/DeltaCalculator.svelte';
  import TechnicalGuide from '$lib/components/TechnicalGuide.svelte';
  import AdSlot from '$lib/components/AdSlot.svelte';
</script>

<svelte:head>
  <title>Interactive Psychrometric Chart | PsychroLab</title>
  <meta name="description" content="High-precision interactive Psychrometric chart calculator for HVAC engineers and thermodynamic analysis." />
</svelte:head>

<div class="space-y-5">
  
  <!-- Interactive Psychrometric Chart View -->
  <PsychroChart />

  <!-- Ad Banner Slot -->
  <AdSlot slotId="psych-top" label="Engineering Sponsor" />

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
