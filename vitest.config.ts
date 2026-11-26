import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Pure calculation modules only; no DOM is needed for the engines under test.
    environment: 'node',
    include: ['src/**/*.test.ts']
  }
});
