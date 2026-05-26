import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Cpu, Bot, Layers, Clock, TrendingUp } from 'lucide-react';

const DYNAMIC_TICKERS = [
  { text: 'AI大模型：微软与OpenAI斥资1000亿美元拟建 Stargate 算力群', value: '+100x算力' },
  { text: '半导体：台积电宝山厂 A16 2纳米背面供电技术开启风险流产试产', value: '+12%频率' },
  { text: '人形机器人：宇树推出 H1-E 平民级主力双足，价格打至 9.9万元', value: '全球低价量产' },
  { text: 'AI大模型：DeepSeek V3-Pro 开辟极速 MoE 架，API降幅达50倍', value: '0.1元/百万Token' },
  { text: '半导体：英伟达 Blackwell-V2 震撼流片，重磅引入12叠层 HBM4 架构', value: '+80%算力' },
  { text: '人形机器人：特斯拉首批 Optimus-G3 正式进入德州流水线实载测跑', value: '24h无人装配' },
];

export default function RadarHeader() {
  const [timeStr, setTimeStr] = useState('');
  const [tickerOffset, setTickerOffset] = useState(0);

  // Clean real-time Clock update
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(
        d.toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Ticker cycle
  useEffect(() => {
    const tickerTimer = setInterval(() => {
      setTickerOffset((prev) => (prev + 1) % DYNAMIC_TICKERS.length);
    }, 4000);
    return () => clearInterval(tickerTimer);
  }, []);

  return (
    <header id="radar-app-header" className="w-full border-b border-slate-200 bg-white sticky top-0 z-40 transition-all duration-300">
      {/* High-density Brokerage-style ticking news ribbon */}
      <div className="w-full bg-slate-900 text-white py-1 px-4 overflow-hidden text-[11px] font-mono border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 flex-grow overflow-hidden">
            <span className="flex items-center gap-1 text-[9px] bg-blue-600 text-white font-bold px-1.5 py-0.2 rounded animate-pulse shrink-0 tracking-wider">
              REAL-TIME
            </span>
            <div className="relative h-4 overflow-hidden w-full ml-1">
              <motion.div
                key={tickerOffset}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="absolute inset-0 flex items-center justify-between gap-4 text-slate-350 truncate"
              >
                <div className="flex items-center gap-2 truncate text-slate-200">
                  <span className="text-slate-400">⏱️ 今天</span>
                  <span className="truncate text-slate-100">{DYNAMIC_TICKERS[tickerOffset].text}</span>
                </div>
                <span className="shrink-0 flex items-center gap-0.5 text-blue-400 font-bold bg-blue-950/40 px-1.5 py-0.2 rounded border border-blue-900/30 text-[9px]">
                  <TrendingUp className="w-2.5 h-2.5" />
                  {DYNAMIC_TICKERS[tickerOffset].value}
                </span>
              </motion.div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-slate-400 pl-4 border-l border-slate-800 shrink-0 select-none text-[10px]">
            <span>LATENCY: 142ms</span>
          </div>
        </div>
      </div>

      {/* Main High Density Branding bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand logo & titles exactly matching High Density specifications */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shrink-0 shadow-sm">
            <svg className="w-5 h-5 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold tracking-tight text-slate-800 flex items-center gap-1.5">
              赛道雷达 <span className="text-blue-600">· Track Radar</span>
            </h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              AI & Semiconductor Investment Intelligence
            </p>
          </div>
        </div>

        {/* Live Metrics & Indicators */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400 animate-spin-slow" />
            <span>北京时间</span>
            <span className="font-bold text-slate-800">{timeStr || '12:00:00'}</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <span className="block text-xs font-bold text-green-600 leading-none">NASDAQ: +1.24%</span>
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-tighter">Market Open</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
          </div>
        </div>
      </div>
    </header>
  );
}
