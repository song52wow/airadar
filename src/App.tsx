import { Outlet } from 'react-router-dom';
import RadarHeader from './components/RadarHeader';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 pb-12 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Brand Header with real-time clock & moving trading ticker */}
      <header>
        <RadarHeader />
      </header>

      {/* Page content rendered by react-router */}
      <Outlet />

      {/* Footer */}
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
