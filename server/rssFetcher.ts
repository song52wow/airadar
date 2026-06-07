import { RSSHUB_URL, RSS_SOURCES, MAX_CACHE_ITEMS } from "./config";
import { createLogger } from "./logger";

const log = createLogger("rssFetcher");

export interface RawRssItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  sourceLabel: string;
  guid: string;
}

function normalize(str: string): string {
  return str
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80)
    .toLowerCase();
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim();
}

async function fetchSource(
  route: string,
  sourceLabel: string
): Promise<RawRssItem[]> {
  const url = new URL(`${RSSHUB_URL}${route}`);
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "airadar/1.0" },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    throw new Error(`RSSHub returned ${res.status} for ${route}`);
  }

  const data = await res.json();
  const rawItems: RawRssItem[] = (data.items || []).map((item: any) => ({
    title: stripHtml(item.title || ""),
    description: stripHtml(item.description || item.content_html || "").slice(
      0,
      300
    ),
    link: item.link || item.url || "",
    pubDate: item.pubDate || item.date_published || new Date().toISOString(),
    sourceLabel,
    guid: item.guid || item.id || item.link || "",
  }));

  return rawItems;
}

export async function fetchAllSources(
  existingCache: Pick<RawRssItem, "guid" | "title">[]
): Promise<RawRssItem[]> {
  const seenKeys = new Set<string>();
  for (const cached of existingCache) {
    if (cached.guid) seenKeys.add(cached.guid);
    // also index by normalized title to catch duplicates across sources
    seenKeys.add(normalize(cached.title));
  }

  const results: RawRssItem[] = [];
  const errors: string[] = [];

  for (const source of RSS_SOURCES) {
    try {
      const items = await fetchSource(source.route, source.label);
      for (const item of items) {
        const key = item.guid || normalize(item.title);
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);
        results.push(item);
      }
    } catch (err: any) {
      errors.push(`${source.label}: ${err.message}`);
      log.warn(`Failed to fetch ${source.label}:`, err.message);
    }
  }

  // Sort newest first
  results.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  if (errors.length > 0) {
    log.warn(
      `${errors.length}/${RSS_SOURCES.length} sources failed`,
      errors
    );
  }

  log.info(
    `Fetched ${results.length} new items from ${RSS_SOURCES.length} sources`
  );

  return results.slice(0, MAX_CACHE_ITEMS);
}
