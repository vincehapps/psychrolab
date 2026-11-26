<script lang="ts">
  import { scaleLinear } from 'd3-scale';
  import { getSatVaporPressureSI, getHumRatioFromVapPress } from '$lib/psychrometrics/engine';

  export let onpick: (tC: number, w: number) => void;
  export let marker: { tC: number; w: number } | null = null;
  export let tMin = 0;
  export let tMax = 50;

  const width = 780;
  const height = 420;
  const margin = { top: 24, right: 64, bottom: 46, left: 62 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const wMax = 0.03;

  $: xScale = scaleLinear().domain([tMin, tMax]).range([0, innerWidth]);
  $: yScale = scaleLinear().domain([0, wMax]).range([innerHeight, 0]);

  $: tTicks = Array.from({ length: 11 }, (_, i) => tMin + (i * (tMax - tMin)) / 10);
  $: wTicks = Array.from({ length: 7 }, (_, i) => (i * wMax) / 6);

  $: rhCurves = [20, 40, 60, 80].map((rh) => {
    const pts: { x: number; y: number }[] = [];
    for (let t = tMin; t <= tMax; t += 0.5) {
      const w = getHumRatioFromVapPress((rh / 100) * getSatVaporPressureSI(t), 101325);
      pts.push({ x: xScale(t), y: yScale(Math.min(wMax, w)) });
    }
    const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    return { rh, path };
  });

  $: satPath = (() => {
    const pts: { x: number; y: number }[] = [];
    for (let t = tMin; t <= tMax; t += 0.5) {
      const w = getHumRatioFromVapPress(getSatVaporPressureSI(t), 101325);
      pts.push({ x: xScale(t), y: yScale(Math.min(wMax, w)) });
    }
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  })();

  function handleClick(event: MouseEvent) {
    const target = event.currentTarget as SVGSVGElement;
    const rect = target.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const x = (event.clientX - rect.left) * scaleX - margin.left;
    const y = (event.clientY - rect.top) * scaleY - margin.top;
    if (x < 0 || x > innerWidth || y < 0 || y > innerHeight) return;
    const tC = Number(xScale.invert(x).toFixed(2));
    const w = Number(yScale.invert(y).toFixed(5));
    onpick(tC, w);
  }
</script>

<div class="relative w-full aspect-[780/420] bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden">
  <svg
    viewBox="0 0 {width} {height}"
    class="w-full h-full select-none cursor-crosshair"
    on:click={handleClick}
    on:keydown={(e) => e.key === 'Enter' && onpick(25, 0.01)}
    role="button"
    tabindex="0"
    aria-label="Practice chart — click to place your answer"
  >
    <g transform="translate({margin.left}, {margin.top})">
      {#each tTicks as t (t)}
        <line x1={xScale(t)} y1="0" x2={xScale(t)} y2={innerHeight} stroke="#1e293b" stroke-dasharray="2 2" />
        <text x={xScale(t)} y={innerHeight + 16} fill="#64748b" font-size="9" font-family="JetBrains Mono" text-anchor="middle">
          {t.toFixed(0)}°
        </text>
      {/each}
      {#each wTicks as w (w)}
        <line x1="0" y1={yScale(w)} x2={innerWidth} y2={yScale(w)} stroke="#1e293b" stroke-dasharray="2 2" />
        <text x={innerWidth + 8} y={yScale(w) + 3} fill="#64748b" font-size="9" font-family="JetBrains Mono">
          {(w * 1000).toFixed(0)}
        </text>
      {/each}

      {#each rhCurves as curve (curve.rh)}
        <path d={curve.path} fill="none" stroke="#475569" stroke-width="1.1" stroke-dasharray="4 2" />
      {/each}
      <path d={satPath} fill="none" stroke="#3b82f6" stroke-width="2" />

      <text x={innerWidth / 2} y={innerHeight + 34} fill="#94a3b8" font-size="10" font-family="Inter" text-anchor="middle">
        Dry-bulb temperature (°C)
      </text>
      <text transform="rotate(-90)" x={-innerHeight / 2} y="-42" fill="#94a3b8" font-size="10" font-family="Inter" text-anchor="middle">
        Humidity ratio (g/kg)
      </text>

      {#if marker}
        <g transform="translate({xScale(marker.tC)}, {yScale(marker.w)})">
          <circle r="9" fill="#22c55e" opacity="0.25" />
          <circle r="5" fill="#22c55e" stroke="#ffffff" stroke-width="1.5" />
        </g>
      {/if}
    </g>
  </svg>
</div>
