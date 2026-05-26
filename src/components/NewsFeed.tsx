import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_NEWS, ADS } from '../data';
import { NewsItem, AdItem } from '../types';
import { Search, Star, MessageSquare, ChevronDown, ChevronUp, Tag, Award, Briefcase, TrendingUp, TrendingDown, BookOpen, AlertCircle, Share2, Copy } from 'lucide-react';

interface NewsFeedProps {
  onSelectKeyword: (kw: string) => void;
  searchFilter: string;
  setSearchFilter: (val: string) => void;
}

export default function NewsFeed({ onSelectKeyword, searchFilter, setSearchFilter }: NewsFeedProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'ai' | 'robot' | 'semiconductor' | 'watchlist'>('all');
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [showCopyBanner, setShowCopyBanner] = useState(false);

  // Load localStorage watchlist
  useEffect(() => {
    try {
      const stored = localStorage.getItem('radar_watchlist');
      if (stored) {
        setWatchlist(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed reading watchlist from local storage:', e);
    }
  }, []);

  // Save watchlist helper
  const toggleWatchlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering card expand toggle
    let updated: string[];
    if (watchlist.includes(id)) {
      updated = watchlist.filter(item => item !== id);
    } else {
      updated = [...watchlist, id];
    }
    setWatchlist(updated);
    try {
      localStorage.setItem('radar_watchlist', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed saving watchlist:', err);
    }
  };

  // Toggle card details
  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Trigger copying of news summary
  const handleCopyNews = (item: NewsItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `【赛道雷达】${item.time} / ${item.source} ： ${item.summary}\n关联：${item.symbols.join(', ')}\n了解更多硬科技风向，请访问赛道雷达 APP。`;
    navigator.clipboard.writeText(shareText).then(() => {
      setShowCopyBanner(true);
      setTimeout(() => setShowCopyBanner(false), 2000);
    });
  };

  // Master Filter Pipeline
  const getFilteredNews = (): NewsItem[] => {
    let result = INITIAL_NEWS;

    // 1. Tab filter
    if (activeTab === 'watchlist') {
      result = result.filter(item => watchlist.includes(item.id));
    } else if (activeTab !== 'all') {
      result = result.filter(item => item.track === activeTab);
    }

    // 2. Search query filter
    if (searchFilter.trim()) {
      const query = searchFilter.toLowerCase().trim();
      result = result.filter(item => {
        return (
          item.summary.toLowerCase().includes(query) ||
          item.source.toLowerCase().includes(query) ||
          item.symbols.some(sym => sym.toLowerCase().includes(query)) ||
          item.keywords.some(kw => kw.toLowerCase().includes(query))
        );
      });
    }

    // Sorting: Descent chronological timeline (since records contain direct hours e.g., '09:15', descending)
    return [...result].sort((a, b) => b.time.localeCompare(a.time));
  };

  const filteredNews = getFilteredNews();

  // Insert Ads smoothly every 5 news items
  const renderList: Array<NewsItem | AdItem> = [];
  filteredNews.forEach((news, idx) => {
    renderList.push(news);
    // Every 5th news (1-based index 5, 10, 15...) embed a dynamic ad
    if ((idx + 1) % 5 === 0) {
      const adIndex = Math.floor((idx + 1) / 5 - 1) % ADS.length;
      renderList.push({
        ...ADS[adIndex],
        id: `ad-embed-${news.id}-${idx}`, // Make unique
      });
    }
  });

  const getTrackBadgeStyles = (track: 'ai' | 'robot' | 'semiconductor') => {
    switch (track) {
      case 'ai':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'robot':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'semiconductor':
        return 'bg-emerald-50 text-emerald-700 border-emerald-110';
    }
  };

  const getTrackLabel = (track: 'ai' | 'robot' | 'semiconductor') => {
    switch (track) {
      case 'ai': return 'AI';
      case 'robot': return '机器人';
      case 'semiconductor': return '半导体';
    }
  };

  const getImpactBadge = (impact: 'positive' | 'neutral' | 'negative') => {
    switch (impact) {
      case 'positive':
        return (
          <span className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 border border-blue-100 font-bold px-2 py-0.5 rounded">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            投研量化：正面利好
          </span>
        );
      case 'neutral':
        return (
          <span className="flex items-center gap-1 text-[10px] bg-slate-50 text-slate-600 border border-slate-200 font-bold px-2 py-0.5 rounded">
            投研量化：中性观望
          </span>
        );
      case 'negative':
        return (
          <span className="flex items-center gap-1 text-[10px] bg-red-50 text-red-700 border border-red-100 font-bold px-2 py-0.5 rounded">
            <TrendingDown className="w-3.5 h-3.5 text-red-600 shrink-0" />
            投研量化：谨慎防守
          </span>
        );
    }
  };

  return (
    <div id="news-feed-container" className="flex flex-col flex-grow">
      {/* Search Input Filter bar - Tight High Density */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-3.5 w-3.5 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="搜索快讯、相关代码、概念词汇 (例如: NVDA, 2纳米, OpenAI)..."
          className="block w-full pl-8.5 pr-10 py-2 text-xs bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden rounded shadow-xs transition-colors placeholder-slate-400 font-sans"
        />
        {searchFilter && (
          <button
            onClick={() => setSearchFilter('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-800 text-xs cursor-pointer select-none font-bold"
          >
            清除
          </button>
        )}
      </div>

      {/* High-density grid tabs */}
      <div id="feed-track-tabs" className="grid grid-cols-5 gap-0.5 bg-slate-100 p-0.5 rounded mb-4 border border-slate-200">
        {[
          { key: 'all', label: '今日综合' },
          { key: 'ai', label: 'AI大模型' },
          { key: 'robot', label: '机器人' },
          { key: 'semiconductor', label: '半导体' },
          { key: 'watchlist', label: '自选快讯' },
        ].map((tab) => {
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-1.5 rounded-xs text-[11px] font-bold font-sans tracking-tight transition-all select-none cursor-pointer text-center ${
                isSelected
                  ? 'bg-white text-slate-800 shadow-xs border-b border-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
              {tab.key === 'watchlist' && watchlist.length > 0 && (
                <span className="ml-1 bg-blue-600 text-white rounded-full px-1 py-0.2 text-[8px] font-mono leading-none inline-block">
                  {watchlist.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* News loop with high-density embedded cards */}
      <div className="flex-grow space-y-3">
        {renderList.length > 0 ? (
          renderList.map((item, index) => {
            // Check if it is an ad
            if ('isAd' in item) {
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-slate-50/70 border border-slate-200 rounded p-3 md:p-3.5 relative overflow-hidden flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs group"
                >
                  <div className="flex-grow space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-bold bg-slate-200 border border-slate-300 text-slate-700 px-1.5 py-0.2 rounded font-mono uppercase tracking-wider">
                        {item.brand}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 bg-white border border-slate-200 rounded px-1.5 py-0.2 font-sans tracking-tight">
                        AD 广告原生存款
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-sans leading-relaxed font-semibold group-hover:text-slate-800 transition-colors">
                      {item.title}
                    </p>
                  </div>
                  <button className="w-full sm:w-auto shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-1 px-3 rounded shadow-2xs transition-all text-center select-none cursor-pointer font-sans whitespace-nowrap">
                    {item.cta} →
                  </button>

                  {/* High Density Sleek Left Accent Line */}
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-slate-300" />
                </motion.div>
              );
            }

            // Normal News item
            const isStarred = watchlist.includes(item.id);
            const isExpanded = !!expandedItems[item.id];
            const hasDetails = !!item.details;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
                className={`bg-white border rounded p-3 md:p-3.5 transition-all shadow-2xs relative overflow-hidden group hover:shadow-xs cursor-pointer ${
                  isExpanded ? 'border-slate-350 bg-slate-50/20' : 'border-slate-200/90 hover:border-slate-300'
                }`}
                onClick={() => toggleExpanded(item.id)}
              >
                {/* Visual density left accent line */}
                <span className="absolute top-0 bottom-0 left-0 w-0.5 bg-slate-200 group-hover:bg-blue-600 transition-colors" />

                {/* News header log row */}
                <div className="flex items-start justify-between gap-2.5 mb-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Time indicator */}
                    <span className="text-[11px] font-mono font-bold text-slate-800 flex items-center gap-0.5">
                      ⏱️ {item.time}
                    </span>

                    <span className="text-slate-300 select-none text-[10px]">•</span>

                    {/* Source label */}
                    <span className="text-[11.5px] font-bold text-slate-500 font-sans">
                      {item.source}
                    </span>

                    <span className="text-slate-300 select-none text-[10px]">•</span>

                    {/* Sector Badge */}
                    <span className={`text-[9px] font-bold font-sans px-1 rounded-sm border ${getTrackBadgeStyles(item.track)}`}>
                      {getTrackLabel(item.track)}
                    </span>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1 shrink-0 bg-white group-hover:bg-transparent rounded px-0.5 transition-all">
                    {/* Clipboard Copy */}
                    <button
                      onClick={(e) => handleCopyNews(item, e)}
                      title="极速复制快讯"
                      className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors select-none cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                    </button>

                    {/* Add watchlist */}
                    <button
                      onClick={(e) => toggleWatchlist(item.id, e)}
                      className={`p-0.5 px-1.5 rounded-sm transition-all select-none cursor-pointer flex items-center gap-1 text-[9px] font-sans font-bold ${
                        isStarred
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-transparent'
                      }`}
                      title={isStarred ? "已加入自选" : "加自选"}
                    >
                      <Star className={`w-3 h-3 ${isStarred ? 'fill-amber-400 text-amber-500' : ''}`} />
                      <span>{isStarred ? "已存" : "+自选"}</span>
                    </button>
                  </div>
                </div>

                {/* News Title text */}
                <h3 className="text-xs font-bold text-slate-800 font-sans leading-relaxed group-hover:text-slate-900 transition-colors pr-1.5 break-words">
                  {item.summary}
                </h3>

                {/* Interactive expandable footer row */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold font-sans mt-2 pt-2 border-t border-dashed border-slate-100">
                  <span className="flex items-center gap-1 hover:text-slate-705 transition-colors">
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3 h-3 text-blue-600" /> 收起研判与主力指标
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3" /> 点击查看深度投研解读 & 关联代码
                      </>
                    )}
                  </span>

                  {item.symbols.length > 0 && (
                    <div className="flex items-center gap-1 overflow-hidden truncate max-w-[60%]">
                      <span className="text-[9px] font-mono uppercase tracking-tight text-slate-400">研判跟踪:</span>
                      {item.symbols.map((sym, i) => (
                        <span key={i} className="text-[9px] font-mono font-bold bg-slate-100 border border-slate-205 text-slate-650 px-1 rounded-xs truncate">
                          ${sym}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Expandable Content Container */}
                <AnimatePresence>
                  {isExpanded && hasDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden bg-slate-50/80 border-t border-slate-200 -mx-3 md:-mx-3.5 -mb-3 md:-mb-3.5 mt-2 p-3 md:p-3.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="space-y-3">
                        {/* Summary description */}
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider block">
                            📰 投研大合伙人深度解读
                          </span>
                          <p className="text-[11px] text-slate-600 leading-relaxed text-justify">
                            {item.details}
                          </p>
                        </div>

                        {/* Quantitative tags and code filters */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-dashed border-slate-200">
                          {getImpactBadge(item.impact)}

                          <div className="flex flex-wrap items-center gap-1 text-[10px]">
                            <span className="text-slate-400 font-medium">关联标的:</span>
                            {item.symbols.map((symbol) => (
                              <button
                                key={symbol}
                                onClick={() => setSearchFilter(symbol)}
                                className="px-1.5 py-0.2 rounded-xs bg-slate-200 hover:bg-blue-600 hover:text-white font-mono font-bold text-[10px] text-slate-700 transition-colors cursor-pointer select-none"
                              >
                                ${symbol}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Keyword selector blocks */}
                        {item.keywords.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 pt-1.5 border-t border-dashed border-slate-200/50 text-[10px]">
                            <Tag className="w-2.5 h-2.5 text-slate-400" />
                            <span className="text-slate-400 font-medium">看盘主线:</span>
                            {item.keywords.map((kw) => (
                              <button
                                key={kw}
                                onClick={() => onSelectKeyword(kw)}
                                className="px-1.5 py-0.2 rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-600 font-semibold transition-colors cursor-pointer select-none"
                              >
                                #{kw}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        ) : (
          <div className="bg-white border border-dashed border-slate-200 rounded p-8 text-center text-slate-500 font-sans">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-2 border border-slate-100">
              <Star className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-xs font-bold text-slate-700">没有查找到符合条件的硬科技雷达快讯</p>
            <p className="text-[10px] text-slate-400 mt-1 max-w-sm mx-auto leading-normal">
              {activeTab === 'watchlist'
                ? '您的自选列表为空。请在「今日综合」或三个硬科技频道，点击快讯卡片上的「+自选」，即可将感兴趣的动态实时收纳于此进行集中跟踪。'
                : '无匹配要闻，您可以尝试修改检索关键词、或者点击不同的赛道，盘查今日核心风向。'}
            </p>
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-[10px] py-1 px-3 rounded font-bold shadow-xs cursor-pointer select-none"
              >
                重置搜索过滤
              </button>
            )}
          </div>
        )}
      </div>

      {/* Global copy prompt popup */}
      <AnimatePresence>
        {showCopyBanner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed bottom-5 left-1/2 -track-translate-x-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] py-2 px-4 rounded shadow-lg z-50 flex items-center gap-1.5 font-bold"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>快讯内容已复制到系统剪贴板！</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
