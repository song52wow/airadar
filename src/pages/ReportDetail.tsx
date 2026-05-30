import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Sparkles, TrendingUp } from 'lucide-react';

interface ReportData {
  sentimentIndex: number;
  marketVibe: string;
  keyTakeaways: string[];
  trackAnalysis: {
    ai: string;
    robot: string;
    semiconductor: string;
  };
  hotCompanies: string[];
}

export default function ReportDetail() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/analyst/report');
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setReport(data);
        }
      } catch (err) {
        console.warn('Failed to load report:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <main className="max-w-4xl w-full mx-auto px-4 py-8 flex-grow">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-slate-200 rounded" />
          <div className="h-10 w-3/4 bg-slate-200 rounded" />
          <div className="h-32 w-full bg-slate-200 rounded" />
        </div>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="max-w-4xl w-full mx-auto px-4 py-8 flex-grow text-center">
        <h1 className="text-xl font-bold text-slate-800 mb-2">研报暂不可用</h1>
        <p className="text-slate-500 mb-4">AI 投研报告正在生成中，请稍后重试。</p>
        <Link to="/" className="text-blue-600 hover:text-blue-800 font-semibold underline">
          返回首页
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl w-full mx-auto px-4 py-8 flex-grow">
      <article>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] text-slate-400 mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-slate-700 transition-colors">首页</Link>
          <span>/</span>
          <span className="text-slate-600">AI 投研日报</span>
        </nav>

        {/* Hero header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">AI 雷达投研合伙人 · 每日简报</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                根据最新核心数据链、底层芯片进度及具身智能价格波动协同研判
              </p>
            </div>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Sentiment Index hero card */}
          <section className="bg-gradient-to-br from-slate-800 to-slate-950 text-white rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Gauge */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">
                  今日硬科技风向指数
                </span>
                <span className="text-5xl font-extrabold font-mono text-blue-400">
                  {report.sentimentIndex}%
                </span>
                <span className="text-xs font-bold mt-1 px-2 py-0.5 rounded bg-blue-600/30 text-blue-300">
                  {report.sentimentIndex >= 80 ? '极度乐观' : report.sentimentIndex >= 60 ? '积极进取' : '稳健观望'}
                </span>
              </div>

              {/* Vibe */}
              <div className="md:col-span-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
                  今日市场氛围
                </span>
                <p className="text-xl font-bold border-l-2 border-blue-400 pl-3 mb-4">
                  {report.marketVibe}
                </p>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
                    核心风向研判
                  </span>
                  <ul className="space-y-2">
                    {report.keyTakeaways.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300 leading-snug">
                        <span className="w-5 h-5 rounded bg-slate-700 text-slate-300 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                          0{i + 1}
                        </span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Three Track Analysis */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { key: 'ai', label: 'AI 大模型赛道', code: 'AI MODELS', color: 'blue', analysis: report.trackAnalysis.ai },
              { key: 'robot', label: '人形机器人赛道', code: 'ROBOTICS', color: 'purple', analysis: report.trackAnalysis.robot },
              { key: 'semiconductor', label: '半导体芯片赛道', code: 'SEMICON', color: 'emerald', analysis: report.trackAnalysis.semiconductor },
            ].map((track) => (
              <div
                key={track.key}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full bg-${track.color}-600`} />
                    {track.label}
                  </h2>
                  <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded font-mono">
                    {track.code}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {track.analysis}
                </p>
              </div>
            ))}
          </section>

          {/* Hot Companies */}
          <section className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800">今日主力盯盘 WATCHLIST</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {report.hotCompanies.map((ticker, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-mono font-bold text-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
                >
                  {ticker}
                </span>
              ))}
            </div>
          </section>
        </motion.div>

        {/* Back navigation */}
        <div className="pt-6 border-t border-slate-200">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回仪表盘
          </Link>
        </div>
      </article>

      {/* JSON-LD Structured Data for Report/Article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: '赛道雷达 AI 投研日报 — 硬科技投资简报',
            description: `市场情绪指数 ${report.sentimentIndex}%，${report.marketVibe}`,
            datePublished: new Date().toISOString().split('T')[0],
            author: {
              '@type': 'Organization',
              name: '赛道雷达 Track Radar AI',
            },
            publisher: {
              '@type': 'Organization',
              name: '赛道雷达 Track Radar',
              url: 'https://trackradar.ai',
            },
            about: [
              { '@type': 'Thing', name: 'AI大模型' },
              { '@type': 'Thing', name: '人形机器人' },
              { '@type': 'Thing', name: '半导体芯片' },
              { '@type': 'Thing', name: '硬科技投资' },
            ],
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': 'https://trackradar.ai/report',
            },
          }),
        }}
      />
    </main>
  );
}
