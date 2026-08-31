<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import HeaderNav from '$lib/components/HeaderNav.svelte';
  import SettingsModal from '$lib/components/SettingsModal.svelte';
  import ShareModal from '$lib/components/ShareModal.svelte';
  import { loadStateFromUrl } from '$lib/stores/appStore';

  onMount(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      loadStateFromUrl(urlParams);
    }
  });

  $: if ($page.url.searchParams.has('share')) {
    loadStateFromUrl($page.url.searchParams);
  }
</script>

<div class="min-h-screen bg-[#0b1326] text-slate-100 flex flex-col font-sans">
  <HeaderNav />

  <main class="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-5">
    <slot />
  </main>

  <SettingsModal />
  <ShareModal />

  <!-- Footer -->
  <footer class="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-400 font-mono">
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
      <div>PsychroLab © 2026 — High-Precision Thermodynamic & HVAC Engineering Tools</div>
      <div class="text-slate-400">ASHRAE 2017 Handbook Standards • SI & IP Systems</div>
    </div>
  </footer>
</div>
