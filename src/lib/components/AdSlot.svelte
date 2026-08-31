<script lang="ts">
  export let slotId: string = 'banner-top';
  export let label: string = 'Engineering Partner Sponsor';
</script>

<div class="w-full glass-panel rounded-xl p-3 border border-slate-800/80 my-3 flex flex-col items-center justify-center min-h-[70px]">
  <div class="text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">{label} — Slot #{slotId}</div>
  <div class="w-full max-w-2xl h-10 rounded-lg bg-slate-900/60 border border-dashed border-slate-700/60 flex items-center justify-center text-xs font-mono text-slate-400">
    <span>[ Google AdSense / Sponsor Slot Container ]</span>
  </div>
</div>
