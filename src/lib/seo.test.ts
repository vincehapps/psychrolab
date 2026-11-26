import { describe, expect, it } from 'vitest';
import { SEO, SITE_URL, jsonLd, jsonLdScriptTag } from './seo';

const entries = Object.entries(SEO);

describe('SEO registry', () => {
  it('gives every route a unique path', () => {
    const paths = entries.map(([, e]) => e.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('gives every route a unique, branded title', () => {
    const titles = entries.map(([, e]) => e.title);
    expect(new Set(titles).size).toBe(titles.length);
    for (const [, entry] of entries) {
      expect(entry.title).toContain('PsychroLab');
      expect(entry.title.length).toBeGreaterThan(20);
      expect(entry.title.length).toBeLessThan(70);
    }
  });

  it('writes substantive, unique descriptions', () => {
    const descriptions = entries.map(([, e]) => e.description);
    expect(new Set(descriptions).size).toBe(descriptions.length);
    for (const [, entry] of entries) {
      expect(entry.description.length).toBeGreaterThan(80);
      expect(entry.description.length).toBeLessThan(320);
    }
  });

  it('uses clean absolute paths', () => {
    for (const [, entry] of entries) {
      expect(entry.path.startsWith('/')).toBe(true);
      if (entry.path !== '/') expect(entry.path.endsWith('/')).toBe(false);
    }
  });

  it('gives each FAQ item a question and an answer', () => {
    for (const [key, entry] of entries) {
      for (const item of entry.faq ?? []) {
        expect(item.q.length, key).toBeGreaterThan(10);
        expect(item.a.length, key).toBeGreaterThan(40);
      }
    }
  });
});

describe('JSON-LD', () => {
  it('emits a WebApplication node pointing at the canonical URL', () => {
    const data = jsonLd('psych-chart') as {
      '@context': string;
      '@graph': Array<Record<string, unknown>>;
    };
    expect(data['@context']).toBe('https://schema.org');

    const app = data['@graph'][0];
    expect(app['@type']).toBe('WebApplication');
    expect(app.url).toBe(`${SITE_URL}${SEO['psych-chart'].path}`);
    expect(app.description).toBe(SEO['psych-chart'].description);
  });

  it('emits a two-level breadcrumb for sub-pages and one level for home', () => {
    const sub = jsonLd('mollier') as { '@graph': Array<{ '@type': string; itemListElement?: unknown[] }> };
    const crumb = sub['@graph'][1];
    expect(crumb['@type']).toBe('BreadcrumbList');
    expect(crumb.itemListElement).toHaveLength(2);

    const home = jsonLd('home') as { '@graph': Array<{ '@type': string; itemListElement?: unknown[] }> };
    expect(home['@graph'][1].itemListElement).toHaveLength(1);
  });

  it('adds FAQPage only for routes that define FAQs', () => {
    const withFaq = jsonLd('wet-bulb') as { '@graph': Array<{ '@type': string }> };
    const withoutFaq = jsonLd('psych-chart') as { '@graph': Array<{ '@type': string }> };
    expect(withFaq['@graph'].some((n) => n['@type'] === 'FAQPage')).toBe(true);
    expect(withoutFaq['@graph'].some((n) => n['@type'] === 'FAQPage')).toBe(false);
  });

  it('escapes closing script tags', () => {
    const tag = jsonLdScriptTag('home');
    expect(tag.startsWith('<script type="application/ld+json">')).toBe(true);
    expect(tag).not.toContain('</script></script>');
    expect(tag.slice(0, 40)).not.toContain('<script');
  });
});
