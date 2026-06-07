import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { INITIAL_NEWS } from "./src/data";
import { startPolling, getCachedNews, forceRefresh } from "./server/newsCache";
import { getAIClient } from "./server/ai/client";
import { renderSeoContent, renderSsrCss } from "./server/renderer";
import { createLogger } from "./server/logger";
import { requestLogger } from "./server/requestLogger";

const log = createLogger("server");

dotenv.config();

// Start RSSHub news polling
startPolling();

// Compat: ESM (tsx dev) vs CJS (esbuild production)
const _filename: string = (() => {
  try { return fileURLToPath(import.meta.url); } catch { /* CJS fallback */ }
  try { return __filename as any; } catch { /* ignore */ }
  return process.cwd();
})();
const _dirname = path.dirname(_filename);

const isProduction = process.env.NODE_ENV === "production";

const REPORT_SCHEMA = {
  type: "object",
  properties: {
    sentimentIndex: {
      type: "integer",
      description: "Market sentiment rating from 0 to 100",
    },
    marketVibe: {
      type: "string",
      description: "A succinct caption summarizing today's tech market atmosphere (15 chars max)",
    },
    keyTakeaways: {
      type: "array",
      items: { type: "string" },
      description: "Three profound macroeconomic takeaways (30-50 chars each)",
    },
    trackAnalysis: {
      type: "object",
      properties: {
        ai: { type: "string" },
        robot: { type: "string" },
        semiconductor: { type: "string" },
      },
      required: ["ai", "robot", "semiconductor"],
    },
    hotCompanies: {
      type: "array",
      items: { type: "string" },
      description: "List of 4 hot companies/stock codes",
    },
  },
  required: [
    "sentimentIndex",
    "marketVibe",
    "keyTakeaways",
    "trackAnalysis",
    "hotCompanies",
  ],
};

/**
 * Generate dynamic SEO meta tags based on the requested URL
 */
function generateMetaTags(url: string, newsTitle?: string, reportData?: any): string {
  const siteName = "赛道雷达 Track Radar";
  const baseUrl = "https://trackradar.ai";
  const defaultTitle = "赛道雷达 · Track Radar — AI/机器人/半导体硬科技投资情报";
  const defaultDesc = "聚焦 AI 大模型、人形机器人、半导体芯片三大硬科技赛道，聚合实时新闻与 AI 投研分析。";

  let title = defaultTitle;
  let description = defaultDesc;
  let canonical = `${baseUrl}${url}`;
  let ogType = "website";

  if (url.startsWith("/track/ai")) {
    title = "AI 大模型赛道 — 赛道雷达 Track Radar";
    description = "AI 大模型赛道实时快讯：OpenAI、微软星际之门、DeepSeek、智谱、Kimi 等大模型与算力投资动态。";
  } else if (url.startsWith("/track/robot")) {
    title = "人形机器人赛道 — 赛道雷达 Track Radar";
    description = "人形机器人赛道实时快讯：特斯拉 Optimus、宇树科技、傅利叶 GR-2 等具身智能与人形机器人量产动态。";
  } else if (url.startsWith("/track/semiconductor")) {
    title = "半导体芯片赛道 — 赛道雷达 Track Radar";
    description = "半导体芯片赛道实时快讯：台积电 A16、英伟达 Blackwell、HBM4、先进封装等半导体产业链动态。";
  } else if (url.startsWith("/news/") && newsTitle) {
    title = `${newsTitle.slice(0, 60)} — 赛道雷达`;
    description = newsTitle;
  } else if (url === "/report") {
    title = "AI 投研日报 — 赛道雷达 Track Radar";
    description = reportData?.marketVibe
      ? `市场情绪指数 ${reportData.sentimentIndex}%，${reportData.marketVibe} — AI 投研合伙人每日简报`
      : "赛道雷达 AI 投研合伙人每日简报，覆盖 AI 大模型、人形机器人、半导体芯片三大赛道。";
    ogType = "article";
  }

  return `
<title>${title}</title>
<meta name="description" content="${description}" />
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
<meta property="og:type" content="${ogType}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:site_name" content="${siteName}" />
<meta property="og:locale" content="zh_CN" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<link rel="canonical" href="${canonical}" />`;
}

/**
 * Generate JSON-LD structured data based on URL
 */
function generateJsonLd(url: string, initialData: any): string {
  const baseUrl = "https://trackradar.ai";
  const scripts: string[] = [];

  // WebSite (for all pages)
  scripts.push(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "赛道雷达 Track Radar",
    url: baseUrl,
    description: "实时硬科技投资情报与 AI 投研分析平台",
    inLanguage: "zh-CN",
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  }));

  // Organization
  scripts.push(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "赛道雷达 Track Radar",
    url: baseUrl,
    description: "聚焦 AI 大模型、人形机器人、半导体芯片三大硬科技赛道的投资情报平台",
    knowsAbout: ["AI大模型", "人形机器人", "半导体芯片", "硬科技投资", "科技新闻"],
  }));

  // BreadcrumbList
  const breadcrumbItems: any[] = [
    { "@type": "ListItem", position: 1, name: "首页", item: baseUrl },
  ];

  if (url.startsWith("/track/")) {
    const trackMap: Record<string, string> = { ai: "AI 大模型", robot: "人形机器人", semiconductor: "半导体芯片" };
    const trackId = url.split("/track/")[1];
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 2,
      name: trackMap[trackId] || trackId,
      item: `${baseUrl}/track/${trackId}`,
    });
  } else if (url === "/report") {
    breadcrumbItems.push({ "@type": "ListItem", position: 2, name: "AI 投研日报", item: `${baseUrl}/report` });
  } else if (url.startsWith("/news/")) {
    const newsId = url.split("/news/")[1];
    const news = initialData?.news?.items?.find((n: any) => n.id === newsId);
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 2,
      name: news?.summary?.slice(0, 30) || "快讯详情",
      item: `${baseUrl}/news/${newsId}`,
    });
  }

  scripts.push(JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  }));

  // Page-specific structured data
  if (url.startsWith("/news/") && initialData?.news) {
    const newsId = url.split("/news/")[1];
    const news = initialData.news.items.find((n: any) => n.id === newsId);
    if (news) {
      scripts.push(JSON.stringify({
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: news.summary,
        datePublished: `2026-05-30T${news.time}:00+08:00`,
        author: { "@type": "Organization", name: news.source },
        publisher: { "@type": "Organization", name: "赛道雷达 Track Radar", url: baseUrl },
        about: news.keywords.map((kw: string) => ({ "@type": "Thing", name: kw })),
        articleBody: news.details,
        keywords: news.keywords.join(", "),
        mainEntityOfPage: { "@type": "WebPage", "@id": `${baseUrl}/news/${news.id}` },
      }));
    }
  }

  if (url === "/report" && initialData?.report) {
    scripts.push(JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "赛道雷达 AI 投研日报 — 硬科技投资简报",
      description: `市场情绪指数 ${initialData.report.sentimentIndex}%，${initialData.report.marketVibe}`,
      datePublished: new Date().toISOString().split("T")[0],
      author: { "@type": "Organization", name: "赛道雷达 Track Radar AI" },
      publisher: { "@type": "Organization", name: "赛道雷达 Track Radar", url: baseUrl },
      about: [
        { "@type": "Thing", name: "AI大模型" },
        { "@type": "Thing", name: "人形机器人" },
        { "@type": "Thing", name: "半导体芯片" },
        { "@type": "Thing", name: "硬科技投资" },
      ],
      mainEntityOfPage: { "@type": "WebPage", "@id": `${baseUrl}/report` },
    }));
  }

  return scripts.map((s) => `<script type="application/ld+json">${s}</script>`).join("\n");
}

/**
 * Build the full SEO meta block (title, description, OG, Twitter, canonical, JSON-LD)
 */
function buildMetaBlock(url: string, initialData: any): string {
  const parts: string[] = [];

  // Keywords and author (static)
  parts.push('<meta name="keywords" content="赛道雷达,Track Radar,AI投资,大模型,人形机器人,半导体,芯片,硬科技,科技新闻,投资情报,AI投研" />');
  parts.push('<meta name="author" content="Track Radar AI" />');

  // Dynamic route-specific meta
  parts.push(generateMetaTags(
    url,
    initialData?.newsTitle,
    initialData?.report,
  ));

  // JSON-LD structured data
  parts.push(generateJsonLd(url, initialData));

  return parts.join("\n    ");
}

/**
 * Build the initial data script tag
 */
function buildInitialDataScript(newsItems: any[]): string {
  const initialData = {
    news: {
      items: newsItems,
      isDynamic: newsItems.length > 0,
      lastFetched: new Date().toISOString(),
    },
    report: null,
  };
  return `<script>window.__INITIAL_DATA__ = ${JSON.stringify(initialData)};</script>`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(requestLogger());

  // Helper to get AI client or respond with error
  function requireAIClient(res: express.Response) {
    const client = getAIClient();
    if (!client) {
      res.status(503).json({
        error: "AI 服务未配置。请设置 AI_API_KEY（或 GEMINI_API_KEY）环境变量。",
        isConfigError: true,
      });
      return null;
    }
    return client;
  }

  // API Route 1: Generate dynamic AI Investor Report
  app.get("/api/analyst/report", async (req, res) => {
    try {
      const client = requireAIClient(res);
      if (!client) return;

      const { items: newsData } = getCachedNews();
      const activeNews = newsData.length > 0 ? newsData : INITIAL_NEWS;

      const prompt = `你是一位顶尖的硬科技赛道（AI大模型、人形机器人、半导体芯片）核心投研合伙人。这里是今日的所有行业投资快讯：
${JSON.stringify(activeNews, null, 2)}

请深度阅读并交叉关联上面的行业雷达快讯，输出今日的宏观半导体与 AI/具身智能投资简报。
请完全遵守下面的 JSON 格式和属性要求输出（输出必须是合法的 JSON 字符串，不做任何多余的包裹，可解析）：

- sentimentIndex: 市场整体情绪指数，取值 0 到 100 之间的整数（例如：85 代表高涨，40 代表低迷保守）
- marketVibe: 对今日硬科技市场总体氛围的一句话点评（15字以内）
- keyTakeaways: 3条今日最核心、高屋建瓴的硬科技赛道宏观投研洞察（每条 30-50 字，富有穿透力和前瞻眼光）
- trackAnalysis: 包含下述三个赛道的具体总结：
  - ai: 大模型与开源生态的最新演进及算力采购格局变化总结，并给出一句直接的买入/观望投资配置建议（60-90字）
  - robot: 人形机器人与具身智能在量产线、家庭端或者工信部标准制订上的演进解读评估（60-90字）
  - semiconductor: 半导体先进工艺（如 A16背面供电）、高宽带内存 HBM4 或通用 GPU 核心突破及订单对攻分析评估（60-90字）
- hotCompanies: 今日最值得投研跟踪的 4 家热门实体公司/股票代码（如 NVDA, TSMC, AAPL, 宇树科技 ），形式为字符串数组。`;

      const response = await client.chat({
        messages: [{ role: "user", content: prompt }],
        structuredOutput: { schema: REPORT_SCHEMA },
      });

      const parsedData = JSON.parse(response.text || "{}");
      // Echo the active provider/model so the client can label the "实时分析成功" banner
      // with the real model name (instead of a hardcoded one).
      res.json({
        ...parsedData,
        _meta: {
          provider: process.env.AI_PROVIDER || "gemini",
          model: process.env.AI_MODEL || null,
        },
      });
    } catch (error: any) {
      log.error("Failed to generate investment report:", error);
      res.status(500).json({
        error: error.message || "Internal server error generating report.",
        isConfigError: error.message?.includes("API_KEY"),
      });
    }
  });

  // API Route 2: Grounded Q&A Chat Client with AI investment analyst
  app.post("/api/analyst/chat", async (req, res) => {
    try {
      const client = requireAIClient(res);
      if (!client) return;

      const { message, history = [] } = req.body;

      if (!message) {
        return res
          .status(400)
          .json({ error: "Missing required 'message' in request body." });
      }

      const { items: chatNews } = getCachedNews();
      const activeChatNews = chatNews.length > 0 ? chatNews : INITIAL_NEWS;

      const systemInstruction = `你是一位精通人工智能、人形机器人、半导体芯片三大硬科技赛道的顶尖投资理财基金经理（花名：雷达大师）。你正在为大众及专业机构投资者提供今日最新动态的深度研判解答。
今天的最新硬科技赛道行业雷达快讯如下（请将其作为最核心的实时事实依据）：
${JSON.stringify(activeChatNews, null, 2)}

【回答指南】：
- 使用友好、极其专业、富有逻辑、有条理且稍带幽默感的基金经理人设。
- 善于结合今日新闻的数据（如：1000亿美元星际之门，9.9万元 Unitree H1-E，A16 背面供电工艺，12层 HBM4）解答。
- 给出清晰敏锐的"黄金投资直觉"。
- 每次回答必须控制在 150 - 300 字之间（精炼至上，避免废话）。
- 如果用户提问的内容与今日快讯毫无关系、也不是关于这三个硬科技领域（AI、机器人、半导体），请幽默而温柔地提醒对方，并拉回到今日的主线行情上来。
- 直接输出 Markdown 文本，结构层次要清晰。`;

      // Build messages from history (unified format)
      const messages = history.map((h: any) => ({
        role: h.role === "model" ? "assistant" : h.role,
        content: h.text || h.content || "",
      }));

      // Append current message
      messages.push({ role: "user", content: message });

      const response = await client.chat({
        messages,
        systemInstruction,
        temperature: 0.7,
      });

      const text =
        response.text ||
        "非常抱歉，雷达信号受到些许电磁波干扰，请您重新发送一次您的投资咨询。";
      res.json({ text });
    } catch (error: any) {
      log.error("Failed in analyst chat conversation:", error);
      res.status(500).json({
        error: error.message || "Internal server error in conversation.",
        isConfigError: error.message?.includes("API_KEY"),
      });
    }
  });

  // API Route 3: Get cached news feed (dynamic or fallback)
  app.get("/api/news", (req, res) => {
    const { items, isDynamic, lastFetched, error } = getCachedNews();
    if (items.length > 0) {
      res.json({ items, count: items.length, isDynamic, lastFetched, error });
    } else {
      res.json({
        items: INITIAL_NEWS,
        count: INITIAL_NEWS.length,
        isDynamic: false,
        lastFetched: null,
        error: error ?? "RSSHub 数据暂不可用，已切换至离线静态数据",
      });
    }
  });

  // API Route 4: Force refresh news from RSSHub
  app.post("/api/news/refresh", async (req, res) => {
    try {
      await forceRefresh();
      const { items, isDynamic } = getCachedNews();
      res.json({ success: true, count: items.length, isDynamic });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ============================
  // Sitemap & Robots
  // ============================

  // Serve robots.txt
  app.get("/robots.txt", (req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send(`User-agent: *
Allow: /
Disallow: /api/

# AI Crawlers
User-agent: GPTBot
Allow: /
Disallow: /api/

User-agent: Claude-Web
Allow: /
Disallow: /api/

User-agent: anthropic-ai
Allow: /
Disallow: /api/

User-agent: CCBot
Allow: /
Disallow: /api/

User-agent: PerplexityBot
Allow: /
Disallow: /api/

User-agent: Google-Extended
Allow: /
Disallow: /api/

Sitemap: https://trackradar.ai/sitemap.xml`);
  });

  // Dynamic sitemap.xml
  app.get("/sitemap.xml", (req, res) => {
    const baseUrl = "https://trackradar.ai";
    const today = new Date().toISOString().split("T")[0];

    // Static routes
    const staticRoutes = [
      { loc: "/", priority: "1.0", changefreq: "hourly" },
      { loc: "/track/ai", priority: "0.9", changefreq: "hourly" },
      { loc: "/track/robot", priority: "0.9", changefreq: "hourly" },
      { loc: "/track/semiconductor", priority: "0.9", changefreq: "hourly" },
      { loc: "/report", priority: "0.8", changefreq: "daily" },
    ];

    // Dynamic news routes
    const { items: newsItems } = getCachedNews();
    const activeNews = newsItems.length > 0 ? newsItems : INITIAL_NEWS;
    const newsRoutes = activeNews.map((item: any) => ({
      loc: `/news/${item.id}`,
      priority: "0.6",
      changefreq: "daily",
      lastmod: today,
    }));

    const allRoutes = [...staticRoutes, ...newsRoutes];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${allRoutes
  .map(
    (r) => `  <url>
    <loc>${baseUrl}${r.loc}</loc>
    <lastmod>${(r as any).lastmod || today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.send(xml);
  });

  // ============================
  // SSR Rendering Middleware
  // ============================

  // Simple in-memory cache for SSR output (TTL: 5 minutes, matches news polling interval)
  const ssrCache = new Map<string, { html: string; timestamp: number }>();
  const SSR_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  function getCachedSSR(url: string): string | null {
    const cached = ssrCache.get(url);
    if (cached && Date.now() - cached.timestamp < SSR_CACHE_TTL) {
      return cached.html;
    }
    if (cached) {
      ssrCache.delete(url);
    }
    return null;
  }

  function setCachedSSR(url: string, html: string): void {
    ssrCache.set(url, { html, timestamp: Date.now() });
  }

  if (isProduction) {
    // Production: Serve static assets (JS, CSS, etc.) but NOT index.html
    const distClientPath = path.join(process.cwd(), "dist", "client");
    app.use(
      express.static(distClientPath, {
        index: false, // Don't serve index.html automatically — SSR handles it
      }),
    );

    // SSR fallback: For all non-API routes, serve index.html (SPA mode with client-side routing)
    // In production, we use the built client assets
    const indexHtml = fs.readFileSync(
      path.join(distClientPath, "index.html"),
      "utf-8"
    );

    app.get("*", (req, res) => {
      if (req.path.startsWith("/api/")) return; // Skip API routes (handled above)

      const cacheKey = req.path;
      const cached = getCachedSSR(cacheKey);
      if (cached) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("X-SSR-Cache", "HIT");
        return res.send(cached);
      }

      try {
        // Pre-fetch data for SSR
        const { items: newsItems } = getCachedNews();
        const activeNews = newsItems.length > 0 ? newsItems : INITIAL_NEWS;

        // Determine route type
        let trackFilter: 'ai' | 'robot' | 'semiconductor' | undefined;
        let newsIdFilter: string | undefined;
        if (req.path.startsWith('/track/ai')) trackFilter = 'ai';
        else if (req.path.startsWith('/track/robot')) trackFilter = 'robot';
        else if (req.path.startsWith('/track/semiconductor')) trackFilter = 'semiconductor';
        else if (req.path.startsWith('/news/')) newsIdFilter = req.path.split('/news/')[1];

        // Get news title for meta tags
        let newsTitle: string | undefined;
        if (newsIdFilter) {
          const found = activeNews.find((n: any) => n.id === newsIdFilter);
          if (found) newsTitle = found.summary;
        }

        // Generate SEO pre-rendered HTML content (visible to all crawlers)
        const seoHtml = renderSeoContent(activeNews, {
          url: req.path,
          trackFilter,
          newsIdFilter,
        });
        const seoCss = renderSsrCss();

        const initialData = { newsTitle, news: { items: activeNews }, report: null };
        const metaBlock = buildMetaBlock(req.path, initialData);
        const dataScript = buildInitialDataScript(activeNews);

        // Replace placeholders in the built index.html
        let html = indexHtml
          .replace('<!-- META_PLACEHOLDER -->', metaBlock)
          .replace(
            '<!-- SSR_PLACEHOLDER -->',
            `<style>${seoCss}</style>\n${seoHtml}`,
          )
          .replace('<!-- INITIAL_DATA_PLACEHOLDER -->', dataScript);

        setCachedSSR(cacheKey, html);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("X-SSR-Cache", "MISS");
        res.send(html);
      } catch (err) {
        log.error("SSR render error:", err);
        res.sendFile(path.join(distClientPath, "index.html"));
      }
    });
  } else {
    // Development: Use Vite middleware + SSR for all routes
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);

    // SSR handler for all non-API routes in dev mode
    app.get("*", async (req, res, next) => {
      if (req.path.startsWith("/api/")) return next();

      const url = req.originalUrl;

      try {
        // Read and transform the index.html template
        let template = fs.readFileSync(
          path.join(process.cwd(), "index.html"),
          "utf-8"
        );
        template = await vite.transformIndexHtml(url, template);

        // Pre-fetch data for SSR
        const { items: newsItems } = getCachedNews();
        const activeNews = newsItems.length > 0 ? newsItems : INITIAL_NEWS;

        // Determine route type
        let trackFilter: 'ai' | 'robot' | 'semiconductor' | undefined;
        let newsIdFilter: string | undefined;
        if (url.startsWith('/track/ai')) trackFilter = 'ai';
        else if (url.startsWith('/track/robot')) trackFilter = 'robot';
        else if (url.startsWith('/track/semiconductor')) trackFilter = 'semiconductor';
        else if (url.startsWith('/news/')) newsIdFilter = url.split('/news/')[1];

        // Get news title for meta tags
        let newsTitle: string | undefined;
        if (newsIdFilter) {
          const found = activeNews.find((n: any) => n.id === newsIdFilter);
          if (found) newsTitle = found.summary;
        }

        // Generate SEO pre-rendered HTML content (visible to all crawlers)
        const seoHtml = renderSeoContent(activeNews, {
          url,
          trackFilter,
          newsIdFilter,
        });
        const seoCss = renderSsrCss();

        const initialData = { newsTitle, news: { items: activeNews }, report: null };
        const metaBlock = buildMetaBlock(url, initialData);
        const dataScript = buildInitialDataScript(activeNews);

        // Replace placeholders
        const html = template
          .replace('<!-- META_PLACEHOLDER -->', metaBlock)
          .replace(
            '<!-- SSR_PLACEHOLDER -->',
            `<style>${seoCss}</style>\n${seoHtml}`,
          )
          .replace('<!-- INITIAL_DATA_PLACEHOLDER -->', dataScript);

        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.send(html);
      } catch (err: any) {
        // If everything fails, fall back to SPA mode
        if (!res.headersSent) {
          vite.ssrFixStacktrace(err);
          log.error("SSR dev error:", err.message);
          try {
            const template = await vite.transformIndexHtml(
              url,
              fs.readFileSync(path.join(process.cwd(), "index.html"), "utf-8"),
            );
            const fallbackMeta = buildMetaBlock(url, {});
            const html = template.replace("<!-- META_PLACEHOLDER -->", fallbackMeta);
            res.status(200).setHeader("Content-Type", "text/html; charset=utf-8").send(html);
          } catch {
            next(err);
          }
        }
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    const provider = process.env.AI_PROVIDER || "gemini";
    const model = process.env.AI_MODEL || "auto";
    log.info(
      `Server listening at http://localhost:${PORT} (provider=${provider}, model=${model}, mode=${isProduction ? "production" : "development"})`
    );
  });
}

startServer();
