import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './index.css';

// SSR: The server injects pre-rendered HTML content inside <div id="root">
// for SEO/GEO crawlers. React's render() replaces it with the interactive app.
// Crawlers without JS see the full content; users get the interactive SPA.
const rootEl = document.getElementById('root')!;

createRoot(rootEl).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
