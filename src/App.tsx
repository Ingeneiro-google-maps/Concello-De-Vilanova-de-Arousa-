import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { BreakingTicker } from './components/BreakingTicker';
import { HeroNews } from './components/HeroNews';
import { NewsCard } from './components/NewsCard';
import { NewsDetailModal } from './components/NewsDetailModal';
import { AdminPanel } from './components/AdminPanel';
import { AdminAuthModal } from './components/AdminAuthModal';
import { Footer } from './components/Footer';
import { NewsItem, Category } from './types';
import { initialNewsData } from './data/newsData';
import { safeFetchJson } from './utils/apiHelper';

export default function App() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category>('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedNewsIds, setSavedNewsIds] = useState<string[]>([]);
  const [isSavedView, setIsSavedView] = useState(false);
  
  // Modals state
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Direct code save state
  const [isSavingToCode, setIsSavingToCode] = useState(false);
  const [lastSaveSuccess, setLastSaveSuccess] = useState<boolean | null>(null);

  // Initial Load
  useEffect(() => {
    // Load saved bookmarks from localStorage
    try {
      const saved = localStorage.getItem('saved_news_ids');
      if (saved) {
        setSavedNewsIds(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not read saved news from localStorage');
    }

    // Load news from API or local cache
    const fetchNewsFromApi = async () => {
      try {
        const data = await safeFetchJson('/api/news');
        if (data && data.success && Array.isArray(data.news) && data.news.length > 0) {
          setNewsList(sortNewsByPosition(data.news));
          return;
        }
      } catch (err) {
        console.warn('Backend API unavailable, attempting local storage or fallback:', err);
      }

      // Fallback to localStorage or initial dataset
      try {
        const cached = localStorage.getItem('news_list_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setNewsList(sortNewsByPosition(parsed));
            return;
          }
        }
      } catch (e) {
        console.warn('Error reading news cache');
      }

      // Final fallback
      setNewsList(sortNewsByPosition(initialNewsData));
    };

    fetchNewsFromApi();

    // Auto-refresh from PostgreSQL DB every 20 seconds to stay synced globally
    const interval = setInterval(() => {
      fetchNewsFromApi();
    }, 20000);

    const handleFocus = () => {
      fetchNewsFromApi();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Sync newsList with local cache on change
  useEffect(() => {
    if (newsList.length > 0) {
      try {
        localStorage.setItem('news_list_cache', JSON.stringify(newsList));
      } catch (e) {
        console.warn('Failed to cache news list');
      }
    }
  }, [newsList]);

  // Helper to ensure news items are ordered by position
  const sortNewsByPosition = (items: NewsItem[]): NewsItem[] => {
    return [...items].sort((a, b) => (a.position || 99) - (b.position || 99));
  };

  // Toggle bookmark article
  const handleToggleSave = (e: React.MouseEvent, news: NewsItem) => {
    e.stopPropagation();
    let newSavedIds: string[];
    if (savedNewsIds.includes(news.id)) {
      newSavedIds = savedNewsIds.filter((id) => id !== news.id);
    } else {
      newSavedIds = [...savedNewsIds, news.id];
    }
    setSavedNewsIds(newSavedIds);
    try {
      localStorage.setItem('saved_news_ids', JSON.stringify(newSavedIds));
    } catch (err) {
      console.warn('Failed to update saved bookmarks');
    }
  };

  // Helper to persist news list to PostgreSQL DB automatically
  const persistToDatabase = async (itemsToSave: NewsItem[]): Promise<boolean> => {
    setIsSavingToCode(true);
    setLastSaveSuccess(null);

    try {
      const data = await safeFetchJson('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ news: itemsToSave }),
      });

      if (data && data.success) {
        setLastSaveSuccess(true);
        setTimeout(() => setLastSaveSuccess(null), 4000);
        return true;
      } else {
        throw new Error(data?.error || 'No se pudo guardar en la base de datos.');
      }
    } catch (err) {
      console.error('Error auto-saving to database:', err);
      setLastSaveSuccess(false);
      setTimeout(() => setLastSaveSuccess(null), 4000);
      return false;
    } finally {
      setIsSavingToCode(false);
    }
  };

  // Update News List from Admin Panel and sync to Database automatically
  const handleUpdateNewsList = (updated: NewsItem[]) => {
    const sorted = sortNewsByPosition(updated);
    setNewsList(sorted);
    persistToDatabase(sorted);
  };

  // Save directly to code file via API (/api/news)
  const handleSaveToCodeDirectly = async (): Promise<boolean> => {
    return await persistToDatabase(newsList);
  };

  // Add Comment to Article and sync to Database
  const handleAddComment = (newsId: string, commentText: string, authorName: string) => {
    const updated = newsList.map((item) => {
      if (item.id === newsId) {
        const comments = item.comments || [];
        const newComment = {
          id: `c-${Date.now()}`,
          author: authorName,
          text: commentText,
          date: 'Hace un momento',
          likes: 0,
        };
        return {
          ...item,
          comments: [newComment, ...comments],
        };
      }
      return item;
    });

    const sorted = sortNewsByPosition(updated);
    setNewsList(sorted);
    if (selectedNews && selectedNews.id === newsId) {
      const updatedSelected = sorted.find((n) => n.id === newsId) || null;
      setSelectedNews(updatedSelected);
    }
    persistToDatabase(sorted);
  };

  // Like Article and sync to Database
  const handleLikeNews = (newsId: string) => {
    const updated = newsList.map((item) => {
      if (item.id === newsId) {
        return {
          ...item,
          likes: item.likes + 1,
        };
      }
      return item;
    });

    const sorted = sortNewsByPosition(updated);
    setNewsList(sorted);
    if (selectedNews && selectedNews.id === newsId) {
      const updatedSelected = sorted.find((n) => n.id === newsId) || null;
      setSelectedNews(updatedSelected);
    }
    persistToDatabase(sorted);
  };

  // Filtered News Items Calculation
  const filteredNews = useMemo(() => {
    let result = newsList;

    // Filter by bookmarks if in saved view
    if (isSavedView) {
      result = result.filter((n) => savedNewsIds.includes(n.id));
    } else if (currentCategory !== 'Todas') {
      result = result.filter((n) => n.category === currentCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.subtitle.toLowerCase().includes(query) ||
          n.content.toLowerCase().includes(query) ||
          n.category.toLowerCase().includes(query) ||
          n.author.toLowerCase().includes(query) ||
          n.tags?.some((t) => t.toLowerCase().includes(query))
      );
    }

    return result;
  }, [newsList, currentCategory, searchQuery, isSavedView, savedNewsIds]);

  // Breaking news items
  const breakingNews = useMemo(() => {
    return newsList.filter((n) => n.isBreaking);
  }, [newsList]);

  // Hero news (Position #1 or first item if category filtered)
  const heroNewsItem = useMemo(() => {
    if (isSavedView || searchQuery.trim() || currentCategory !== 'Todas') {
      return null;
    }
    return filteredNews.length > 0 ? filteredNews[0] : null;
  }, [filteredNews, isSavedView, searchQuery, currentCategory]);

  // Grid news items (excluding hero if present)
  const gridNewsItems = useMemo(() => {
    if (heroNewsItem) {
      return filteredNews.slice(1);
    }
    return filteredNews;
  }, [filteredNews, heroNewsItem]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors flex flex-col justify-between">
      <div>
        {/* Main Header */}
        <Header
          currentCategory={currentCategory}
          onSelectCategory={(cat) => {
            setCurrentCategory(cat);
            setIsSavedView(false);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenAdmin={() => setIsAuthModalOpen(true)}
          savedCount={savedNewsIds.length}
          onOpenSaved={() => setIsSavedView(!isSavedView)}
          isSavedView={isSavedView}
          onSaveToCodeDirectly={handleSaveToCodeDirectly}
          isSavingToCode={isSavingToCode}
          lastSaveSuccess={lastSaveSuccess}
        />

        {/* Breaking News Ticker */}
        <BreakingTicker
          breakingNews={breakingNews}
          onSelectNews={(item) => setSelectedNews(item)}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-8">
          {/* Featured Position #1 Hero Article */}
          {heroNewsItem && (
            <section>
              <HeroNews
                news={heroNewsItem}
                onSelectNews={(item) => setSelectedNews(item)}
                isSaved={savedNewsIds.includes(heroNewsItem.id)}
                onToggleSave={handleToggleSave}
              />
            </section>
          )}

          {/* Grid Stream of Articles (4-column row directly matching screenshot) */}
          {gridNewsItems.length > 0 ? (
            <section className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                {gridNewsItems.map((news) => (
                  <NewsCard
                    key={news.id}
                    news={news}
                    onSelectNews={(item) => setSelectedNews(item)}
                    isSaved={savedNewsIds.includes(news.id)}
                    onToggleSave={handleToggleSave}
                    showPositionTag={false}
                  />
                ))}
              </div>
            </section>
          ) : (
            <div className="text-center py-16 bg-[#fdfcf8] dark:bg-black border-4 border-black dark:border-white p-8 space-y-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
              <p className="text-lg font-black uppercase font-display text-black dark:text-white">
                No se encontraron noticias en esta sección.
              </p>
              <p className="text-xs font-mono text-slate-700 dark:text-slate-300 max-w-md mx-auto uppercase">
                Prueba seleccionando otra categoría o utiliza el Panel de Administración para crear una nueva noticia.
              </p>
              <button
                onClick={() => {
                  setCurrentCategory('Todas');
                  setIsSavedView(false);
                  setSearchQuery('');
                }}
                className="bg-black text-white hover:bg-rose-600 font-black px-6 py-3 border-2 border-black text-xs uppercase tracking-widest transition"
              >
                Ver Todas las Noticias
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Reader Article Detail Modal */}
      <NewsDetailModal
        news={selectedNews}
        onClose={() => setSelectedNews(null)}
        isSaved={selectedNews ? savedNewsIds.includes(selectedNews.id) : false}
        onToggleSave={handleToggleSave}
        onAddComment={handleAddComment}
        onLikeNews={handleLikeNews}
      />

      {/* Admin Auth Password Modal */}
      <AdminAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          setIsAdminOpen(true);
        }}
      />

      {/* Admin Panel Modal */}
      {isAdminOpen && (
        <AdminPanel
          newsList={newsList}
          onClose={() => setIsAdminOpen(false)}
          onUpdateNewsList={handleUpdateNewsList}
          onSaveToCodeDirectly={handleSaveToCodeDirectly}
          isSavingToCode={isSavingToCode}
          lastSaveSuccess={lastSaveSuccess}
        />
      )}

      {/* Footer */}
      <Footer
        onSelectCategory={(cat) => {
          setCurrentCategory(cat);
          setIsSavedView(false);
        }}
        onOpenAdmin={() => setIsAuthModalOpen(true)}
        onSaveToCodeDirectly={handleSaveToCodeDirectly}
      />
    </div>
  );
}
