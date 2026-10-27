<script lang="ts">
  import SteamChart from '$lib/components/SteamChart.svelte';
  import SteamStateInputs from '$lib/components/SteamStateInputs.svelte';
  import SteamCycleSummary from '$lib/components/SteamCycleSummary.svelte';
  import SteamTableGrid from '$lib/components/SteamTableGrid.svelte';
</script>

<svelte:head>
  <title>Saturated Steam Tables, T–s Chart & Cycle Visualization | PsychroLab</title>
  <meta name="description" content="Interactive saturated water & steam property tables, temperature–entropy (T–s) steam diagram with saturation dome, vapor quality contours, and Rankine cycle visualization for mechanical engineers." />
</svelte:head>

<div class="space-y-5">

  <!-- Interactive T–s Steam Diagram (Saturation Dome, Isobars, Quality Lines, State Points) -->
  <SteamChart />

  <!-- Multi-State Steam Point Solver Inputs (drives chart markers) -->
  <SteamStateInputs />

  <!-- Calculated Thermodynamic Properties Table & Rankine Cycle Diagnostics -->
  <SteamCycleSummary />

  <!-- Saturated Water & Steam Property Tables (by Temperature / by Pressure) -->
  <SteamTableGrid />

</div>
