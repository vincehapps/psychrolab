// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { copyTableTsv, downloadChartSvg, downloadTableCsv, serializeChartSvg } from './chartExport';

const SVG_NS = 'http://www.w3.org/2000/svg';

let blobs: Blob[] = [];
let downloads: string[] = [];

function makeSvg(viewBox?: string): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  if (viewBox) svg.setAttribute('viewBox', viewBox);
  svg.appendChild(document.createElementNS(SVG_NS, 'circle'));
  return svg;
}

beforeEach(() => {
  blobs = [];
  downloads = [];
  URL.createObjectURL = vi.fn((blob: Blob) => {
    blobs.push(blob);
    return 'blob:mock';
  }) as unknown as typeof URL.createObjectURL;
  URL.revokeObjectURL = vi.fn() as unknown as typeof URL.revokeObjectURL;
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    downloads.push(this.download);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('SVG serialisation', () => {
  it('keeps the viewBox size and adds the legend strip height', () => {
    const out = serializeChartSvg(makeSvg('0 0 800 600'), 30);
    expect(out.width).toBe(800);
    expect(out.height).toBe(600);
    expect(out.text).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(out.text).toContain('width="800"');
    expect(out.text).toContain('height="630"');
    expect(out.text).toContain('<circle');
  });

  it('falls back to the default chart size without a viewBox', () => {
    const out = serializeChartSvg(makeSvg());
    expect(out.width).toBe(850);
    expect(out.height).toBe(500);
    expect(out.text).toContain('height="500"');
  });
});

describe('vector download', () => {
  it('writes a date-stamped SVG file', async () => {
    downloadChartSvg(makeSvg('0 0 100 50'), 'chart');
    expect(downloads[0]).toMatch(/^chart-\d{4}-\d{2}-\d{2}\.svg$/);
    expect(await blobs[0].text()).toContain('<svg');
  });
});

describe('CSV export', () => {
  it('quotes values containing commas and quotation marks', async () => {
    downloadTableCsv(
      ['Temp', 'Ratio'],
      [
        [25, 'a,b'],
        ['q"d', 3]
      ],
      'data'
    );

    expect(await blobs[0].text()).toBe('Temp,Ratio\n25,"a,b"\n"q""d",3');
    expect(downloads[0]).toMatch(/^data-\d{4}-\d{2}-\d{2}\.csv$/);
  });

  it('leaves plain values unquoted', async () => {
    downloadTableCsv(['A', 'B'], [[1, 2]], 'plain');
    expect(await blobs[0].text()).toBe('A,B\n1,2');
  });
});

describe('clipboard export', () => {
  it('copies a tab-separated block', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    expect(await copyTableTsv(['A', 'B'], [[1, 2]])).toBe(true);
    expect(writeText).toHaveBeenCalledWith('A\tB\n1\t2');
  });

  it('reports failure when the clipboard is blocked', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    expect(await copyTableTsv(['A'], [[1]])).toBe(false);
  });
});
