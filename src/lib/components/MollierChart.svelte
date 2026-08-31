<script lang="ts">
  import { pointsInputStore, computedPointsStore, settingsStore, updatePointInput } from '../stores/appStore';
  import { getSatVaporPressureSI, getHumRatioFromVapPress, getEnthalpySI, calculateStatePointSI, solveStatePointFromPairSI } from '../psychrometrics/engine';
  import type { PropertyType } from '../psychrometrics/types';
  import { cToF, fToC, getStandardAtmosphericPressureSI, psiTokPa, feetToMeters } from '../psychrometrics/unitConverter';
  import { scaleLinear } from 'd3-scale';
  import { Compass, Crosshair } from '@lucide/svelte';

  $: isSI = $settingsStore.unitSystem === 'SI';

  $: pPa = isSI
    ? ($settingsStore.pressure ? $settingsStore.pressure * 1000 : getStandardAtmosphericPressureSI($settingsStore.elevation))
    : ($settingsStore.pressure ? psiTokPa($settingsStore.pressure) * 1000 : getStandardAtmosphericPressureSI(feetToMeters($settingsStore.elevation)));

  // Mollier axes range
  // Temperature theta (vertical axis)
  $: thetaMin = isSI ? -25 : -10;
  $: thetaMax = isSI ? 50 : 120;

  // Absolute humidity x (horizontal axis)
  $: xMin = 0;
  $: xMax = isSI ? 0.025 : 175; // kg/kg in SI, grains/lb in IP

  const width = 940;
  const height = 580;
  const margin = { top: 55, right: 80, bottom: 65, left: 75 };

  $: innerWidth = width - margin.left - margin.right;
  $: innerHeight = height - margin.top - margin.bottom;

  // D3 Scales
  $: xScale = scaleLinear().domain([xMin, xMax]).range([0, innerWidth]);
  $: yScale = scaleLinear().domain([thetaMin, thetaMax]).range([innerHeight, 0]);

  // Absolute Humidity (x) Grid Ticks and Guidelines
  $: xMajorStep = isSI ? 0.005 : 25;
  $: xMinorStep = isSI ? 0.001 : 5;

  $: xMajorTicks = (() => {
    const ticks: { val: number; label: string; px: number }[] = [];
    for (let v = xMin; v <= xMax + 1e-6; v += xMajorStep) {
      const rounded = Number(v.toFixed(isSI ? 3 : 0));
      ticks.push({
        val: rounded,
        label: isSI ? rounded.toFixed(3) : String(rounded),
        px: xScale(rounded)
      });
    }
    return ticks;
  })();

  $: xMinorTicks = (() => {
    const ticks: { px: number }[] = [];
    for (let v = xMin; v <= xMax + 1e-6; v += xMinorStep) {
      ticks.push({ px: xScale(v) });
    }
    return ticks;
  })();

  // Temperature (theta) Left Axis Ticks
  $: thetaMajorStep = isSI ? 5 : 10;
  $: thetaTicks = (() => {
    const ticks: { val: number; label: string; py: number }[] = [];
    for (let t = thetaMin; t <= thetaMax; t += thetaMajorStep) {
      ticks.push({
        val: t,
        label: String(t),
        py: yScale(t)
      });
    }
    return ticks;
  })();

  // Enthalpy (h) Diagonal Guidelines and Scale
  // In SI: h = 1.006 * theta + w * (2501 + 1.86 * theta) kJ/kg
  // theta(w) = (h - 2501 * w) / (1.006 + 1.86 * w)
  $: enthalpyLines = (() => {
    const lines: {
      hVal: number;
      isMajor: boolean;
      path: string;
      labelPt: { x: number; y: number; angle: number } | null;
      exitRightPt: { x: number; y: number } | null;
    }[] = [];

    const hStart = isSI ? -20 : -5;
    const hEnd = isSI ? 130 : 55;
    const step = isSI ? 5 : 2.5;

    for (let h = hStart; h <= hEnd; h += step) {
      const isMajor = isSI ? h % 20 === 0 : h % 10 === 0;
      const isIntermediate = isSI ? h % 10 === 0 : h % 5 === 0;

      const pts: { x: number; y: number }[] = [];
      const numPoints = 40;

      for (let i = 0; i <= numPoints; i++) {
        const xDisp = xMin + (i / numPoints) * (xMax - xMin);
        const wSI = isSI ? xDisp : xDisp / 7000;
        const hSI = isSI ? h : h / 0.4299;

        // Calculate dry bulb temperature theta in °C
        const thetaC = (hSI - 2501 * wSI) / (1.006 + 1.86 * wSI);
        const thetaDisp = isSI ? thetaC : cToF(thetaC);

        const px = xScale(xDisp);
        const py = yScale(thetaDisp);

        if (py >= -20 && py <= innerHeight + 20) {
          pts.push({ x: px, y: py });
        }
      }

      if (pts.length >= 2) {
        const path = pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

        // Compute angle of the enthalpy guideline
        const p1 = pts[0];
        const p2 = pts[pts.length - 1];
        const angle = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;

        // Inline label placement (around 40% along the line if inside visible box)
        let labelPt: { x: number; y: number; angle: number } | null = null;
        const midIdx = Math.floor(pts.length * 0.4);
        const mid = pts[midIdx];
        if (isIntermediate && mid && mid.x > 20 && mid.x < innerWidth - 30 && mid.y > 20 && mid.y < innerHeight - 20) {
          labelPt = { x: mid.x, y: mid.y, angle };
        }

        // Exit point on right border or bottom border for axis labeling
        let exitRightPt: { x: number; y: number } | null = null;
        const lastPt = pts[pts.length - 1];
        if (lastPt && lastPt.x >= innerWidth - 5 && lastPt.y >= 0 && lastPt.y <= innerHeight) {
          exitRightPt = { x: innerWidth, y: lastPt.y };
        }

        lines.push({
          hVal: h,
          isMajor,
          path,
          labelPt,
          exitRightPt
        });
      }
    }

    return lines;
  })();

  // Saturation Line (100% RH)
  $: satCurvePath = (() => {
    const points: string[] = [];
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const thetaDisp = thetaMin + (i / steps) * (thetaMax - thetaMin);
      const tC = isSI ? thetaDisp : fToC(thetaDisp);
      if (tC < -20 || tC > 60) continue;

      const pws = getSatVaporPressureSI(tC);
      const wSI = getHumRatioFromVapPress(pws, pPa);
      const xDisp = isSI ? wSI : wSI * 7000;

      const px = xScale(Math.min(xMax, xDisp));
      const py = yScale(thetaDisp);

      if (px >= 0 && px <= innerWidth && py >= 0 && py <= innerHeight) {
        points.push(`${points.length === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
      }
    }
    return points.join(' ');
  })();

  let cursorX = 0;
  let cursorY = 0;
  let isHovering = false;
  let cursorReadout: {
    enthalpy: number;
    w: number;
    dbt: number;
    rh: number;
  } | null = null;

  let draggingPointId: string | null = null;

  function handleWindowMouseMove(e: MouseEvent) {
    if (!draggingPointId) return;

    const svgEl = document.querySelector('#mollier-svg-canvas');
    if (!svgEl) return;
    const svgRect = svgEl.getBoundingClientRect();

    const scaleX = width / svgRect.width;
    const scaleY = height / svgRect.height;

    const mouseSvgX = (e.clientX - svgRect.left) * scaleX - margin.left;
    const mouseSvgY = (e.clientY - svgRect.top) * scaleY - margin.top;

    const clampedX = Math.max(0, Math.min(innerWidth, mouseSvgX));
    const clampedY = Math.max(0, Math.min(innerHeight, mouseSvgY));

    const xDisp = xScale.invert(clampedX);
    const thetaDisp = yScale.invert(clampedY);

    const wSI = isSI ? xDisp : xDisp / 7000;
    const tSI = isSI ? thetaDisp : fToC(thetaDisp);

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
        default: return cPt.dbt;
      }
    };

    const solvedSI = solveStatePointFromPairSI('DBT', tSI, 'HUMRAT', wSI, pPa);

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

    const scaleX = width / svgRect.width;
    const scaleY = height / svgRect.height;

    const mouseSvgX = (e.clientX - svgRect.left) * scaleX - margin.left;
    const mouseSvgY = (e.clientY - svgRect.top) * scaleY - margin.top;

    if (mouseSvgX >= 0 && mouseSvgX <= innerWidth && mouseSvgY >= 0 && mouseSvgY <= innerHeight) {
      isHovering = true;
      cursorX = mouseSvgX;
      cursorY = mouseSvgY;

      const xDisp = xScale.invert(mouseSvgX);
      const thetaDisp = yScale.invert(mouseSvgY);

      const wSI = isSI ? xDisp : xDisp / 7000;
      const tSI = isSI ? thetaDisp : fToC(thetaDisp);
      const res = calculateStatePointSI('DBT_HUMRAT', tSI, wSI, pPa);

      cursorReadout = {
        enthalpy: isSI ? Number(res.enthalpy.toFixed(1)) : Number((res.enthalpy * 0.4299).toFixed(1)),
        w: isSI ? Number(wSI.toFixed(4)) : Number(xDisp.toFixed(1)),
        dbt: isSI ? Number(tSI.toFixed(1)) : Number(thetaDisp.toFixed(1)),
        rh: Number(res.rh.toFixed(1))
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

  $: activePoints = $computedPointsStore.filter((p) => p.enabled);
  $: processPath = (() => {
    if (activePoints.length < 2) return '';
    return activePoints
      .map((p, idx) => {
        const x = xScale(p.humRat);
        const y = yScale(p.dbt);
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  })();
</script>

<div class="relative glass-panel rounded-2xl p-4 border border-slate-800 shadow-xl overflow-hidden">
  
  <!-- Header Bar -->
  <div class="flex items-center justify-between mb-2">
    <div class="flex items-center space-x-2">
      <Compass class="w-4 h-4 text-emerald-400" />
      <h3 class="text-sm font-semibold text-slate-100 uppercase tracking-wide">Mollier Diagram</h3>
    </div>
    <div class="flex items-center space-x-4 text-xs text-slate-400">
      <span class="flex items-center space-x-1.5">
        <span class="w-2.5 h-0.5 bg-amber-400 rounded"></span>
        <span class="text-slate-300">Enthalpy Guidelines (h)</span>
      </span>
      <span class="flex items-center space-x-1.5">
        <span class="w-2.5 h-0.5 bg-blue-400 rounded"></span>
        <span class="text-slate-300">Absolute Humidity Lines (x)</span>
      </span>
      <span class="flex items-center space-x-1.5">
        <span class="w-2.5 h-0.5 bg-emerald-500 rounded"></span>
        <span class="text-slate-300">Saturation Line (100% RH)</span>
      </span>
    </div>
  </div>

  <div class="relative w-full aspect-[17/10] bg-slate-950/95 rounded-xl border border-slate-800 overflow-hidden cursor-crosshair">
    <svg
      id="mollier-svg-canvas"
      viewBox="0 0 {width} {height}"
      class="w-full h-full select-none"
      on:mousemove={handleMouseMove}
      on:mouseleave={handleMouseLeave}
      role="img"
      aria-label="Mollier Diagram"
    >
      <defs>
        <!-- Clip path to keep guidelines strictly inside the inner diagram frame -->
        <clipPath id="mollier-chart-clip">
          <rect x="0" y="0" width={innerWidth} height={innerHeight} />
        </clipPath>
      </defs>

      <g transform="translate({margin.left}, {margin.top})">
        
        <!-- Clipped Guidelines Layer -->
        <g clip-path="url(#mollier-chart-clip)">
          
          <!-- 1. Minor Vertical Grid Lines (Constant Absolute Humidity x) -->
          {#each xMinorTicks as xmin}
            <line
              x1={xmin.px}
              y1={0}
              x2={xmin.px}
              y2={innerHeight}
              stroke="#1e293b"
              stroke-width="0.75"
              opacity="0.5"
            />
          {/each}

          <!-- 2. Major Vertical Grid Lines (Constant Absolute Humidity x) -->
          {#each xMajorTicks as xt}
            <line
              x1={xt.px}
              y1={0}
              x2={xt.px}
              y2={innerHeight}
              stroke="#334155"
              stroke-width="1"
              opacity="0.8"
            />
          {/each}

          <!-- 3. Constant Enthalpy Diagonal Guidelines (h = const) -->
          {#each enthalpyLines as hLine}
            <path
              d={hLine.path}
              fill="none"
              stroke={hLine.isMajor ? '#f59e0b' : '#78350f'}
              stroke-width={hLine.isMajor ? '1.2' : '0.8'}
              stroke-dasharray={hLine.isMajor ? 'none' : '3 2'}
              opacity={hLine.isMajor ? '0.75' : '0.45'}
            />
            
            <!-- Inline Rotated Enthalpy Labels -->
            {#if hLine.labelPt}
              <g transform="translate({hLine.labelPt.x}, {hLine.labelPt.y}) rotate({hLine.labelPt.angle})">
                <text
                  x="0"
                  y="-3"
                  fill="#f59e0b"
                  font-size="8.5"
                  font-family="JetBrains Mono"
                  font-weight="bold"
                  text-anchor="middle"
                  opacity="0.9"
                >
                  h={hLine.hVal}
                </text>
              </g>
            {/if}
          {/each}

          <!-- 4. Saturation Boundary Line (φ = 100%) -->
          <path
            d={satCurvePath}
            fill="none"
            stroke="#10b981"
            stroke-width="2.5"
          />

          <!-- Process Path connecting active state points -->
          {#if processPath}
            <path
              d={processPath}
              fill="none"
              stroke="#3b82f6"
              stroke-width="2"
              stroke-dasharray="5 3"
              class="animate-pulse"
            />
          {/if}

          <!-- Plotted Active State Points -->
          {#each activePoints as pt}
            <g transform="translate({xScale(pt.humRat)}, {yScale(pt.dbt)})">
              <circle r="8" fill={pt.color} opacity="0.3" class="animate-ping" />
              <circle r="5" fill={pt.color} stroke="#ffffff" stroke-width="1.5" class="shadow-lg" />
              <g transform="translate(8, -8)">
                <rect
                  x="-3"
                  y="-11"
                  width="65"
                  height="16"
                  rx="3"
                  fill="#0f172a"
                  stroke={pt.color}
                  stroke-width="1"
                  opacity="0.9"
                />
                <text
                  x="2"
                  y="0"
                  fill="#ffffff"
                  font-size="9"
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
              stroke="#10b981"
              stroke-width="1"
              stroke-dasharray="3 3"
              opacity="0.8"
            />
            <line
              x1={0}
              y1={cursorY}
              x2={innerWidth}
              y2={cursorY}
              stroke="#10b981"
              stroke-width="1"
              stroke-dasharray="3 3"
              opacity="0.8"
            />
            <circle cx={cursorX} cy={cursorY} r="4" fill="#10b981" stroke="#ffffff" stroke-width="1.5" />
          {/if}

        </g>

        <!-- Outer Boundary Frame Box -->
        <rect
          x="0"
          y="0"
          width={innerWidth}
          height={innerHeight}
          fill="none"
          stroke="#475569"
          stroke-width="1.5"
        />

        <!-- ================= TOP AXIS: Absolute Humidity (x) ================= -->
        <g>
          <!-- Minor ticks -->
          {#each xMinorTicks as xmin}
            <line x1={xmin.px} y1="0" x2={xmin.px} y2="-3" stroke="#64748b" stroke-width="0.75" />
          {/each}

          <!-- Major ticks and numerical labels -->
          {#each xMajorTicks as xt}
            <line x1={xt.px} y1="0" x2={xt.px} y2="-6" stroke="#94a3b8" stroke-width="1.2" />
            <text
              x={xt.px}
              y="-10"
              fill="#94a3b8"
              font-size="9"
              font-family="JetBrains Mono"
              text-anchor="middle"
            >
              {xt.label}
            </text>
          {/each}

          <!-- Top Axis Label -->
          <text
            x={innerWidth / 2}
            y="-26"
            fill="#cbd5e1"
            font-size="10.5"
            font-family="Inter"
            font-weight="600"
            text-anchor="middle"
          >
            Absolute Humidity x ({isSI ? 'kg water / kg dry air' : 'grains / lb dry air'}) →
          </text>
        </g>

        <!-- ================= BOTTOM AXIS: Absolute Humidity (x) ================= -->
        <g transform="translate(0, {innerHeight})">
          <!-- Minor ticks -->
          {#each xMinorTicks as xmin}
            <line x1={xmin.px} y1="0" x2={xmin.px} y2="3" stroke="#64748b" stroke-width="0.75" />
          {/each}

          <!-- Major ticks and numerical labels -->
          {#each xMajorTicks as xt}
            <line x1={xt.px} y1="0" x2={xt.px} y2="6" stroke="#94a3b8" stroke-width="1.2" />
            <text
              x={xt.px}
              y="17"
              fill="#94a3b8"
              font-size="9"
              font-family="JetBrains Mono"
              text-anchor="middle"
            >
              {xt.label}
            </text>
          {/each}

          <!-- Bottom Axis Label -->
          <text
            x={innerWidth / 2}
            y="35"
            fill="#cbd5e1"
            font-size="10.5"
            font-family="Inter"
            font-weight="600"
            text-anchor="middle"
          >
            → x ({isSI ? 'kg/kg dry air' : 'grains/lb dry air'})
          </text>
        </g>

        <!-- ================= LEFT AXIS: Temperature (θ / Tdb) ================= -->
        <g>
          {#each thetaTicks as tt}
            <line x1="0" y1={tt.py} x2="-5" y2={tt.py} stroke="#94a3b8" stroke-width="1.2" />
            <text
              x="-8"
              y={tt.py + 3}
              fill="#cbd5e1"
              font-size="9"
              font-family="JetBrains Mono"
              text-anchor="end"
            >
              {tt.label}°
            </text>
          {/each}

          <text
            transform="rotate(-90)"
            x={-innerHeight / 2}
            y="-48"
            fill="#cbd5e1"
            font-size="10.5"
            font-family="Inter"
            font-weight="600"
            text-anchor="middle"
          >
            Temperature θ ({isSI ? '°C' : '°F'}) →
          </text>
        </g>

        <!-- ================= RIGHT AXIS: Enthalpy (h) Scale ================= -->
        <g transform="translate({innerWidth}, 0)">
          {#each enthalpyLines as hLine}
            {#if hLine.exitRightPt && (hLine.isMajor || (isSI && hLine.hVal % 10 === 0))}
              <line
                x1="0"
                y1={hLine.exitRightPt.y}
                x2="6"
                y2={hLine.exitRightPt.y}
                stroke="#f59e0b"
                stroke-width="1.2"
              />
              <text
                x="9"
                y={hLine.exitRightPt.y + 3}
                fill="#f59e0b"
                font-size="9"
                font-family="JetBrains Mono"
                font-weight="bold"
                text-anchor="start"
              >
                {hLine.hVal}
              </text>
            {/if}
          {/each}

          <text
            transform="rotate(90)"
            x={innerHeight / 2}
            y="-52"
            fill="#f59e0b"
            font-size="10.5"
            font-family="Inter"
            font-weight="600"
            text-anchor="middle"
          >
            Specific Enthalpy h ({isSI ? 'kJ/kg' : 'Btu/lb'}) →
          </text>
        </g>

      </g>
    </svg>

    <!-- Glassmorphic Live Cursor Inspector Widget -->
    {#if isHovering && cursorReadout}
      <div
        class="absolute top-4 right-4 glass-widget rounded-xl p-3 text-xs shadow-2xl border border-emerald-500/40 pointer-events-none w-56 transition-all duration-75"
      >
        <div class="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-700/60">
          <div class="flex items-center space-x-1 text-emerald-400 font-semibold">
            <Crosshair class="w-3.5 h-3.5" />
            <span>Mollier Inspector</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-y-1 gap-x-2 font-mono text-[11px]">
          <span class="text-slate-400">Enthalpy h:</span>
          <span class="text-amber-400 text-right font-bold">{cursorReadout.enthalpy} {isSI ? 'kJ/kg' : 'Btu/lb'}</span>

          <span class="text-slate-400">Humidity x:</span>
          <span class="text-cyan-400 text-right font-bold">{cursorReadout.w}</span>

          <span class="text-slate-400">Temp θ (Tdb):</span>
          <span class="text-white text-right font-bold">{cursorReadout.dbt} {isSI ? '°C' : '°F'}</span>

          <span class="text-slate-400">Rel. Hum φ:</span>
          <span class="text-emerald-400 text-right font-bold">{cursorReadout.rh} %</span>
        </div>
      </div>
    {/if}
  </div>
</div>
