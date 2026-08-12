import React, { useState, useEffect } from 'react';
import { ShieldAlert, ChevronRight, ChevronLeft, Zap } from 'lucide-react';
import { NewsItem } from '../types';

interface BreakingTickerProps {
  breakingNews: NewsItem[];
  onSelectNews: (news: NewsItem) => void;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({
  breakingNews,
  onSelectNews,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (breakingNews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [breakingNews.length]);

  if (!breakingNews || breakingNews.length === 0) return null;

  const currentItem = breakingNews[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + breakingNews.length) % breakingNews.length);
  };

  return (
    <div className="bg-black text-white border-b-2 border-black dark:border-white py-2.5 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          {/* Breaking badge */}
          <div className="flex items-center gap-1.5 bg-rose-600 text-white font-black text-xs uppercase px-3 py-1 shrink-0 tracking-widest border border-white">
            <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
            Última Hora
          </div>

          {/* Current headline */}
          <button
            onClick={() => onSelectNews(currentItem)}
            className="text-xs sm:text-sm font-bold tracking-wide text-white hover:text-amber-300 uppercase truncate text-left cursor-pointer transition"
          >
            <span className="font-extrabold text-amber-400 mr-2 bg-slate-900 px-1.5 py-0.5 border border-slate-700">
              [{currentItem.category}]
            </span>
            {currentItem.title}
          </button>
        </div>

        {/* Ticker controls */}
        {breakingNews.length > 1 && (
          <div className="flex items-center gap-2 shrink-0 text-white">
            <button
              onClick={handlePrev}
              className="p-1 border border-white hover:bg-white hover:text-black transition"
              title="Noticia anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold px-1 tracking-widest">
              {currentIndex + 1}/{breakingNews.length}
            </span>
            <button
              onClick={handleNext}
              className="p-1 border border-white hover:bg-white hover:text-black transition"
              title="Siguiente noticia"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
