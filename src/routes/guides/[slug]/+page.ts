import { error } from '@sveltejs/kit';
import type { Component } from 'svelte';
import { getGuide, getGuides } from '$lib/guides';

export const prerender = true;

export function entries() {
	return getGuides().map((g) => ({ slug: g.slug }));
}

const modules = import.meta.glob<{ default: Component }>('/src/content/guides/*.md', {
	eager: true
});

export function load({ params }) {
	const guide = getGuide(params.slug);
	if (!guide) error(404, 'Guide not found');

	const mod = modules[`/src/content/guides/${params.slug}.md`];
	if (!mod) error(404, 'Guide not found');

	return { guide, Content: mod.default, allGuides: getGuides() };
}