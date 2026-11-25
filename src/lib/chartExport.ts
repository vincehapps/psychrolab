/**
 * Browser-side export helpers for the SVG charts: vector SVG, rasterised PNG
 * at a chosen scale with a property legend and site branding, plus
 * spreadsheet-friendly table copy/download.
 *
 * The pure render steps (serialise / rasterise) are exported separately from
 * the download wrappers so they can be exercised without writing a file.
 */

const SITE = 'psychrolab.org';
const BG = '#0b1326';

export interface SerializedChart {
  text: string;
  width: number;
  height: number;
}

function stamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function triggerDownload(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** Serialise a live <svg> into a standalone SVG document string. */
export function serializeChartSvg(svg: SVGSVGElement, extraHeight = 0): SerializedChart {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  const viewBox = (svg.getAttribute('viewBox') ?? '0 0 850 500').split(/\s+/).map(Number);
  const width = viewBox[2] || 850;
  const height = viewBox[3] || 500;

  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height + extraHeight));

  return { text: new XMLSerializer().serializeToString(clone), width, height };
}

/**
 * Rasterise the SVG at `scale`× and append a legend strip so the exported image
 * is self-documenting in reports and slide decks.
 */
export async function chartPngDataUrl(
  svg: SVGSVGElement,
  legend: string[] = [],
  scale = 2
): Promise<string> {
  const legendHeight = legend.length ? 30 : 0;
  const { text, width, height } = serializeChartSvg(svg, legendHeight);

  const blob = new Blob([text], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.crossOrigin = 'anonymous';

  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Could not rasterise chart'));
      img.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = (height + legendHeight) * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');

    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, width * scale, height * scale);

    if (legend.length) {
      const baseline = (height + legendHeight / 2) * scale;
      ctx.textBaseline = 'middle';
      ctx.font = `${11 * scale}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'left';
      ctx.fillText(legend.join('   ·   '), 14 * scale, baseline);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`${SITE}  ·  ${stamp()}`, width * scale - 14 * scale, baseline);
    }

    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Download the live SVG element as a vector file. */
export function downloadChartSvg(svg: SVGSVGElement, name = 'psychrolab-chart'): void {
  if (typeof document === 'undefined') return;
  const { text } = serializeChartSvg(svg);
  const blob = new Blob([text], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${name}-${stamp()}.svg`);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Download the chart as a branded 2× (by default) PNG. */
export async function downloadChartPng(
  svg: SVGSVGElement,
  name = 'psychrolab-chart',
  legend: string[] = [],
  scale = 2
): Promise<void> {
  if (typeof document === 'undefined') return;
  const dataUrl = await chartPngDataUrl(svg, legend, scale);
  triggerDownload(dataUrl, `${name}-${scale}x-${stamp()}.png`);
}

/** Copy a tab-separated block that pastes straight into Excel or Google Sheets. */
export async function copyTableTsv(headers: string[], rows: (string | number)[][]): Promise<boolean> {
  const tsv = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
  try {
    await navigator.clipboard.writeText(tsv);
    return true;
  } catch {
    return false;
  }
}

/** Download the same table as a CSV file. */
export function downloadTableCsv(headers: string[], rows: (string | number)[][], name = 'psychrolab-data'): void {
  if (typeof document === 'undefined') return;
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${name}-${stamp()}.csv`);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
