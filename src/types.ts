export interface NewsItem {
  id: string;
  track: 'ai' | 'robot' | 'semiconductor';
  time: string;
  source: string;
  summary: string;
  details: string; // Additional details for clicking/expanding
  impact: 'positive' | 'neutral' | 'negative'; // Investment impact rating
  symbols: string[]; // Related stocks/companies (e.g., MSFT, TSMC, NVDA)
  keywords: string[]; // Core technology or market keywords
}

export interface AdItem {
  id: string;
  isAd: true;
  category: 'broker' | 'etf' | 'robo';
  brand: string;
  title: string;
  cta: string;
}
