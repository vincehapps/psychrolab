<script lang="ts">
  import { ShieldCheck, ArrowLeft, Activity, Compass, LineChart, Code2, Sparkles, BookOpen, Layers, Zap, HeartHandshake } from '@lucide/svelte';
</script>

<svelte:head>
  <title>About PsychroLab — Modern Thermodynamic Engineering Suite</title>
  <meta name="description" content="Learn about PsychroLab, an open engineering workspace for HVAC designers, mechanical engineers, and students building next-generation psychrometric and Mollier tools." />
</svelte:head>

<div class="max-w-4xl mx-auto space-y-12 py-4">

  <!-- ================= HERO HEADER SECTION ================= -->
  <section class="relative overflow-hidden rounded-3xl glass-panel p-8 md:p-12 border border-slate-800 shadow-2xl">
    <!-- Ambient glowing backgrounds matching index page -->
    <div class="absolute -top-24 -left-24 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-24 -right-24 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

    <div class="relative z-10 space-y-4 text-center md:text-left">
      <div>
        <a
          href="/"
          class="inline-flex items-center space-x-1.5 text-xs font-mono font-medium text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ArrowLeft class="w-3.5 h-3.5"/>
          <span>Return to Application</span>
        </a>
      </div>

      <div class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono font-medium block w-fit mx-auto md:mx-0">
        <Sparkles class="w-3.5 h-3.5 text-blue-400"/>
        <span>Engineering Toolsuite & Platform</span>
      </div>

      <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
        Precision Thermodynamic <br class="hidden sm:inline" />
        <span class="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
          Analysis for Everyone
        </span>
      </h1>

      <p class="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
        PsychroLab was created to replace outdated, heavy desktop software with a fast, modern, and accessible web-based workspace for mechanical engineers, HVAC designers, and engineering students.
      </p>
    </div>
  </section>

  <!-- ================= OUR MISSION & OVERVIEW ================= -->
  <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="glass-panel rounded-2xl p-5 border border-slate-800 space-y-2">
      <div class="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
        <LineChart class="w-4 h-4"/>
      </div>
      <h3 class="text-sm font-bold text-white">ASHRAE Standard Math</h3>
      <p class="text-xs text-slate-400 leading-relaxed">
        Built directly on published ASHRAE 2017 Chapter 1 formulations for accurate moist air calculation across standard and high-altitude conditions.
      </p>
    </div>

    <div class="glass-panel rounded-2xl p-5 border border-slate-800 space-y-2">
      <div class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
        <Zap class="w-4 h-4"/>
      </div>
      <h3 class="text-sm font-bold text-white">Zero Installation</h3>
      <p class="text-xs text-slate-400 leading-relaxed">
        Instantly accessible in any modern web browser or tablet without software licenses, heavy installers, or active server requirements.
      </p>
    </div>

    <div class="glass-panel rounded-2xl p-5 border border-slate-800 space-y-2">
      <div class="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
        <Code2 class="w-4 h-4"/>
      </div>
      <h3 class="text-sm font-bold text-white">Modern Developer Stack</h3>
      <p class="text-xs text-slate-400 leading-relaxed">
        Engineered with SvelteKit and client-side execution to ensure instantaneous UI updates, 60 FPS chart interactions, and light resource usage.
      </p>
    </div>
  </section>

  <!-- ================= CORE CAPABILITIES BREAKDOWN ================= -->
  <section class="space-y-6">
    <div class="border-b border-slate-800 pb-3">
      <h2 class="text-lg font-bold text-white tracking-tight">What PsychroLab Solves</h2>
      <p class="text-xs text-slate-400">Targeted tools designed for practical HVAC workflows and academic engineering</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      
      <!-- Feature Card 1 -->
      <div class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
        <div class="flex items-center space-x-2 text-blue-400 font-semibold text-xs font-mono uppercase">
          <Activity class="w-4 h-4 text-blue-400" />
          <span>Coil & Process Load Sizing</span>
        </div>
        <h3 class="text-base font-bold text-white">Sensible & Latent Heat Calculations</h3>
        <p class="text-xs text-slate-300 leading-relaxed">
          Evaluate air handling unit (AHU) cooling coils, heating elements, and humidifiers by analyzing process deltas ($\Delta T_db$, $\Delta W$, $\Delta h$, $\Delta RH$). Compute total coil capacity, sensible heat ratios (SHR), and moisture removal rates instantly.
        </p>
      </div>

      <!-- Feature Card 2 -->
      <div class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
        <div class="flex items-center space-x-2 text-emerald-400 font-semibold text-xs font-mono uppercase">
          <Compass class="w-4 h-4 text-emerald-400" />
          <span>Dual Engineering Diagram Views</span>
        </div>
        <h3 class="text-base font-bold text-white">Carrier Psychrometric & DIN Mollier Charts</h3>
        <p class="text-xs text-slate-300 leading-relaxed">
          Switch effortlessly between standard Carrier-style temperature vs. humidity ratio charts used in North America and oblique enthalpy Mollier ($h$-$x$) diagrams common in European engineering standards (DIN 4107).
        </p>
      </div>

      <!-- Feature Card 3 -->
      <div class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
        <div class="flex items-center space-x-2 text-cyan-400 font-semibold text-xs font-mono uppercase">
          <Layers class="w-4 h-4 text-cyan-400" />
          <span>Custom Altitude & Barometric Controls</span>
        </div>
        <h3 class="text-base font-bold text-white">Off-Standard Atmospheric Pressure</h3>
        <p class="text-xs text-slate-300 leading-relaxed">
          Standard sea-level charts fail at high altitudes. PsychroLab dynamically recalibrates atmospheric pressure and elevation parameters, recomputing moist air density, saturation vapor pressure, and specific volume on the fly.
        </p>
      </div>

      <!-- Feature Card 4 -->
      <div class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
        <div class="flex items-center space-x-2 text-amber-400 font-semibold text-xs font-mono uppercase">
          <BookOpen class="w-4 h-4 text-amber-400" />
          <span>Educational Transparency</span>
        </div>
        <h3 class="text-base font-bold text-white">Built for Students & Instructors</h3>
        <p class="text-xs text-slate-300 leading-relaxed">
          Designed not just to give an answer, but to help students understand thermodynamics. Tabular state outputs provide full parameter breakdowns ($T_db, T_wb, T_dp, RH, W, h, v, p_v$), making textbook problem verification simple.
        </p>
      </div>

    </div>
  </section>

  <!-- ================= TECHNICAL ACCURACY & E-E-A-T STATEMENT ================= -->
  <section class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
    <div class="flex items-center space-x-2 text-white font-bold text-base border-b border-slate-800 pb-3">
      <ShieldCheck class="w-5 h-5 text-emerald-400" />
      <h2>Formulations & Calculation Standards</h2>
    </div>

    <p class="text-xs text-slate-300 leading-relaxed">
      PsychroLab solves moist air properties using high-order polynomial formulations derived from standard thermodynamic relations. Calculations are accurate across freezing ranges (-100°C to 0°C) and normal atmospheric ranges (0°C to 200°C).
    </p>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
      <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
        <span class="text-slate-400 uppercase text-[10px]">Primary Math Baseline</span>
        <div class="text-amber-400 font-bold">2017 ASHRAE Handbook — Fundamentals</div>
      </div>
      <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
        <span class="text-slate-400 uppercase text-[10px]">European Standard Model</span>
        <div class="text-cyan-400 font-bold">DIN 4107 Oblique Enthalpy ($h$-$x$)</div>
      </div>
    </div>
  </section>

  <!-- ================= CONTACT & FEEDBACK CALLOUT ================= -->
  <section class="rounded-2xl glass-widget p-8 text-center border border-blue-500/30 space-y-4 shadow-2xl relative overflow-hidden">
    <div class="max-w-2xl mx-auto space-y-3">
      <div class="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
        <HeartHandshake class="w-5 h-5" />
      </div>
      <h3 class="text-xl font-bold text-white">Have Feedback or Feature Requests?</h3>
      <p class="text-xs text-slate-300 leading-relaxed">
        PsychroLab is continuously evolving. Whether you are an HVAC engineer needing a specific equipment template or a professor with suggestions for classroom features, we welcome your input.
      </p>
      <div class="pt-2">
        <a
          href="mailto:vincenth.apps@gmail.com"
          class="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all"
        >
          <span>Contact Development Desk</span>
        </a>
      </div>
    </div>
  </section>

</div>