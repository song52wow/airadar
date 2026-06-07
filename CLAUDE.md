# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**赛道雷达 Track Radar** — a Chinese-language real-time investment intelligence platform for hard-tech sectors (AI large models, humanoid robots, semiconductor chips). React 19 SPA with full SSR for SEO/GEO, server-side news polling from RSSHub, and multi-provider AI (Gemini / OpenAI-compatible) for an analyst report and chat assistant.

Live: https://trackradar.ai · Built from AI Studio: https://ai.studio/apps/8ca3a449-3020-4c82-8fa2-cdb6339166fc

## Commands

```bash
npm install
npm run dev        # Dev server: tsx server.ts (Vite middleware + SSR), port 3000
npm run build      # Build client (vite → dist/client) and server (esbuild → dist/server.cjs)
npm run build:client
npm run build:server
npm start          # Production: NODE_ENV=production node dist/server.cjs
npm run lint       # tsc --noEmit (type-check only)
npm run clean      # rm -rf dist server.js
```

No test runner is configured. `lint` is the only static check.

## Environment

Copy `.env.example` → `.env`. Key variables:

- `AI_PROVIDER` — `gemini` (default) or `openai-compat` (DeepSeek / MiniMax / Codex / 硅基流动 etc.)
- `AI_API_KEY` — required. Falls back to `GEMINI_API_KEY` for the gemini provider.
- `AI_MODEL` — optional; provider picks a default if empty.
- `AI_BASE_URL` — required only when `AI_PROVIDER=openai-compat`.
- `RSSHUB_URL` — RSSHub instance (default `https://rsshub.rssforever.com`).
- `POLL_INTERVAL_MS` — news polling cadence (default 15 min).
- `APP_URL` — public host (used in canonical/OG URLs in meta tags).

## Architecture

### Single-server design
`server.ts` is the entry point in both dev and production. It hosts:
- 4 JSON APIs: `/api/analyst/report`, `/api/analyst/chat`, `/api/news`, `/api/news/refresh`
- `robots.txt` and dynamic `sitemap.xml`
- SSR middleware (Vite middleware in dev; static `dist/client` in prod) for all non-API routes

### SSR pipeline (server.ts:512–672)
The HTML template `index.html` has three placeholders replaced at request time:
- `<!-- META_PLACEHOLDER -->` → title, description, OG/Twitter, canonical, JSON-LD (built by `buildMetaBlock` / `generateMetaTags` / `generateJsonLd`)
- `<!-- SSR_PLACEHOLDER -->` → pre-rendered `<style>` + crawler-visible HTML (from `server/renderer.ts` `renderSeoContent` / `renderSsrCss`)
- `<!-- INITIAL_DATA_PLACEHOLDER -->` → `window.__INITIAL_DATA__ = {...}` (consumed by `src/utils/dataContext.ts`)

Prod SSR has a 5-minute in-memory cache keyed by URL path. On any error, dev falls back to SPA mode and prod serves raw `dist/client/index.html`.

### News data flow
1. `server/newsCache.ts` `startPolling()` fires at server boot and every `POLL_INTERVAL_MS`.
2. `server/rssFetcher.ts` hits `RSSHUB_URL` for 5 sources (36kr / wallstreetcn / readhub / jin10 / solidot), dedupes by guid + normalized title, returns newest.
3. `server/classifier.ts` tags each item with `track: 'ai' | 'robot' | 'semiconductor'`, `impact`, `symbols`, `keywords`. Uses the AI client if configured, else keyword fallback.
4. Capped at `MAX_CACHE_ITEMS` (60, in `server/config.ts`).
5. On RSSHub failure, `INITIAL_NEWS` from `src/data.ts` is the offline fallback.

### AI client abstraction
`server/ai/client.ts` returns a cached `AIClient` chosen by `AI_PROVIDER`. Both backends implement `chat({ messages, systemInstruction?, temperature?, structuredOutput? })`:
- `backends/gemini.ts` — uses `@google/genai`, supports structured output via JSON schema.
- `backends/openai-compat.ts` — generic OpenAI Chat Completions adapter (DeepSeek, MiniMax, Codex, 硅基流动, etc.). Auto-infers `deepseek-chat` / `abab6.5s-chat` from base URL.

If no `AI_API_KEY` is set, `getAIClient()` returns `null` and `/api/analyst/*` responds 503 with `isConfigError: true`. News classification still works via keyword fallback.

### Routes (client)
`src/router.tsx` (createBrowserRouter, hydrated from `entry-client.tsx`):
- `/` — `pages/Dashboard.tsx`
- `/track/:trackId` — same `Dashboard` filtered by trackId
- `/news/:newsId` — `pages/NewsDetail.tsx`
- `/report` — `pages/ReportDetail.tsx`

`src/App.tsx` wraps with `RadarHeader` + footer; `pages/*` use components from `src/components/` (`AIAssistant`, `AIReportCard`, `NewsFeed`, `RadarHeader`).

## Conventions

- **Path alias**: `@/*` → project root (`tsconfig.json` + `vite.config.ts`).
- **HMR toggle**: set `DISABLE_HMR=true` to disable Vite HMR + file watching (saves CPU during agent edits). Production code path is unaffected.
- **SSR-noExternal**: `react-router-dom`, `motion`, `lucide-react` are bundled for SSR (`vite.config.ts`).
- **Meta tag generation is duplicated by design**: server side in `server.ts:generateMetaTags`/`generateJsonLd` (for crawlers), client side in `src/utils/seo.ts` (for SPA navigation). Keep both in sync when adding new SEO fields.
- **AdSense verification script** lives in `index.html` `<head>`. It is NOT one of the three SSR placeholders, so it is preserved across all SSR renders.
- **AI crawlers are explicitly whitelisted** in `/robots.txt` (GPTBot, Claude-Web, anthropic-ai, CCBot, PerplexityBot, Google-Extended) — keep this aligned with the GEO strategy.
- **TypeScript**: ES2022 target, `jsx: react-jsx`, `allowImportingTsExtensions`, `noEmit` (Vite/esbuild do the emitting). `experimentalDecorators` enabled but unused.

## Logging

Two thin wrappers, no external logging library:

- **Server**: `server/logger.ts` — `createLogger(module)` returns `{ debug, info, warn, error, child }`. ISO timestamp + `[LEVEL] [module]` prefix. debug/info → stdout, warn/error → stderr. Controlled by `LOG_LEVEL` env (default: `debug` in dev, `info` in prod).
- **Client**: `src/utils/logger.ts` — same interface; gated by `import.meta.env.DEV` and overridable via `VITE_LOG_LEVEL` or `window.__LOG_LEVEL__`. Production default is `warn` (no debug/info noise in user consoles).
- **HTTP access log**: `server/requestLogger.ts` mounted in `server.ts` via `app.use(requestLogger())` — logs `METHOD URL STATUS duration ua=…` per request, level auto-escalates for 4xx/5xx.
- **Ad-hoc `console.*` is banned** in `src/` and `server/` (except inside the logger files themselves). Always import `createLogger` with a module-level `const log = createLogger("…")`.
- **Module naming convention**: file basename or `parent:child` (e.g. `ai/client`, `classifier:ai`). Use `log.child("ai")` to derive sub-loggers.
