/**
 * Shared data context for SSR initial data injection.
 * Server-rendered data is passed via window.__INITIAL_DATA__ and
 * consumed by components on first render to avoid loading flashes.
 */

interface InitialData {
  news: { items: any[]; isDynamic: boolean; lastFetched: string | null } | null;
  report: any;
}

declare global {
  interface Window {
    __INITIAL_DATA__?: InitialData;
  }
}

export function getInitialData(): InitialData | null {
  if (typeof window !== 'undefined' && window.__INITIAL_DATA__) {
    const data = window.__INITIAL_DATA__;
    // Clean up after reading to avoid stale data on client-side navigation
    delete window.__INITIAL_DATA__;
    return data;
  }
  return null;
}

export type { InitialData };
