import React, { useState } from 'react';
import { X, Clock, Eye, Heart, Share2, Bookmark, Send, ThumbsUp, User, Sparkles, Zap, MessageSquare, ExternalLink, Globe } from 'lucide-react';
import { NewsItem, Comment } from '../types';

interface NewsDetailModalProps {
  news: NewsItem | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent, news: NewsItem) => void;
  onAddComment: (newsId: string, commentText: string, authorName: string) => void;
  onLikeNews: (newsId: string) => void;
}

export const NewsDetailModal: React.FC<NewsDetailModalProps> = ({
  news,
  onClose,
  isSaved,
  onToggleSave,
  onAddComment,
  onLikeNews,
}) => {
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [copied, setCopied] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  if (!news) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleLike = () => {
    if (!hasLiked) {
      onLikeNews(news.id);
      setHasLiked(true);
    }
  };

  const handleOpenOriginal = () => {
    if (news.originalUrl) {
      window.open(news.originalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const name = authorName.trim() || 'Lector Anónimo';
    onAddComment(news.id, commentText.trim(), name);
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-[#fdfcf8] dark:bg-black border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header Action Bar */}
        <div className="sticky top-0 z-20 bg-[#fdfcf8] dark:bg-black px-6 py-4 border-b-4 border-black dark:border-white flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-black text-white dark:bg-white dark:text-black font-black text-xs uppercase px-3 py-1 border border-black tracking-widest">
              {news.category}
            </span>
            {news.isBreaking && (
              <span className="bg-rose-600 text-white font-black text-xs uppercase px-3 py-1 flex items-center gap-1 border border-black tracking-widest">
                <Zap className="w-3 h-3 fill-current animate-pulse" /> Última Hora
              </span>
            )}
            <span className="hidden sm:inline font-mono font-bold text-xs bg-amber-300 text-black px-2 py-0.5 border border-black uppercase">
              #{news.position}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {news.originalUrl && (
              <button
                onClick={handleOpenOriginal}
                className="bg-amber-300 hover:bg-black hover:text-white text-black border-2 border-black font-black text-xs uppercase tracking-wider px-3 py-1.5 flex items-center gap-1.5 transition"
                title="Ver Noticia Original en su sitio web"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">Noticia Original</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleShare}
              className="p-2 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white transition text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              title="Compartir Noticia"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{copied ? '¡Copiado!' : 'Compartir'}</span>
            </button>

            <button
              onClick={(e) => onToggleSave(e, news)}
              className={`p-2 border-2 border-black dark:border-white transition ${
                isSaved
                  ? 'bg-amber-400 text-black font-black'
                  : 'text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'
              }`}
              title={isSaved ? 'Guardado' : 'Guardar noticia'}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={onClose}
              className="p-2 border-2 border-black dark:border-white bg-rose-600 text-white font-black hover:bg-rose-700 transition"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Reader Body */}
        <div className="overflow-y-auto p-6 sm:p-10 space-y-8">
          {/* Banner for Original URL if present */}
          {news.originalUrl && (
            <div className="bg-amber-300 text-black border-4 border-black p-4 flex flex-wrap items-center justify-between gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3">
                <Globe className="w-6 h-6 shrink-0" />
                <div>
                  <p className="font-black text-xs sm:text-sm uppercase tracking-tight">Noticia importada de la fuente oficial</p>
                  <p className="text-[11px] font-mono font-bold truncate max-w-md">{news.originalUrl}</p>
                </div>
              </div>
              <button
                onClick={handleOpenOriginal}
                className="bg-black text-white hover:bg-rose-600 font-black text-xs uppercase tracking-widest px-4 py-2 border-2 border-black flex items-center gap-2 transition"
              >
                <span>Ir a Noticia Original</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Headline Title */}
          <div>
            <h1 className="text-3xl sm:text-5xl font-black text-black dark:text-white font-display uppercase tracking-tighter leading-none">
              {news.title}
            </h1>
            <p className="mt-4 text-base sm:text-xl text-black dark:text-slate-300 font-bold border-l-4 border-black dark:border-white pl-4 italic leading-relaxed">
              {news.subtitle}
            </p>
          </div>

          {/* Author & Timestamp Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y-2 border-black dark:border-white text-xs font-bold uppercase tracking-wider text-black dark:text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black text-white dark:bg-white dark:text-black font-black flex items-center justify-center text-lg border-2 border-black">
                {news.author.charAt(0)}
              </div>
              <div>
                <p className="font-extrabold text-black dark:text-white text-sm">{news.author}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">{news.authorRole || 'Redactor Especializado'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-rose-600" />
                {news.readTime}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {news.views.toLocaleString()} lecturas
              </span>
              <span>
                {new Date(news.date).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Article Hero Image */}
          <div className="relative border-4 border-black dark:border-white aspect-[16/9] bg-slate-200">
            <img
              src={news.imageUrl}
              alt={news.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition duration-500"
            />
            <div className="absolute bottom-3 right-3 bg-black text-white border border-white px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest">
              FOTO REDACCIÓN • EL DIARIO
            </div>
          </div>

          {/* Formatted Article Content */}
          <div className="max-w-none text-black dark:text-slate-100 text-base sm:text-lg leading-relaxed space-y-6 font-serif">
            {news.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="first-letter:text-5xl first-letter:font-black first-letter:text-black dark:first-letter:text-white first-letter:mr-3 first-letter:float-left first-letter:font-display">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags */}
          {news.tags && news.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-4 border-t-2 border-black dark:border-white">
              <span className="text-xs font-black text-black dark:text-white uppercase tracking-widest mr-2">ETIQUETAS:</span>
              {news.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-black text-white dark:bg-white dark:text-black text-xs font-bold px-3 py-1 border border-black uppercase tracking-wider"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Interactive Likes & Reaction */}
          <div className="flex items-center justify-between p-6 bg-amber-300 text-black border-4 border-black">
            <div>
              <p className="font-black uppercase tracking-wider text-sm">¿Te resultó útil esta noticia?</p>
              <p className="text-xs font-medium uppercase tracking-wide">Apoya el periodismo independiente dejando tu valoración.</p>
            </div>

            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-5 py-2.5 border-2 border-black font-black text-xs uppercase tracking-widest transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                hasLiked
                  ? 'bg-rose-600 text-white'
                  : 'bg-white hover:bg-black hover:text-white text-black'
              }`}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
              <span>{news.likes + (hasLiked ? 1 : 0)} Me gusta</span>
            </button>
          </div>

          {/* Comments Section */}
          <div className="pt-6 border-t-4 border-black dark:border-white">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-6 h-6 text-black dark:text-white" />
              <h3 className="text-2xl font-black text-black dark:text-white font-display uppercase tracking-tighter">
                Comentarios ({news.comments?.length || 0})
              </h3>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="space-y-3 mb-8 bg-white dark:bg-slate-900 p-4 sm:p-6 border-4 border-black dark:border-white">
              <input
                type="text"
                placeholder="TU NOMBRE (OPCIONAL)"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full sm:w-1/2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white outline-none focus:ring-2 focus:ring-black"
              />
              <textarea
                rows={3}
                placeholder="ESCRIBE TU OPINIÓN SOBRE ESTA NOTICIA..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full px-4 py-2.5 text-xs font-bold uppercase tracking-wider bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white outline-none resize-none focus:ring-2 focus:ring-black"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black hover:bg-rose-600 dark:hover:bg-rose-600 hover:text-white disabled:opacity-50 font-black px-5 py-2.5 border-2 border-black text-xs uppercase tracking-widest transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  Publicar Comentario
                </button>
              </div>
            </form>

            {/* Existing Comments List */}
            <div className="space-y-4">
              {news.comments && news.comments.length > 0 ? (
                news.comments.map((c) => (
                  <div key={c.id} className="p-4 bg-white dark:bg-black border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-xs font-black border border-black">
                          {c.author.charAt(0)}
                        </div>
                        <span className="font-extrabold text-xs uppercase text-black dark:text-white">{c.author}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">{c.date}</span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-black dark:text-slate-200 leading-relaxed pl-8">
                      {c.text}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs font-bold text-black dark:text-white uppercase tracking-wider italic text-center py-4 bg-amber-100 dark:bg-slate-800 border-2 border-black">
                  Sé el primero en comentar esta noticia.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
