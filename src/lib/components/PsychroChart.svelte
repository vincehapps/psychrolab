<script lang="ts">
  import { pointsInputStore, computedPointsStore, settingsStore } from '../stores/appStore';
  import { getSatVaporPressureSI, getHumRatioFromVapPress, calculateStatePointSI, solveStatePointFromPairSI } from '../psychrometrics/engine';
  import { cToF, fToC, getStandardAtmosphericPressureSI, psiTokPa, feetToMeters } from '../psychrometrics/unitConverter';
  import { scaleLinear } from 'd3-scale';
  import { Eye, Crosshair, Sparkles, Download, Copy, Check } from '@lucide/svelte';
  import { ASHRAE55_ZONES, ASHRAE55_NOTE, pmv, ppd } from '../psychrometrics/comfort';
  import { sensibleHeatRatio } from '../psychrometrics/process';
  import { downloadChartPng, downloadChartSvg, copyTableTsv, downloadTableCsv } from '../chartExport';

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
  // Constant Wet-Bulb Temperature Guidelines (Tw lines, oblique axis inline with enthalpy)
  // ASHRAE relation (same as engine.ts):
  // W = ((2501 - 2.326 * Twb) * Wsat(Twb) - 1.006 * (Tdb - Twb)) / (2501 + 1.86 * Tdb - 4.186 * Twb)
  $: wetBulbLines = (() => {
    const twStep = isSI ? 2 : 5;
    const twMinVal = isSI ? 0 : 30;
    const twMaxVal = isSI ? 50 : 120;

    const twValues: number[] = [];
    for (let tw = twMinVal; tw <= twMaxVal; tw += twStep) {
      twValues.push(tw);
    }

    return twValues.map((twVal) => {
      const twbSI = isSI ? twVal : fToC(twVal);
      const pwsTwb = getSatVaporPressureSI(twbSI);
      const wSatTwbSI = getHumRatioFromVapPress(pwsTwb, pPa);

      const points: { x: number; y: number }[] = [];
      const steps = 60;
      const tStart = Math.max(tMin, twVal);

      for (let i = 0; i <= steps; i++) {
        const tDisp = tStart + (i / steps) * (tMax - tStart);
        const tSI = isSI ? tDisp : fToC(tDisp);

        // Solve W at constant wet-bulb temperature
        const wSI =
          ((2501 - 2.326 * twbSI) * wSatTwbSI - 1.006 * (tSI - twbSI)) /
          (2501 + 1.86 * tSI - 4.186 * twbSI);
        const wDisp = isSI ? wSI : wSI * 7000;

        // Saturation W at this dry-bulb temperature
        const pws = getSatVaporPressureSI(tSI);
        const wSatSI = getHumRatioFromVapPress(pws, pPa);
        const wSatDisp = isSI ? wSatSI : wSatSI * 7000;

        // Line must be inside chart domain and below/at the saturation curve
        if (wDisp >= wMin && wDisp <= wMax && wDisp <= wSatDisp + 0.001) {
          points.push({ x: xScale(tDisp), y: yScale(wDisp) });
        }
      }

      if (points.length < 2) return null;

      const pFirst = points[0];
      const pNext = points[Math.min(5, points.length - 1)];
      const dx = pNext.x - pFirst.x;
      const dy = pNext.y - pFirst.y;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      const pathD = points.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');

      // Label placed at the saturation-curve intersection (diagonal scale, inline with enthalpy)
      return { val: twVal, path: pathD, labelPt: { x: pFirst.x, y: pFirst.y, angle } };
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

  // ---------------------------------------------------------------------
  // Overlays: ASHRAE 55 comfort zones, SHR protractor, process deltas
  // ---------------------------------------------------------------------
  let showComfort = true;
  let showShr = false;
  let showConnectors = true;
  let shrValue = 0.8;
  let selectedPointId: string = $pointsInputStore[0]?.id ?? 'P1';
  let copyState: 'idle' | 'done' | 'failed' = 'idle';

  // Live PMV / PPD for the selected point under the summer (0.5 clo) office case.
  $: comfortPoint = $computedPointsStore.find((p) => p.id === selectedPointId) ?? null;
  $: comfortPmv =
    comfortPoint === null
      ? null
      : pmv({
          ta: isSI ? comfortPoint.dbt : fToC(comfortPoint.dbt),
          rh: comfortPoint.rh,
          clo: 0.5,
          met: 1.1
        });

  $: if ($pointsInputStore.length && !$pointsInputStore.some((p) => p.id === selectedPointId)) {
    selectedPointId = $pointsInputStore[0].id;
  }

  $: comfortRects = ASHRAE55_ZONES.map((z) => {
    const t0 = isSI ? z.tMinC : cToF(z.tMinC);
    const t1 = isSI ? z.tMaxC : cToF(z.tMaxC);
    const w0 = isSI ? z.wMin : z.wMin * 7000;
    const w1 = isSI ? z.wMax : z.wMax * 7000;
    const yTop = yScale(w1);
    const yBottom = yScale(w0);
    return {
      key: z.key,
      label: z.label,
      color: z.color,
      pmvMin: z.pmvMin,
      pmvMax: z.pmvMax,
      x: xScale(t0),
      y: yTop,
      width: Math.max(0, xScale(t1) - xScale(t0)),
      height: Math.max(0, yBottom - yTop)
    };
  });

  // SHR protractor: slope dW/dT = (cp/hfg)·(1−SHR)/SHR through the first point
  $: shrGuidePoints = (() => {
    if (!showShr) return [] as { x: number; y: number }[];
    const ref = activePoints[0];
    const tRefSI = ref ? (isSI ? ref.dbt : fToC(ref.dbt)) : 24;
    const wRefSI = ref ? (isSI ? ref.humRat : ref.humRat / 7000) : 0.0093;
    const slope = (1.006 / 2500) * ((1 - shrValue) / Math.max(shrValue, 0.08));
    const pts: { x: number; y: number }[] = [];
    for (let tSI = Math.max(-20, tRefSI - 40); tSI <= Math.min(60, tRefSI + 45); tSI += 0.5) {
      const wSI = wRefSI + slope * (tSI - tRefSI);
      if (wSI <= 0) continue;
      const tDisp = isSI ? tSI : cToF(tSI);
      const wDisp = isSI ? wSI : wSI * 7000;
      if (tDisp < tMin || tDisp > tMax || wDisp < wMin || wDisp > wMax) continue;
      const wSat = getHumRatioFromVapPress(getSatVaporPressureSI(tSI), pPa);
      if (wSI > wSat) continue;
      pts.push({ x: xScale(tDisp), y: yScale(wDisp) });
    }
    return pts;
  })();
  $: shrGuidePath = shrGuidePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  // Consecutive-point process segments with ΔT, Δω, Δh and SHR
  $: segments = activePoints.slice(1).map((pt, idx) => {
    const a = activePoints[idx];
    const dTdisp = pt.dbt - a.dbt;
    const dWdisp = pt.humRat - a.humRat;
    const dHdisp = pt.enthalpy - a.enthalpy;
    const dTsi = isSI ? dTdisp : dTdisp / 1.8;
    const dWsi = isSI ? dWdisp : dWdisp / 7000;
    return {
      id: `${a.id} → ${pt.id}`,
      x1: xScale(a.dbt),
      y1: yScale(a.humRat),
      x2: xScale(pt.dbt),
      y2: yScale(pt.humRat),
      dT: dTdisp,
      dW: dWdisp,
      dH: dHdisp,
      shr: sensibleHeatRatio(dTsi, dWsi)
    };
  });

  // Keep pressure consistent with the chosen site elevation so the settings
  // modal and every downstream calculator agree on the barometric pressure.
  function setElevation(value: number) {
    const elevM = isSI ? value : feetToMeters(value);
    const pPa = getStandardAtmosphericPressureSI(elevM);
    settingsStore.update((s) => ({
      ...s,
      elevation: value,
      pressure: isSI ? Number((pPa / 1000).toFixed(3)) : Number(((pPa / 1000) * 0.1450377).toFixed(3))
    }));
  }

  function stepFor(type: PropertyType): number {
    switch (type) {
      case 'RH':
        return 1;
      case 'HUMRAT':
        return isSI ? 0.0001 : 0.1;
      case 'ENTHALPY':
        return isSI ? 0.2 : 0.1;
      default:
        return isSI ? 0.1 : 0.2;
    }
  }

  function roundFor(type: PropertyType, value: number): number {
    if (type === 'HUMRAT') return Number(value.toFixed(isSI ? 5 : 1));
    return Number(value.toFixed(2));
  }

  function handleChartKeydown(event: KeyboardEvent) {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    const pt = $pointsInputStore.find((p) => p.id === selectedPointId);
    if (!pt) return;
    event.preventDefault();
    const dir = event.key === 'ArrowUp' || event.key === 'ArrowRight' ? 1 : -1;
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      updatePointInput(pt.id, { val1: roundFor(pt.type1, pt.val1 + dir * stepFor(pt.type1)) });
    } else {
      updatePointInput(pt.id, { val2: roundFor(pt.type2, pt.val2 + dir * stepFor(pt.type2)) });
    }
  }

  // ---------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------
  $: exportLegend = [
    'Saturation 100% RH',
    'RH curves',
    'Enthalpy h',
    'Wet bulb Tw',
    'Process path',
    `SHR ${(shrValue * 100).toFixed(0)}%`,
    'ASHRAE 55 zones'
  ];

  function chartSvg(): SVGSVGElement | null {
    return typeof document === 'undefined'
      ? null
      : (document.querySelector('#psychro-svg-canvas') as SVGSVGElement | null);
  }

  async function handlePngExport() {
    const el = chartSvg();
    if (el) await downloadChartPng(el, 'psychrometric-chart', exportLegend, 2);
  }

  function handleSvgExport() {
    const el = chartSvg();
    if (el) downloadChartSvg(el, 'psychrometric-chart');
  }

  $: tableHeaders = [
    'Point',
    `Tdb (${isSI ? 'C' : 'F'})`,
    `Twb (${isSI ? 'C' : 'F'})`,
    `Tdp (${isSI ? 'C' : 'F'})`,
    'RH (%)',
    `W (${isSI ? 'kg/kg' : 'gr/lb'})`,
    `h (${isSI ? 'kJ/kg' : 'Btu/lb'})`,
    `v (${isSI ? 'm3/kg' : 'ft3/lb'})`
  ];
  $: tableRows = $computedPointsStore
    .filter((p) => p.enabled)
    .map((p) => [p.id, p.dbt, p.wbt, p.dpt, p.rh, p.humRat, p.enthalpy, p.vol]);

  async function handleCopyTable() {
    const ok = await copyTableTsv(tableHeaders, tableRows);
    copyState = ok ? 'done' : 'failed';
    setTimeout(() => (copyState = 'idle'), 2000);
  }

  function handleCsvExport() {
    downloadTableCsv(tableHeaders, tableRows, 'psychrometric-states');
  }
</script>

<div
  class="relative glass-panel rounded-2xl p-4 border border-slate-800 shadow-xl overflow-hidden"
  role="application"
  aria-label="Interactive psychrometric chart"
  tabindex="0"
  on:keydown={handleChartKeydown}
>

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
          <span class="w-2.5 h-0.5 bg-cyan-400 rounded"></span>
          <span>Wet-Bulb (T<sub>w</sub>) Lines</span>
        </span>
        <span class="flex items-center space-x-1">
        <span class="w-2.5 h-0.5 bg-amber-400/80 rounded"></span>
        <span>Process Path</span>
      </span>
    </div>
  </div>

  <!-- Chart controls: overlays, elevation, export -->
  <div class="flex flex-wrap items-center gap-1.5 mb-2 text-[11px] font-mono">
    <button
      type="button"
      on:click={() => (showComfort = !showComfort)}
      aria-pressed={showComfort}
      class="px-2 py-1 rounded-md border transition-colors {showComfort
        ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300'
        : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white'}"
      title={ASHRAE55_NOTE}
    >
      ASHRAE 55 comfort
    </button>
    {#if showComfort && comfortPmv !== null}
      <span
        class="px-2 py-1 rounded-md border border-slate-800 bg-slate-900/70 text-slate-400"
        title="Predicted Mean Vote and Predicted Percentage Dissatisfied for the selected point (0.5 clo, 1.1 met, 0.1 m/s)"
      >
        PMV {comfortPmv.toFixed(2)} · PPD {ppd(comfortPmv).toFixed(0)}%
      </span>
    {/if}
    <button
      type="button"
      on:click={() => (showShr = !showShr)}
      aria-pressed={showShr}
      class="px-2 py-1 rounded-md border transition-colors {showShr
        ? 'bg-fuchsia-600/20 border-fuchsia-500/50 text-fuchsia-300'
        : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white'}"
      title="Sensible heat ratio guide through the first state point"
    >
      SHR guide
    </button>
    {#if showShr}
      <input
        type="range"
        min="0.4"
        max="1"
        step="0.01"
        bind:value={shrValue}
        aria-label="Sensible heat ratio"
        class="w-24 accent-fuchsia-500"
      />
      <span class="text-fuchsia-300 w-10">{shrValue.toFixed(2)}</span>
    {/if}
    <button
      type="button"
      on:click={() => (showConnectors = !showConnectors)}
      aria-pressed={showConnectors}
      class="px-2 py-1 rounded-md border transition-colors {showConnectors
        ? 'bg-amber-600/20 border-amber-500/50 text-amber-300'
        : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white'}"
      title="Directional process connectors with delta table"
    >
      Process Δ
    </button>

    <label class="flex items-center gap-1 px-2 py-1 rounded-md border border-slate-800 bg-slate-900/70 text-slate-400">
      <span>Alt</span>
      <input
        type="number"
        step="50"
        value={Math.round($settingsStore.elevation)}
        on:change={(e) => setElevation(Number(e.currentTarget.value) || 0)}
        aria-label="Site elevation"
        class="w-14 bg-transparent text-slate-200 focus:outline-none"
      />
      <span>{isSI ? 'm' : 'ft'}</span>
    </label>
    <span class="text-slate-500">{isSI ? (pPa / 1000).toFixed(2) + ' kPa' : (pPa / 1000).toFixed(2) + ' kPa (' + ((pPa / 1000) * 0.1450377).toFixed(2) + ' psi)'}</span>

    <div class="ml-auto flex items-center gap-1.5">
      <button
        type="button"
        on:click={handlePngExport}
        class="flex items-center gap-1 px-2 py-1 rounded-md border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
        title="Download 2x PNG with property legend"
      >
        <Download class="w-3 h-3 text-blue-400" /><span>PNG 2x</span>
      </button>
      <button
        type="button"
        on:click={handleSvgExport}
        class="flex items-center gap-1 px-2 py-1 rounded-md border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
        title="Download vector SVG"
      >
        <Download class="w-3 h-3 text-emerald-400" /><span>SVG</span>
      </button>
      <button
        type="button"
        on:click={handleCopyTable}
        class="flex items-center gap-1 px-2 py-1 rounded-md border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
        title="Copy tab-separated table for Excel or Google Sheets"
      >
        {#if copyState === 'done'}
          <Check class="w-3 h-3 text-emerald-400" /><span>Copied</span>
        {:else if copyState === 'failed'}
          <Copy class="w-3 h-3 text-amber-400" /><span>Copy failed</span>
        {:else}
          <Copy class="w-3 h-3 text-cyan-400" /><span>Copy TSV</span>
        {/if}
      </button>
      <button
        type="button"
        on:click={handleCsvExport}
        class="flex items-center gap-1 px-2 py-1 rounded-md border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
        title="Download CSV"
      >
        <Download class="w-3 h-3 text-purple-400" /><span>CSV</span>
      </button>
    </div>
  </div>

  <!-- SVG Psychrometric Chart Canvas -->
  <div class="relative w-full aspect-[17/10] bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden cursor-crosshair">

    <svg
      id="psychro-svg-canvas"
      viewBox="0 0 {width} {height}"
      class="w-full h-full select-none"
      role="img"
      aria-label="Psychrometric chart with state points, comfort zones and process path"
      on:mousemove={handleMouseMove}
      on:mouseleave={handleMouseLeave}
    >
      <defs>
        <marker id="process-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
        </marker>
      </defs>
      <g transform="translate({margin.left}, {margin.top})">
        <!-- ASHRAE 55 comfort envelopes -->
        {#if showComfort}
          {#each comfortRects as zone (zone.key)}
            <rect
              x={zone.x}
              y={zone.y}
              width={zone.width}
              height={zone.height}
              fill={zone.color}
              fill-opacity="0.10"
              stroke={zone.color}
              stroke-opacity="0.45"
              stroke-width="1"
              stroke-dasharray="4 3"
            >
              <title>
                {zone.label} — PMV {zone.pmvMin.toFixed(1)} to {zone.pmvMax.toFixed(1)} at 50% RH
              </title>
            </rect>
          {/each}
        {/if}

          <!-- Constant Wet-Bulb Temperature Guidelines (Oblique Tw lines & diagonal scale labels) -->
            {#each wetBulbLines as wbLine}
              {#if wbLine}
                <path
                  d={wbLine.path}
                  fill="none"
                  stroke="#22d3ee"
                  stroke-width="1"
                  stroke-dasharray="2 3"
                  opacity="0.7"
                />
                <g transform="translate({wbLine.labelPt.x}, {wbLine.labelPt.y}) rotate({wbLine.labelPt.angle})">
                  <text
                    x="-14"
                    y="3"
                    fill="#22d3ee"
                    font-size="9"
                    font-family="JetBrains Mono"
                    font-weight="bold"
                    text-anchor="end"
                  >
                    {wbLine.val}°
                  </text>
                </g>
              {/if}
            {/each}

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
                  x="-36"
                  y="2"
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

        <!-- SHR protractor guide through the reference point -->
        {#if showShr && shrGuidePath}
          <path d={shrGuidePath} fill="none" stroke="#e879f9" stroke-width="1.8" stroke-dasharray="6 3" opacity="0.9" />
          {#if activePoints[0]}
            <text
              x={xScale(activePoints[0].dbt) + 6}
              y={yScale(activePoints[0].humRat) - 6}
              fill="#e879f9"
              font-size="9"
              font-family="JetBrains Mono"
              font-weight="bold"
            >
              SHR {shrValue.toFixed(2)}
            </text>
          {/if}
        {/if}

        <!-- Process Path connecting active state points -->
        {#if showConnectors && activePoints.length > 1}
          {#each segments as seg (seg.id)}
            <line
              x1={seg.x1}
              y1={seg.y1}
              x2={seg.x2}
              y2={seg.y2}
              stroke="#f59e0b"
              stroke-width="2"
              stroke-dasharray="5 3"
              marker-end="url(#process-arrow)"
            />
          {/each}
        {:else if processPath}
          <path d={processPath} fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5 3" />
        {/if}

        <!-- Plotted Active State Points -->
        {#each activePoints as pt}
          <g
            transform="translate({xScale(pt.dbt)}, {yScale(pt.humRat)})"
            on:click|stopPropagation={() => (selectedPointId = pt.id)}
            on:keydown={(e) => e.key === 'Enter' && (selectedPointId = pt.id)}
            role="button"
            tabindex="0"
            aria-label="Select state point {pt.id}"
            class="cursor-pointer"
          >
            {#if selectedPointId === pt.id}
              <circle r="11" fill="none" stroke="#ffffff" stroke-width="1" stroke-dasharray="2 2" opacity="0.7" />
            {/if}
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

        <!-- Subtle branding travels with PNG / SVG exports -->
        <text
          x={innerWidth}
          y={innerHeight + 46}
          fill="#64748b"
          font-size="9"
          font-family="JetBrains Mono"
          text-anchor="end"
          opacity="0.7"
        >
          psychrolab.org · Interactive Psychrometric Chart
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

  {#if showConnectors && segments.length}
    <div class="mt-3 rounded-xl border border-slate-800 bg-slate-950/60 overflow-x-auto">
      <table class="w-full text-[11px] font-mono">
        <thead class="text-slate-400 border-b border-slate-800">
          <tr>
            <th class="text-left p-2 font-semibold">Process</th>
            <th class="text-right p-2 font-semibold">ΔT<sub>db</sub></th>
            <th class="text-right p-2 font-semibold">Δω</th>
            <th class="text-right p-2 font-semibold">Δh</th>
            <th class="text-right p-2 font-semibold">SHR</th>
          </tr>
        </thead>
        <tbody>
          {#each segments as seg (seg.id)}
            <tr class="border-b border-slate-800/50">
              <td class="p-2 text-slate-300">{seg.id}</td>
              <td class="p-2 text-right text-blue-300">{seg.dT.toFixed(2)} {isSI ? '°C' : '°F'}</td>
              <td class="p-2 text-right text-cyan-300">{isSI ? seg.dW.toFixed(5) : seg.dW.toFixed(1)}</td>
              <td class="p-2 text-right text-amber-300">{seg.dH.toFixed(2)} {isSI ? 'kJ/kg' : 'Btu/lb'}</td>
              <td class="p-2 text-right text-emerald-300">{Number.isFinite(seg.shr) ? seg.shr.toFixed(3) : '—'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
      <p class="px-2 py-1.5 text-[10px] text-slate-500 font-mono">
        Click a point to select it, then nudge with ↑ ↓ (first property) and ← → (second property).
      </p>
    </div>
  {/if}
</div>
