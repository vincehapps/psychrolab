import { getGuides } from '$lib/guides';

export const prerender = true;

export function load() {
	return { guides: getGuides() };
}