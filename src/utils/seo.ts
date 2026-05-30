/**
 * Client-side SEO utilities for dynamic metadata generation.
 * Server-side SEO is handled by server.ts (generateMetaTags + generateJsonLd).
 * This module provides helpers for client-side meta updates (e.g., after navigation).
 */

interface SEOData {
  title: string;
  description: string;
  canonical: string;
  ogType?: 'website' | 'article';
}

const BASE_URL = 'https://trackradar.ai';

/**
 * Update document title
 */
export function updateTitle(title: string): void {
  document.title = title;
}

/**
 * Update meta tags in the document head after client-side navigation.
 * This ensures crawlers that execute JS see the correct meta tags.
 */
export function updateMetaTags(data: SEOData): void {
  updateTitle(data.title);

  const setMeta = (name: string, content: string, property = false) => {
    const attr = property ? 'property' : 'name';
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMeta('description', data.description);
  setMeta('robots', 'index, follow, max-snippet:-1, max-image-preview:large');
  setMeta('og:type', data.ogType || 'website', true);
  setMeta('og:url', data.canonical, true);
  setMeta('og:title', data.title, true);
  setMeta('og:description', data.description, true);
  setMeta('og:site_name', '赛道雷达 Track Radar', true);
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', data.title);
  setMeta('twitter:description', data.description);

  // Update canonical link
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', data.canonical);
}

/**
 * Get SEO data for a specific route
 */
export function getSEODataForRoute(pathname: string): SEOData {
  if (pathname.startsWith('/track/ai')) {
    return {
      title: 'AI 大模型赛道 — 赛道雷达 Track Radar',
      description: 'AI 大模型赛道实时快讯：OpenAI、微软星际之门、DeepSeek、智谱、Kimi 等大模型与算力投资动态。',
      canonical: `${BASE_URL}/track/ai`,
    };
  }
  if (pathname.startsWith('/track/robot')) {
    return {
      title: '人形机器人赛道 — 赛道雷达 Track Radar',
      description: '人形机器人赛道实时快讯：特斯拉 Optimus、宇树科技、傅利叶 GR-2 等具身智能与人形机器人量产动态。',
      canonical: `${BASE_URL}/track/robot`,
    };
  }
  if (pathname.startsWith('/track/semiconductor')) {
    return {
      title: '半导体芯片赛道 — 赛道雷达 Track Radar',
      description: '半导体芯片赛道实时快讯：台积电 A16、英伟达 Blackwell、HBM4、先进封装等半导体产业链动态。',
      canonical: `${BASE_URL}/track/semiconductor`,
    };
  }
  if (pathname === '/report') {
    return {
      title: 'AI 投研日报 — 赛道雷达 Track Radar',
      description: '赛道雷达 AI 投研合伙人每日简报，覆盖 AI 大模型、人形机器人、半导体芯片三大赛道。',
      canonical: `${BASE_URL}/report`,
      ogType: 'article',
    };
  }

  // Default
  return {
    title: '赛道雷达 · Track Radar — AI/机器人/半导体硬科技投资情报',
    description: '聚焦 AI 大模型、人形机器人、半导体芯片三大硬科技赛道，聚合实时新闻与 AI 投研分析。',
    canonical: BASE_URL,
  };
}
