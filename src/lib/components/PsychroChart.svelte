<script lang="ts">
  import { pointsInputStore, computedPointsStore, settingsStore } from '../stores/appStore';
  import { getSatVaporPressureSI, getHumRatioFromVapPress, calculateStatePointSI, solveStatePointFromPairSI } from '../psychrometrics/engine';
  import { cToF, fToC, getStandardAtmosphericPressureSI, psiTokPa, feetToMeters } from '../psychrometrics/unitConverter';
  import { scaleLinear } from 'd3-scale';
  import { Eye, Crosshair, Sparkles } from '@lucide/svelte';

  $: isSI = $settingsStore.unitSystem === 'SI';

  // Pressure in Pa
  $: pPa = isSI
    ? ($settingsStore.pressure ? $settingsStore.pressure * 1000 : getStandardAtmosphericPressureSI($settingsStore.elevation))
    : ($settingsStore.pressure ? psiTokPa($settingsStore.pressure) * 1000 : getStandardAtmosphericPressureSI(feetToMeters($settingsStore.elevation)));

  // Temperature Range
  $: tMin = isSI ? 0 : 32;
  $: tMax = isSI ? 50 : 120;

  // Humidity Ratio Range
  $: wMin = 0;
  $: wMax = isSI ? 0.030 : 210; // kg/kg for SI, grains/lb for IP

  // Chart dimensions
  const width = 850;
  const height = 500;
  const margin = { top: 40, right: 60, bottom: 50, left: 65 };

  $: innerWidth = width - margin.left - margin.right;
  $: innerHeight = height - margin.top - margin.bottom;

  // D3 Scales
  $: xScale = scaleLinear().domain([tMin, tMax]).range([0, innerWidth]);
  $: yScale = scaleLinear().domain([wMin, wMax]).range([innerHeight, 0]);

  // Saturation curve points
  $: satCurvePath = (() => {
    const points: string[] = [];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const tDisp = tMin + (i / steps) * (tMax - tMin);
      const tSI = isSI ? tDisp : fToC(tDisp);
      const pws = getSatVaporPressureSI(tSI);
      const wSI = getHumRatioFromVapPress(pws, pPa);
      const wDisp = isSI ? wSI : wSI * 7000;
      
      const x = xScale(tDisp);
      const y = yScale(Math.min(wMax, wDisp));
      points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return points.join(' ');
  })();

  // RH Curves (10% to 90%)
  $: rhCurves = [10, 20, 30, 40, 50, 60, 70, 80, 90].map((rh) => {
    const points: { x: number; y: number }[] = [];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const tDisp = tMin + (i / steps) * (tMax - tMin);
      const tSI = isSI ? tDisp : fToC(tDisp);
      const pws = getSatVaporPressureSI(tSI);
      const pv = (rh / 100) * pws;
      const wSI = getHumRatioFromVapPress(pv, pPa);
      const wDisp = isSI ? wSI : wSI * 7000;

      const x = xScale(tDisp);
      const y = yScale(Math.min(wMax, wDisp));
      points.push({ x, y });
    }

    const path = points.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');

    // Position label around mid-right of the curve for maximum readability
    const labelIdx = Math.floor(points.length * 0.65);
    const pLabel = points[labelIdx];
    const pPrev = points[Math.max(0, labelIdx - 2)];
    const pNext = points[Math.min(points.length - 1, labelIdx + 2)];

    const dx = pNext.x - pPrev.x;
    const dy = pNext.y - pPrev.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    return { rh, path, labelPt: { x: pLabel.x, y: pLabel.y, angle } };
  });

  // Vertical Tdb Grid lines
  $: tGrid = (() => {
    const step = isSI ? 5 : 10;
    const ticks: number[] = [];
    for (let t = tMin; t <= tMax; t += step) {
      ticks.push(t);
    }
    return ticks;
  })();

  // Horizontal W Grid lines
  $: wGrid = (() => {
    const step = isSI ? 0.005 : 30;
    const ticks: number[] = [];
    for (let w = wMin; w <= wMax; w += step) {
      ticks.push(w);
    }
    return ticks;
  })();

  // Constant Enthalpy Guidelines (h lines in increments of 5)
  $: enthalpyLines = (() => {
    const hMinVal = isSI ? 10 : 5;
    const hMaxVal = isSI ? 130 : 55;
    const hStep = 5;

    const hValues: number[] = [];
    for (let h = hMinVal; h <= hMaxVal; h += hStep) {
      hValues.push(h);
    }

    return hValues.map((hVal) => {
      const points: { x: number; y: number; tDisp: number; wDisp: number }[] = [];
      const steps = 60;
      let satIntersect: { x: number; y: number; angle: number } | null = null;

      for (let i = 0; i <= steps; i++) {
        const tDisp = tMin + (i / steps) * (tMax - tMin);
        const tSI = isSI ? tDisp : fToC(tDisp);
        const hSI = isSI ? hVal : hVal / 0.4299;
        
        // Solve W from h and T
        const wSI = (hSI - 1.006 * tSI) / (2501 + 1.86 * tSI);
        const wDisp = isSI ? wSI : wSI * 7000;

        // Check saturation W at this temperature
        const pws = getSatVaporPressureSI(tSI);
        const wSatSI = getHumRatioFromVapPress(pws, pPa);
        const wSatDisp = isSI ? wSatSI : wSatSI * 7000;

        const x = xScale(tDisp);
        const y = yScale(Math.min(wMax, wDisp));

        // Line is inside chart domain and below/at saturation curve
        if (wDisp >= wMin && wDisp <= wMax && wDisp <= wSatDisp + 0.001) {
          points.push({ x, y, tDisp, wDisp });
        }
      }

      if (points.length < 2) return null;

      const pFirst = points[0];
      const pNext = points[Math.min(5, points.length - 1)];
      const dx = pNext.x - pFirst.x;
      const dy = pNext.y - pFirst.y;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      // Label placed right near the top-left saturation line intersection
      satIntersect = {
        x: pFirst.x,
        y: pFirst.y,
        angle
      };

      const pathD = points.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');

      return { val: hVal, path: pathD, satIntersect };
    }).filter(Boolean);
  })();

  // Live Cursor Inspector State
  let cursorX = 0;
  let cursorY = 0;
  let isHovering = false;
  let cursorReadout: {
    dbt: number;
    w: number;
    rh: number;
    enthalpy: number;
    wbt: number;
    dpt: number;
  } | null = null;

  import { updatePointInput } from '../stores/appStore';
  import type { PropertyType } from '../psychrometrics/types';

  let draggingPointId: string | null = null;

  function handleDragStart(e: MouseEvent, id: string) {
    e.stopPropagation();
    draggingPointId = id;
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  }

  function handleWindowMouseMove(e: MouseEvent) {
    if (!draggingPointId) return;

    const svgEl = document.querySelector('#psychro-svg-canvas');
    if (!svgEl) return;
    const svgRect = svgEl.getBoundingClientRect();

    const scaleX = width / svgRect.width;
    const scaleY = height / svgRect.height;

    const mouseSvgX = (e.clientX - svgRect.left) * scaleX - margin.left;
    const mouseSvgY = (e.clientY - svgRect.top) * scaleY - margin.top;

    const clampedX = Math.max(0, Math.min(innerWidth, mouseSvgX));
    const clampedY = Math.max(0, Math.min(innerHeight, mouseSvgY));

    const newT = Number(xScale.invert(clampedX).toFixed(1));
    const newW = Number(yScale.invert(clampedY).toFixed(isSI ? 4 : 1));

    const pt = $computedPointsStore.find((p) => p.id === draggingPointId);
    const inputPt = $pointsInputStore.find((p) => p.id === draggingPointId);
    if (!pt || !inputPt) return;

    const t1 = inputPt.type1 || 'DBT';
    const t2 = inputPt.type2 || 'RH';

    const getPropValFromCalculated = (prop: PropertyType, cPt: typeof pt): number => {
      switch (prop) {
        case 'DBT': return cPt.dbt;
        case 'WBT': return cPt.wbt;
        case 'DPT': return cPt.dpt;
        case 'RH': return cPt.rh;
        case 'HUMRAT': return cPt.humRat;
        case 'ENTHALPY': return cPt.enthalpy;
      }
    };

    // Calculate full point state from canvas position (newT, newW)
    const tSI = isSI ? newT : fToC(newT);
    const wSI = isSI ? newW : newW / 7000;
    const solvedSI = solveStatePointFromPairSI('DBT', tSI, 'HUMRAT', wSI, pPa);

    // Format calculated values into display units
    const calcPtDisplay = isSI
      ? {
          dbt: Number(solvedSI.dbt.toFixed(1)),
          wbt: Number(solvedSI.wbt.toFixed(1)),
          dpt: Number(solvedSI.dpt.toFixed(1)),
          rh: Number(solvedSI.rh.toFixed(1)),
          humRat: Number(solvedSI.humRat.toFixed(4)),
          enthalpy: Number(solvedSI.enthalpy.toFixed(1))
        }
      : {
          dbt: Number(cToF(solvedSI.dbt).toFixed(1)),
          wbt: Number(cToF(solvedSI.wbt).toFixed(1)),
          dpt: Number(cToF(solvedSI.dpt).toFixed(1)),
          rh: Number(solvedSI.rh.toFixed(1)),
          humRat: Number((solvedSI.humRat * 7000).toFixed(1)),
          enthalpy: Number((solvedSI.enthalpy * 0.4299).toFixed(1))
        };

    updatePointInput(draggingPointId, {
      val1: getPropValFromCalculated(t1, calcPtDisplay as any),
      val2: getPropValFromCalculated(t2, calcPtDisplay as any)
    });
  }

  function handleWindowMouseUp() {
    draggingPointId = null;
    window.removeEventListener('mousemove', handleWindowMouseMove);
    window.removeEventListener('mouseup', handleWindowMouseUp);
  }

  function handleMouseMove(e: MouseEvent) {
    if (draggingPointId) return;

    const svgRect = e.currentTarget instanceof SVGElement ? e.currentTarget.getBoundingClientRect() : null;
    if (!svgRect) return;

    // Convert mouse event position to SVG inner coordinate space
    const scaleX = width / svgRect.width;
    const scaleY = height / svgRect.height;

    const mouseSvgX = (e.clientX - svgRect.left) * scaleX - margin.left;
    const mouseSvgY = (e.clientY - svgRect.top) * scaleY - margin.top;

    if (mouseSvgX >= 0 && mouseSvgX <= innerWidth && mouseSvgY >= 0 && mouseSvgY <= innerHeight) {
      isHovering = true;
      cursorX = mouseSvgX;
      cursorY = mouseSvgY;

      const tDisp = xScale.invert(mouseSvgX);
      const wDisp = yScale.invert(mouseSvgY);

      const tSI = isSI ? tDisp : fToC(tDisp);
      const wSI = isSI ? wDisp : wDisp / 7000;

      // Evaluate thermodynamic properties under cursor
      const res = calculateStatePointSI('DBT_HUMRAT', tSI, wSI, pPa);

      cursorReadout = {
        dbt: isSI ? Number(res.dbt.toFixed(1)) : Number(cToF(res.dbt).toFixed(1)),
        w: isSI ? Number(res.humRat.toFixed(4)) : Number((res.humRat * 7000).toFixed(1)),
        rh: Number(res.rh.toFixed(1)),
        enthalpy: isSI ? Number(res.enthalpy.toFixed(1)) : Number((res.enthalpy * 0.4299).toFixed(1)),
        wbt: isSI ? Number(res.wbt.toFixed(1)) : Number(cToF(res.wbt).toFixed(1)),
        dpt: isSI ? Number(res.dpt.toFixed(1)) : Number(cToF(res.dpt).toFixed(1))
      };
    } else {
      isHovering = false;
    }
  }

  function handleMouseLeave() {
    if (!draggingPointId) {
      isHovering = false;
    }
  }

  // Interconnecting process line between active state points (P1 -> P2 -> P3)
  $: activePoints = $computedPointsStore.filter((p) => p.enabled);
  $: processPath = (() => {
    if (activePoints.length < 2) return '';
    return activePoints
      .map((p, idx) => {
        const x = xScale(p.dbt);
        const y = yScale(p.humRat);
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  })();
</script>

<div class="relative glass-panel rounded-2xl p-4 border border-slate-800 shadow-xl overflow-hidden">
  
  <!-- Header bar -->
  <div class="flex items-center justify-between mb-2">
    <div class="flex items-center space-x-2">
      <Eye class="w-4 h-4 text-blue-400" />
      <h3 class="text-sm font-semibold text-slate-100 uppercase tracking-wide">Interactive Psychrometric Chart</h3>
    </div>
    <!-- Legend bar -->
    <div class="flex items-center space-x-3 text-xs text-slate-400">
      <span class="flex items-center space-x-1">
        <span class="w-2.5 h-0.5 bg-blue-500 rounded"></span>
        <span>Sat Curve (100% RH)</span>
      </span>
      <span class="flex items-center space-x-1">
        <span class="w-2.5 h-0.5 bg-slate-600 rounded"></span>
        <span>RH % Lines</span>
      </span>
      <span class="flex items-center space-x-1">
        <span class="w-2.5 h-0.5 bg-emerald-500 rounded"></span>
        <span>Enthalpy (h) Lines</span>
      </span>
      <span class="flex items-center space-x-1">
        <span class="w-2.5 h-0.5 bg-amber-400/80 rounded"></span>
        <span>Process Path</span>
      </span>
    </div>
  </div>

  <!-- SVG Psychrometric Chart Canvas -->
  <div class="relative w-full aspect-[17/10] bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden cursor-crosshair">
    
    <svg
      id="psychro-svg-canvas"
      viewBox="0 0 {width} {height}"
      class="w-full h-full select-none"
      on:mousemove={handleMouseMove}
      on:mouseleave={handleMouseLeave}
    >
      <g transform="translate({margin.left}, {margin.top})">
        
        <!-- Constant Enthalpy Guidelines (Oblique h lines & diagonal scale labels) -->
        {#each enthalpyLines as hLine}
          {#if hLine}
            <path
              d={hLine.path}
              fill="none"
              stroke="#10b981"
              stroke-width="1"
              stroke-dasharray="4 3"
              opacity="0.65"
            />
            {#if hLine.satIntersect}
              <g transform="translate({hLine.satIntersect.x}, {hLine.satIntersect.y}) rotate({hLine.satIntersect.angle})">
                <text
                  x="-14"
                  y="-3"
                  fill="#10b981"
                  font-size="9"
                  font-family="JetBrains Mono"
                  font-weight="bold"
                  text-anchor="end"
                >
                  {hLine.val}
                </text>
              </g>
            {/if}
          {/if}
        {/each}

        <!-- Background Grid Lines -->
        <!-- Vertical Tdb lines -->
        {#each tGrid as t}
          <line
            x1={xScale(t)}
            y1={0}
            x2={xScale(t)}
            y2={innerHeight}
            stroke="#1e293b"
            stroke-dasharray="2 2"
            stroke-width="1"
          />
          <text
            x={xScale(t)}
            y={innerHeight + 18}
            fill="#64748b"
            font-size="10"
            font-family="JetBrains Mono"
            text-anchor="middle"
          >
            {t}°
          </text>
        {/each}

        <!-- Horizontal W lines -->
        {#each wGrid as w}
          <line
            x1={0}
            y1={yScale(w)}
            x2={innerWidth}
            y2={yScale(w)}
            stroke="#1e293b"
            stroke-dasharray="2 2"
            stroke-width="1"
          />
          <text
            x={innerWidth + 10}
            y={yScale(w) + 3}
            fill="#64748b"
            font-size="10"
            font-family="JetBrains Mono"
            text-anchor="start"
          >
            {w}
          </text>
        {/each}

        <!-- Relative Humidity Curves (RH %) with rotated labels -->
        {#each rhCurves as rhItem}
          <g>
            <path
              d={rhItem.path}
              fill="none"
              stroke="#475569"
              stroke-width="1.2"
              stroke-dasharray="4 2"
            />
            <g transform="translate({rhItem.labelPt.x}, {rhItem.labelPt.y}) rotate({rhItem.labelPt.angle})">
              <text
                x="0"
                y="-3"
                fill="#94a3b8"
                font-size="9"
                font-family="JetBrains Mono"
                font-weight="bold"
                text-anchor="middle"
              >
                {rhItem.rh}%
              </text>
            </g>
          </g>
        {/each}

        <!-- Saturation Curve (100% RH) -->
        <path
          d={satCurvePath}
          fill="none"
          stroke="#3b82f6"
          stroke-width="2.5"
        />

        <!-- Process Path connecting active state points -->
        {#if processPath}
          <path
            d={processPath}
            fill="none"
            stroke="#f59e0b"
            stroke-width="2"
            stroke-dasharray="5 3"
            class="animate-pulse"
          />
        {/if}

        <!-- Plotted Active State Points -->
        {#each activePoints as pt}
          <g transform="translate({xScale(pt.dbt)}, {yScale(pt.humRat)})">
            <!-- Pulsing outer circle -->
            <circle r="9" fill={pt.color} opacity="0.25" class="animate-ping" />
            <!-- Main Point dot -->
            <circle r="6" fill={pt.color} stroke="#ffffff" stroke-width="1.5" class="shadow-lg" />
            <!-- Point Label Tag -->
            <g transform="translate(10, -10)">
              <rect
                x="-4"
                y="-12"
                width="60"
                height="18"
                rx="4"
                fill="#0f172a"
                stroke={pt.color}
                stroke-width="1"
                opacity="0.9"
              />
              <text
                x="2"
                y="0"
                fill="#ffffff"
                font-size="10"
                font-family="JetBrains Mono"
                font-weight="bold"
              >
                {pt.id}: {pt.dbt}°
              </text>
            </g>
          </g>
        {/each}

        <!-- Live Cursor Crosshair Projection -->
        {#if isHovering}
          <line
            x1={cursorX}
            y1={0}
            x2={cursorX}
            y2={innerHeight}
            stroke="#60a5fa"
            stroke-width="1"
            stroke-dasharray="3 3"
            opacity="0.7"
          />
          <line
            x1={0}
            y1={cursorY}
            x2={innerWidth}
            y2={cursorY}
            stroke="#60a5fa"
            stroke-width="1"
            stroke-dasharray="3 3"
            opacity="0.7"
          />
          <circle cx={cursorX} cy={cursorY} r="4" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5" />
        {/if}

        <!-- Axis Labels -->
        <text
          x={innerWidth / 2}
          y={innerHeight + 38}
          fill="#94a3b8"
          font-size="11"
          font-family="Inter"
          font-weight="600"
          text-anchor="middle"
        >
          Dry-Bulb Temperature Tdb ({isSI ? '°C' : '°F'})
        </text>

        <text
          transform="rotate(-90)"
          x={-innerHeight / 2}
          y={-45}
          fill="#94a3b8"
          font-size="11"
          font-family="Inter"
          font-weight="600"
          text-anchor="middle"
        >
          Humidity Ratio W ({isSI ? 'kg/kg dry air' : 'grains/lb dry air'})
        </text>

      </g>
    </svg>

    <!-- Glassmorphic Live Cursor Inspector Widget -->
    {#if isHovering && cursorReadout}
      <div
        class="absolute top-4 right-4 glass-widget rounded-xl p-3 text-xs shadow-2xl border border-blue-500/40 pointer-events-none w-60 transition-all duration-75"
      >
        <div class="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-700/60">
          <div class="flex items-center space-x-1 text-blue-400 font-semibold">
            <Crosshair class="w-3.5 h-3.5" />
            <span>Live Inspector</span>
          </div>
          <span class="text-[10px] font-mono text-emerald-400">ACTIVE</span>
        </div>

        <div class="grid grid-cols-2 gap-y-1 gap-x-2 font-mono text-[11px]">
          <span class="text-slate-400">Dry Bulb:</span>
          <span class="text-white text-right font-bold">{cursorReadout.dbt} {isSI ? '°C' : '°F'}</span>

          <span class="text-slate-400">Hum. Ratio:</span>
          <span class="text-cyan-400 text-right font-bold">{cursorReadout.w}</span>

          <span class="text-slate-400">Rel. Humidity:</span>
          <span class="text-emerald-400 text-right font-bold">{cursorReadout.rh} %</span>

          <span class="text-slate-400">Enthalpy:</span>
          <span class="text-amber-400 text-right font-bold">{cursorReadout.enthalpy} {isSI ? 'kJ/kg' : 'Btu/lb'}</span>

          <span class="text-slate-400">Wet Bulb:</span>
          <span class="text-blue-300 text-right">{cursorReadout.wbt} {isSI ? '°C' : '°F'}</span>

          <span class="text-slate-400">Dew Point:</span>
          <span class="text-purple-300 text-right">{cursorReadout.dpt} {isSI ? '°C' : '°F'}</span>
        </div>
      </div>
    {/if}

  </div>
</div>
