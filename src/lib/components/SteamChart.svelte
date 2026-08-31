<script lang="ts">
  import { onMount } from 'svelte';
  import { calculatedSteamPointsStore, activeSteamPointId, updateSteamPoint } from '../steam/steamStore';
  import { settingsStore } from '../stores/appStore';
  import {
    getSaturatedPropertiesSI,
    getSatTemperatureC,
    getSatPressureBar,
    getSuperheatedPropertiesSI,
    CRITICAL_T_C,
    CRITICAL_S,
    CRITICAL_P_BAR
  } from '../steam/steamEngine';
  import {
    Maximize2,
    RotateCcw,
    Layers,
    Share2,
    Eye,
    Activity,
    Compass,
    Sparkles,
    Download
  } from '@lucide/svelte';

  // SVG Chart Dimensions
  const width = 1000;
  const height = 560;
  const margin = { top: 40, right: 60, bottom: 50, left: 70 };

  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  // Domain Ranges: Entropy s [0, 9.5] kJ/kg*K, Temperature T [0, 550] °C
  const sMin = 0;
  const sMax = 9.2;
  const tMin = 0;
  const tMax = 550;

  function sToX(s: number): number {
    return margin.left + ((s - sMin) / (sMax - sMin)) * plotWidth;
  }

  function tToY(t: number): number {
    return margin.top + (1 - (t - tMin) / (tMax - tMin)) * plotHeight;
  }

  function xToS(x: number): number {
    return sMin + ((x - margin.left) / plotWidth) * (sMax - sMin);
  }

  function yToT(y: number): number {
    return tMin + (1 - (y - margin.top) / plotHeight) * (tMax - tMin);
  }

  // Generate Saturation Dome (Liquid boundary sf and Vapor boundary sg)
  let domePath = '';
  let sfPoints: { s: number; t: number; x: number; y: number }[] = [];
  let sgPoints: { s: number; t: number; x: number; y: number }[] = [];

  function generateDome() {
    const ptsSf: string[] = [];
    const ptsSg: string[] = [];
    sfPoints = [];
    sgPoints = [];

    // Step temperatures from 0.01 to 373.94 °C
    for (let t = 0.01; t <= CRITICAL_T_C; t += (t < 300 ? 5 : 1)) {
      const sat = getSaturatedPropertiesSI(t);
      const xf = sToX(sat.sf);
      const yf = tToY(t);
      const xg = sToX(sat.sg);
      const yg = tToY(t);

      ptsSf.push(`${xf.toFixed(1)},${yf.toFixed(1)}`);
      ptsSg.unshift(`${xg.toFixed(1)},${yg.toFixed(1)}`);

      if (Math.round(t) % 50 === 0) {
        sfPoints.push({ s: sat.sf, t, x: xf, y: yf });
        sgPoints.push({ s: sat.sg, t, x: xg, y: yg });
      }
    }

    const criticalX = sToX(CRITICAL_S);
    const criticalY = tToY(CRITICAL_T_C);

    domePath = `M ${ptsSf.join(' L ')} L ${criticalX},${criticalY} L ${ptsSg.join(' L ')} Z`;
  }

  // Generate Isobaric (Constant Pressure) Curves
  interface Isobar {
    pBar: number;
    label: string;
    path: string;
    labelPos: { x: number; y: number };
  }

  const isobarsList: number[] = [0.05, 0.2, 1.0, 5.0, 20.0, 50.0, 100.0, 200.0];
  let isobars: Isobar[] = [];

  function generateIsobars() {
    isobars = isobarsList.map((p) => {
      const tsat = getSatTemperatureC(p);
      const sat = getSaturatedPropertiesSI(tsat);
      const pathPts: string[] = [];

      // 1. Subcooled liquid (from 0°C to Tsat)
      for (let t = 0; t <= tsat; t += Math.max(5, tsat / 10)) {
        const satSub = getSaturatedPropertiesSI(t);
        pathPts.push(`${sToX(satSub.sf).toFixed(1)},${tToY(t).toFixed(1)}`);
      }
      pathPts.push(`${sToX(sat.sf).toFixed(1)},${tToY(tsat).toFixed(1)}`);

      // 2. Phase change inside dome (horizontal at Tsat from sf to sg)
      pathPts.push(`${sToX(sat.sg).toFixed(1)},${tToY(tsat).toFixed(1)}`);

      // 3. Superheated steam (from Tsat to 550°C)
      for (let t = tsat + 10; t <= tMax; t += 20) {
        const sup = getSuperheatedPropertiesSI(p, t);
        pathPts.push(`${sToX(sup.s).toFixed(1)},${tToY(t).toFixed(1)}`);
      }

      const endSup = getSuperheatedPropertiesSI(p, tMax - 30);
      const labelPos = { x: sToX(endSup.s), y: tToY(tMax - 30) };

      return {
        pBar: p,
        label: p >= 1 ? `${p} bar` : `${(p * 100).toFixed(0)} kPa`,
        path: `M ${pathPts.join(' L ')}`,
        labelPos
      };
    });
  }

  // Constant quality curves inside dome (x = 0.2, 0.4, 0.6, 0.8)
  const qualityList = [0.2, 0.4, 0.6, 0.8];
  let qualityLines: { x: number; path: string; labelPos: { x: number; y: number } }[] = [];

  function generateQualityLines() {
    qualityLines = qualityList.map((q) => {
      const pts: string[] = [];
      for (let t = 20; t <= CRITICAL_T_C - 5; t += 10) {
        const sat = getSaturatedPropertiesSI(t);
        const sVal = sat.sf + q * sat.sfg;
        pts.push(`${sToX(sVal).toFixed(1)},${tToY(t).toFixed(1)}`);
      }
      const satLabel = getSaturatedPropertiesSI(120);
      return {
        x: q,
        path: `M ${pts.join(' L ')}`,
        labelPos: { x: sToX(satLabel.sf + q * satLabel.sfg), y: tToY(120) }
      };
    });
  }

  // Live Cursor Crosshair Inspector State
  let cursorX = 0;
  let cursorY = 0;
  let showCrosshair = false;
  let inspectorState = {
    s: 0,
    tC: 0,
    pBar: 0,
    h: 0,
    v: 0,
    xQuality: -1,
    region: 'Superheated'
  };

  function handleMouseMove(e: MouseEvent) {
    const svg = (e.currentTarget as SVGElement).getBoundingClientRect();
    const relX = e.clientX - svg.left;
    const relY = e.clientY - svg.top;

    if (relX < margin.left || relX > width - margin.right || relY < margin.top || relY > height - margin.bottom) {
      showCrosshair = false;
      return;
    }

    showCrosshair = true;
    cursorX = relX;
    cursorY = relY;

    const s = Math.max(sMin, Math.min(sMax, xToS(relX)));
    const tC = Math.max(tMin, Math.min(tMax, yToT(relY)));

    // Determine region and state
    if (tC <= CRITICAL_T_C) {
      const sat = getSaturatedPropertiesSI(tC);
      if (s < sat.sf) {
        // Subcooled
        inspectorState = {
          s: Number(s.toFixed(3)),
          tC: Number(tC.toFixed(1)),
          pBar: Number((sat.pPa / 1e5).toFixed(3)),
          h: Number(sat.hf.toFixed(1)),
          v: Number(sat.vf.toFixed(5)),
          xQuality: -1,
          region: 'Subcooled Liquid'
        };
      } else if (s > sat.sg) {
        // Superheated
        const pEst = Math.max(0.01, getSatPressureBar(tC) * 0.8);
        const sup = getSuperheatedPropertiesSI(pEst, tC);
        inspectorState = {
          s: Number(s.toFixed(3)),
          tC: Number(tC.toFixed(1)),
          pBar: Number(pEst.toFixed(3)),
          h: Number(sup.h.toFixed(1)),
          v: Number(sup.v.toFixed(4)),
          xQuality: -1,
          region: 'Superheated Vapor'
        };
      } else {
        // Saturated mixture inside dome
        const q = (s - sat.sf) / sat.sfg;
        const h = sat.hf + q * sat.hfg;
        const v = sat.vf + q * (sat.vg - sat.vf);
        inspectorState = {
          s: Number(s.toFixed(3)),
          tC: Number(tC.toFixed(1)),
          pBar: Number((sat.pPa / 1e5).toFixed(3)),
          h: Number(h.toFixed(1)),
          v: Number(v.toFixed(4)),
          xQuality: Number(q.toFixed(3)),
          region: `Saturated Mixture (x=${(q * 100).toFixed(0)}%)`
        };
      }
    } else {
      // Supercritical
      inspectorState = {
        s: Number(s.toFixed(3)),
        tC: Number(tC.toFixed(1)),
        pBar: 230,
        h: 2400,
        v: 0.005,
        xQuality: -1,
        region: 'Supercritical Fluid'
      };
    }
  }

  function handleMouseLeave() {
    showCrosshair = false;
  }

  // Display toggles
  let showIsobars = true;
  let showQuality = true;
  let showCyclePath = true;

  onMount(() => {
    generateDome();
    generateIsobars();
    generateQualityLines();
  });

  $: isIP = $settingsStore.unitSystem === 'IP';

  // SVG Export
  function exportDiagram() {
    const svgElement = document.getElementById('steam-chart-svg');
    if (!svgElement) return;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'steam-ts-diagram.svg';
    link.click();
    URL.revokeObjectURL(url);
  }
</script>

<div class="glass-panel rounded-2xl p-4 md:p-6 border border-slate-800 space-y-4">
  
  <!-- Header Bar -->
  <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
    <div class="flex items-center space-x-3">
      <div class="p-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl shadow-inner">
        <Compass class="w-5 h-5" />
      </div>
      <div>
        <div class="flex items-center space-x-2">
          <h2 class="text-base font-bold text-white tracking-tight">Interactive Temperature–Entropy (T–s) Steam Diagram</h2>
          <span class="px-2 py-0.5 text-[10px] font-mono uppercase font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-full">
            IAPWS Standard
          </span>
        </div>
        <p class="text-xs text-slate-400 font-sans">
          Saturation dome, isobaric boiling lines, vapor quality contours, and Rankine cycle analysis
        </p>
      </div>
    </div>

    <!-- Toolbar controls -->
    <div class="flex items-center space-x-2 flex-wrap gap-1">
      <button
        type="button"
        on:click={() => (showIsobars = !showIsobars)}
        class="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors {showIsobars ? 'bg-blue-600/20 border-blue-500/40 text-blue-300' : 'bg-slate-900 border-slate-800 text-slate-400'}"
      >
        <Layers class="w-3.5 h-3.5" />
        <span>Isobars</span>
      </button>

      <button
        type="button"
        on:click={() => (showQuality = !showQuality)}
        class="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors {showQuality ? 'bg-cyan-600/20 border-cyan-500/40 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'}"
      >
        <Activity class="w-3.5 h-3.5" />
        <span>Quality (x)</span>
      </button>

      <button
        type="button"
        on:click={() => (showCyclePath = !showCyclePath)}
        class="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors {showCyclePath ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'}"
      >
        <Sparkles class="w-3.5 h-3.5" />
        <span>Cycle Path</span>
      </button>

      <button
        type="button"
        on:click={exportDiagram}
        title="Export SVG Diagram"
        class="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-300 hover:text-white transition-colors"
      >
        <Download class="w-4 h-4" />
      </button>
    </div>
  </div>

  <!-- Live Cursor Inspector HUD Strip -->
  <div class="grid grid-cols-2 sm:grid-cols-6 gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 font-mono text-xs">
    <div>
      <span class="text-[10px] text-slate-500 uppercase block">Temperature (T)</span>
      <span class="text-amber-400 font-bold">
        {showCrosshair ? (isIP ? ((inspectorState.tC * 9) / 5 + 32).toFixed(1) + ' °F' : inspectorState.tC.toFixed(1) + ' °C') : '—'}
      </span>
    </div>
    <div>
      <span class="text-[10px] text-slate-500 uppercase block">Entropy (s)</span>
      <span class="text-blue-400 font-bold">
        {showCrosshair ? (isIP ? (inspectorState.s * 0.2388).toFixed(4) + ' Btu/lb·R' : inspectorState.s.toFixed(4) + ' kJ/kg·K') : '—'}
      </span>
    </div>
    <div>
      <span class="text-[10px] text-slate-500 uppercase block">Pressure (P)</span>
      <span class="text-cyan-400 font-bold">
        {showCrosshair ? (isIP ? (inspectorState.pBar * 14.5038).toFixed(2) + ' psi' : inspectorState.pBar.toFixed(3) + ' bar') : '—'}
      </span>
    </div>
    <div>
      <span class="text-[10px] text-slate-500 uppercase block">Enthalpy (h)</span>
      <span class="text-emerald-400 font-bold">
        {showCrosshair ? (isIP ? (inspectorState.h * 0.4299).toFixed(1) + ' Btu/lb' : inspectorState.h.toFixed(1) + ' kJ/kg') : '—'}
      </span>
    </div>
    <div>
      <span class="text-[10px] text-slate-500 uppercase block">Vapor Quality (x)</span>
      <span class="text-purple-400 font-bold">
        {showCrosshair ? (inspectorState.xQuality >= 0 ? (inspectorState.xQuality * 100).toFixed(1) + '%' : 'Superheated') : '—'}
      </span>
    </div>
    <div>
      <span class="text-[10px] text-slate-500 uppercase block">Fluid Region</span>
      <span class="text-white font-bold truncate">
        {showCrosshair ? inspectorState.region : 'Hover diagram'}
      </span>
    </div>
  </div>

  <!-- Interactive SVG Canvas -->
  <div class="relative w-full overflow-x-auto select-none rounded-xl bg-[#070d1e] border border-slate-800">
    <svg
      id="steam-chart-svg"
      viewBox="0 0 {width} {height}"
      class="w-full h-auto cursor-crosshair"
      on:mousemove={handleMouseMove}
      on:mouseleave={handleMouseLeave}
    >
      <defs>
        <linearGradient id="domeFillGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="#0284c7" stop-opacity="0.15" />
          <stop offset="70%" stop-color="#3b82f6" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#6366f1" stop-opacity="0.4" />
        </linearGradient>

        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Grid Lines -->
      <!-- Vertical Entropy Grid Lines -->
      {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as sVal}
        <line
          x1={sToX(sVal)}
          y1={margin.top}
          x2={sToX(sVal)}
          y2={height - margin.bottom}
          stroke="#1e293b"
          stroke-width="1"
          stroke-dasharray="2,2"
        />
        <text
          x={sToX(sVal)}
          y={height - margin.bottom + 18}
          fill="#64748b"
          font-size="10"
          font-family="monospace"
          text-anchor="middle"
        >
          {sVal}
        </text>
      {/each}

      <!-- Horizontal Temperature Grid Lines -->
      {#each [50, 100, 150, 200, 250, 300, 350, 400, 450, 500] as tVal}
        <line
          x1={margin.left}
          y1={tToY(tVal)}
          x2={width - margin.right}
          y2={tToY(tVal)}
          stroke="#1e293b"
          stroke-width="1"
          stroke-dasharray="2,2"
        />
        <text
          x={margin.left - 8}
          y={tToY(tVal) + 3}
          fill="#64748b"
          font-size="10"
          font-family="monospace"
          text-anchor="end"
        >
          {isIP ? Math.round((tVal * 9) / 5 + 32) : tVal}
        </text>
      {/each}

      <!-- Saturation Dome Bell Curve Fill & Stroke -->
      {#if domePath}
        <path d={domePath} fill="url(#domeFillGrad)" stroke="#38bdf8" stroke-width="2.5" />
      {/if}

      <!-- Critical Point Marker (Tc = 373.95°C, s = 4.407) -->
      <circle
        cx={sToX(CRITICAL_S)}
        cy={tToY(CRITICAL_T_C)}
        r="4.5"
        fill="#f43f5e"
        stroke="#ffffff"
        stroke-width="1.5"
        filter="url(#glow)"
      />
      <text
        x={sToX(CRITICAL_S)}
        y={tToY(CRITICAL_T_C) - 10}
        fill="#f43f5e"
        font-size="10"
        font-weight="bold"
        font-family="monospace"
        text-anchor="middle"
      >
        Critical Point (374°C, 220.6 bar)
      </text>

      <!-- Constant Quality Lines inside Dome -->
      {#if showQuality}
        {#each qualityLines as qLine}
          <path
            d={qLine.path}
            fill="none"
            stroke="#a855f7"
            stroke-width="1.2"
            stroke-dasharray="3,3"
            stroke-opacity="0.75"
          />
          <text
            x={qLine.labelPos.x}
            y={qLine.labelPos.y}
            fill="#c084fc"
            font-size="9"
            font-family="monospace"
            text-anchor="middle"
          >
            x={(qLine.x * 100).toFixed(0)}%
          </text>
        {/each}
      {/if}

      <!-- Isobaric Constant Pressure Lines -->
      {#if showIsobars}
        {#each isobars as isobar}
          <path
            d={isobar.path}
            fill="none"
            stroke="#0ea5e9"
            stroke-width="1.2"
            stroke-opacity="0.8"
          />
          <text
            x={isobar.labelPos.x + 4}
            y={isobar.labelPos.y - 2}
            fill="#38bdf8"
            font-size="9"
            font-family="monospace"
            font-weight="600"
          >
            {isobar.label}
          </text>
        {/each}
      {/if}

      <!-- Thermodynamic Cycle Path Connecting State Points (Rankine Path) -->
      {#if showCyclePath && $calculatedSteamPointsStore.length > 1}
        {@const cyclePts = $calculatedSteamPointsStore.map((pt) => `${sToX(pt.s).toFixed(1)},${tToY(pt.tC).toFixed(1)}`)}
        <polygon
          points={cyclePts.join(' ')}
          fill="none"
          stroke="#10b981"
          stroke-width="2.5"
          stroke-dasharray="5,3"
          stroke-opacity="0.9"
        />
      {/if}

      <!-- Render State Points -->
      {#each $calculatedSteamPointsStore as pt, idx (pt.id)}
        {@const px = sToX(pt.s)}
        {@const py = tToY(pt.tC)}
        <g
          class="cursor-pointer transition-transform hover:scale-125"
          on:click={() => activeSteamPointId.set(pt.id)}
        >
          <!-- Outer Pulse Glow -->
          <circle
            cx={px}
            cy={py}
            r="8"
            fill={pt.color}
            fill-opacity="0.25"
            stroke={pt.color}
            stroke-width="1"
          />
          <!-- Core Center Dot -->
          <circle
            cx={px}
            cy={py}
            r="4.5"
            fill={pt.color}
            stroke="#ffffff"
            stroke-width="1.5"
            filter="url(#glow)"
          />
          <!-- State Label Badge -->
          <rect
            x={px + 8}
            y={py - 12}
            width="44"
            height="18"
            rx="4"
            fill="#0f172a"
            fill-opacity="0.9"
            stroke={pt.color}
            stroke-width="1"
          />
          <text
            x={px + 30}
            y={py}
            fill="#ffffff"
            font-size="9"
            font-weight="bold"
            font-family="monospace"
            text-anchor="middle"
          >
            {pt.id}
          </text>
        </g>
      {/each}

      <!-- Live Cursor Crosshairs -->
      {#if showCrosshair}
        <line
          x1={cursorX}
          y1={margin.top}
          x2={cursorX}
          y2={height - margin.bottom}
          stroke="#38bdf8"
          stroke-width="1"
          stroke-dasharray="3,3"
          stroke-opacity="0.8"
        />
        <line
          x1={margin.left}
          y1={cursorY}
          x2={width - margin.right}
          y2={cursorY}
          stroke="#38bdf8"
          stroke-width="1"
          stroke-dasharray="3,3"
          stroke-opacity="0.8"
        />
        <circle cx={cursorX} cy={cursorY} r="4" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" />
      {/if}

      <!-- Axis Labels -->
      <!-- X Axis Label -->
      <text
        x={width / 2}
        y={height - 12}
        fill="#94a3b8"
        font-size="11"
        font-weight="600"
        font-family="monospace"
        text-anchor="middle"
      >
        Specific Entropy s [{isIP ? 'Btu / (lb · °R)' : 'kJ / (kg · K)'}]
      </text>

      <!-- Y Axis Label -->
      <text
        x={-(height / 2)}
        y={20}
        transform="rotate(-90)"
        fill="#94a3b8"
        font-size="11"
        font-weight="600"
        font-family="monospace"
        text-anchor="middle"
      >
        Temperature T [{isIP ? '°F' : '°C'}]
      </text>
    </svg>
  </div>

</div>
