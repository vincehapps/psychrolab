export type CategorySlug = 'air-conditioning' | 'refrigeration' | 'power-plants' | 'industrial-systems';

export interface Guide {
	slug: string;
	title: string;
	description: string;
	category: string;
	categorySlug: CategorySlug;
	tags: string[];
	date: string;
	readingTime: string;
}

export const CATEGORIES: { slug: CategorySlug; name: string; blurb: string }[] = [
	{
		slug: 'air-conditioning',
		name: 'Air Conditioning & Ventilation',
		blurb: 'Psychrometrics, cooling loads, air distribution and indoor air quality.'
	},
	{
		slug: 'refrigeration',
		name: 'Refrigeration Systems',
		blurb: 'Vapour compression cycles, refrigerants, components and advanced cycles.'
	},
	{
		slug: 'power-plants',
		name: 'Power Plant Engineering',
		blurb: 'Rankine cycles, reheating, regeneration and geothermal power.'
	},
	{
		slug: 'industrial-systems',
		name: 'Industrial Plant Systems',
		blurb: 'Cold storage, compressed air, water distribution and plant utilities.'
	}
];

interface GuideModule {
	default: unknown;
	metadata: {
		title: string;
		description: string;
		category: string;
		categorySlug: CategorySlug;
		tags?: string[] | string;
		date: string;
	};
}

const modules = import.meta.glob<GuideModule>('/src/content/guides/*.md', { eager: true });
const rawModules = import.meta.glob<string>('/src/content/guides/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
});

function toIsoDate(value: unknown): string {
	if (value instanceof Date) return value.toISOString().slice(0, 10);
	const s = String(value);
	return s.length >= 10 ? s.slice(0, 10) : s;
}

function readingTimeOf(raw: string): string {
	// Strip frontmatter before counting words.
	const body = raw.replace(/^---[\s\S]*?\n---/, '');
	const words = body.split(/\s+/).filter(Boolean).length;
	const minutes = Math.max(1, Math.round(words / 200));
	return `${minutes} min read`;
}

export function getGuides(): Guide[] {
	return Object.entries(modules)
		.map(([path, mod]) => {
			const slug = path.split('/').pop()!.replace(/\.md$/, '');
			const meta = mod.metadata;
			const raw = rawModules[path] ?? '';
			const tags = Array.isArray(meta.tags)
				? meta.tags
				: typeof meta.tags === 'string'
					? meta.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
					: [];
			return {
				slug,
				title: meta.title,
				description: meta.description,
				category: meta.category,
				categorySlug: meta.categorySlug,
				tags,
				date: toIsoDate(meta.date),
				readingTime: readingTimeOf(raw)
			};
		})
		.sort((a, b) => (a.date === b.date ? a.title.localeCompare(b.title) : a.date < b.date ? 1 : -1));
}

export function getGuide(slug: string): Guide | undefined {
	return getGuides().find((g) => g.slug === slug);
}