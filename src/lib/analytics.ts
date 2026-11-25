/**
 * Thin, fail-safe wrapper around the GA4 gtag() global injected in app.html.
 * Every call is a no-op during SSR or when analytics is blocked.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  try {
    window.gtag('event', name, params);
  } catch {
    // analytics must never break the calculator
  }
}
