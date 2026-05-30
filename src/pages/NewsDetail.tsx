import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, TrendingUp, TrendingDown, Tag, ExternalLink } from 'lucide-react';
import { NewsItem } from '../types';
import { INITIAL_NEWS } from '../data';

export default function NewsDetail() {
  const { newsId } = useParams<{ newsId: string }>();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      try {
        const res = await fetch('/api/news');
        if (res.ok) {
          const data = await res.json();
          const items: NewsItem[] = data.items || [];
          const found = items.find((n) => n.id === newsId);
          if (!cancelled) {
            setNews(found || INITIAL_NEWS.find((n) => n.id === newsId) || null);
          }
        } else {
          if (!cancelled) {
            setNews(INITIAL_NEWS.find((n) => n.id === newsId) || null);
          }
        }
      } catch {
        if (!cancelled) {
          setNews(INITIAL_NEWS.find((n) => n.id === newsId) || null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadNews();
    return () => { cancelled = true; };
  }, [newsId]);

  const getTrackLabel = (track: 'ai' | 'robot' | 'semiconductor') => {
    switch (track) {
      case 'ai': return 'AI 大模型';
      case 'robot': return '人形机器人';
      case 'semiconductor': return '半导体芯片';
    }
  };

  const getTrackUrl = (track: 'ai' | 'robot' | 'semiconductor') => `/track/${track}`;

  if (loading) {
    return (
      <main className="max-w-3xl w-full mx-auto px-4 py-8 flex-grow">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-slate-200 rounded" />
          <div className="h-10 w-3/4 bg-slate-200 rounded" />
          <div className="h-4 w-full bg-slate-200 rounded" />
          <div className="h-4 w-full bg-slate-200 rounded" />
          <div className="h-4 w-2/3 bg-slate-200 rounded" />
        </div>
      </main>
    );
  }

  if (!news) {
    return (
      <main className="max-w-3xl w-full mx-auto px-4 py-8 flex-grow text-center">
        <h1 className="text-xl font-bold text-slate-800 mb-2">快讯未找到</h1>
        <p className="text-slate-500 mb-4">该快讯可能已被移除或链接无效。</p>
        <Link to="/" className="text-blue-600 hover:text-blue-800 font-semibold underline">
          返回首页
        </Link>
      </main>
    );
  }

  const impactLabel = news.impact === 'positive' ? '正面利好' : news.impact === 'negative' ? '谨慎防守' : '中性观望';
  const impactColor = news.impact === 'positive' ? 'text-blue-600' : news.impact === 'negative' ? 'text-red-600' : 'text-slate-500';

  return (
    <main className="max-w-3xl w-full mx-auto px-4 py-8 flex-grow">
      <article>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] text-slate-400 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-slate-700 transition-colors">首页</Link>
          <span>/</span>
          <Link to={getTrackUrl(news.track)} className="hover:text-slate-700 transition-colors">
            {getTrackLabel(news.track)}
          </Link>
          <span>/</span>
          <span className="text-slate-600 truncate max-w-[200px]">{news.summary.slice(0, 30)}...</span>
        </nav>

        {/* Header metadata */}
        <header className="mb-6">
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mb-3">
            <time dateTime={`2026-05-30T${news.time}:00+08:00`}>{news.time}</time>
            <span>·</span>
            <span>{news.source}</span>
            <span>·</span>
            <Link
              to={getTrackUrl(news.track)}
              className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold hover:bg-blue-100 hover:text-blue-700 transition-colors"
            >
              {getTrackLabel(news.track)}
            </Link>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug mb-4">
            {news.summary}
          </h1>

          <div className="flex items-center gap-3 flex-wrap">
            <span className={`flex items-center gap-1 text-[11px] font-bold ${impactColor}`}>
              {news.impact === 'positive' ? <TrendingUp className="w-4 h-4" /> : news.impact === 'negative' ? <TrendingDown className="w-4 h-4" /> : null}
              投研量化：{impactLabel}
            </span>

            {news.symbols.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-medium">关联标的:</span>
                {news.symbols.map((sym) => (
                  <span key={sym} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold text-[10px]">
                    ${sym}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Full article body */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="prose prose-slate max-w-none"
        >
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 mb-6">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
              📰 深度投研解读
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {news.details}
            </p>
          </div>

          {/* Keywords */}
          {news.keywords.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-500 font-medium">核心主线:</span>
              {news.keywords.map((kw) => (
                <Link
                  key={kw}
                  to={`/?q=${encodeURIComponent(kw)}`}
                  className="px-2 py-0.5 rounded border border-slate-200 text-slate-600 text-[11px] font-semibold hover:bg-slate-100 transition-colors"
                >
                  #{kw}
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Back navigation */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回今日快讯流
          </Link>
        </div>
      </article>

      {/* JSON-LD Structured Data for NewsArticle */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: news.summary,
            datePublished: `2026-05-30T${news.time}:00+08:00`,
            author: {
              '@type': 'Organization',
              name: news.source,
            },
            publisher: {
              '@type': 'Organization',
              name: '赛道雷达 Track Radar',
              url: 'https://trackradar.ai',
            },
            about: news.keywords.map((kw) => ({ '@type': 'Thing', name: kw })),
            articleBody: news.details,
            keywords: news.keywords.join(', '),
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://trackradar.ai/news/${news.id}`,
            },
          }),
        }}
      />
    </main>
  );
}
