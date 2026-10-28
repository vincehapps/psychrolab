<script lang="ts">
  import { onMount } from 'svelte';
  import { Download, Image as ImageIcon, Loader2, AlertTriangle } from '@lucide/svelte';
  import {
    ensureRefrigerantReady,
    getCritical,
    getSat,
    getPsatBar,
    getH,
    getHfromPS,
    getQfromPH,
    getTfromPH,
    getTsatC,
    type RefrigerantId
  } from '$lib/refrig/engine';
  import type { CycleResult } from '$lib/refrig/cycle';

  export let refrigerant: RefrigerantId = 'R134a';
  export let cycle: CycleResult | null = null;

  const width = 1000;
  const height = 620;
  const margin = { top: 30, right: 30, bottom: 56, left: 76 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  interface Pt { h: number; p: number }
  interface DomePt { t: number; p: number; hf: number; hg: number }
  interface Isotherm { t: number; liquid: Pt[]; vapor: Pt[]; satP: number; satHf: number; satHg: number; label: Pt }

  interface Geo {
    tMin: number;
    tCrit: number;
    pMinBar: number;
    pMaxBar: number;
    hMin: number;
    hMax: number;
    dome: DomePt[];
    quality: { x: number; pts: Pt[] }[];
    isotherms: Isotherm[];
    isobarTicks: number[];
    hTicks: number[];
  }

  let ready = false;
  let building = false;
  let errorMsg = '';
  let geo: Geo | null = null;
  let svgNode: SVGSVGElement;

  // ---- scales -------------------------------------------------------------
  function xOf(h: number): number {
    if (!geo) return 0;
    return margin.left + ((h - geo.hMin) / (geo.hMax - geo.hMin)) * plotW;
  }
  function hOf(x: number): number {
    if (!geo) return 0;
    return geo.hMin + ((x - margin.left) / plotW) * (geo.hMax - geo.hMin);
  }
  function yOf(p: number): number {
    if (!geo) return 0;
    const lp = Math.log10(geo.pMinBar);
    const span = Math.log10(geo.pMaxBar) - lp;
    return margin.top + (1 - (Math.log10(Math.max(p, geo.pMinBar)) - lp) / span) * plotH;
  }
  function pOf(y: number): number {
    if (!geo) return 1;
    const lp = Math.log10(geo.pMinBar);
    const span = Math.log10(geo.pMaxBar) - lp;
    const frac = 1 - (y - margin.top) / plotH;
    return Math.pow(10, lp + frac * span);
  }

  function path(pts: Pt[]): string {
    if (!pts.length) return '';
    return pts.map((q, i) => `${i === 0 ? 'M' : 'L'} ${xOf(q.h).toFixed(1)},${yOf(q.p).toFixed(1)}`).join(' ');
  }

  // ---- geometry -----------------------------------------------------------
  function niceStep(range: number, target: number): number {
    const raw = range / target;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    const step = norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10;
    return step * mag;
  }

  function build(f: RefrigerantId): Geo {
    const crit = getCritical(f);
    const tCrit = crit.tC;
    const pMaxBar = crit.pBar;
    const tMin = getChartTminSafe(f);
    const pMinBar = getPsatBar(f, tMin);

    // Saturation dome
    const dome: DomePt[] = [];
    const n = 72;
    for (let i = 0; i <= n; i++) {
      const t = tMin + ((tCrit - tMin) * i) / n;
      const sat = getSat(f, t);
      dome.push({ t, p: sat.pBar, hf: sat.hf, hg: sat.hg });
    }

    // Isotherms
    const isoTemps: number[] = [];
    for (let t = Math.ceil(tMin / 10) * 10; t < tCrit - 0.5; t += 10) isoTemps.push(t);
    isoTemps.push(Number(tCrit.toFixed(1)));
    const tCritRound = Math.ceil(tCrit / 10) * 10;
    for (let t = tCritRound + 20; t <= tCritRound + 60; t += 20) isoTemps.push(t);

    const isotherms: Isotherm[] = [];
    let hMin = Infinity;
    let hMax = -Infinity;

    for (const t of isoTemps) {
      if (t <= tCrit) {
        const sat = getSat(f, t);
        const liquid: Pt[] = [{ h: sat.hf, p: sat.pBar }];
        const vapor: Pt[] = [{ h: sat.hg, p: sat.pBar }];
        for (let i = 1; i <= 4; i++) {
          const p = sat.pBar * Math.pow(pMaxBar / sat.pBar, i / 4);
          liquid.push({ h: getH(f, p * 1e5, t), p });
        }
        for (let i = 1; i <= 5; i++) {
          const p = sat.pBar * Math.pow(pMinBar / sat.pBar, i / 5);
          vapor.push({ h: getH(f, p * 1e5, t), p });
        }
        isotherms.push({ t, liquid, vapor, satP: sat.pBar, satHf: sat.hf, satHg: sat.hg, label: vapor[vapor.length - 1] });
        for (const q of [...liquid, ...vapor]) {
          hMin = Math.min(hMin, q.h);
          hMax = Math.max(hMax, q.h);
        }
      } else {
        const pts: Pt[] = [];
        for (let i = 0; i <= 8; i++) {
          const p = pMinBar * Math.pow(pMaxBar / pMinBar, i / 8);
          pts.push({ h: getH(f, p * 1e5, t), p });
        }
        isotherms.push({ t, liquid: pts, vapor: [], satP: NaN, satHf: NaN, satHg: NaN, label: pts[0] });
        for (const q of pts) {
          hMin = Math.min(hMin, q.h);
          hMax = Math.max(hMax, q.h);
        }
      }
    }

    for (const d of dome) {
      hMin = Math.min(hMin, d.hf);
      hMax = Math.max(hMax, d.hg);
    }

    const pad = (hMax - hMin) * 0.03;
    hMin -= pad;
    hMax += pad;

    // Quality lines
    const quality = [0.2, 0.4, 0.6, 0.8].map((x) => ({
      x,
      pts: dome.map((d) => ({ h: d.hf + x * (d.hg - d.hf), p: d.p }))
    }));

    // Axis ticks
    const hStep = niceStep(hMax - hMin, 9);
    const hTicks: number[] = [];
    for (let h = Math.ceil(hMin / hStep) * hStep; h <= hMax; h += hStep) hTicks.push(Number(h.toFixed(1)));

    const candidates = [0.2, 0.3, 0.5, 0.7, 1, 1.5, 2, 3, 5, 7, 10, 15, 20, 30, 50, 70, 100, 150, 200, 300];
    const isobarTicks = candidates.filter((p) => p >= pMinBar && p <= pMaxBar);

    return { tMin, tCrit, pMinBar, pMaxBar, hMin, hMax, dome, quality, isotherms, isobarTicks, hTicks };
  }

  function getChartTminSafe(f: RefrigerantId): number {
    for (let t = 0; t >= -70; t -= 1) {
      if (getPsatBar(f, t) < 0.3) return t + 1;
    }
    return -60;
  }

  // ---- lifecycle ----------------------------------------------------------
  onMount(() => {
    let cancelled = false;
    building = true;
    ensureRefrigerantReady()
      .then(() => {
        if (cancelled) return;
        ready = true;
        geo = build(refrigerant);
        building = false;
      })
      .catch((err: unknown) => {
        errorMsg = `Could not load the refrigerant property database: ${String(err)}`;
        building = false;
      });
    return () => {
      cancelled = true;
    };
  });

  let lastBuilt: RefrigerantId | null = null;
  $: if (ready && refrigerant && refrigerant !== lastBuilt) {
    lastBuilt = refrigerant;
    building = true;
    // let the loading state paint before the synchronous build
    setTimeout(() => {
      geo = build(refrigerant);
      building = false;
    }, 16);
  }

  // ---- cycle overlay ------------------------------------------------------
  let compPath: Pt[] = [];
  $: compPath = cycle && ready ? sampleCompression(cycle) : [];

  function sampleCompression(c: CycleResult): Pt[] {
    const s1 = c.states[0].s;
    const p1 = c.states[0].pBar;
    const p2 = c.states[1].pBar;
    const pts: Pt[] = [];
    for (let i = 0; i <= 8; i++) {
      const p = p1 * Math.pow(p2 / p1, i / 8);
      pts.push({ h: getHfromPS(c.refrigerant, p * 1e5, s1), p });
    }
    return pts;
  }

  // ---- hover inspector ----------------------------------------------------
  let showCrosshair = false;
  let cursorX = 0;
  let cursorY = 0;
  let readout = { tC: 0, pBar: 0, h: 0, x: -1, region: '—' };

  function handleMouseMove(e: MouseEvent) {
    if (!geo || !ready) return;
    const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (x < margin.left || x > width - margin.right || y < margin.top || y > height - margin.bottom) {
      showCrosshair = false;
      return;
    }

    showCrosshair = true;
    cursorX = x;
    cursorY = y;

    const h = hOf(x);
    const pBar = pOf(y);
    const pPa = pBar * 1e5;
    const q = getQfromPH(refrigerant, pPa, h);

    if (q >= 0) {
      const tC = getTsatC(refrigerant, pPa);
      readout = {
        tC,
        pBar,
        h,
        x: q,
        region: q <= 0.0001 ? 'Saturated liquid' : q >= 0.9999 ? 'Saturated vapor' : 'Two-phase mixture'
      };
    } else {
      const tC = getTfromPH(refrigerant, pPa, h);
      const tSat = getTsatC(refrigerant, pPa);
      let region = '—';
      if (Number.isFinite(tSat) && tSat > geo.tMin) {
        const hf = getH(refrigerant, pPa, tSat);
        region = h < hf ? 'Subcooled liquid' : 'Superheated vapor';
      }
      readout = { tC, pBar, h, x: -1, region };
    }
  }

  function handleMouseLeave() {
    showCrosshair = false;
  }

  // ---- export -------------------------------------------------------------
  function serializeSvg(): string {
    const clone = svgNode.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', String(width));
    clone.setAttribute('height', String(height));
    return new XMLSerializer().serializeToString(clone);
  }

  function download(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  function exportSvg() {
    const blob = new Blob([serializeSvg()], { type: 'image/svg+xml;charset=utf-8' });
    download(blob, `psychrolab-ph-chart-${refrigerant}.svg`);
  }

  function exportPng() {
    const svgStr = serializeSvg();
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * 2;
      canvas.height = height * 2;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#070d1e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => b && download(b, `psychrolab-ph-chart-${refrigerant}.png`), 'image/png');
    };
    img.src = url;
  }

  const fmt = (v: number, d = 1) => (Number.isFinite(v) ? v.toFixed(d) : '—');
</script>

<div class="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
  <!-- Inspector bar -->
  <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-800 bg-slate-950/40">
    <div class="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-mono">
      <span class="text-slate-500 uppercase text-[10px]">T</span>
      <span class="text-white font-bold">{showCrosshair ? `${fmt(readout.tC)} °C` : '—'}</span>
      <span class="text-slate-500 uppercase text-[10px]">P</span>
      <span class="text-cyan-300 font-bold">{showCrosshair ? `${fmt(readout.pBar, 3)} bar` : '—'}</span>
      <span class="text-slate-500 uppercase text-[10px]">h</span>
      <span class="text-amber-300 font-bold">{showCrosshair ? `${fmt(readout.h)} kJ/kg` : '—'}</span>
      <span class="text-slate-500 uppercase text-[10px]">x</span>
      <span class="text-emerald-300 font-bold">{showCrosshair && readout.x >= 0 ? `${(readout.x * 100).toFixed(1)} %` : '—'}</span>
      <span class="text-slate-400">{showCrosshair ? readout.region : 'Hover the diagram'}</span>
    </div>
    <div class="flex items-center gap-2">
      <button
        type="button"
        on:click={exportPng}
        disabled={!ready}
        class="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-200 transition-colors disabled:opacity-40"
      >
        <ImageIcon class="w-3.5 h-3.5 text-blue-400" />
        <span>PNG</span>
      </button>
      <button
        type="button"
        on:click={exportSvg}
        disabled={!ready}
        class="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-200 transition-colors disabled:opacity-40"
      >
        <Download class="w-3.5 h-3.5 text-emerald-400" />
        <span>SVG</span>
      </button>
    </div>
  </div>

  <div class="relative w-full bg-[#070d1e]">
    {#if building || (!ready && !errorMsg)}
      <div class="absolute inset-0 z-10 flex items-center justify-center space-x-2 text-xs font-mono text-slate-400">
        <Loader2 class="w-4 h-4 animate-spin text-blue-400" />
        <span>Loading refrigerant property database…</span>
      </div>
    {/if}
    {#if errorMsg}
      <div class="absolute inset-0 z-10 flex items-center justify-center space-x-2 text-xs font-mono text-amber-400 px-6 text-center">
        <AlertTriangle class="w-4 h-4 shrink-0" />
        <span>{errorMsg}</span>
      </div>
    {/if}

    <svg
      bind:this={svgNode}
      viewBox="0 0 {width} {height}"
      class="w-full h-auto cursor-crosshair"
      class:invisible={!ready || building}
      role="img"
      aria-label="Pressure-enthalpy diagram"
      on:mousemove={handleMouseMove}
      on:mouseleave={handleMouseLeave}
    >
      <rect x="0" y="0" {width} {height} fill="#070d1e" />

      {#if geo}
        <!-- Isobar grid + labels -->
        {#each geo.isobarTicks as p (p)}
          <line
            x1={margin.left}
            y1={yOf(p)}
            x2={width - margin.right}
            y2={yOf(p)}
            stroke="#1e293b"
            stroke-width="1"
          />
          <text
            x={margin.left - 8}
            y={yOf(p) + 3}
            fill="#64748b"
            font-size="10"
            font-family="monospace"
            text-anchor="end"
          >{p}</text>
        {/each}

        <!-- Enthalpy grid + labels -->
        {#each geo.hTicks as h (h)}
          <line
            x1={xOf(h)}
            y1={margin.top}
            x2={xOf(h)}
            y2={height - margin.bottom}
            stroke="#1e293b"
            stroke-width="1"
          />
          <text
            x={xOf(h)}
            y={height - margin.bottom + 16}
            fill="#64748b"
            font-size="10"
            font-family="monospace"
            text-anchor="middle"
          >{h}</text>
        {/each}

        <!-- Isotherms -->
        {#each geo.isotherms as iso (iso.t)}
          {#if Number.isFinite(iso.satP)}
            <!-- liquid branch -->
            <path d={path(iso.liquid)} fill="none" stroke="#38bdf8" stroke-opacity="0.45" stroke-width="1" />
            <!-- horizontal two-phase segment -->
            <line
              x1={xOf(iso.satHf)}
              y1={yOf(iso.satP)}
              x2={xOf(iso.satHg)}
              y2={yOf(iso.satP)}
              stroke="#38bdf8"
              stroke-opacity="0.45"
              stroke-width="1"
            />
            <!-- vapor branch -->
            <path d={path(iso.vapor)} fill="none" stroke="#38bdf8" stroke-opacity="0.45" stroke-width="1" />
          {:else}
            <path d={path(iso.liquid)} fill="none" stroke="#38bdf8" stroke-opacity="0.45" stroke-width="1" />
          {/if}
          <text
            x={xOf(iso.label.h)}
            y={yOf(iso.label.p) - 5}
            fill="#38bdf8"
            fill-opacity="0.85"
            font-size="9"
            font-family="monospace"
            text-anchor="middle"
          >{iso.t}°</text>
        {/each}

        <!-- Dome fill + outline -->
        <path
          d="{geo.dome.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xOf(d.hf).toFixed(1)},${yOf(d.p).toFixed(1)}`).join(' ')}
             {geo.dome.slice().reverse().map((d) => `L ${xOf(d.hg).toFixed(1)},${yOf(d.p).toFixed(1)}`).join(' ')} Z"
          fill="url(#domeGrad)"
          stroke="none"
        />
        <path
          d="{geo.dome.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xOf(d.hf).toFixed(1)},${yOf(d.p).toFixed(1)}`).join(' ')}"
          fill="none"
          stroke="#38bdf8"
          stroke-width="1.6"
        />
        <path
          d="{geo.dome.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xOf(d.hg).toFixed(1)},${yOf(d.p).toFixed(1)}`).join(' ')}"
          fill="none"
          stroke="#38bdf8"
          stroke-width="1.6"
        />

        <!-- Quality lines -->
        {#each geo.quality as q (q.x)}
          <path d={path(q.pts)} fill="none" stroke="#34d399" stroke-opacity="0.5" stroke-width="1" stroke-dasharray="4,4" />
          <text
            x={xOf(q.pts[Math.floor(q.pts.length * 0.65)].h)}
            y={yOf(q.pts[Math.floor(q.pts.length * 0.65)].p) - 4}
            fill="#34d399"
            fill-opacity="0.9"
            font-size="9"
            font-family="monospace"
            text-anchor="middle"
          >x={q.x}</text>
        {/each}

        <defs>
          <linearGradient id="domeGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stop-color="#0284c7" stop-opacity="0.12" />
            <stop offset="100%" stop-color="#6366f1" stop-opacity="0.28" />
          </linearGradient>
        </defs>
      {/if}

      <!-- Cycle overlay -->
      {#if cycle && geo}
        <path d={path(compPath)} fill="none" stroke="#f59e0b" stroke-width="2" stroke-linejoin="round" />
        <path
          d="M {xOf(cycle.states[1].h)},{yOf(cycle.states[1].pBar)}
             L {xOf(cycle.states[2].h)},{yOf(cycle.states[2].pBar)}
             L {xOf(cycle.states[3].h)},{yOf(cycle.states[3].pBar)}
             L {xOf(cycle.states[0].h)},{yOf(cycle.states[0].pBar)}"
          fill="none"
          stroke="#f59e0b"
          stroke-width="2"
          stroke-linejoin="round"
        />
        {#each cycle.states as st, i (st.label)}
          <circle
            cx={xOf(st.h)}
            cy={yOf(st.pBar)}
            r="5"
            fill="#f59e0b"
            stroke="#ffffff"
            stroke-width="1.5"
          />
          <text
            x={xOf(st.h) + (i === 1 || i === 2 ? 9 : 9)}
            y={yOf(st.pBar) - 8}
            fill="#ffffff"
            font-size="11"
            font-weight="bold"
            font-family="monospace"
          >{st.label}</text>
        {/each}
      {/if}

      <!-- Crosshair -->
      {#if showCrosshair}
        <line x1={cursorX} y1={margin.top} x2={cursorX} y2={height - margin.bottom} stroke="#38bdf8" stroke-width="1" stroke-dasharray="3,3" stroke-opacity="0.8" />
        <line x1={margin.left} y1={cursorY} x2={width - margin.right} y2={cursorY} stroke="#38bdf8" stroke-width="1" stroke-dasharray="3,3" stroke-opacity="0.8" />
        <circle cx={cursorX} cy={cursorY} r="4" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" />
      {/if}

      <!-- Axes -->
      <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#475569" stroke-width="1.5" />
      <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#475569" stroke-width="1.5" />

      <text x={width / 2} y={height - 14} fill="#94a3b8" font-size="12" font-weight="600" font-family="monospace" text-anchor="middle">
        Specific Enthalpy h [kJ/kg]
      </text>
      <text x={-(height / 2)} y={16} transform="rotate(-90)" fill="#94a3b8" font-size="12" font-weight="600" font-family="monospace" text-anchor="middle">
        Pressure P [bar, log scale]
      </text>
      {#if geo}
        <text x={width - margin.right} y={margin.top - 10} fill="#64748b" font-size="11" font-family="monospace" text-anchor="end">
          {refrigerant} — saturation dome {geo.tMin}°C to {geo.tCrit.toFixed(1)}°C
        </text>
      {/if}
    </svg>
  </div>
</div>