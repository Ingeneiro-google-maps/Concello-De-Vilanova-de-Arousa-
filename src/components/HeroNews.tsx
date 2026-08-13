import React from 'react';
import { Clock, Bookmark, ExternalLink, ArrowRight } from 'lucide-react';
import { NewsItem } from '../types';

interface HeroNewsProps {
  news: NewsItem;
  onSelectNews: (news: NewsItem) => void;
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent, news: NewsItem) => void;
}

export const HeroNews: React.FC<HeroNewsProps> = ({
  news,
  onSelectNews,
  isSaved,
  onToggleSave
}) => {
  const handleOpenOriginal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (news.originalUrl) {
      window.open(news.originalUrl, '_blank', 'noopener,noreferrer');
    } else {
      onSelectNews(news);
    }
  };

  return (
    <div className="bg-white dark:bg-black border-b border-gray-300 dark:border-gray-800 pb-6 mb-6">
      {/* Top Topic Tag Bar with Thick Black Line */}
      <div className="border-b-2 border-black dark:border-white pb-1.5 mb-5">
        <h3 className="text-xl sm:text-2xl font-black font-serif text-black dark:text-white uppercase tracking-tight flex items-center gap-2">
          <span className="bg-rose-700 text-white text-xs px-2.5 py-0.5 font-sans font-black rounded uppercase">
            {news.category && news.category !== 'Todas' ? news.category : 'Alcaldía'}
          </span>
          <span>Iniciativa Oficial</span>
        </h3>
      </div>

      {/* 2-Column Split Hero Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column (~42%): Headline + Lead Subtitle + Author */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full">
          <div>
            <h2 
              onClick={() => onSelectNews(news)}
              className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold font-serif leading-[1.08] text-gray-950 dark:text-white tracking-tight cursor-pointer hover:text-[#c20000] dark:hover:text-red-400 transition"
            >
              {news.title}
            </h2>

            <p className="mt-3.5 text-gray-700 dark:text-gray-300 font-body text-base leading-snug">
              {news.subtitle || news.content?.slice(0, 160) + '...'}
            </p>

            <p className="mt-4 text-xs font-sans-ui text-gray-500 font-semibold tracking-wider uppercase">
              {news.author || 'P. V.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-2">
            <button
              onClick={() => onSelectNews(news)}
              className="bg-[#c20000] hover:bg-black text-white font-bold text-xs uppercase px-4 py-2 flex items-center gap-1.5 transition"
            >
              <span>Leer Noticia</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {news.originalUrl && (
              <button
                onClick={handleOpenOriginal}
                className="bg-amber-300 hover:bg-black hover:text-white text-black font-bold text-xs uppercase px-3 py-2 border border-black flex items-center gap-1 transition"
                title="Ir a noticia original en la fuente"
              >
                <span>Fuente 🔗</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={(e) => onToggleSave(e, news)}
              className={`p-2 border border-gray-300 dark:border-gray-700 transition ${
                isSaved ? 'bg-amber-400 text-black' : 'hover:bg-gray-100 text-gray-700'
              }`}
              title="Guardar noticia"
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>

        {/* Right Column (~58%): Large Main Photo with Credits */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="w-full aspect-[16/10] bg-gray-100 dark:bg-gray-900 overflow-hidden relative cursor-pointer" onClick={() => onSelectNews(news)}>
            <img
              src={news.imageUrl}
              alt={news.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover hover:scale-[1.02] transition duration-500"
            />
          </div>
          <p className="text-[11px] font-sans-ui text-gray-400 dark:text-gray-500 text-right mt-1.5 font-medium">
            Foto: A. Manso / V. Mejuto / C. Carballeira / A. Camba
          </p>
        </div>
      </div>
    </div>
  );
};

