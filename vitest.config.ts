import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Loads svelte.config.js, which brings in mdsvex so the guide markdown modules
  // resolve to compiled components (with their frontmatter metadata) in tests.
  plugins: [svelte()],
  test: {
    // Pure calculation modules only; no DOM is needed for the engines under test.
    environment: 'node',
    include: ['src/**/*.test.ts']
  }
});
