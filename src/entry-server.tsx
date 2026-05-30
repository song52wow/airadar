import React from 'react';
import { renderToPipeableStream, RenderToPipeableStreamOptions } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App';
import type { NewsItem } from './types';

interface InitialData {
  news: { items: NewsItem[]; isDynamic: boolean; lastFetched: string | null };
  report: any;
}

/**
 * SSR render function for Express integration.
 * Renders the React app to a pipeable stream with the given URL context.
 */
export function render(
  url: string,
  _initialData: InitialData | null,
  options?: RenderToPipeableStreamOptions,
) {
  const app = React.createElement(
    StaticRouter,
    { location: url },
    React.createElement(App),
  );

  return {
    pipe: (res: any) => {
      const { pipe } = renderToPipeableStream(app, options);
      pipe(res);
    },
  };
}
