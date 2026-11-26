import { afterEach, describe, expect, it, vi } from 'vitest';
import { trackEvent } from './analytics';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('trackEvent', () => {
  it('is a silent no-op when there is no browser window', () => {
    expect(() => trackEvent('shared_state_loaded', { points: 3 })).not.toThrow();
  });

  it('forwards the event name and parameters to gtag', () => {
    const gtag = vi.fn();
    vi.stubGlobal('window', { gtag });

    trackEvent('share_link_copied', { path: '/psych-chart' });

    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith('event', 'share_link_copied', { path: '/psych-chart' });
  });

  it('defaults the parameter object to empty', () => {
    const gtag = vi.fn();
    vi.stubGlobal('window', { gtag });

    trackEvent('scenario_saved');

    expect(gtag).toHaveBeenCalledWith('event', 'scenario_saved', {});
  });

  it('ignores a window whose gtag is not callable', () => {
    vi.stubGlobal('window', { gtag: 'blocked by an extension' });
    expect(() => trackEvent('anything')).not.toThrow();
  });

  it('swallows errors thrown by a hostile gtag', () => {
    const gtag = vi.fn(() => {
      throw new Error('blocked');
    });
    vi.stubGlobal('window', { gtag });

    expect(() => trackEvent('anything')).not.toThrow();
    expect(gtag).toHaveBeenCalled();
  });
});
