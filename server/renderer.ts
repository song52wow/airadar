/**
 * Server-side HTML Renderer
 *
 * Generates semantic, SEO-optimized HTML snapshots from cached news data.
 * This content is injected into the initial page HTML so that crawlers
 * (Googlebot, GPTBot, Claude-Web, PerplexityBot, etc.) can index all
 * content without executing JavaScript.
 */

interface NewsItem {
  id: string;
  track: 'ai' | 'robot' | 'semiconductor';
  time: string;
  source: string;
  summary: string;
  details: string;
  impact: 'positive' | 'neutral' | 'negative';
  symbols: string[];
  keywords: string[];
}

const TRACK_META = {
  ai: { label: 'AI 大模型', code: 'AI', color: 'blue' },
  robot: { label: '人形机器人', code: 'ROBOT', color: 'purple' },
  semiconductor: { label: '半导体芯片', code: 'SEMI', color: 'emerald' },
} as const;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderNewsJsonLd(item: NewsItem): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: item.summary,
    datePublished: `2026-05-31T${item.time}:00+08:00`,
    author: { '@type': 'Organization', name: item.source },
    publisher: {
      '@type': 'Organization',
      name: '赛道雷达 Track Radar',
      url: 'https://trackradar.ai',
    },
    about: item.keywords.map((kw) => ({ '@type': 'Thing', name: kw })),
    articleBody: item.details,
    keywords: item.keywords.join(', '),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://trackradar.ai/news/${item.id}`,
    },
  });
}

function renderImpactBadge(impact: 'positive' | 'neutral' | 'negative'): string {
  switch (impact) {
    case 'positive':
      return '<span class="impact impact-positive">📈 正面利好</span>';
    case 'negative':
      return '<span class="impact impact-negative">📉 谨慎防守</span>';
    default:
      return '<span class="impact impact-neutral">📊 中性观望</span>';
  }
}

function renderTrackBadge(track: 'ai' | 'robot' | 'semiconductor'): string {
  const m = TRACK_META[track];
  return `<span class="track-badge track-${track}">${m.label}</span>`;
}

/**
 * Render a single news article as semantic HTML
 */
function renderNewsArticle(item: NewsItem, index: number): string {
  const jsonLd = renderNewsJsonLd(item);
  const symbolsHtml = item.symbols
    .map((s) => `<data value="${escapeHtml(s)}" class="symbol">$${escapeHtml(s)}</data>`)
    .join(' ');
  const keywordsHtml = item.keywords
    .map((k) => `<a href="/?q=${encodeURIComponent(k)}" class="keyword">#${escapeHtml(k)}</a>`)
    .join(' ');

  return `
    <article class="news-card" id="news-${escapeHtml(item.id)}" itemscope itemtype="https://schema.org/NewsArticle">
      <script type="application/ld+json">${jsonLd}</script>
      <div class="news-meta">
        <time datetime="2026-05-31T${escapeHtml(item.time)}:00+08:00" class="news-time">⏱️ ${escapeHtml(item.time)}</time>
        <cite class="news-source">${escapeHtml(item.source)}</cite>
        ${renderTrackBadge(item.track)}
        ${renderImpactBadge(item.impact)}
      </div>
      <h3 class="news-headline" itemprop="headline">
        <a href="/news/${escapeHtml(item.id)}">${escapeHtml(item.summary)}</a>
      </h3>
      <div class="news-body" itemprop="articleBody">
        <p>${escapeHtml(item.details)}</p>
      </div>
      <div class="news-footer">
        ${symbolsHtml ? `<div class="news-symbols"><span>关联标的:</span> ${symbolsHtml}</div>` : ''}
        ${keywordsHtml ? `<div class="news-keywords"><span>核心主线:</span> ${keywordsHtml}</div>` : ''}
      </div>
    </article>`;
}

/**
 * Render the track filter tabs
 */
function renderTrackTabs(activeTrack?: string): string {
  const tabs = [
    { key: '', label: '📡 今日综合' },
    { key: 'ai', label: '🤖 AI 大模型' },
    { key: 'robot', label: '🦿 人形机器人' },
    { key: 'semiconductor', label: '💾 半导体芯片' },
  ];

  return `
    <nav class="track-tabs" aria-label="赛道筛选">
      ${tabs
        .map(
          (t) =>
            `<a href="/${t.key ? `track/${t.key}` : ''}" class="tab-link ${
              activeTrack === t.key ? 'tab-active' : ''
            }">${t.label}</a>`,
        )
        .join('\n      ')}
    </nav>`;
}

/**
 * Main render function: generates the complete SEO content block
 */
export function renderSeoContent(
  newsItems: NewsItem[],
  options?: {
    url?: string;
    trackFilter?: 'ai' | 'robot' | 'semiconductor';
    newsIdFilter?: string;
    report?: any;
  },
): string {
  const { url = '/', trackFilter, newsIdFilter, report } = options || {};

  // Single news detail page
  if (newsIdFilter) {
    const item = newsItems.find((n) => n.id === newsIdFilter);
    if (item) {
      return `
        <div id="ssr-content" class="ssr-content">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="/">首页</a> /
            <a href="/track/${item.track}">${TRACK_META[item.track].label}</a> /
            <span>${escapeHtml(item.summary.slice(0, 30))}...</span>
          </nav>
          ${renderNewsArticle(item, 0)}
        </div>`;
    }
    return `<div id="ssr-content" class="ssr-content"><p>快讯未找到</p></div>`;
  }

  // Filter by track if specified
  let filteredNews = newsItems;
  if (trackFilter) {
    filteredNews = newsItems.filter((n) => n.track === trackFilter);
  }

  // Sort by time (descending)
  const sorted = [...filteredNews].sort((a, b) => b.time.localeCompare(a.time));

  // Group by track for the overview
  const trackGroups = {
    ai: sorted.filter((n) => n.track === 'ai').slice(0, 10),
    robot: sorted.filter((n) => n.track === 'robot').slice(0, 10),
    semiconductor: sorted.filter((n) => n.track === 'semiconductor').slice(0, 10),
  };

  // Track summary stats
  const trackStats = Object.entries(trackGroups)
    .map(([key, items]) => {
      const m = TRACK_META[key as keyof typeof TRACK_META];
      const positiveCount = items.filter((i) => i.impact === 'positive').length;
      return `
        <div class="track-stat">
          <span class="track-stat-label">${m.label}</span>
          <span class="track-stat-count">${items.length} 条快讯</span>
          <span class="track-stat-positive">${positiveCount} 利好</span>
        </div>`;
    })
    .join('\n');

  // Render all news articles
  const articlesHtml = sorted
    .slice(0, 30)
    .map((item, i) => renderNewsArticle(item, i))
    .join('\n');

  // AI Report summary (if available)
  const reportHtml = report
    ? `
    <section class="ssr-report" aria-labelledby="report-heading">
      <h2 id="report-heading">🤖 AI 投研合伙人 · 每日简报</h2>
      <div class="report-sentiment">
        <span class="sentiment-score">${escapeHtml(String(report.sentimentIndex))}%</span>
        <span class="sentiment-label">${escapeHtml(report.marketVibe || '')}</span>
      </div>
      <ul class="report-takeaways">
        ${(report.keyTakeaways || []).map((t: string) => `<li>${escapeHtml(t)}</li>`).join('\n')}
      </ul>
      <div class="report-tracks">
        <div class="report-track"><strong>AI 大模型:</strong> ${escapeHtml(report.trackAnalysis?.ai || '')}</div>
        <div class="report-track"><strong>人形机器人:</strong> ${escapeHtml(report.trackAnalysis?.robot || '')}</div>
        <div class="report-track"><strong>半导体芯片:</strong> ${escapeHtml(report.trackAnalysis?.semiconductor || '')}</div>
      </div>
      <div class="report-companies">
        <strong>🔥 主力盯盘:</strong>
        ${(report.hotCompanies || []).map((c: string) => `<span class="hot-company">${escapeHtml(c)}</span>`).join(' ')}
      </div>
    </section>`
    : '';

  return `
    <div id="ssr-content" class="ssr-content">
      <section class="ssr-hero" aria-labelledby="site-title">
        <h1 id="site-title">赛道雷达 · Track Radar</h1>
        <p class="ssr-subtitle">AI 大模型 / 人形机器人 / 半导体芯片 — 硬科技投资情报平台</p>
        <p class="ssr-updated">📡 数据更新于 ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })} · 实时快讯流已激活</p>
        <div class="track-stats">
          ${trackStats}
        </div>
      </section>

      ${reportHtml}

      ${renderTrackTabs(trackFilter)}

      <section class="ssr-news-feed" aria-label="${trackFilter ? TRACK_META[trackFilter].label + '赛道快讯' : '今日硬科技快讯流'}">
        <h2 class="ssr-section-title">📰 ${trackFilter ? TRACK_META[trackFilter].label + '赛道' : '今日硬科技'}快讯流 (${sorted.length} 条)</h2>
        <div class="news-list">
          ${articlesHtml || '<p class="ssr-empty">暂无匹配快讯</p>'}
        </div>
      </section>

      <section class="ssr-about" aria-labelledby="about-heading">
        <h2 id="about-heading">关于赛道雷达</h2>
        <p>赛道雷达 (Track Radar) 聚焦 AI 大模型、人形机器人、半导体芯片三大硬科技赛道，聚合 36氪、华尔街见闻、Readhub、金十数据、Solidot 等权威信息源，提供实时新闻聚合、AI 投研分析和市场情绪指数，为硬科技投资者提供一站式情报服务。</p>
        <p class="ssr-links">
          <a href="/sitemap.xml">Sitemap</a> ·
          <a href="/report">AI 投研日报</a> ·
          <a href="/track/ai">AI 大模型</a> ·
          <a href="/track/robot">人形机器人</a> ·
          <a href="/track/semiconductor">半导体芯片</a>
        </p>
      </section>
    </div>`;
}

/**
 * Generate CSS styles for the SSR content (inline for performance)
 */
export function renderSsrCss(): string {
  return `
    .ssr-content { max-width: 1200px; margin: 0 auto; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; line-height: 1.6; }
    .ssr-content a { color: #2563eb; text-decoration: none; }
    .ssr-content a:hover { text-decoration: underline; }
    .ssr-hero { background: linear-gradient(135deg, #1e293b, #0f172a); color: white; padding: 32px 24px; border-radius: 12px; margin-bottom: 24px; }
    .ssr-hero h1 { font-size: 28px; margin: 0 0 8px; }
    .ssr-subtitle { font-size: 14px; opacity: 0.8; margin: 0 0 8px; }
    .ssr-updated { font-size: 11px; opacity: 0.6; margin: 0; }
    .track-stats { display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap; }
    .track-stat { background: rgba(255,255,255,0.1); padding: 8px 14px; border-radius: 8px; font-size: 12px; display: flex; gap: 8px; align-items: center; }
    .track-stat-label { font-weight: 700; }
    .track-stat-positive { color: #4ade80; }
    .track-tabs { display: flex; gap: 4px; margin-bottom: 20px; background: #f1f5f9; padding: 4px; border-radius: 8px; }
    .tab-link { flex: 1; text-align: center; padding: 8px 12px; font-size: 13px; font-weight: 600; border-radius: 6px; color: #64748b; transition: all 0.2s; }
    .tab-link:hover { color: #1e293b; background: #e2e8f0; }
    .tab-active { background: white; color: #1e293b; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-bottom: 2px solid #2563eb; }
    .ssr-report { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .ssr-report h2 { font-size: 18px; margin: 0 0 16px; }
    .report-sentiment { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
    .sentiment-score { font-size: 36px; font-weight: 800; color: #2563eb; }
    .sentiment-label { font-size: 16px; font-weight: 600; }
    .report-takeaways { padding-left: 20px; margin: 0 0 16px; font-size: 13px; }
    .report-takeaways li { margin-bottom: 6px; }
    .report-tracks { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px; margin-bottom: 16px; font-size: 12px; }
    .report-track { background: white; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
    .report-companies { font-size: 13px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
    .hot-company { background: #eff6ff; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px; font-weight: 600; border: 1px solid #bfdbfe; }
    .ssr-section-title { font-size: 16px; margin: 0 0 16px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
    .news-list { display: flex; flex-direction: column; gap: 12px; }
    .news-card { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; transition: box-shadow 0.2s; }
    .news-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .news-meta { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 8px; font-size: 11px; }
    .news-time { font-family: monospace; font-weight: 700; color: #1e293b; }
    .news-source { font-weight: 600; color: #64748b; font-style: normal; }
    .track-badge { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
    .track-ai { background: #eff6ff; color: #1d4ed8; }
    .track-robot { background: #faf5ff; color: #7c3aed; }
    .track-semiconductor { background: #ecfdf5; color: #047857; }
    .impact { font-size: 10px; font-weight: 600; }
    .impact-positive { color: #2563eb; }
    .impact-negative { color: #dc2626; }
    .impact-neutral { color: #64748b; }
    .news-headline { font-size: 14px; font-weight: 700; margin: 0 0 8px; line-height: 1.5; }
    .news-headline a { color: #1e293b; }
    .news-headline a:hover { color: #2563eb; }
    .news-body { font-size: 12px; color: #475569; line-height: 1.7; margin-bottom: 8px; }
    .news-footer { font-size: 11px; color: #94a3b8; display: flex; flex-wrap: wrap; gap: 12px; }
    .news-symbols, .news-keywords { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
    .symbol { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: 700; color: #475569; }
    .keyword { background: white; padding: 2px 6px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 10px; }
    .ssr-about { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-top: 32px; font-size: 13px; }
    .ssr-about h2 { font-size: 16px; margin: 0 0 12px; }
    .ssr-links { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; font-size: 12px; }
    .ssr-empty { text-align: center; padding: 32px; color: #94a3b8; }
    .ssr-content .breadcrumb { font-size: 12px; color: #94a3b8; margin-bottom: 16px; }
    .ssr-content .breadcrumb a { color: #64748b; }
  `;
}
