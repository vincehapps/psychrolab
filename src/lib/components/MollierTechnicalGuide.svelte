<script lang="ts">
  import { BookOpen, CheckCircle, Flame, Droplets, Snowflake, Wind, Activity, ArrowRight, Gauge, Cpu, Compass, LineChart } from '@lucide/svelte';
</script>

<div class="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
  
  <!-- Header -->
  <div class="flex items-center justify-between pb-4 border-b border-slate-800 flex-wrap gap-3">
    <div class="flex items-center space-x-3">
      <div class="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
        <Compass class="w-5 h-5" />
      </div>
      <div>
        <h3 class="text-base font-bold text-white">Engineering Guide to Mollier Diagram (h-x) Analysis</h3>
        <p class="text-xs text-slate-400">DIN 4107 European Standards, Oblique Enthalpy Axes & Real-World HVAC Equipment</p>
      </div>
    </div>

    <a
      href="/psych-chart"
      class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
    >
      <LineChart class="w-3.5 h-3.5" />
      <span>Switch to Psychrometric View</span>
      <ArrowRight class="w-3.5 h-3.5" />
    </a>
  </div>

  <!-- Content Sections -->
  <div class="space-y-6 text-sm text-slate-300 leading-relaxed font-sans">
    
    <!-- Section 1: Fundamentals of Mollier Diagram -->
    <section>
      <h4 class="text-sm font-semibold text-white mb-2 flex items-center space-x-2">
        <CheckCircle class="w-4 h-4 text-emerald-400" />
        <span>1. Principles of the Mollier (h-x) Coordinate System</span>
      </h4>
      <p class="text-xs text-slate-400 mb-3">
        Developed by German physicist Richard Mollier in 1923, the <strong>Mollier h-x diagram</strong> is the standard thermodynamic representation for moist air across European mechanical engineering (DIN 4107, VDI 4672). Unlike the rectangular <a href="/psych-chart" class="text-blue-400 hover:text-blue-300 underline font-medium">Carrier psychrometric chart</a>, the Mollier diagram uses an <em>oblique coordinate transformation</em> where lines of constant enthalpy (h) slope downward so the 0°C dry-bulb isotherm lies strictly horizontal.
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
        <div class="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800/80">
          <div class="font-bold text-white">Specific Enthalpy (h)</div>
          <div class="text-[11px] text-slate-400">Oblique diagonal grid lines (kJ/kg or Btu/lb).</div>
        </div>
        <div class="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800/80">
          <div class="font-bold text-white">Absolute Humidity (x)</div>
          <div class="text-[11px] text-slate-400">Vertical grid lines (kg water/kg dry air or grains/lb).</div>
        </div>
        <div class="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800/80">
          <div class="font-bold text-white">Isotherms (θ)</div>
          <div class="text-[11px] text-slate-400">Dry-bulb lines with positive slope in unsaturated zone.</div>
        </div>
        <div class="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800/80">
          <div class="font-bold text-white">Saturation Line (φ=100%)</div>
          <div class="text-[11px] text-slate-400">Boundary separating clear moist air from the supersaturated fog region.</div>
        </div>
        <div class="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800/80">
          <div class="font-bold text-white">Wet Thermometer (θ<sub>v</sub>)</div>
          <div class="text-[11px] text-slate-400">Equilibrium wet-bulb temperature along saturation curve.</div>
        </div>
        <div class="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800/80">
          <div class="font-bold text-white">Process Gradient (Δh/Δx)</div>
          <div class="text-[11px] text-slate-400">Enthalpy direction vector determining coil / steam process angle.</div>
        </div>
      </div>
    </section>

    <!-- Section 2: Sensible Heat Ratio (SHR) & Enthalpy Gradient -->
    <section class="bg-slate-900/40 p-4 rounded-xl border border-slate-800/90 space-y-3">
      <div class="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
        <Gauge class="w-4 h-4" />
        <span class="uppercase tracking-wider">2. Enthalpy Gradient (Δh/Δx) & Sensible Heat Ratio (SHR)</span>
      </div>
      <p class="text-xs text-slate-300 leading-relaxed">
        On a Mollier diagram, process lines follow the direction of the <strong>enthalpy-to-moisture gradient (Δh/Δx)</strong>. In HVAC coil design, this directly correlates to the <strong>Sensible Heat Ratio (SHR)</strong>:
      </p>
      
      <div class="p-3 bg-slate-950/90 rounded-lg border border-slate-800 font-mono text-xs text-center space-y-1">
        <div class="text-amber-400 font-bold text-sm">
          Δh/Δx = (h<sub>2</sub> - h<sub>1</sub>) / (x<sub>2</sub> - x<sub>1</sub>) [kJ / kg moisture]
        </div>
        <div class="text-[11px] text-slate-400">
          SHR = Q<sub>sensible</sub> / Q<sub>total</sub> = (c<sub>pa</sub> · Δθ) / Δh<sub>total</sub>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-sans pt-1">
        <div class="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
          <div class="font-bold text-emerald-400">High SHR (0.85 – 1.0)</div>
          <div class="text-[11px] text-slate-400 mt-0.5">High sensible heat load with minimal moisture exchange (e.g. Data Centers, Switch Rooms, Dry Climates).</div>
        </div>
        <div class="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
          <div class="font-bold text-blue-400">Comfort Range SHR (0.70 – 0.80)</div>
          <div class="text-[11px] text-slate-400 mt-0.5">Combined sensible transmission/solar loads and human metabolic moisture generation (Commercial Offices, Classrooms).</div>
        </div>
        <div class="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
          <div class="font-bold text-cyan-400">Low SHR (0.50 – 0.65)</div>
          <div class="text-[11px] text-slate-400 mt-0.5">Intensive latent dehumidification demands (Indoor Aquatic Centers, Hot Yoga, Commercial Kitchens).</div>
        </div>
      </div>
    </section>

    <!-- Section 3: Thermodynamic Processes with Real Equipment -->
    <section class="space-y-3">
      <h4 class="text-sm font-semibold text-white flex items-center space-x-2">
        <CheckCircle class="w-4 h-4 text-cyan-400" />
        <span>3. Mollier Air Conditioning Process Vectors & Real Equipment Examples</span>
      </h4>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        
        <!-- Process A: Sensible Heating -->
        <div class="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
          <div class="flex items-center space-x-2 text-amber-400 font-bold">
            <Flame class="w-4 h-4" />
            <span>Sensible Heating (Upward along vertical x line: Δθ &gt; 0, Δx = 0)</span>
          </div>
          <p class="text-slate-300 text-[11px]">
            Air is heated at constant absolute moisture content. The state point moves upward across isotherms while relative humidity φ drops.
          </p>
          <div class="pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-400">
            <strong class="text-slate-200">Real Devices:</strong> Electric finned duct heaters, hydronic heating coils (central boiler loops), gas-fired warm air furnaces, perimeter convection radiators.
          </div>
        </div>

        <!-- Process B: Sensible Cooling -->
        <div class="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
          <div class="flex items-center space-x-2 text-blue-400 font-bold">
            <Snowflake class="w-4 h-4" />
            <span>Sensible Cooling (Downward along vertical x line: Δθ &lt; 0, Δx = 0)</span>
          </div>
          <p class="text-slate-300 text-[11px]">
            Heat removed without moisture condensation. The cooling coil surface remains above the entering air dew point (θ<sub>coil</sub> &gt; θ<sub>dp</sub>).
          </p>
          <div class="pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-400">
            <strong class="text-slate-200">Real Devices:</strong> Chilled ceiling radiant panels, sensible air-to-air plate heat recovery units, dry chilled water coils in warm return air paths.
          </div>
        </div>

        <!-- Process C: Cooling & Dehumidification -->
        <div class="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
          <div class="flex items-center space-x-2 text-cyan-400 font-bold">
            <Droplets class="w-4 h-4" />
            <span>Cooling & Dehumidification (Down &amp; Left: Δθ &lt; 0, Δx &lt; 0)</span>
          </div>
          <p class="text-slate-300 text-[11px]">
            Air passes across a cold coil below the entering dew point (θ<sub>coil</sub> &lt; θ<sub>dp</sub>). Moisture condenses out as water while enthalpy and temperature decrease.
          </p>
          <div class="pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-400">
            <strong class="text-slate-200">Real Devices:</strong> Direct Expansion (DX) evaporator coils in rooftop units (RTU), chilled water AHU cooling coils (6°C supply / 12°C return), computer room air handlers (CRAH).
          </div>
        </div>

        <!-- Process D: Heating & Humidification -->
        <div class="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
          <div class="flex items-center space-x-2 text-emerald-400 font-bold">
            <Activity class="w-4 h-4" />
            <span>Heating & Humidification / Steam Injection (Up &amp; Right: Δθ &gt; 0, Δx &gt; 0)</span>
          </div>
          <p class="text-slate-300 text-[11px]">
            Simultaneous heat and water vapor injection. On a Mollier diagram, steam humidification follows a steep upward gradient corresponding to steam enthalpy (h<sub>steam</sub> ≈ 2680 kJ/kg).
          </p>
          <div class="pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-400">
            <strong class="text-slate-200">Real Devices:</strong> Electrode boiler steam humidifiers, gas-fired steam dispersion manifolds, pressurized boiler steam injection nozzles in AHU supply ducts.
          </div>
        </div>

        <!-- Process E: Evaporative Cooling (Adiabatic Saturation) -->
        <div class="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
          <div class="flex items-center space-x-2 text-purple-400 font-bold">
            <Wind class="w-4 h-4" />
            <span>Evaporative Cooling / Adiabatic Humidification (Parallel to h lines: Δh ≈ 0)</span>
          </div>
          <p class="text-slate-300 text-[11px]">
            Water evaporates into the air without net heat exchange. State point moves down and to the right parallel to constant enthalpy (h) guidelines toward the saturation line.
          </p>
          <div class="pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-400">
            <strong class="text-slate-200">Real Devices:</strong> Direct evaporative wet media pads (swamp coolers), open cooling towers, high-pressure water fogging nozzles, adiabatic air washers.
          </div>
        </div>

        <!-- Process F: Desiccant Dehumidification -->
        <div class="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
          <div class="flex items-center space-x-2 text-orange-400 font-bold">
            <Cpu class="w-4 h-4" />
            <span>Chemical Desiccant Dehumidification (Δθ &gt; 0, Δx &lt; 0)</span>
          </div>
          <p class="text-slate-300 text-[11px]">
            Adsorption of moisture by hygroscopic media releasing heat of sorption. Air temperature rises while moisture content drops to ultra-low dew points (-40°C).
          </p>
          <div class="pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-400">
            <strong class="text-slate-200">Real Devices:</strong> Rotary desiccant wheels (silica gel / zeolite rotors in lithium battery dry rooms, pharmaceutical tablet coating suites).
          </div>
        </div>

      </div>
    </section>

    <!-- Section 4: Mollier vs Carrier Psychrometric Chart Comparison -->
    <section class="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2.5">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-semibold text-white flex items-center space-x-2">
          <CheckCircle class="w-4 h-4 text-blue-400" />
          <span>4. Mollier Diagram vs. Carrier Psychrometric Chart</span>
        </h4>
        <a
          href="/psych-chart"
          class="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
        >
          <LineChart class="w-3 h-3" />
          <span>Switch to Psychrometric View</span>
          <ArrowRight class="w-3 h-3" />
        </a>
      </div>
      <p class="text-xs text-slate-300 leading-relaxed">
        While the American <a href="/psych-chart" class="text-blue-400 hover:text-blue-300 font-semibold underline">Carrier Psychrometric Chart</a> plots dry-bulb temperature along the horizontal axis and humidity ratio vertically, the European <strong>Mollier Diagram (h-x)</strong> aligns absolute moisture on the vertical grid lines and tilts the enthalpy axis obliquely. This enables direct geometric construction of steam addition lines and mixing vectors without needing oblique auxiliary protractor scales.
      </p>
    </section>

  </div>

</div>
