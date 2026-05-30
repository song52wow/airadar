import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './index.css';

// Get initial data injected by server-side rendering
declare global {
  interface Window {
    __INITIAL_DATA__?: {
      news: { items: any[]; isDynamic: boolean; lastFetched: string | null };
      report: any;
    };
  }
}

hydrateRoot(
  document.getElementById('root')!,
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
