<script lang="ts">
  import { LineChart, Compass, Sliders, ArrowRight, Activity, Zap, CheckCircle2, ShieldCheck, Download, Layers, Flame, Droplets, Mountain, BookOpen } from '@lucide/svelte';
  import { setUnitSystem, settingsStore } from '$lib/stores/appStore';
</script>

<svelte:head>
  <title>PsychroLab — Precision Thermodynamic & Psychrometric Engineering Suite</title>
  <meta name="description" content="Professional thermodynamic suite for HVAC designers and mechanical engineers. Interactive Psychrometric charts, Mollier diagrams, multi-state AHU coil analysis, and ASHRAE 2017 compliant calculations." />
</svelte:head>

<div class="space-y-16 py-4">

  <!-- ================= HERO SECTION ================= -->
  <section class="relative overflow-hidden rounded-3xl glass-panel p-8 md:p-12 border border-slate-800 shadow-2xl">
    <!-- Ambient glowing backgrounds -->
    <div class="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

    <div class="relative z-10 max-w-4xl mx-auto text-center space-y-6">
      
      <!-- Top Badge -->
      <div class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono font-medium">
        <span class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
        <span>ASHRAE 2017 & DIN Engineering Standard Suite</span>
      </div>

      <!-- Main Headline -->
      <h1 class="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
        Precision Thermodynamic & <br class="hidden sm:inline" />
        <span class="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
          Psychrometric Analysis
        </span>
      </h1>

      <!-- Subtitle -->
      <p class="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
        The complete web-based thermodynamic workspace for mechanical engineers and HVAC designers. Solve multi-state points, analyze coil deltas, and explore interactive Psychrometric and Mollier charts.
      </p>

      <!-- CTA Action Buttons -->
      <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
        <a
          href="/psych-chart"
          class="flex items-center space-x-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 transition-all duration-150 transform hover:-translate-y-0.5"
        >
          <LineChart class="w-4 h-4" />
          <span>Launch Psychrometric Calculator</span>
          <ArrowRight class="w-4 h-4 ml-1" />
        </a>

        <a
          href="/mollier"
          class="flex items-center space-x-2 px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 text-sm font-semibold rounded-xl transition-all duration-150"
        >
          <Compass class="w-4 h-4 text-emerald-400" />
          <span>Explore Mollier Diagram</span>
        </a>
      </div>

      <!-- Feature Badges Row -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80 text-left">
        <div class="flex items-center space-x-2 text-xs text-slate-300 font-mono">
          <CheckCircle2 class="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>SI & IP Dual Precision</span>
        </div>
        <div class="flex items-center space-x-2 text-xs text-slate-300 font-mono">
          <CheckCircle2 class="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>Unlimited State Points</span>
        </div>
        <div class="flex items-center space-x-2 text-xs text-slate-300 font-mono">
          <CheckCircle2 class="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span>Elevation Altitude Solver</span>
        </div>
        <div class="flex items-center space-x-2 text-xs text-slate-300 font-mono">
          <CheckCircle2 class="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>Process Delta Characterizer</span>
        </div>
      </div>

    </div>
  </section>

  <!-- ================= CORE TOOLS & MODULES ================= -->
  <section class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-800 pb-3">
      <div>
        <h2 class="text-xl font-bold text-white tracking-tight">Thermodynamic Tools & Workspaces</h2>
        <p class="text-xs text-slate-400">Select an engineering environment to begin analyzing moist air systems</p>
      </div>
      <a href="/psych-chart" class="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1">
        <span>Open full workspace</span>
        <ArrowRight class="w-3.5 h-3.5" />
      </a>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      
      <!-- Tool 1: Interactive Psychrometric Chart -->
      <div class="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-blue-500/50 transition-all duration-200 flex flex-col justify-between group">
        <div class="space-y-3">
          <div class="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
            <LineChart class="w-5 h-5" />
          </div>
          <h3 class="text-base font-bold text-white">Interactive Psychrometric Chart</h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            Carrier-style temperature vs humidity ratio diagram. Live crosshair inspection, continuous enthalpy guidelines, and drag-and-drop state point adjustments.
          </p>
        </div>
        <div class="pt-5 mt-4 border-t border-slate-800/80">
          <a
            href="/psych-chart"
            class="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300"
          >
            <span>Open Psychrometric Chart</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <!-- Tool 2: Mollier Diagram (h-x) -->
      <div class="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-emerald-500/50 transition-all duration-200 flex flex-col justify-between group">
        <div class="space-y-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
            <Compass class="w-5 h-5" />
          </div>
          <h3 class="text-base font-bold text-white">Standard Mollier Diagram</h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            European standard (DIN 4107) h-x diagram with oblique enthalpy guidelines, horizontal 0°C isotherms, absolute humidity lines, and saturation curves.
          </p>
        </div>
        <div class="pt-5 mt-4 border-t border-slate-800/80">
          <a
            href="/mollier"
            class="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            <span>Open Mollier Diagram</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <!-- Tool 3: Two-Property State Solver -->
      <div class="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-cyan-500/50 transition-all duration-200 flex flex-col justify-between group">
        <div class="space-y-3">
          <div class="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
            <Sliders class="w-5 h-5" />
          </div>
          <h3 class="text-base font-bold text-white">Custom Pair State Point Solver</h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            Input any two distinct parameters (DBT, WBT, DPT, RH, Humidity Ratio, Enthalpy) to calculate the complete thermodynamic state of moist air.
          </p>
        </div>
        <div class="pt-5 mt-4 border-t border-slate-800/80">
          <a
            href="/psych-chart"
            class="inline-flex items-center space-x-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          >
            <span>Configure State Points</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <!-- Tool 4: Process Delta & Coil Analyzer -->
      <div class="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-amber-500/50 transition-all duration-200 flex flex-col justify-between group">
        <div class="space-y-3">
          <div class="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
            <Activity class="w-5 h-5" />
          </div>
          <h3 class="text-base font-bold text-white">AHU Process Delta Analyzer</h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            Compute sensible and latent enthalpy deltas (Δh, ΔT, ΔW, ΔRH) between any two state points to size heating/cooling coils and humidifiers.
          </p>
        </div>
        <div class="pt-5 mt-4 border-t border-slate-800/80">
          <a
            href="/psych-chart"
            class="inline-flex items-center space-x-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300"
          >
            <span>Analyze Process Deltas</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <!-- Tool 5: Elevation & Barometric Pressure Settings -->
      <div class="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-indigo-500/50 transition-all duration-200 flex flex-col justify-between group">
        <div class="space-y-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
            <Mountain class="w-5 h-5" />
          </div>
          <h3 class="text-base font-bold text-white">Altitude & Barometric Adjustment</h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            Adjust site elevation and atmospheric pressure in real-time. Automatically recalculates moist air density, vapor pressure, and saturation states.
          </p>
        </div>
        <div class="pt-5 mt-4 border-t border-slate-800/80">
          <a
            href="/psych-chart"
            class="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            <span>Set Altitude Parameters</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <!-- Tool 6: Engineering CSV Data Export -->
      <div class="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-purple-500/50 transition-all duration-200 flex flex-col justify-between group">
        <div class="space-y-3">
          <div class="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
            <Download class="w-5 h-5" />
          </div>
          <h3 class="text-base font-bold text-white">Data Summary & CSV Export</h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            Full tabular breakdown of all thermodynamic state variables (Tdb, Twb, Tdp, RH, W, h, v, pv). Export directly to CSV for engineering reports.
          </p>
        </div>
        <div class="pt-5 mt-4 border-t border-slate-800/80">
          <a
            href="/psych-chart"
            class="inline-flex items-center space-x-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300"
          >
            <span>View Data Table</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

    </div>
  </section>

  <!-- ================= ENGINEERING CAPABILITIES & EQUATIONS ================= -->
  <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    
    <!-- Left Card: Standards & Methodology -->
    <div class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
      <div class="flex items-center space-x-2 text-blue-400 font-semibold text-sm">
        <ShieldCheck class="w-4 h-4" />
        <span class="uppercase tracking-wider">Governing Thermodynamic Standards</span>
      </div>
      <h3 class="text-lg font-bold text-white">ASHRAE 2017 & ISO Standards Compliant</h3>
      <p class="text-xs text-slate-300 leading-relaxed">
        PsychroLab implements the official formulas from the <em>2017 ASHRAE Handbook — Fundamentals (Chapter 1: Psychrometrics)</em> and European DIN 4107 standards. Vapor pressures are solved with high-order polynomial formulations accurate across freezing (-100°C to 0°C) and standard ambient (0°C to 200°C) ranges.
      </p>
      
      <div class="space-y-2 pt-2 text-xs font-mono text-slate-300">
        <div class="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
          <div class="text-slate-400 text-[10px] uppercase">Enthalpy Formulation (SI)</div>
          <div class="text-amber-400 font-bold">h = 1.006 · T_db + W · (2501 + 1.86 · T_db) [kJ/kg]</div>
        </div>
        <div class="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
          <div class="text-slate-400 text-[10px] uppercase">Humidity Ratio Formulation</div>
          <div class="text-cyan-400 font-bold">W = 0.62198 · p_v / (p_tot - p_v) [kg/kg]</div>
        </div>
      </div>
    </div>

    <!-- Right Card: Educational & Industry Applications -->
    <div class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4 flex flex-col justify-between">
      <div class="space-y-3">
        <div class="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
          <BookOpen class="w-4 h-4" />
          <span class="uppercase tracking-wider">HVAC & Mechanical Engineering Applications</span>
        </div>
        <h3 class="text-lg font-bold text-white">Built for Field Engineers & Students</h3>
        <p class="text-xs text-slate-300 leading-relaxed">
          Whether sizing cooling coils, determining sensible heat ratios (SHR), assessing data center free cooling hours, or evaluating cleanroom dehumidification cycles, PsychroLab provides instant calculation without software installations or heavy spreadsheets.
        </p>

        <ul class="space-y-2 text-xs text-slate-300">
          <li class="flex items-center space-x-2">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <span>Air Handling Unit (AHU) mixed air & coil load calculations</span>
          </li>
          <li class="flex items-center space-x-2">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Evaporative cooling tower wet-bulb approach analysis</span>
          </li>
          <li class="flex items-center space-x-2">
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>Building envelope condensation & dew point risk assessment</span>
          </li>
        </ul>
      </div>

      <div class="pt-4 border-t border-slate-800/80">
        <a
          href="/psych-chart#technical-guide-section"
          class="inline-flex items-center space-x-2 text-xs font-semibold text-blue-400 hover:text-blue-300"
        >
          <span>Read Technical Psychrometric Guide</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </a>
      </div>
    </div>

  </section>

  <!-- ================= FINAL CALL TO ACTION ================= -->
  <section class="rounded-2xl glass-widget p-8 text-center border border-blue-500/30 space-y-4 shadow-2xl relative overflow-hidden">
    <div class="max-w-2xl mx-auto space-y-3">
      <h3 class="text-2xl font-bold text-white">Ready to Perform Psychrometric Calculations?</h3>
      <p class="text-xs text-slate-300">
        Launch the interactive dual-view psychrometric environment and solve complex moist air processes in seconds.
      </p>
      <div class="pt-2">
        <a
          href="/psych-chart"
          class="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all"
        >
          <span>Open Interactive Calculator</span>
          <ArrowRight class="w-4 h-4" />
        </a>
      </div>
    </div>
  </section>

</div>
