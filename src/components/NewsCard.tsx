import React from 'react';
import { Camera, Play, Bookmark, ExternalLink } from 'lucide-react';
import { NewsItem, CATEGORIES_LIST } from '../types';

interface NewsCardProps {
  news: NewsItem;
  onSelectNews: (news: NewsItem) => void;
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent, news: NewsItem) => void;
  showPositionTag?: boolean;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  news,
  onSelectNews,
  isSaved,
  onToggleSave,
}) => {
  const handleOpenOriginal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (news.originalUrl) {
      window.open(news.originalUrl, '_blank', 'noopener,noreferrer');
    } else {
      onSelectNews(news);
    }
  };

  const isVideo = news.title.toLowerCase().includes('programa') || news.title.toLowerCase().includes('video') || news.title.toLowerCase().includes('especial');

  return (
    <article className="group bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 pb-5 flex flex-col justify-between h-full">
      <div>
        {/* Thumbnail Image */}
        <div 
          className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-900 cursor-pointer mb-3" 
          onClick={() => onSelectNews(news)}
        >
          <img
            src={news.imageUrl}
            alt={news.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-300"
          />

          {/* Category Badge */}
          {(() => {
            const catInfo = CATEGORIES_LIST.find(c => c.id === news.category);
            return (
              <div className={`absolute top-2 left-2 ${catInfo?.badgeBg || 'bg-rose-700'} ${catInfo?.badgeText || 'text-white'} text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-md border border-white/20`}>
                {news.category || 'Alcaldía'}
              </div>
            );
          })()}

          {/* Media Badge (Camera or Play Icon) */}
          <div className="absolute bottom-2 left-2 bg-black/80 text-white p-1.5 rounded-sm">
            {isVideo ? <Play className="w-3.5 h-3.5 fill-current" /> : <Camera className="w-3.5 h-3.5" />}
          </div>

          {/* Save Action */}
          <button
            onClick={(e) => onToggleSave(e, news)}
            className={`absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-black/90 rounded border border-gray-300 transition ${
              isSaved ? 'text-amber-500 fill-current' : 'text-gray-700 dark:text-gray-300 hover:text-black'
            }`}
            title="Guardar noticia"
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>

        {/* Headline */}
        <h3
          onClick={() => onSelectNews(news)}
          className="text-lg sm:text-xl font-bold font-serif text-gray-950 dark:text-white leading-snug cursor-pointer hover:text-[#c20000] dark:hover:text-red-400 transition line-clamp-3"
        >
          {news.title}
        </h3>

        {/* Lead Subtitle */}
        {news.subtitle && (
          <p className="mt-2 text-xs font-body text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {news.subtitle}
          </p>
        )}
      </div>

      {/* Footer Meta & Source Link */}
      <div className="mt-4 pt-2 flex items-center justify-between text-[11px] font-sans-ui text-gray-500 border-t border-gray-100 dark:border-gray-900">
        <span className="uppercase font-semibold tracking-wider text-gray-400 truncate max-w-[120px]">
          {news.author || 'M. MORALEJO'}
        </span>

        <div className="flex items-center gap-2">
          {news.originalUrl && (
            <button
              onClick={handleOpenOriginal}
              className="text-[#c20000] dark:text-red-400 hover:underline font-bold flex items-center gap-1"
              title="Ir a fuente original"
            >
              <span>Fuente</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={() => onSelectNews(news)}
            className="text-black dark:text-white hover:text-[#c20000] font-bold"
          >
            Leer →
          </button>
        </div>
      </div>
    </article>
  );
};

