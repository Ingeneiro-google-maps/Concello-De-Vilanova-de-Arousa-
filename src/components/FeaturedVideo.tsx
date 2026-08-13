import React from 'react';
import { Play, ExternalLink, Flame, Tv } from 'lucide-react';
import { SiteConfig } from '../types';

interface FeaturedVideoProps {
  config: SiteConfig;
}

export const getYouTubeEmbedUrl = (url: string, autoplay: boolean = true): string => {
  if (!url) return '';

  let videoId = '';
  if (url.includes('youtube.com/embed/')) {
    const idMatch = url.match(/embed\/([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) videoId = idMatch[1];
  } else if (url.includes('v=')) {
    const match = url.match(/v=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) videoId = match[1];
  } else if (url.includes('youtu.be/')) {
    const match = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) videoId = match[1];
  } else if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
    videoId = url.trim();
  }

  if (!videoId) {
    videoId = '40GxTki9Krc';
  }

  const autoplayParams = autoplay ? 'autoplay=1&mute=1&enablejsapi=1' : 'autoplay=0';
  return `https://www.youtube.com/embed/${videoId}?${autoplayParams}&rel=0`;
};

export const FeaturedVideo: React.FC<FeaturedVideoProps> = ({ config }) => {
  if (!config.showVideo || !config.videoUrl) return null;

  const isAutoplay = config.autoplayVideo !== false;
  const embedUrl = getYouTubeEmbedUrl(config.videoUrl, isAutoplay);

  return (
    <section className="w-full bg-slate-900 text-white border-y-4 border-red-700 py-6 sm:py-8 px-4 sm:px-8 shadow-xl relative overflow-hidden font-sans my-6">
      {/* Background Subtle Texture Accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-950 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Header Badge Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
            </span>
            
            <div className="inline-flex items-center gap-2 bg-red-600 text-white px-3 py-1 text-xs font-black tracking-widest uppercase rounded shadow-sm">
              <Flame className="w-3.5 h-3.5" />
              <span>{config.videoBadge || 'NOTICIA IMPORTANTE'}</span>
            </div>

            <span className="hidden sm:inline text-xs text-slate-400 font-mono tracking-wider uppercase">
              • Emisión de Vídeo Oficial
            </span>
          </div>

          <a
            href={config.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 px-3 py-1 rounded transition font-medium"
          >
            <Tv className="w-3.5 h-3.5 text-red-400" />
            <span>Ver en YouTube</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>

        {/* Video Grid Layout: Left Embed Video Player, Right Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Main Video Embed Container */}
          <div className="lg:col-span-8 bg-black border-2 border-slate-700 rounded-lg overflow-hidden shadow-2xl group">
            <div className="relative aspect-video w-full">
              <iframe
                src={embedUrl}
                title={config.videoTitle || 'Noticia Importante - Vídeo Municipal'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              ></iframe>
            </div>
          </div>

          {/* Video Information Side Panel */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[11px] font-mono font-bold text-red-400 uppercase tracking-widest block mb-1">
                Concello de Vilanova de Arousa
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight font-serif tracking-tight mb-2">
                {config.videoTitle || 'Noticia Importante'}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed font-sans line-clamp-6">
                {config.videoDescription || 'Comunicado oficial e información municipal para los vecinos.'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Play className="w-3.5 h-3.5 text-red-500 fill-current" />
                Vídeo Oficial
              </span>
              <span>Canal Municipal</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
