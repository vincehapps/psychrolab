import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	optimizeDeps: {
		// Keep coolprop-wasm unbundled so its `new URL('coolprop.wasm', import.meta.url)`
		// resolves against node_modules in dev and is emitted as an asset in build.
		exclude: ['coolprop-wasm']
	}
});
