import { useState } from 'react';
import { useParams } from 'react-router-dom';
import AIReportCard from '../components/AIReportCard';
import NewsFeed from '../components/NewsFeed';
import AIAssistant from '../components/AIAssistant';
import { motion } from 'motion/react';

interface DashboardProps {
  onSelectKeyword?: (kw: string) => void;
  searchFilter?: string;
  setSearchFilter?: (val: string) => void;
}

export default function Dashboard({
  onSelectKeyword: externalOnSelect,
  searchFilter: externalSearchFilter,
  setSearchFilter: externalSetSearchFilter,
}: DashboardProps) {
  const { trackId } = useParams<{ trackId?: string }>();
  const [internalSearchFilter, setInternalSearchFilter] = useState('');
  const [internalKeywordFilter, setInternalKeywordFilter] = useState('');

  // Use external state or internal state
  const searchFilter = externalSearchFilter ?? (internalKeywordFilter || internalSearchFilter);
  const setSearchFilter = (val: string) => {
    externalSetSearchFilter?.(val);
    setInternalSearchFilter(val);
  };

  // When clicking a keyword/tag/symbol from other components, filter the news feed
  const handleKeywordSelect = (kw: string) => {
    if (externalOnSelect) {
      externalOnSelect(kw);
    } else {
      setInternalKeywordFilter(kw);
      setInternalSearchFilter(kw);
    }
    // Smoothly scroll down to feed view
    const feedEl = document.getElementById('feed-track-tabs');
    if (feedEl) {
      feedEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <main className="max-w-7xl w-full mx-auto px-4 py-4 md:py-6 flex-grow">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* Main Left area: dynamic AI Macro Summary Report and the chronological Timeline list (Col=8) */}
        <div className="lg:col-span-8 space-y-5">
          {/* AI Strategic briefing Card */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <AIReportCard />
          </motion.div>

          {/* Timelines control flow */}
          <section className="bg-white rounded-xl border border-slate-250 shadow-xs p-4 md:p-5">
            <div className="flex items-center justify-between gap-4 mb-4 pb-2 border-b border-slate-100 flex-wrap">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-blue-600 rounded text-white flex items-center justify-center font-mono text-[9px] font-bold">
                  TR
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                    赛道雷达 · 今日硬科技快讯流
                  </h2>
                  <p className="text-[10px] text-slate-400 font-sans">
                    精选硬科技高维决策情报 · 点击查看深度研判
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                <span>实时快讯流 </span>
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-ping ml-0.5" />
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block -ml-2" />
              </div>
            </div>

            {/* News Feed Timeline loop renderer */}
            <NewsFeed
              onSelectKeyword={handleKeywordSelect}
              searchFilter={searchFilter}
              setSearchFilter={setSearchFilter}
              initialTab={trackId as 'ai' | 'robot' | 'semiconductor' | undefined}
            />
          </section>
        </div>

        {/* Right Sidebar sticky: Conversational Assistant to drill down stock insights (Col=4) */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-5">
          {/* Quick overview metric widget */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-950 text-slate-100 rounded-xl p-4.5 border border-slate-800 shadow-md relative overflow-hidden">
            <div className="relative z-10 flex flex-col justify-between h-full space-y-3.5">
              <div>
                <div className="flex items-center space-x-2 opacity-75">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    雷达观察站 · MARKET PULSE
                  </span>
                </div>
                <p className="text-sm font-semibold mt-1.5 text-white leading-tight">
                  "半导体周期底部已现，AI 与机器人是下一个十年最大的α机会。"
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center border-t border-slate-800 pt-3">
                <div>
                  <span className="text-[9px] text-slate-400 block font-mono">AI 研判</span>
                  <span className="text-xs font-bold font-mono text-blue-400">MoE 时代</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block font-mono">机器双足</span>
                  <span className="text-xs font-bold font-mono text-emerald-400">9.9万级</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block font-mono">高级半导体</span>
                  <span className="text-xs font-bold font-mono text-amber-400">背面供电</span>
                </div>
              </div>
            </div>
            {/* Background absolute abstract visual layer */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500 rounded-full opacity-10 blur-xl pointer-events-none" />
          </div>

          {/* Grounded chat assistant window */}
          <AIAssistant />
        </aside>
      </div>
    </main>
  );
}
