<script lang="ts">
  import Seo from '$lib/components/Seo.svelte';
  import PracticeChart from '$lib/components/PracticeChart.svelte';
  import { solveStatePointFromPairSI } from '$lib/psychrometrics/engine';
  import { CheckCircle2, ArrowRight, BookOpen } from '@lucide/svelte';

  const P_STD = 101325;

  type Ask = 'W' | 'h' | 'dpt' | 'wbt';

  interface Question {
    tdb: number;
    rh: number;
    ask: Ask;
    answer: number;
    wAnswer: number;
    unit: string;
    tolerance: number;
    prompt: string;
  }

  const ASK_META: Record<Ask, { label: string; unit: string; tolerance: number }> = {
    W: { label: 'humidity ratio', unit: 'g/kg', tolerance: 1.2 },
    h: { label: 'specific enthalpy', unit: 'kJ/kg', tolerance: 2.0 },
    dpt: { label: 'dew point', unit: '°C', tolerance: 1.5 },
    wbt: { label: 'wet bulb', unit: '°C', tolerance: 1.5 }
  };

  function propertyAt(tC: number, w: number, ask: Ask): number {
    const st = solveStatePointFromPairSI('DBT', tC, 'HUMRAT', w, P_STD);
    switch (ask) {
      case 'W':
        return st.humRat * 1000;
      case 'h':
        return st.enthalpy;
      case 'dpt':
        return st.dpt;
      default:
        return st.wbt;
    }
  }

  function makeQuestion(): Question {
    const tdb = 8 + Math.round(Math.random() * 24);
    const rh = 35 + Math.round(Math.random() * 50);
    const asks: Ask[] = ['W', 'h', 'dpt', 'wbt'];
    const ask = asks[Math.floor(Math.random() * asks.length)];
    const st = solveStatePointFromPairSI('DBT', tdb, 'RH', rh, P_STD);
    const meta = ASK_META[ask];
    return {
      tdb,
      rh,
      ask,
      answer: propertyAt(tdb, st.humRat, ask),
      wAnswer: st.humRat,
      unit: meta.unit,
      tolerance: meta.tolerance,
      prompt: `Air at ${tdb} °C dry bulb and ${rh}% relative humidity. Click that state on the chart, then read its ${meta.label}.`
    };
  }

  let question = makeQuestion();
  let clicked: { tC: number; w: number } | null = null;
  let result: 'correct' | 'close' | 'wrong' | null = null;
  let clickedValue = 0;
  let score = 0;
  let attempts = 0;
  let streak = 0;
  let revealed = false;
  let marker: { tC: number; w: number } | null = null;

  function handlePick(tC: number, w: number) {
    clicked = { tC, w };
    clickedValue = propertyAt(tC, w, question.ask);
    const valueError = Math.abs(clickedValue - question.answer);
    const tempError = Math.abs(tC - question.tdb);

    attempts += 1;
    if (valueError <= question.tolerance && tempError <= 2) {
      result = 'correct';
      if (!revealed) {
        score += 1;
        streak += 1;
      }
    } else if (valueError <= question.tolerance * 2 && tempError <= 4) {
      result = 'close';
      streak = 0;
    } else {
      result = 'wrong';
      streak = 0;
    }
  }

  function nextQuestion() {
    question = makeQuestion();
    clicked = null;
    result = null;
    revealed = false;
    marker = null;
  }

  function reveal() {
    revealed = true;
    clicked = { tC: question.tdb, w: question.wAnswer };
    clickedValue = question.answer;
    result = null;
    marker = { tC: question.tdb, w: question.wAnswer };
    streak = 0;
  }
</script>

<Seo route="practice" />

<div class="space-y-5">
  <div class="space-y-1 border-b border-slate-800 pb-4">
    <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Psychrometric Practice Mode</h1>
    <p class="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
      Randomised chart-reading drills at standard sea-level pressure. Each problem gives a dry bulb and
      relative humidity; click the corresponding state on the chart and the tool checks both the position
      and the property you were asked to read.
    </p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
    <div class="lg:col-span-2 glass-panel rounded-2xl border border-slate-800 p-4">
      <PracticeChart onpick={handlePick} marker={marker} />
      <p class="mt-2 text-[10px] font-mono text-slate-500">
        Chart axes: dry bulb 0–50 °C, humidity ratio 0–30 g/kg. Saturation curve and 20/40/60/80% RH lines shown.
      </p>
    </div>

    <div class="glass-panel rounded-2xl border border-slate-800 p-5 space-y-4">
      <div class="flex items-center gap-2">
        <BookOpen class="w-4 h-4 text-purple-400" />
        <h2 class="text-sm font-bold text-white uppercase tracking-wider">Problem</h2>
      </div>

      <p class="text-sm text-slate-200 leading-relaxed">{question.prompt}</p>

      <div class="grid grid-cols-3 gap-2 text-center font-mono">
        <div class="rounded-lg border border-slate-800 bg-slate-950/60 p-2">
          <div class="text-[10px] text-slate-500 uppercase">Score</div>
          <div class="text-sm font-bold text-emerald-400">{score}</div>
        </div>
        <div class="rounded-lg border border-slate-800 bg-slate-950/60 p-2">
          <div class="text-[10px] text-slate-500 uppercase">Attempts</div>
          <div class="text-sm font-bold text-blue-300">{attempts}</div>
        </div>
        <div class="rounded-lg border border-slate-800 bg-slate-950/60 p-2">
          <div class="text-[10px] text-slate-500 uppercase">Streak</div>
          <div class="text-sm font-bold text-amber-300">{streak}</div>
        </div>
      </div>

      {#if clicked && result}
        <div
          class="rounded-xl border p-3 space-y-1.5 {result === 'correct'
            ? 'border-emerald-500/40 bg-emerald-500/10'
            : result === 'close'
              ? 'border-amber-500/40 bg-amber-500/10'
              : 'border-red-500/40 bg-red-500/10'}"
        >
          <p class="text-xs font-bold {result === 'correct' ? 'text-emerald-300' : result === 'close' ? 'text-amber-300' : 'text-red-300'} flex items-center gap-1.5">
            {#if result === 'correct'}<CheckCircle2 class="w-3.5 h-3.5" />{/if}
            {result === 'correct' ? 'Correct' : result === 'close' ? 'Close — keep going' : 'Not quite'}
          </p>
          <p class="text-[11px] font-mono text-slate-300">
            You clicked {clicked.tC.toFixed(1)} °C / {(clicked.w * 1000).toFixed(1)} g/kg → {clickedValue.toFixed(2)} {question.unit}
          </p>
          <p class="text-[11px] font-mono text-slate-400">
            Answer: {question.answer.toFixed(2)} {question.unit} at {question.tdb} °C / {question.rh}% RH
          </p>
        </div>
      {:else if clicked}
        <p class="text-[11px] font-mono text-slate-300">
          Clicked {clicked.tC.toFixed(1)} °C / {(clicked.w * 1000).toFixed(1)} g/kg →
          <span class="text-white font-bold">{clickedValue.toFixed(2)} {question.unit}</span>
        </p>
      {:else}
        <p class="text-[11px] font-mono text-slate-500">Click anywhere inside the chart to answer.</p>
      {/if}

      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          on:click={nextQuestion}
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
        >
          New problem <ArrowRight class="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          on:click={reveal}
          class="px-3 py-2 rounded-lg border border-slate-700 text-slate-300 text-xs font-semibold hover:text-white hover:border-slate-500"
        >
          Show answer
        </button>
      </div>

      <div class="pt-2 border-t border-slate-800 space-y-2">
        <p class="text-[10px] font-mono uppercase text-slate-500">How to read it</p>
        <p class="text-[11px] text-slate-400 leading-relaxed">
          Find the dry-bulb temperature on the horizontal axis, follow the vertical line to the relative
          humidity curve, then read across to the humidity ratio axis. Enthalpy and wet-bulb lines run
          diagonally down to the right, so a state can be cross-checked against them.
        </p>
        <a href="/psych-chart" class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-400 hover:text-blue-300">
          Practise on the full chart <ArrowRight class="w-3 h-3" />
        </a>
      </div>
    </div>
  </div>
</div>
