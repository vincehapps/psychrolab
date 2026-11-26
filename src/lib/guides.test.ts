import { describe, expect, it } from 'vitest';
import { CATEGORIES, getGuide, getGuides } from './guides';

const guides = getGuides();

describe('guide index', () => {
  it('finds the markdown guides and derives their metadata', () => {
    expect(guides.length).toBeGreaterThan(5);
    for (const guide of guides) {
      expect(guide.slug).toMatch(/^[a-z0-9-]+$/);
      expect(guide.title.length).toBeGreaterThan(5);
      expect(guide.description.length).toBeGreaterThan(30);
      expect(guide.readingTime).toMatch(/^\d+ min read$/);
    }
  });

  it('gives every guide a unique slug and title', () => {
    expect(new Set(guides.map((g) => g.slug)).size).toBe(guides.length);
    expect(new Set(guides.map((g) => g.title)).size).toBe(guides.length);
  });

  it('uses only declared categories', () => {
    const slugs = new Set(CATEGORIES.map((c) => c.slug));
    for (const guide of guides) {
      expect(slugs, guide.slug).toContain(guide.categorySlug);
      const category = CATEGORIES.find((c) => c.slug === guide.categorySlug)!;
      expect(category.name.length).toBeGreaterThan(3);
      expect(category.blurb.length).toBeGreaterThan(10);
    }
  });

  it('normalises dates to ISO yyyy-mm-dd', () => {
    for (const guide of guides) {
      expect(guide.date, guide.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(guide.date)), guide.slug).toBe(false);
    }
  });

  it('sorts newest first', () => {
    for (let i = 1; i < guides.length; i++) {
      expect(guides[i - 1].date >= guides[i].date).toBe(true);
    }
  });

  it('estimates reading time from the word count', () => {
    for (const guide of guides) {
      const minutes = Number(guide.readingTime.split(' ')[0]);
      expect(minutes).toBeGreaterThanOrEqual(1);
      expect(minutes).toBeLessThan(60);
    }
  });

  it('looks a guide up by slug', () => {
    const first = guides[0];
    expect(getGuide(first.slug)?.title).toBe(first.title);
    expect(getGuide('this-guide-does-not-exist')).toBeUndefined();
  });

  it('carries tags through from frontmatter', () => {
    const tagged = guides.find((g) => g.tags.length > 0);
    expect(tagged).toBeDefined();
    for (const tag of tagged!.tags) {
      expect(tag.length).toBeGreaterThan(1);
      expect(tag).not.toContain(',');
    }
  });
});
