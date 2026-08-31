<script lang="ts">
  import { BookOpen, CheckCircle, Flame, Droplets, Snowflake, Wind, Activity, ArrowRight, Gauge, Cpu } from '@lucide/svelte';
</script>

<div class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
  
  <!-- Header -->
  <div class="flex items-center justify-between pb-4 border-b border-slate-800 flex-wrap gap-3">
    <div class="flex items-center space-x-3">
      <div class="p-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl">
        <BookOpen class="w-5 h-5" />
      </div>
      <div>
        <h3 class="text-base font-bold text-white">Engineering Guide to Psychrometric Analysis</h3>
        <p class="text-xs text-slate-400">ASHRAE Fundamentals, Sensible Heat Ratio (SHR) & Real-World HVAC Equipment</p>
      </div>
    </div>

    <a
      href="/mollier"
      class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
    >
      <span>Open Mollier Diagram</span>
      <ArrowRight class="w-3.5 h-3.5" />
    </a>
  </div>

  <!-- Content Sections -->
  <div class="space-y-6 text-sm text-slate-300 leading-relaxed font-sans">
    
    <!-- Section 1: Fundamentals -->
    <section>
      <h4 class="text-sm font-semibold text-white mb-2 flex items-center space-x-2">
        <CheckCircle class="w-4 h-4 text-blue-400" />
        <span>1. Fundamentals of Moist Air & Governing Variables</span>
      </h4>
      <p class="text-xs text-slate-400 mb-3">
        Psychrometrics is the branch of thermodynamics evaluating moist air—a binary mixture of dry air and water vapor. Standard sea-level psychrometric charts and <a href="/mollier" class="text-emerald-400 hover:text-emerald-300 underline font-medium">Mollier diagrams</a> represent state points governed by Dalton's law of partial pressures at 101.325 kPa (14.696 psi).
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
        <div class="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800/80">
          <div class="font-bold text-white">Dry-Bulb Temp (T<sub>db</sub>)</div>
          <div class="text-[11px] text-slate-400">True thermodynamic ambient air temperature.</div>
        </div>
        <div class="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800/80">
          <div class="font-bold text-white">Wet-Bulb Temp (T<sub>wb</sub>)</div>
          <div class="text-[11px] text-slate-400">Dynamic equilibrium temperature reached by adiabatic evaporation.</div>
        </div>
        <div class="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800/80">
          <div class="font-bold text-white">Dew Point Temp (T<sub>dp</sub>)</div>
          <div class="text-[11px] text-slate-400">Saturation temperature where vapor condenses into liquid water.</div>
        </div>
        <div class="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800/80">
          <div class="font-bold text-white">Relative Humidity (RH)</div>
          <div class="text-[11px] text-slate-400">Ratio of partial vapor pressure p<sub>v</sub> to saturation pressure p<sub>ws</sub>.</div>
        </div>
        <div class="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800/80">
          <div class="font-bold text-white">Humidity Ratio (W)</div>
          <div class="text-[11px] text-slate-400">Mass of moisture per unit mass dry air (kg/kg or grains/lb).</div>
        </div>
        <div class="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800/80">
          <div class="font-bold text-white">Enthalpy (h)</div>
          <div class="text-[11px] text-slate-400">Total internal energy content (h = c<sub>pa</sub>T + W·h<sub>g</sub>).</div>
        </div>
      </div>
    </section>

    <!-- Section 2: Sensible Heat Ratio (SHR) -->
    <section class="bg-slate-900/40 p-4 rounded-xl border border-slate-800/90 space-y-3">
      <div class="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
        <Gauge class="w-4 h-4" />
        <span class="uppercase tracking-wider">2. Sensible Heat Ratio (SHR) & Coil Load Vector</span>
      </div>
      <p class="text-xs text-slate-300 leading-relaxed">
        The <strong>Sensible Heat Ratio (SHR)</strong> defines the proportion of sensible cooling capacity to total cooling capacity (sensible + latent) required by a conditioned zone or cooling coil:
      </p>
      
      <div class="p-3 bg-slate-950/90 rounded-lg border border-slate-800 font-mono text-xs text-center space-y-1">
        <div class="text-amber-400 font-bold text-sm">
          SHR = Q<sub>sensible</sub> / Q<sub>total</sub> = Q<sub>sensible</sub> / (Q<sub>sensible</sub> + Q<sub>latent</sub>)
        </div>
        <div class="text-[11px] text-slate-400">
          SHR = (c<sub>pa</sub> · ΔT<sub>db</sub>) / Δh<sub>total</sub>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-sans pt-1">
        <div class="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
          <div class="font-bold text-emerald-400">High SHR (0.85 – 1.0)</div>
          <div class="text-[11px] text-slate-400 mt-0.5">High sensible heat load with negligible moisture addition (e.g. Data Centers, Server Rooms, Dry Climates).</div>
        </div>
        <div class="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
          <div class="font-bold text-blue-400">Standard Comfort SHR (0.70 – 0.80)</div>
          <div class="text-[11px] text-slate-400 mt-0.5">Standard human occupancy with combined sensible heat (lighting, people, envelope) and latent sweat/breathing loads (e.g. Commercial Offices, Classrooms).</div>
        </div>
        <div class="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
          <div class="font-bold text-cyan-400">Low SHR (0.50 – 0.65)</div>
          <div class="text-[11px] text-slate-400 mt-0.5">Heavy latent moisture loads requiring intensive dehumidification (e.g. Indoor Swimming Pools, Hot Yoga Studios, Nightclubs, Kitchens).</div>
        </div>
      </div>
    </section>

    <!-- Section 3: Comprehensive HVAC Processes with Real Equipment -->
    <section class="space-y-3">
      <h4 class="text-sm font-semibold text-white flex items-center space-x-2">
        <CheckCircle class="w-4 h-4 text-cyan-400" />
        <span>3. Thermodynamic Air Conditioning Processes & Real Equipment Examples</span>
      </h4>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        
        <!-- Process A: Sensible Heating -->
        <div class="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
          <div class="flex items-center space-x-2 text-amber-400 font-bold">
            <Flame class="w-4 h-4" />
            <span>Sensible Heating (Horizontal Right: ΔT<sub>db</sub> &gt; 0, ΔW = 0)</span>
          </div>
          <p class="text-slate-300 text-[11px]">
            Heat added to moist air with zero moisture addition. Relative humidity drops while dry-bulb temperature increases at constant absolute humidity.
          </p>
          <div class="pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-400">
            <strong class="text-slate-200">Real Devices:</strong> Electric resistance duct heaters, hot water heating coils (hydronic boiler loops), gas-fired furnace heat exchangers, hydronic perimeter baseboards.
          </div>
        </div>

        <!-- Process B: Sensible Cooling -->
        <div class="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
          <div class="flex items-center space-x-2 text-blue-400 font-bold">
            <Snowflake class="w-4 h-4" />
            <span>Sensible Cooling (Horizontal Left: ΔT<sub>db</sub> &lt; 0, ΔW = 0)</span>
          </div>
          <p class="text-slate-300 text-[11px]">
            Heat removed from air without moisture condensation. The cooling coil surface temperature remains strictly above the entering air dew point temperature (T<sub>coil</sub> &gt; T<sub>dp</sub>).
          </p>
          <div class="pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-400">
            <strong class="text-slate-200">Real Devices:</strong> Chilled water dry coils in high-temperature chilled water systems (radiant chilled ceiling panels), air-to-air plate heat recovery exchangers.
          </div>
        </div>

        <!-- Process C: Cooling & Dehumidification -->
        <div class="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
          <div class="flex items-center space-x-2 text-cyan-400 font-bold">
            <Droplets class="w-4 h-4" />
            <span>Cooling & Dehumidification (Down &amp; Left: ΔT<sub>db</sub> &lt; 0, ΔW &lt; 0)</span>
          </div>
          <p class="text-slate-300 text-[11px]">
            Moist air passes across a coil operating below its entering dew point temperature (T<sub>coil</sub> &lt; T<sub>dp</sub>). Water vapor condenses out as condensate while air temperature drops.
          </p>
          <div class="pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-400">
            <strong class="text-slate-200">Real Devices:</strong> DX (Direct Expansion) evaporator coils in rooftop units (RTU), standard chilled water AHU cooling coils (6°C/12°C chilled water), computer room air conditioners (CRAC).
          </div>
        </div>

        <!-- Process D: Heating & Humidification -->
        <div class="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
          <div class="flex items-center space-x-2 text-emerald-400 font-bold">
            <Activity class="w-4 h-4" />
            <span>Heating & Humidification (Up &amp; Right: ΔT<sub>db</sub> &gt; 0, ΔW &gt; 0)</span>
          </div>
          <p class="text-slate-300 text-[11px]">
            Simultaneous heat and water vapor addition. Often implemented in cold winter climates to prevent excessively dry indoor environments and static shocks.
          </p>
          <div class="pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-400">
            <strong class="text-slate-200">Real Devices:</strong> Isothermal steam injection humidifiers (electrode boiler steam generators, gas-fired steam humidifiers) injected into warm AHU supply airstreams.
          </div>
        </div>

        <!-- Process E: Evaporative Cooling (Adiabatic Saturation) -->
        <div class="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
          <div class="flex items-center space-x-2 text-purple-400 font-bold">
            <Wind class="w-4 h-4" />
            <span>Evaporative Cooling / Adiabatic Saturation (Δh ≈ 0)</span>
          </div>
          <p class="text-slate-300 text-[11px]">
            Liquid water evaporates into the air without external heat addition. Sensible heat is converted into latent heat: dry-bulb temperature drops while humidity ratio rises along constant wet-bulb lines.
          </p>
          <div class="pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-400">
            <strong class="text-slate-200">Real Devices:</strong> Direct evaporative media pads (swamp coolers), open cooling towers, high-pressure ultrasonic atomizing fogging nozzles, adiabatic indirect coolers.
          </div>
        </div>

        <!-- Process F: Chemical Desiccant Dehumidification -->
        <div class="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
          <div class="flex items-center space-x-2 text-orange-400 font-bold">
            <Cpu class="w-4 h-4" />
            <span>Heating & Dehumidification / Desiccant Drying (ΔT<sub>db</sub> &gt; 0, ΔW &lt; 0)</span>
          </div>
          <p class="text-slate-300 text-[11px]">
            Moisture is absorbed by a hygroscopic desiccant medium. Releasing the latent heat of adsorption warms the leaving air while driving humidity ratio to ultra-low dew points (-40°C).
          </p>
          <div class="pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-400">
            <strong class="text-slate-200">Real Devices:</strong> Rotary desiccant dehumidifier wheels (silica gel / molecular sieve rotors in EV lithium battery dry rooms, pharmaceutical cleanrooms).
          </div>
        </div>

      </div>
    </section>

    <!-- Section 4: Psychrometric Chart vs Mollier Diagram Comparison -->
    <section class="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2.5">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-semibold text-white flex items-center space-x-2">
          <CheckCircle class="w-4 h-4 text-emerald-400" />
          <span>4. Carrier Psychrometric Chart vs. Mollier Diagram</span>
        </h4>
        <a
          href="/mollier"
          class="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1"
        >
          <span>Switch to Mollier View</span>
          <ArrowRight class="w-3 h-3" />
        </a>
      </div>
      <p class="text-xs text-slate-300 leading-relaxed">
        While the American <strong>Carrier-style Psychrometric Chart</strong> plots dry-bulb temperature on the horizontal axis and humidity ratio on the vertical axis, European mechanical engineering standards (DIN 4107, VDI 4672) utilize the <a href="/mollier" class="text-emerald-400 hover:text-emerald-300 font-semibold underline">Mollier Diagram (h-x)</a>. In the <a href="/mollier" class="text-emerald-400 hover:text-emerald-300 font-semibold underline">Mollier Diagram</a>, enthalpy (h) lines are tilted obliquely so that the 0°C isotherm lies perfectly horizontal, providing distinct clarity for process direction vectors (Δh/Δx) and steam injection trajectories.
      </p>
    </section>

  </div>

</div>
