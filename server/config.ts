export const RSSHUB_URL = process.env.RSSHUB_URL || "https://rsshub.rssforever.com";

export const POLL_INTERVAL_MS =
  Number(process.env.POLL_INTERVAL_MS) || 15 * 60 * 1000;

export const MAX_CACHE_ITEMS = 60;

export interface RssSourceConfig {
  route: string;
  label: string;
}

export const RSS_SOURCES: RssSourceConfig[] = [
  { route: "/36kr/newsflashes", label: "36氪" },
  { route: "/wallstreetcn/live/global", label: "华尔街见闻" },
  { route: "/readhub", label: "Readhub" },
  { route: "/jin10", label: "金十数据" },
  { route: "/solidot/www", label: "Solidot" },
];
