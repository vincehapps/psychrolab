import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess(), mdsvex({ extensions: ['.md'] })],
	extensions: ['.svelte', '.md'],
	kit: {
		// Pin the runtime: the adapter otherwise infers it from the local Node version
		// and refuses to build on anything newer than the Node majors it supports.
		adapter: adapter({ runtime: 'nodejs22.x' })
	}
};

export default config;