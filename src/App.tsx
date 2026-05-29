import { useState } from 'react';
import RadarHeader from './components/RadarHeader';
import AIReportCard from './components/AIReportCard';
import NewsFeed from './components/NewsFeed';
import AIAssistant from './components/AIAssistant';
import { motion } from 'motion/react';
import { Cpu, Bot, Layers, Star, SlidersHorizontal, BookOpen } from 'lucide-react';

export default function App() {
  const [searchFilter, setSearchFilter] = useState('');

  // When clicking a keyword/tag/symbol from other components, filter the news feed
  const handleKeywordSelect = (kw: string) => {
    setSearchFilter(kw);
    // Smoothly scroll down to feed view to ensure immediate user visual awareness
    const feedEl = document.getElementById('feed-track-tabs');
    if (feedEl) {
      feedEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 pb-12 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* 1. Brand Header with real-time clock & moving trading ticker */}
      <RadarHeader />

      {/* 2. Primary layout board (Desktop double column / Mobile stacking single column) */}
      <main className="max-w-7xl w-full mx-auto px-4 py-4 md:py-6 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
          
          {/* Main Left area: dynamic AI Macro Summary Report and the chronological Timeline list (Col=8) */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* AI Strategic briefing Card (speedometer indicator & bento cards) */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <AIReportCard />
            </motion.div>

            {/* Timelines control flow */}
            <div className="bg-white rounded-xl border border-slate-250 shadow-xs p-4 md:p-5">
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
              />
            </div>
          </div>

          {/* Right Sidebar sticky: Conversational Assistant to drill down stock insights (Col=4) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-5">
            
            {/* Quick overview metric widget of the tracks styled perfectly to High Density premium gradient */}
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
                    “半导体周期底部已现，AI 与机器人是下一个十年最大的α机会。”
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

              {/* Background absolute abstract visual layer representing radar lines */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500 rounded-full opacity-10 blur-xl pointer-events-none" />
            </div>

            {/* Grounded chat assistant window */}
            <AIAssistant />
          </div>

        </div>
      </main>

      {/* Aesthetic human label credits at the bottom */}
      <footer className="max-w-7xl mx-auto w-full px-4 text-center mt-12 text-[10px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-200/80 pt-4">
        <div className="flex space-x-6 items-center">
          <span>Real-time Data Stream: ACTIVE</span>
          <span className="hidden sm:inline">Latency: 142ms</span>
        </div>
        <div className="flex space-x-4">
          <span>MVP 1.0</span>
          <span>© 2026 Track Radar AI</span>
        </div>
      </footer>
    </div>
  );
}
