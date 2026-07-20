import { vi } from 'vitest';

export function installBrowserEnvironment(options: { reducedMotion?: boolean } = {}) {
  const reducedMotion = options.reducedMotion ?? false;

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn((query: string) => ({
      matches: query.includes('prefers-reduced-motion') && reducedMotion,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => false)
    }))
  });
  Object.defineProperty(window, 'IntersectionObserver', {
    configurable: true,
    value: class {
      constructor(private callback: IntersectionObserverCallback) {}

      observe = (target: Element) =>
        this.callback(
          [{ target, isIntersecting: true }] as IntersectionObserverEntry[],
          this as unknown as IntersectionObserver
        );
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = () => [];
      root = null;
      rootMargin = '0px';
      thresholds = [0];
    }
  });
  Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
    configurable: true,
    value: vi.fn()
  });
  Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
    configurable: true,
    value: vi.fn()
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: vi.fn(() => Promise.resolve())
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    value: vi.fn()
  });
}
