import { fetchAllSources } from "./rssFetcher";
import { classifyItems } from "./classifier";
import { getAIClient } from "./ai/client";
import { POLL_INTERVAL_MS, MAX_CACHE_ITEMS } from "./config";
import { createLogger } from "./logger";
import type { NewsItem } from "../src/types";

const log = createLogger("newsCache");

interface CachedState {
  items: NewsItem[];
  isDynamic: boolean;
  lastFetched: string | null;
  error: string | null;
}

let state: CachedState = {
  items: [],
  isDynamic: false,
  lastFetched: null,
  error: null,
};

let pollTimer: ReturnType<typeof setInterval> | null = null;
let isPolling = false;

async function pollOnce(): Promise<void> {
  if (isPolling) return;
  isPolling = true;

  try {
    log.info("Polling RSSHub...");

    const existingGuids = state.items.map((item) => ({
      guid: item.id.replace("rss-", ""),
      title: item.summary,
    }));

    const rawItems = await fetchAllSources(existingGuids);

    if (rawItems.length === 0) {
      log.info("No new items from RSSHub");
      state.error = null;
      state.lastFetched = new Date().toISOString();
      return;
    }

    // classifyItems now works with or without AI (keyword fallback)
    const ai = getAIClient();
    const classified = await classifyItems(rawItems, ai);

    if (classified.length > 0) {
      const existingIds = new Set(state.items.map((i) => i.id));
      const uniqueNew = classified.filter((i) => !existingIds.has(i.id));
      state.items = [...uniqueNew, ...state.items].slice(0, MAX_CACHE_ITEMS);
      state.isDynamic = true;
      const mode = ai ? "AI" : "keyword";
      log.info(
        `Added ${uniqueNew.length} new items via ${mode} (total cache: ${state.items.length})`
      );
    } else {
      log.info("No items classified from this batch");
    }

    state.error = null;
    state.lastFetched = new Date().toISOString();
  } catch (err: any) {
    log.error("Poll cycle failed:", err.message);
    state.error = err.message;
  } finally {
    isPolling = false;
  }
}

export function startPolling(): void {
  pollOnce();
  pollTimer = setInterval(pollOnce, POLL_INTERVAL_MS);
  log.info(`Polling every ${POLL_INTERVAL_MS / 1000}s`);
}

export function stopPolling(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

export function getCachedNews(): CachedState {
  return { ...state };
}

export async function forceRefresh(): Promise<void> {
  await pollOnce();
}
