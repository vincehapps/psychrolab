<script lang="ts">
  import SteamChart from '$lib/components/SteamChart.svelte';
  import SteamStateInputs from '$lib/components/SteamStateInputs.svelte';
  import SteamCycleSummary from '$lib/components/SteamCycleSummary.svelte';
  import SteamTableGrid from '$lib/components/SteamTableGrid.svelte';
  import SteamInterpolator from '$lib/components/SteamInterpolator.svelte';
  import Seo from '$lib/components/Seo.svelte';
</script>

<Seo route="steam-tables" />

<div class="space-y-5">

  <div class="space-y-1 border-b border-slate-800 pb-4">
    <h1 class="text-2xl font-extrabold tracking-tight text-white">Saturated Steam Tables &amp; T–s Diagram</h1>
    <p class="text-xs text-slate-400 max-w-2xl leading-relaxed">
      Saturated water and steam properties by temperature or pressure, an exact-value linear interpolator
      with bounding-row highlighting, and a Rankine cycle state solver with a live T–s diagram.
    </p>
  </div>

  <!-- Interactive T–s Steam Diagram (Saturation Dome, Isobars, Quality Lines, State Points) -->
  <SteamChart />

  <!-- Multi-State Steam Point Solver Inputs (drives chart markers) -->
  <SteamStateInputs />

  <!-- Calculated Thermodynamic Properties Table & Rankine Cycle Diagnostics -->
  <SteamCycleSummary />

  <!-- Exact-value interpolator sits directly above the property tables -->
  <SteamInterpolator />

  <!-- Saturated Water & Steam Property Tables (by Temperature / by Pressure) -->
  <SteamTableGrid />

</div>
