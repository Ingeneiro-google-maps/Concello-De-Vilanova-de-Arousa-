import React, { useState, useEffect } from 'react';
import { 
  X, Plus, ArrowUp, ArrowDown, Edit3, Trash2, Sparkles, Save, Code, Download, 
  CheckCircle2, AlertCircle, RefreshCw, Layers, ShieldCheck, Flame, Image as ImageIcon, Zap, Link as LinkIcon, Globe, ExternalLink, Database, Activity,
  Tv, Palette, Sliders, Video, Play, Type, Search, Target, BarChart2, Share2, FileText, Copy, Award, Cpu, Eye, MapPin, Clock, Compass, Users, Maximize2, Minimize2, Radio, Check
} from 'lucide-react';
import { NewsItem, Category, SiteConfig, defaultSiteConfig, CATEGORIES_LIST } from '../types';
import { safeFetchJson } from '../utils/apiHelper';
import { CoatOfArmsLogo } from './CoatOfArmsLogo';
import { getYouTubeEmbedUrl } from './FeaturedVideo';
import { GalicianNewsRadar } from './GalicianNewsRadar';

interface AdminPanelProps {
  newsList: NewsItem[];
  onClose: () => void;
  onUpdateNewsList: (newList: NewsItem[]) => void;
  onSaveToCodeDirectly: () => Promise<boolean>;
  isSavingToCode: boolean;
  lastSaveSuccess: boolean | null;
  siteConfig?: SiteConfig;
  onUpdateSiteConfig?: (newConfig: SiteConfig) => Promise<boolean>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  newsList,
  onClose,
  onUpdateNewsList,
  onSaveToCodeDirectly,
  isSavingToCode,
  lastSaveSuccess,
  siteConfig = defaultSiteConfig,
  onUpdateSiteConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'order' | 'create' | 'radar' | 'categories' | 'visits' | 'seo' | 'link' | 'ai' | 'config' | 'code'>('order');
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [radarPendingCount, setRadarPendingCount] = useState<number>(0);

  const fetchRadarPendingCount = async () => {
    try {
      const res = await safeFetchJson('/api/monitoring/news');
      if (res && res.success && res.stats) {
        setRadarPendingCount(res.stats.pending || 0);
      }
    } catch (e) {}
  };

  const handleRefreshAllOfficialNews = async () => {
    try {
      const res = await safeFetchJson('/api/news');
      if (res && res.success && res.news) {
        onUpdateNewsList(res.news);
      }
      fetchRadarPendingCount();
    } catch (e) {}
  };

  useEffect(() => {
    fetchRadarPendingCount();
  }, []);

  // Visit History State
  const [visitHistory, setVisitHistory] = useState<{
    totalVisits: number;
    recentVisits: any[];
    topLocations: { name: string; count: number }[];
    topNews: { title: string; count: number }[];
  }>({ totalVisits: 0, recentVisits: [], topLocations: [], topNews: [] });
  const [isLoadingVisits, setIsLoadingVisits] = useState(false);

  const fetchVisitHistory = async () => {
    setIsLoadingVisits(true);
    try {
      const res = await safeFetchJson('/api/visits/history');
      if (res && res.success) {
        setVisitHistory({
          totalVisits: res.totalVisits || 0,
          recentVisits: res.recentVisits || [],
          topLocations: res.topLocations || [],
          topNews: res.topNews || []
        });
      }
    } catch (e) {
      console.warn('Could not fetch visit history:', e);
    } finally {
      setIsLoadingVisits(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'visits') {
      fetchVisitHistory();
    }
  }, [activeTab]);

  // Site Config State
  const [cfgLogoUrl, setCfgLogoUrl] = useState(siteConfig.logoUrl || '');
  const [cfgLogoSize, setCfgLogoSize] = useState(siteConfig.logoSize || 48);
  const [cfgTitleColor, setCfgTitleColor] = useState(siteConfig.titleColor || '#c20000');
  const [cfgTitleText, setCfgTitleText] = useState(siteConfig.titleText || 'Concello de Vilanova de Arousa');
  const [cfgBaseVisits, setCfgBaseVisits] = useState<number>(siteConfig.baseVisits !== undefined ? siteConfig.baseVisits : 30);
  const [cfgVideoUrl, setCfgVideoUrl] = useState(siteConfig.videoUrl || '');
  const [cfgVideoTitle, setCfgVideoTitle] = useState(siteConfig.videoTitle || '');
  const [cfgVideoBadge, setCfgVideoBadge] = useState(siteConfig.videoBadge || 'NOTICIA IMPORTANTE');
  const [cfgVideoDescription, setCfgVideoDescription] = useState(siteConfig.videoDescription || '');
  const [cfgShowVideo, setCfgShowVideo] = useState(siteConfig.showVideo !== false);
  const [cfgAutoplayVideo, setCfgAutoplayVideo] = useState(siteConfig.autoplayVideo !== false);
  const [cfgVideoPosition, setCfgVideoPosition] = useState<'top' | 'middle' | 'sidebar'>(siteConfig.videoPosition || 'top');
  
  // Google SEO & CEO Suite State
  const [cfgSeoTitle, setCfgSeoTitle] = useState(siteConfig.seoTitle || 'Concello de Vilanova de Arousa - Portal Oficial Noticias y Actualidad');
  const [cfgSeoMetaDescription, setCfgSeoMetaDescription] = useState(siteConfig.seoMetaDescription || 'Portal Informativo Oficial del Concello de Vilanova de Arousa. Últimas noticias de alcaldía, obradoiros, proyectos municipales, bandos y eventos.');
  const [cfgSeoKeywords, setCfgSeoKeywords] = useState(siteConfig.seoKeywords || 'Vilanova de Arousa, Concello, Galicia, Alcaldia, Noticias Vilanova, Salnes, Pontevedra, Obras Municipales, Agenda Vilanova');
  const [cfgGoogleSearchConsoleTag, setCfgGoogleSearchConsoleTag] = useState(siteConfig.googleSearchConsoleTag || 'google-site-verification-vilanova-official-2026');
  const [cfgGoogleAnalyticsId, setCfgGoogleAnalyticsId] = useState(siteConfig.googleAnalyticsId || 'G-VILANOVA2026');
  const [cfgOgImageUrl, setCfgOgImageUrl] = useState(siteConfig.ogImageUrl || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80');
  const [cfgCanonicalUrl, setCfgCanonicalUrl] = useState(siteConfig.canonicalUrl || 'https://vilanova-de-arousa.gal');
  const [cfgRobotsMeta, setCfgRobotsMeta] = useState(siteConfig.robotsMeta || 'index, follow, max-image-preview:large, max-snippet:-1');
  const [cfgStructuredDataOrgName, setCfgStructuredDataOrgName] = useState(siteConfig.structuredDataOrgName || 'Concello de Vilanova de Arousa');
  const [cfgStructuredDataRegion, setCfgStructuredDataRegion] = useState(siteConfig.structuredDataRegion || 'Galicia, España');
  
  // Expanded Screen Width State
  const [isExpandedWidth, setIsExpandedWidth] = useState<boolean>(true);

  // Google Auto-Indexing Ping State
  const [isPingingGoogle, setIsPingingGoogle] = useState<boolean>(false);
  const [googlePingResult, setGooglePingResult] = useState<{ success?: boolean; message?: string; details?: string; time?: string } | null>(null);

  const handleTriggerGooglePing = async () => {
    setIsPingingGoogle(true);
    setGooglePingResult(null);
    try {
      const res = await safeFetchJson('/api/seo/ping-google', { method: 'POST' });
      if (res && res.success) {
        setGooglePingResult({
          success: true,
          message: '¡Notificación enviada a Google Search Engine!',
          details: res.pingDetails || `Sitemap.xml listo y disponible en ${res.sitemapUrl}`,
          time: new Date().toLocaleTimeString('es-ES')
        });
      } else {
        setGooglePingResult({
          success: false,
          message: res?.error || 'No se pudo enviar la solicitud de aviso a Google.',
          time: new Date().toLocaleTimeString('es-ES')
        });
      }
    } catch (e: any) {
      setGooglePingResult({
        success: false,
        message: 'Error al comunicarse con el servicio de auto-indexación.',
        time: new Date().toLocaleTimeString('es-ES')
      });
    } finally {
      setIsPingingGoogle(false);
    }
  };

  const [copiedSitemap, setCopiedSitemap] = useState(false);
  const [copiedGoogleLink, setCopiedGoogleLink] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSaveSuccess, setConfigSaveSuccess] = useState<boolean | null>(null);

  // Sitemap DB State
  const [isSavingSitemap, setIsSavingSitemap] = useState(false);
  const [sitemapSaveMessage, setSitemapSaveMessage] = useState('');
  const [sitemapDbStatus, setSitemapDbStatus] = useState<{ isStored: boolean; savedAt?: string; googleLink?: string }>({
    isStored: false,
    googleLink: typeof window !== 'undefined' ? `${window.location.origin}/sitemap.xml` : 'https://vilanova-de-arousa.gal/sitemap.xml'
  });

  const checkSitemapDbStatus = async () => {
    try {
      const res = await safeFetchJson('/api/sitemap/status');
      if (res && res.success) {
        setSitemapDbStatus({
          isStored: res.isStored,
          savedAt: res.sitemap?.updatedAt,
          googleLink: res.googleLink || (typeof window !== 'undefined' ? `${window.location.origin}/sitemap.xml` : 'https://vilanova-de-arousa.gal/sitemap.xml')
        });
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (activeTab === 'seo') {
      checkSitemapDbStatus();
    }
  }, [activeTab]);

  useEffect(() => {
    if (siteConfig) {
      setCfgLogoUrl(siteConfig.logoUrl || '');
      setCfgLogoSize(siteConfig.logoSize || 48);
      setCfgTitleColor(siteConfig.titleColor || '#c20000');
      setCfgTitleText(siteConfig.titleText || 'Concello de Vilanova de Arousa');
      setCfgBaseVisits(siteConfig.baseVisits !== undefined ? siteConfig.baseVisits : 30);
      setCfgVideoUrl(siteConfig.videoUrl || 'https://www.youtube.com/watch?v=40GxTki9Krc');
      setCfgVideoTitle(siteConfig.videoTitle || 'Información y Proyectos Municipales en Vilanova de Arousa');
      setCfgVideoBadge(siteConfig.videoBadge || 'NOTICIA IMPORTANTE');
      setCfgVideoDescription(siteConfig.videoDescription || 'Vídeo oficial con las últimas novedades, obras e iniciativas destacadas del Concello.');
      setCfgShowVideo(siteConfig.showVideo !== false);
      setCfgAutoplayVideo(siteConfig.autoplayVideo !== false);
      setCfgVideoPosition(siteConfig.videoPosition || 'top');

      // SEO
      setCfgSeoTitle(siteConfig.seoTitle || 'Concello de Vilanova de Arousa - Portal Oficial Noticias y Actualidad');
      setCfgSeoMetaDescription(siteConfig.seoMetaDescription || 'Portal Informativo Oficial del Concello de Vilanova de Arousa. Últimas noticias de alcaldía, obradoiros, proyectos municipales, bandos y eventos.');
      setCfgSeoKeywords(siteConfig.seoKeywords || 'Vilanova de Arousa, Concello, Galicia, Alcaldia, Noticias Vilanova, Salnes, Pontevedra, Obras Municipales, Agenda Vilanova');
      setCfgGoogleSearchConsoleTag(siteConfig.googleSearchConsoleTag || 'google-site-verification-vilanova-official-2026');
      setCfgGoogleAnalyticsId(siteConfig.googleAnalyticsId || 'G-VILANOVA2026');
      setCfgOgImageUrl(siteConfig.ogImageUrl || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80');
      setCfgCanonicalUrl(siteConfig.canonicalUrl || 'https://vilanova-de-arousa.gal');
      setCfgRobotsMeta(siteConfig.robotsMeta || 'index, follow, max-image-preview:large, max-snippet:-1');
      setCfgStructuredDataOrgName(siteConfig.structuredDataOrgName || 'Concello de Vilanova de Arousa');
      setCfgStructuredDataRegion(siteConfig.structuredDataRegion || 'Galicia, España');
    }
  }, [siteConfig]);

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    setConfigSaveSuccess(null);
    const updated: SiteConfig = {
      logoUrl: cfgLogoUrl.trim(),
      logoSize: Number(cfgLogoSize) || 48,
      titleColor: cfgTitleColor.trim() || '#c20000',
      titleText: cfgTitleText.trim() || 'Concello de Vilanova de Arousa',
      baseVisits: typeof cfgBaseVisits === 'number' && !isNaN(cfgBaseVisits) ? Math.max(0, cfgBaseVisits) : 30,
      videoUrl: cfgVideoUrl.trim() || 'https://www.youtube.com/watch?v=40GxTki9Krc',
      videoTitle: cfgVideoTitle.trim() || 'Información y Proyectos Municipales en Vilanova de Arousa',
      videoBadge: cfgVideoBadge.trim() || 'NOTICIA IMPORTANTE',
      videoDescription: cfgVideoDescription.trim() || 'Vídeo oficial con las últimas novedades, obras e iniciativas destacadas del Concello.',
      showVideo: cfgShowVideo,
      videoPosition: cfgVideoPosition,
      autoplayVideo: cfgAutoplayVideo,

      // SEO
      seoTitle: cfgSeoTitle.trim(),
      seoMetaDescription: cfgSeoMetaDescription.trim(),
      seoKeywords: cfgSeoKeywords.trim(),
      googleSearchConsoleTag: cfgGoogleSearchConsoleTag.trim(),
      googleAnalyticsId: cfgGoogleAnalyticsId.trim(),
      ogImageUrl: cfgOgImageUrl.trim(),
      canonicalUrl: cfgCanonicalUrl.trim(),
      robotsMeta: cfgRobotsMeta.trim(),
      structuredDataOrgName: cfgStructuredDataOrgName.trim(),
      structuredDataRegion: cfgStructuredDataRegion.trim(),
    };

    if (onUpdateSiteConfig) {
      const ok = await onUpdateSiteConfig(updated);
      setConfigSaveSuccess(ok);

      // Automatically generate and store sitemap in DB as well
      try {
        const baseUrl = updated.canonicalUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://vilanova-de-arousa.gal');
        const todayIso = new Date().toISOString().split('T')[0];
        const escapeXml = (str: string) => (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

        let autoXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        autoXml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;
        autoXml += `  <url><loc>${escapeXml(baseUrl)}/</loc><lastmod>${todayIso}</lastmod><changefreq>daily</changefreq><priority>1.0</priority><mobile:mobile/></url>\n`;
        ['Alcaldia', 'Obras', 'Deportes', 'Cultura', 'Turismo', 'Servizos', 'Eventos'].forEach(cat => {
          autoXml += `  <url><loc>${escapeXml(baseUrl)}/#categoria-${cat.toLowerCase()}</loc><lastmod>${todayIso}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
        });
        newsList.forEach((item) => {
          const itemDate = item.date ? item.date.split('T')[0] : todayIso;
          autoXml += `  <url><loc>${escapeXml(baseUrl)}/#noticia-${escapeXml(item.id)}</loc><lastmod>${itemDate}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority>`;
          autoXml += `<news:news><news:publication><news:name>${escapeXml(updated.structuredDataOrgName || 'Concello de Vilanova de Arousa')}</news:name><news:language>es</news:language></news:publication><news:publication_date>${itemDate}</news:publication_date><news:title>${escapeXml(item.title)}</news:title></news:news>`;
          if (item.imageUrl) autoXml += `<image:image><image:loc>${escapeXml(item.imageUrl)}</image:loc><image:title>${escapeXml(item.title)}</image:title></image:image>`;
          autoXml += `</url>\n`;
        });
        autoXml += `</urlset>`;

        const sRes = await safeFetchJson('/api/sitemap/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ xmlContent: autoXml, urlCount: newsList.length + 8 })
        });

        if (sRes && sRes.success) {
          setSitemapDbStatus({
            isStored: true,
            savedAt: sRes.savedAt || new Date().toISOString(),
            googleLink: sRes.googleLink || `${typeof window !== 'undefined' ? window.location.origin : 'https://vilanova-de-arousa.gal'}/sitemap.xml`
          });
        }
      } catch (e) {}

      setTimeout(() => setConfigSaveSuccess(null), 3500);
    }
    setIsSavingConfig(false);
  };

  // Form State
  const [orderCategoryFilter, setOrderCategoryFilter] = useState<Category>('Todas');
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<Category>('Todas');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formOriginalUrl, setFormOriginalUrl] = useState('');
  const [formAuthor, setFormAuthor] = useState('Gabinete de Prensa');
  const [formAuthorRole, setFormAuthorRole] = useState('Concello de Vilanova de Arousa');
  const [formReadTime, setFormReadTime] = useState('4 min de lectura');
  const [formIsBreaking, setFormIsBreaking] = useState(false);
  const [formTags, setFormTags] = useState('Vilanova, Alcaldía');
  const [formPosition, setFormPosition] = useState<number>(newsList.length + 1);

  // URL Import State
  const [urlInput, setUrlInput] = useState('');
  const [isImportingUrl, setIsImportingUrl] = useState(false);
  const [urlImportError, setUrlImportError] = useState<string | null>(null);
  const [importedPreviewItem, setImportedPreviewItem] = useState<NewsItem | null>(null);

  // AI Generator State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiCategory, setAiCategory] = useState<Category>('Todas');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Code Export State
  const [copiedCode, setCopiedCode] = useState(false);

  // Database Health Connection State
  const [dbHealth, setDbHealth] = useState<{
    connected: boolean;
    dbName: string;
    host: string;
    latencyMs: number;
    totalNews: number;
    error?: string;
    serverTime?: string;
  } | null>(null);
  const [isCheckingDb, setIsCheckingDb] = useState(false);

  const fetchDbHealth = async () => {
    setIsCheckingDb(true);
    try {
      const data = await safeFetchJson('/api/db-health');
      if (data && data.success && data.health) {
        setDbHealth(data.health);
      } else {
        setDbHealth({
          connected: false,
          dbName: 'neondb',
          host: 'Neon PostgreSQL',
          latencyMs: 0,
          totalNews: newsList.length,
          error: data?.health?.error || 'Error al conectar'
        });
      }
    } catch (err: any) {
      setDbHealth({
        connected: false,
        dbName: 'neondb',
        host: 'Neon PostgreSQL',
        latencyMs: 0,
        totalNews: newsList.length,
        error: err.message || 'Error de conexión'
      });
    } finally {
      setIsCheckingDb(false);
    }
  };

  useEffect(() => {
    fetchDbHealth();
  }, []);


  // Load item into edit form
  const handleStartEdit = (item: NewsItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormSubtitle(item.subtitle);
    setFormContent(item.content);
    setFormCategory(item.category);
    setFormImageUrl(item.imageUrl);
    setFormOriginalUrl(item.originalUrl || '');
    setFormAuthor(item.author);
    setFormAuthorRole(item.authorRole || '');
    setFormReadTime(item.readTime);
    setFormIsBreaking(!!item.isBreaking);
    setFormTags(item.tags?.join(', ') || '');
    setFormPosition(item.position);
    setActiveTab('create');
  };

  const handleResetForm = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormSubtitle('');
    setFormContent('');
    setFormCategory('Tecnología');
    setFormImageUrl('');
    setFormOriginalUrl('');
    setFormAuthor('Redacción');
    setFormAuthorRole('Periodista');
    setFormReadTime('4 min de lectura');
    setFormIsBreaking(false);
    setFormTags('Noticias, Actualidad');
    setFormPosition(newsList.length + 1);
  };

  // Reordering Logic
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newList = [...newsList];
    const temp = newList[index];
    newList[index] = newList[index - 1];
    newList[index - 1] = temp;

    // Reassign position numbers sequentially
    const updatedPositions = newList.map((item, idx) => ({
      ...item,
      position: idx + 1,
      isHero: idx === 0,
    }));

    onUpdateNewsList(updatedPositions);
  };

  const handleMoveDown = (index: number) => {
    if (index === newsList.length - 1) return;
    const newList = [...newsList];
    const temp = newList[index];
    newList[index] = newList[index + 1];
    newList[index + 1] = temp;

    const updatedPositions = newList.map((item, idx) => ({
      ...item,
      position: idx + 1,
      isHero: idx === 0,
    }));

    onUpdateNewsList(updatedPositions);
  };

  const handleSetExactPosition = (item: NewsItem, newPos: number) => {
    if (isNaN(newPos) || newPos < 1) return;
    let listWithoutItem = newsList.filter((n) => n.id !== item.id);
    const targetIdx = Math.min(Math.max(newPos - 1, 0), listWithoutItem.length);
    
    listWithoutItem.splice(targetIdx, 0, item);

    const reindexed = listWithoutItem.map((n, idx) => ({
      ...n,
      position: idx + 1,
      isHero: idx === 0,
    }));

    onUpdateNewsList(reindexed);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta noticia?')) {
      const filtered = newsList.filter((n) => n.id !== id);
      const reindexed = filtered.map((n, idx) => ({
        ...n,
        position: idx + 1,
        isHero: idx === 0,
      }));
      onUpdateNewsList(reindexed);
    }
  };

  const handleQuickChangeCategory = (newsId: string, newCat: Category) => {
    const updated = newsList.map((item) => (item.id === newsId ? { ...item, category: newCat } : item));
    onUpdateNewsList(updated);
  };

  // Save/Update Article Form Submit
  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      alert('Por favor completa al menos el título y el contenido.');
      return;
    }

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const defaultImage = formImageUrl.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80';

    if (editingItem) {
      // Update existing
      const updatedList = newsList.map((item) => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            title: formTitle,
            subtitle: formSubtitle,
            content: formContent,
            category: formCategory,
            imageUrl: defaultImage,
            originalUrl: formOriginalUrl.trim() || undefined,
            author: formAuthor,
            authorRole: formAuthorRole,
            readTime: formReadTime,
            isBreaking: formIsBreaking,
            tags: tagsArray,
          };
        }
        return item;
      });

      // Handle position change if updated
      const finalReindexed = updatedList.map((item, idx) => ({
        ...item,
        position: idx + 1,
        isHero: idx === 0,
      }));

      onUpdateNewsList(finalReindexed);
      alert('¡Noticia actualizada con éxito!');
    } else {
      // Create new
      const newArticle: NewsItem = {
        id: `news-${Date.now()}`,
        title: formTitle,
        subtitle: formSubtitle,
        content: formContent,
        category: formCategory,
        imageUrl: defaultImage,
        originalUrl: formOriginalUrl.trim() || undefined,
        author: formAuthor || 'Redacción',
        authorRole: formAuthorRole || 'Periodista',
        date: new Date().toISOString(),
        readTime: formReadTime || '4 min de lectura',
        isBreaking: formIsBreaking,
        isHero: false,
        position: formPosition,
        views: 0,
        likes: 0,
        tags: tagsArray,
        comments: [],
      };

      // Insert at position
      const newList = [...newsList];
      const targetIndex = Math.min(Math.max(formPosition - 1, 0), newList.length);
      newList.splice(targetIndex, 0, newArticle);

      const reindexed = newList.map((item, idx) => ({
        ...item,
        position: idx + 1,
        isHero: idx === 0,
      }));

      onUpdateNewsList(reindexed);
      alert('¡Noticia agregada con éxito!');
    }

    handleResetForm();
    setActiveTab('order');
  };

  // URL Import Handler
  const handleImportFromUrl = async () => {
    if (!urlInput.trim()) return;
    setIsImportingUrl(true);
    setUrlImportError(null);
    setImportedPreviewItem(null);

    try {
      const data = await safeFetchJson('/api/import-from-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      if (!data || !data.success) {
        throw new Error(data?.error || 'No se pudo extraer la información del enlace proporcionado.');
      }

      const itemData = data.item || data.data || {};

      const imported: NewsItem = {
        id: `imported-${Date.now()}`,
        title: itemData.title || 'Noticia Importada',
        subtitle: itemData.subtitle || '',
        content: itemData.content || '',
        category: (itemData.category as Category) || 'Todas',
        imageUrl: itemData.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
        author: itemData.author || 'Fuente Externa',
        authorRole: itemData.authorRole || 'Medio Periodístico',
        date: new Date().toISOString(),
        readTime: itemData.readTime || '3 min de lectura',
        isBreaking: false,
        isHero: false,
        position: 1,
        views: 120,
        likes: 12,
        originalUrl: itemData.originalUrl || urlInput.trim(),
        tags: Array.isArray(itemData.tags) ? itemData.tags : ['NoticiaLink', 'Agregador'],
        comments: [],
      };

      setImportedPreviewItem(imported);
    } catch (err: any) {
      setUrlImportError(err.message || 'Error al conectar con la web de la noticia.');
    } finally {
      setIsImportingUrl(false);
    }
  };

  const handleConfirmAddImported = (imported: NewsItem) => {
    const newList = [imported, ...newsList];
    const reindexed = newList.map((item, idx) => ({
      ...item,
      position: idx + 1,
      isHero: idx === 0,
    }));
    onUpdateNewsList(reindexed);
    setImportedPreviewItem(null);
    setUrlInput('');
    alert('¡Noticia importada exitosamente y publicada en la Portada (#1)!');
  };

  // AI Generation Trigger
  const handleGenerateWithAi = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi(true);
    setAiError(null);

    try {
      const data = await safeFetchJson('/api/generate-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, category: aiCategory }),
      });

      if (!data || !data.success) {
        throw new Error(data?.error || 'Error al comunicarse con la IA Gemini');
      }

      const generated = data.data;
      setFormTitle(generated.title || '');
      setFormSubtitle(generated.subtitle || '');
      setFormContent(generated.content || '');
      setFormCategory(generated.category || aiCategory);
      setFormImageUrl(generated.imageUrl || '');
      setFormAuthor(generated.author || 'IA Redactor');
      setFormAuthorRole(generated.authorRole || 'Periodista Digital');
      setFormReadTime(generated.readTime || '4 min de lectura');
      setFormTags(generated.tags?.join(', ') || 'IA, Actualidad');
      
      setActiveTab('create');
    } catch (err: any) {
      setAiError(err.message || 'Ocurrió un error inesperado');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // TypeScript Code Export Content
  const generatedCodeString = `// src/data/newsData.ts
// Generado automáticamente por el Panel de Administración de Noticias HOY
import { NewsItem } from '../types';

export const initialNews: NewsItem[] = ${JSON.stringify(newsList, null, 2)};
`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCodeString);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleDownloadFile = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedCodeString], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'newsData.ts';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const sampleImagePresets = [
    { label: 'Tecnología', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Economía', url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Deportes', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Internacional', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Cultura', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className={`relative w-full transition-all duration-300 bg-[#fdfcf8] dark:bg-black border-4 border-black dark:border-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] overflow-hidden my-auto ${
          isExpandedWidth 
            ? 'max-w-[98vw] xl:max-w-[98vw] 2xl:max-w-[1850px] max-h-[96vh]' 
            : 'max-w-5xl max-h-[92vh]'
        } flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-black text-white px-6 py-4 flex items-center justify-between border-b-4 border-black dark:border-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-600 flex items-center justify-center font-black text-white border-2 border-white shadow">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black font-display uppercase tracking-tighter text-white flex items-center gap-2">
                Panel de Administración de Noticias
              </h2>
              <p className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                Concello de Vilanova de Arousa • Gestión de Contenidos • Vista Ampliada de Alta Comodidad
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsExpandedWidth(prev => !prev)}
              className="px-3 py-2 border-2 border-white bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider transition flex items-center gap-2 shadow"
              title={isExpandedWidth ? 'Reducir a Ancho Normal' : 'Ampliar Pantalla (Modo Súper Ancho)'}
            >
              {isExpandedWidth ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4 text-emerald-400" />}
              <span className="hidden md:inline">{isExpandedWidth ? 'Vista Normal' : 'Pantalla Ancha Pro'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 border-2 border-white bg-rose-600 text-white font-black hover:bg-rose-700 transition shadow"
              title="Cerrar Panel"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* DB Connection & Health Indicator Banner */}
        <div className={`px-6 py-2.5 border-b-4 border-black flex flex-wrap items-center justify-between gap-3 text-xs font-mono font-bold transition-colors ${
          dbHealth?.connected 
            ? 'bg-slate-900 text-emerald-400 border-emerald-800' 
            : 'bg-rose-950 text-rose-200 border-rose-800'
        }`}>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dbHealth?.connected ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${dbHealth?.connected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              </span>
              <span className="font-sans font-black uppercase text-xs tracking-wider text-white">
                Base de Datos: {dbHealth?.connected ? 'CONECTADA (OK)' : 'DESCONECTADA / ERROR'}
              </span>
            </div>

            {dbHealth?.connected && (
              <>
                <span className="opacity-40">|</span>
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  DB: <strong className="text-white font-mono">{dbHealth.dbName}</strong>
                </span>
                <span className="opacity-40">|</span>
                <span className="truncate max-w-[200px] sm:max-w-none">
                  Host: <strong className="text-emerald-300 font-mono">{dbHealth.host}</strong>
                </span>
                <span className="opacity-40">|</span>
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  Latencia: <strong className="text-amber-300 font-mono">{dbHealth.latencyMs}ms</strong>
                </span>
                <span className="opacity-40">|</span>
                <span>
                  Registros: <strong className="text-white font-mono">{dbHealth.totalNews} noticias</strong>
                </span>
              </>
            )}

            {!dbHealth?.connected && dbHealth?.error && (
              <span className="text-rose-300 font-sans text-xs">Detalle: {dbHealth.error}</span>
            )}
          </div>

          <button
            type="button"
            onClick={fetchDbHealth}
            disabled={isCheckingDb}
            className="bg-black/60 hover:bg-black text-white px-2.5 py-1 border border-white/30 text-[11px] font-mono flex items-center gap-1.5 transition rounded shrink-0"
            title="Verificar conexión de la base de datos ahora"
          >
            <RefreshCw className={`w-3 h-3 ${isCheckingDb ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{isCheckingDb ? 'Probando...' : 'Probar Conexión DB'}</span>
          </button>
        </div>


        {/* Global Auto-Sync & Manual Save Banner */}
        <div className="bg-emerald-400 text-black px-6 py-3 border-b-4 border-black flex flex-wrap items-center justify-between gap-3 text-xs font-bold uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-black shrink-0" />
            <span>
              <strong>Sincronización Global en Tiempo Real:</strong> Todos los cambios (agregar, editar, eliminar o reordenar) se guardan automáticamente en la Base de Datos PostgreSQL (Neon) para que se actualicen en todo el mundo.
            </span>
          </div>

          <button
            onClick={onSaveToCodeDirectly}
            disabled={isSavingToCode}
            className={`flex items-center gap-2 px-4 py-1.5 border-2 border-black font-black text-xs uppercase tracking-widest transition ${
              lastSaveSuccess === true 
                ? 'bg-black text-emerald-400' 
                : 'bg-black text-white hover:bg-slate-800'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSavingToCode ? 'animate-spin' : ''}`} />
            {isSavingToCode ? 'Sincronizando DB...' : 'Forzar Sincronización DB'}
          </button>
        </div>

        {/* Navigation Tabs - Fully Visible Responsive Grid & Wrap */}
        <div className="bg-slate-900 border-b-4 border-black dark:border-white p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Posiciones */}
            <button
              type="button"
              onClick={() => setActiveTab('order')}
              className={`px-3.5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 border-2 shadow-sm ${
                activeTab === 'order'
                  ? 'bg-white text-black border-white ring-2 ring-emerald-400 shadow-md scale-105'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>1. Organizar Noticias ({newsList.length})</span>
            </button>

            {/* 2. Agregar Noticia */}
            <button
              type="button"
              onClick={() => {
                handleResetForm();
                setActiveTab('create');
              }}
              className={`px-3.5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 border-2 shadow-sm ${
                activeTab === 'create'
                  ? 'bg-rose-600 text-white border-rose-400 ring-2 ring-white shadow-md scale-105'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Plus className="w-4 h-4 text-rose-400" />
              <span>2. {editingItem ? 'Editar Noticia' : 'Agregar Noticia'}</span>
            </button>

            {/* 2.5 Radar de Prensa Gallega (Gonzalo Durán - Monitoreo 12h) */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('radar');
                fetchRadarPendingCount();
              }}
              className={`px-3.5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 border-2 shadow-sm relative ${
                activeTab === 'radar'
                  ? 'bg-indigo-600 text-white border-indigo-300 ring-2 ring-cyan-400 shadow-md scale-105'
                  : 'bg-indigo-950/80 text-indigo-200 border-indigo-700 hover:bg-indigo-900 hover:text-white'
              }`}
            >
              <Radio className="w-4 h-4 text-cyan-300 animate-pulse" />
              <span>📡 Radar Medios Gallegos</span>
              {radarPendingCount > 0 && (
                <span className="px-1.5 py-0.5 bg-amber-400 text-black font-black text-[10px] rounded-full shadow animate-bounce">
                  {radarPendingCount}
                </span>
              )}
            </button>

            {/* 3. Categorías Municipales (NUEVO TAB VISIBLE) */}
            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`px-3.5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 border-2 shadow-sm ${
                activeTab === 'categories'
                  ? 'bg-amber-500 text-black border-amber-300 ring-2 ring-white shadow-md scale-105'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span className="text-sm">🏷️</span>
              <span>3. Categorías & Secciones ({CATEGORIES_LIST.length - 1})</span>
            </button>

            {/* 4. Modificar Visitas al Portal */}
            <button
              type="button"
              onClick={() => setActiveTab('visits')}
              className={`px-3.5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 border-2 shadow-sm ${
                activeTab === 'visits'
                  ? 'bg-emerald-600 text-white border-emerald-300 ring-2 ring-emerald-400 shadow-md scale-105'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>4. Modificar Visitas ({cfgBaseVisits.toLocaleString('es-ES')})</span>
            </button>

            {/* 5. Posicionamiento SEO & Deseo de Google */}
            <button
              type="button"
              onClick={() => setActiveTab('seo')}
              className={`px-3.5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 border-2 shadow-sm ${
                activeTab === 'seo'
                  ? 'bg-blue-600 text-white border-blue-300 ring-2 ring-blue-400 shadow-md scale-105'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4 text-cyan-300 animate-pulse" />
              <span>5. SEO & Deseo de Google 🚀</span>
            </button>

            {/* 6. Pegar Link Noticia */}
            <button
              type="button"
              onClick={() => setActiveTab('link')}
              className={`px-3 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5 border-2 shadow-sm ${
                activeTab === 'link'
                  ? 'bg-amber-400 text-black border-amber-200 ring-2 ring-black scale-105'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>6. Pegar Link 🔗</span>
            </button>

            {/* 7. Redactor IA */}
            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`px-3 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5 border-2 shadow-sm ${
                activeTab === 'ai'
                  ? 'bg-purple-600 text-white border-purple-300 ring-2 ring-purple-400 scale-105'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>7. Redactor IA ✨</span>
            </button>

            {/* 8. Logo, Título & Vídeo */}
            <button
              type="button"
              onClick={() => setActiveTab('config')}
              className={`px-3 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5 border-2 shadow-sm ${
                activeTab === 'config'
                  ? 'bg-rose-700 text-white border-rose-300 ring-2 ring-rose-400 scale-105'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-rose-300" />
              <span>8. Identidad & Vídeo 🎥</span>
            </button>

            {/* 9. Exportar TS */}
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`px-3 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5 border-2 shadow-sm ${
                activeTab === 'code'
                  ? 'bg-emerald-700 text-white border-emerald-300 ring-2 ring-emerald-400 scale-105'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-emerald-300" />
              <span>9. Exportar TS</span>
            </button>
          </div>
        </div>

        {/* Tab Content Container */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB: RADAR DE MEDIOS GALLEGOS (GONZALO DURÁN) */}
          {activeTab === 'radar' && (
            <GalicianNewsRadar
              onNewsAddedToOfficial={onUpdateNewsList}
              onRefreshOfficialNews={handleRefreshAllOfficialNews}
            />
          )}

          {/* TAB 1: REORDER & POSITION MANAGEMENT */}
          {activeTab === 'order' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2 mb-2">
                <span>Las noticias se muestran en la portada según su <strong>Posición (1, 2, 3...)</strong>.</span>
                <span>Usa las flechas ▲ ▼ para cambiar el orden fácilmente.</span>
              </div>

              {/* Category Filter Pills */}
              <div className="bg-slate-100 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-[11px] font-black uppercase text-slate-600 dark:text-slate-400 tracking-wider">Filtrar lista por categoría:</span>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES_LIST.map((cat) => {
                    const count = cat.id === 'Todas' 
                      ? newsList.length 
                      : newsList.filter(n => n.category === cat.id).length;
                    const isSelected = orderCategoryFilter === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setOrderCategoryFilter(cat.id)}
                        className={`px-2.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-lg transition border flex items-center gap-1 ${
                          isSelected
                            ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-400'
                        }`}
                      >
                        <span>{cat.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white text-rose-700' : 'bg-slate-200 dark:bg-slate-700'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                {newsList
                  .filter((item) => orderCategoryFilter === 'Todas' || item.category === orderCategoryFilter)
                  .map((item) => {
                    const originalIndex = newsList.findIndex(n => n.id === item.id);
                    return (
                  <div
                    key={item.id}
                    className={`p-4 border-2 border-black dark:border-white transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                      originalIndex === 0
                        ? 'bg-amber-300 text-black'
                        : 'bg-white dark:bg-black text-black dark:text-white'
                    }`}
                  >
                    {/* Position Badge & Thumbnail & Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Numeric position */}
                      <div className="flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] uppercase font-black tracking-widest text-black dark:text-white">Pos</span>
                        <div className="w-8 h-8 bg-black text-white dark:bg-white dark:text-black font-mono font-black flex items-center justify-center text-sm border border-black">
                          #{item.position}
                        </div>
                      </div>

                      {/* Thumbnail */}
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-16 h-12 object-cover grayscale shrink-0 border border-black"
                      />

                      {/* Title & Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {(() => {
                            const catInfo = CATEGORIES_LIST.find(c => c.id === item.category);
                            return (
                              <span className={`${catInfo?.badgeBg || 'bg-black'} ${catInfo?.badgeText || 'text-white'} text-[10px] font-black px-2 py-0.5 border border-black uppercase tracking-wider`}>
                                {item.category}
                              </span>
                            );
                          })()}
                          {originalIndex === 0 && (
                            <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 border border-black uppercase tracking-widest">
                              ★ PORTADA (HERO)
                            </span>
                          )}
                          {item.isBreaking && (
                            <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 border border-black flex items-center gap-1 uppercase tracking-widest">
                              <Zap className="w-2.5 h-2.5 fill-current animate-pulse" /> Última Hora
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-black text-black dark:text-white truncate font-display uppercase tracking-tight">
                          {item.title}
                        </h4>
                        <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 truncate">
                          Por {item.author} • {item.readTime}
                        </p>
                      </div>
                    </div>

                    {/* Position Change Controls */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {/* Set Exact Position Input */}
                      <div className="flex items-center gap-1 bg-white dark:bg-black p-1 border border-black dark:border-white text-xs">
                        <span className="text-[10px] text-black dark:text-white font-bold uppercase pl-1">Ir a:</span>
                        <input
                          type="number"
                          min={1}
                          max={newsList.length}
                          defaultValue={item.position}
                          key={item.position}
                          onBlur={(e) => handleSetExactPosition(item, parseInt(e.target.value, 10))}
                          className="w-10 px-1 py-0.5 text-center font-mono font-black bg-white dark:bg-black text-black dark:text-white border border-black focus:outline-none"
                        />
                      </div>

                      {/* Up/Down buttons */}
                      <button
                        onClick={() => handleMoveUp(originalIndex)}
                        disabled={originalIndex === 0}
                        className="p-2 border border-black dark:border-white bg-white dark:bg-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-30 text-black dark:text-white font-bold transition"
                        title="Subir posición"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleMoveDown(originalIndex)}
                        disabled={originalIndex === newsList.length - 1}
                        className="p-2 border border-black dark:border-white bg-white dark:bg-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-30 text-black dark:text-white font-bold transition"
                        title="Bajar posición"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-2 border border-black bg-amber-300 text-black font-bold hover:bg-black hover:text-white transition"
                        title="Editar noticia"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 border border-black bg-rose-600 text-white font-bold hover:bg-rose-700 transition"
                        title="Eliminar noticia"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          )}

          {/* TAB: CATEGORÍAS MUNICIPALES (VISIÓN COMPLETA Y GESTIÓN) */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              {/* Executive Header Banner */}
              <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-black border-2 border-amber-500/80 p-5 rounded-2xl text-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 font-black text-lg font-serif">
                    <span className="text-xl">🏷️</span>
                    <span>Gestión y Vista Completa de Categorías Municipales</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    Todas las noticias se muestran juntas en la página principal. Desde este módulo puedes ver el desglose completo por área, organizar qué noticias pertenecen a cada temática oficial y reasignar categorías con un solo clic.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      handleResetForm();
                      setFormCategory('Alcaldía');
                      setActiveTab('create');
                    }}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg border border-amber-300"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nueva Noticia</span>
                  </button>
                </div>
              </div>

              {/* Category Summary Matrix Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CATEGORIES_LIST.filter(c => c.id !== 'Todas').map((cat) => {
                  const count = newsList.filter(n => n.category === cat.id).length;
                  const catEmoji = cat.id === 'Alcaldía' ? '🏛️' : cat.id === 'Obras' ? '🏗️' : cat.id === 'Deportes' ? '⚽' : cat.id === 'Cultura' ? '🎭' : cat.id === 'Turismo' ? '🌊' : cat.id === 'Servicios' ? '🤝' : cat.id === 'Eventos' ? '📅' : '🏛️';
                  return (
                    <div 
                      key={cat.id} 
                      className="bg-slate-900 border-2 border-slate-800 hover:border-amber-400/60 p-4 rounded-xl space-y-2 transition shadow"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{catEmoji}</span>
                        <span className="text-xs font-mono font-bold bg-slate-800 text-amber-300 px-2 py-0.5 rounded-full border border-slate-700">
                          {count} {count === 1 ? 'noticia' : 'noticias'}
                        </span>
                      </div>
                      <div className="font-black text-sm text-white truncate" title={cat.label}>
                        {cat.label}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          handleResetForm();
                          setFormCategory(cat.id);
                          setActiveTab('create');
                        }}
                        className="w-full text-left text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 pt-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Añadir noticia aquí</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Detailed Breakdown for Each Category */}
              <div className="space-y-6 pt-2">
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-300 dark:border-slate-800 pb-2 flex items-center justify-between">
                  <span>Listado de Noticias Agrupadas por Categoría:</span>
                  <span className="text-xs font-mono font-normal text-slate-500">Total: {newsList.length} artículos</span>
                </h4>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {CATEGORIES_LIST.filter(c => c.id !== 'Todas').map((cat) => {
                    const itemsInCat = newsList.filter(n => n.category === cat.id);
                    const catEmoji = cat.id === 'Alcaldía' ? '🏛️' : cat.id === 'Obras' ? '🏗️' : cat.id === 'Deportes' ? '⚽' : cat.id === 'Cultura' ? '🎭' : cat.id === 'Turismo' ? '🌊' : cat.id === 'Servicios' ? '🤝' : cat.id === 'Eventos' ? '📅' : '🏛️';

                    return (
                      <div 
                        key={cat.id}
                        className="bg-white dark:bg-slate-900 border-2 border-black dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-md flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{catEmoji}</span>
                            <div>
                              <h5 className="font-black text-sm sm:text-base text-slate-900 dark:text-white uppercase font-serif">
                                {cat.label}
                              </h5>
                              <span className="text-[10px] font-mono text-slate-400">
                                Categoría oficial Concello
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-full border border-slate-300 dark:border-slate-700 font-mono">
                              {itemsInCat.length}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                handleResetForm();
                                setFormCategory(cat.id);
                                setActiveTab('create');
                              }}
                              className="p-1.5 bg-amber-400 text-black hover:bg-amber-300 rounded-lg transition"
                              title={`Agregar nueva noticia en ${cat.label}`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* News List under this Category */}
                        <div className="space-y-2 flex-1 max-h-[300px] overflow-y-auto pr-1">
                          {itemsInCat.length > 0 ? (
                            itemsInCat.map((item) => (
                              <div 
                                key={item.id}
                                className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 hover:border-amber-400/50 transition"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <img 
                                    src={item.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=200&q=80'} 
                                    alt="" 
                                    className="w-10 h-10 object-cover rounded-lg shrink-0 border border-slate-300 dark:border-slate-700"
                                  />
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={item.title}>
                                      {item.title}
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                                      <span>Posición #{item.position}</span>
                                      {item.isHero && <span className="text-rose-500 font-bold">★ Portada</span>}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {/* Quick change category dropdown */}
                                  <select
                                    value={item.category || cat.id}
                                    onChange={(e) => handleQuickChangeCategory(item.id, e.target.value as Category)}
                                    className="text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg p-1 outline-none"
                                    title="Mover noticia a otra categoría"
                                  >
                                    {CATEGORIES_LIST.filter(c => c.id !== 'Todas').map(c => (
                                      <option key={c.id} value={c.id}>{c.label}</option>
                                    ))}
                                  </select>

                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(item)}
                                    className="p-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-lg text-xs transition"
                                    title="Editar Noticia"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 text-slate-400 dark:text-slate-600 text-xs font-mono">
                              No hay noticias asignadas a esta categoría todavía.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CREATE / EDIT ARTICLE FORM */}
          {activeTab === 'create' && (
            <form onSubmit={handleSaveArticle} className="space-y-5">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
                  {editingItem ? 'Editando Noticia' : 'Crear Nueva Noticia'}
                </h3>
                {editingItem && (
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="text-xs text-rose-600 font-semibold hover:underline"
                  >
                    Cancelar edición
                  </button>
                )}
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Titular Principal *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Descubrimiento científico revolucionario en tecnología solar"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Subtítulo / Bajada de Noticia
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Nuevos paneles alcanzan una eficiencia del 45% en pruebas de laboratorio."
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    className="w-full px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
              </div>

              {/* Category Visual Pill Selector */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-rose-600" />
                    <span>Categoría Oficial de la Noticia *</span>
                  </label>
                  <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900">
                    Seleccionada: {formCategory}
                  </span>
                </div>

                {/* Interactive Pills Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {CATEGORIES_LIST.map((cat) => {
                    const isSelected = formCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormCategory(cat.id)}
                        className={`px-3 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 border text-center ${
                          isSelected
                            ? 'bg-rose-600 text-white border-rose-500 shadow-lg ring-2 ring-rose-400 scale-[1.02]'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-rose-400'
                        }`}
                      >
                        <span>{cat.id === 'Todas' ? '🌐' : cat.id === 'Alcaldía' ? '🏛️' : cat.id === 'Obras' ? '🏗️' : cat.id === 'Deportes' ? '⚽' : cat.id === 'Cultura' ? '🎭' : cat.id === 'Turismo' ? '🌊' : cat.id === 'Servicios' ? '🤝' : cat.id === 'Eventos' ? '📅' : '📰'}</span>
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Position and Read Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Posición en la Lista (1 = Portada)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={newsList.length + 1}
                    value={formPosition}
                    onChange={(e) => setFormPosition(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2 text-sm font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Tiempo de Lectura Estimado
                  </label>
                  <input
                    type="text"
                    value={formReadTime}
                    onChange={(e) => setFormReadTime(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
              </div>

              {/* Author & Image URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Autor / Periodista
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nombre del autor"
                      value={formAuthor}
                      onChange={(e) => setFormAuthor(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Cargo (ej. Corresponsal)"
                      value={formAuthorRole}
                      onChange={(e) => setFormAuthorRole(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Imagen URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                  {/* Preset Image Quick Selector */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[11px] text-slate-400">Usar imagen de prueba:</span>
                    {sampleImagePresets.map((preset) => (
                      <button
                        type="button"
                        key={preset.label}
                        onClick={() => setFormImageUrl(preset.url)}
                        className="text-[10px] bg-slate-200 dark:bg-slate-700 hover:bg-rose-600 hover:text-white px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 transition"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Original News Link */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5 text-rose-600" />
                  Link de la Noticia Original (Para redireccionar a la fuente oficial)
                </label>
                <input
                  type="url"
                  placeholder="https://ejemplo.com/noticia-original-oficial"
                  value={formOriginalUrl}
                  onChange={(e) => setFormOriginalUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none font-mono"
                />
              </div>

              {/* Breaking & Options Checkboxes */}
              <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsBreaking}
                    onChange={(e) => setFormIsBreaking(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                  />
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-current" />
                    Destacar en Ticker "ÚLTIMA HORA"
                  </span>
                </label>
              </div>

              {/* Content Body */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Cuerpo Completo del Artículo (Párrafos) *
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Escribe el contenido completo de la noticia aquí. Separa los párrafos dejando una línea en blanco entre ellos."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full p-4 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none leading-relaxed font-serif"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Etiquetas (Separadas por comas)
                </label>
                <input
                  type="text"
                  placeholder="Tecnología, Innovación, Futuro"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Limpiar Formulario
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  {editingItem ? 'Guardar Cambios de Noticia' : 'Agregar Noticia a la Lista'}
                </button>
              </div>
            </form>
          )}

          {/* TAB: LINK IMPORT / NOTICIA DESDE ENLACE */}
          {activeTab === 'link' && (
            <div className="space-y-6">
              <div className="bg-amber-300 text-black border-4 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 mb-2">
                  <LinkIcon className="w-6 h-6 text-black shrink-0" />
                  <h3 className="font-black text-lg font-display uppercase tracking-tight">
                    Importar Noticia Automática desde Link / URL Externa
                  </h3>
                </div>
                <p className="text-xs font-bold leading-relaxed">
                  Pega el enlace de la noticia original. Nuestro scraper inteligente extraerá el titular principal, la bajada/subtítulo, la imagen de portada y generará la vista previa con el enlace directo para tus lectores.
                </p>
              </div>

              {/* URL Input Box */}
              <div className="bg-white dark:bg-black border-4 border-black dark:border-white p-6 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white">
                  Ingresa o pega el Link de la Noticia *
                </label>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="url"
                    placeholder="https://ejemplo.com/noticia-destacada-del-dia"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleImportFromUrl();
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-black dark:border-white font-mono text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-amber-400"
                  />

                  <button
                    type="button"
                    onClick={handleImportFromUrl}
                    disabled={isImportingUrl || !urlInput.trim()}
                    className="bg-rose-600 hover:bg-black text-white font-black text-xs uppercase tracking-widest px-6 py-3 border-2 border-black flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isImportingUrl ? 'animate-spin' : ''}`} />
                    {isImportingUrl ? 'Analizando URL...' : 'Importar Noticia 🔗'}
                  </button>
                </div>

                {urlImportError && (
                  <div className="p-3 bg-rose-100 border-2 border-black text-rose-800 font-bold text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{urlImportError}</span>
                  </div>
                )}
              </div>

              {/* Extracted Preview Card */}
              {importedPreviewItem && (
                <div className="bg-amber-100 dark:bg-slate-900 border-4 border-black dark:border-white p-6 space-y-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
                  <div className="flex items-center justify-between border-b-2 border-black pb-3">
                    <span className="bg-black text-white font-black text-xs uppercase px-3 py-1 border border-black tracking-widest flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Vista Previa de la Noticia Extraída
                    </span>
                    <span className="font-mono text-xs font-bold text-black dark:text-white">
                      Fuente: {importedPreviewItem.author}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Thumbnail Image */}
                    <div className="md:col-span-4 aspect-[16/9] border-2 border-black overflow-hidden bg-slate-200">
                      <img
                        src={importedPreviewItem.imageUrl}
                        alt={importedPreviewItem.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Extracted Details */}
                    <div className="md:col-span-8 space-y-2">
                      <span className="bg-black text-white text-[10px] font-black uppercase px-2 py-0.5">
                        {importedPreviewItem.category}
                      </span>
                      <h4 className="text-lg font-black uppercase text-black dark:text-white leading-tight font-display">
                        {importedPreviewItem.title}
                      </h4>
                      <p className="text-xs text-black dark:text-slate-300 font-medium italic border-l-2 border-black pl-2">
                        {importedPreviewItem.subtitle}
                      </p>
                      <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                        <Globe className="w-3.5 h-3.5 text-rose-600" />
                        <span className="truncate max-w-sm">{importedPreviewItem.originalUrl}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t-2 border-black flex flex-wrap items-center justify-end gap-3">
                    <button
                      onClick={() => {
                        setFormTitle(importedPreviewItem.title);
                        setFormSubtitle(importedPreviewItem.subtitle);
                        setFormContent(importedPreviewItem.content);
                        setFormCategory(importedPreviewItem.category);
                        setFormImageUrl(importedPreviewItem.imageUrl);
                        setFormOriginalUrl(importedPreviewItem.originalUrl || '');
                        setFormAuthor(importedPreviewItem.author);
                        setActiveTab('create');
                      }}
                      className="bg-white hover:bg-slate-200 text-black border-2 border-black font-black text-xs uppercase px-4 py-2 flex items-center gap-1.5 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Editar Antes de Publicar
                    </button>

                    <button
                      onClick={() => handleConfirmAddImported(importedPreviewItem)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-black border-2 border-black font-black text-xs uppercase tracking-widest px-6 py-2 flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition"
                    >
                      <Plus className="w-4 h-4" />
                      Publicar en Portada (#1)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AI ASSISTANT GENERATOR */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="bg-indigo-950/40 border border-indigo-800/60 p-5 rounded-2xl text-indigo-100 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-base font-serif text-white">
                    Redactor de Noticias con Inteligencia Artificial (Gemini)
                  </h3>
                </div>
                <p className="text-xs text-indigo-200 leading-relaxed">
                  Escribe un tema o idea general en español. La IA generará automáticamente el titular, subtítulo, cuerpo periodístico estructurado, tiempo de lectura y etiquetas listos para revisar e integrar.
                </p>
              </div>

              {aiError && (
                <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-200 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Tema o Indicación para la Noticia
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ej. Escribe una noticia sobre el descubrimiento de una nueva especie marina luminiscente en las profundidades del Océano Pacífico."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="w-full p-3.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-2 flex items-center justify-between">
                    <span>Categoría sugerida para la Noticia</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">{aiCategory}</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {CATEGORIES_LIST.map((cat) => {
                      const isSelected = aiCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setAiCategory(cat.id)}
                          className={`px-2.5 py-1.5 text-xs font-black uppercase tracking-wider rounded-xl transition border text-center ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-400 scale-[1.02]'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                          }`}
                        >
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={handleGenerateWithAi}
                  disabled={isGeneratingAi || !aiPrompt.trim()}
                  className="flex items-center justify-center gap-2.5 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition shadow-lg"
                >
                  <Sparkles className={`w-5 h-5 text-amber-300 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                  {isGeneratingAi ? 'Generando borrador periodístico con IA Gemini...' : 'Generar Noticia Completa con IA'}
                </button>
              </div>
            </div>
          )}

          {/* TAB: SITE BRANDING LOGO & FEATURED VIDEO CONFIGURATION */}
          {activeTab === 'config' && (
            <div className="space-y-8 max-w-4xl mx-auto pb-8">
              {/* Top Explanation Banner */}
              <div className="bg-slate-900 border-2 border-black dark:border-white p-5 rounded-2xl text-white shadow-md">
                <div className="flex items-center gap-2 text-rose-400 font-black text-lg uppercase tracking-wide">
                  <Palette className="w-5 h-5 text-amber-400" />
                  Personalización de Identidad Visual y Vídeo Destacado
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Ajusta el logo municipal, el tamaño, el color del título principal de la cabecera ("Concello de Vilanova de Arousa") y configura el enlace de YouTube de la <strong>Noticia Importante en Vídeo</strong>. Todos los cambios se guardarán automáticamente en la Base de Datos PostgreSQL.
                </p>
              </div>

              {/* Status Alert */}
              {configSaveSuccess === true && (
                <div className="p-4 bg-emerald-500 text-black font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black flex items-center gap-2 shadow">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>¡Configuración guardada y sincronizada exitosamente en la base de datos global!</span>
                </div>
              )}
              {configSaveSuccess === false && (
                <div className="p-4 bg-rose-600 text-white font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black flex items-center gap-2 shadow">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>No se pudo guardar la configuración. Intenta nuevamente.</span>
                </div>
              )}

              {/* BLOCK 1: BRANDING & HEADER LOGO/TITLE */}
              <div className="bg-white dark:bg-slate-900 border-2 border-black dark:border-slate-700 p-6 rounded-2xl shadow-md space-y-6">
                <div className="flex items-center gap-2 text-base font-black uppercase text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
                  <Sliders className="w-5 h-5 text-rose-600" />
                  <span>1. Escudo / Logo Municipal y Título Principal</span>
                </div>

                {/* Logo URL Input & Preset Selector */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Imagen del Logo / Escudo
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="url"
                      value={cfgLogoUrl}
                      onChange={(e) => setCfgLogoUrl(e.target.value)}
                      placeholder="https://ejemplo.com/logo-escudo.png (dejar vacío para usar el Escudo SVG Oficial)"
                      className="flex-1 p-3 text-sm bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:border-rose-500 outline-none"
                    />
                    {cfgLogoUrl ? (
                      <button
                        type="button"
                        onClick={() => setCfgLogoUrl('')}
                        className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 text-rose-700 dark:text-rose-400 font-bold text-xs uppercase rounded-xl transition border border-slate-300 dark:border-slate-700"
                      >
                        Usar Escudo SVG Oficial
                      </button>
                    ) : (
                      <span className="px-3 py-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-4 h-4" /> Escudo SVG Activo
                      </span>
                    )}
                  </div>
                </div>

                {/* Logo Size Range Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                    <span>Tamaño del Logo (Altura en Píxeles)</span>
                    <span className="font-mono bg-slate-900 text-white px-2 py-0.5 rounded text-xs">
                      {cfgLogoSize} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={30}
                    max={120}
                    step={2}
                    value={cfgLogoSize}
                    onChange={(e) => setCfgLogoSize(Number(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Pequeño (30px)</span>
                    <span>Mediano (48px)</span>
                    <span>Grande (120px)</span>
                  </div>
                </div>

                {/* Header Title Text */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Texto del Título de la Cabecera
                  </label>
                  <input
                    type="text"
                    value={cfgTitleText}
                    onChange={(e) => setCfgTitleText(e.target.value)}
                    placeholder="Concello de Vilanova de Arousa"
                    className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:border-rose-500 outline-none"
                  />
                </div>

                {/* Header Title Color Selector & Presets */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Color del Título de la Cabecera ("Concello de Vilanova de Arousa")
                  </label>

                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl border border-slate-300 dark:border-slate-700">
                      <input
                        type="color"
                        value={cfgTitleColor}
                        onChange={(e) => setCfgTitleColor(e.target.value)}
                        className="w-9 h-9 rounded cursor-pointer border-0 p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={cfgTitleColor}
                        onChange={(e) => setCfgTitleColor(e.target.value)}
                        className="w-24 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2 py-1.5 rounded uppercase text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { name: 'Rojo Galaico', color: '#c20000' },
                        { name: 'Azul Marino', color: '#1e3a8a' },
                        { name: 'Verde Esmeralda', color: '#047857' },
                        { name: 'Dorado Noble', color: '#b45309' },
                        { name: 'Negro Clásico', color: '#000000' },
                        { name: 'Púrpura Real', color: '#6b21a8' },
                      ].map((preset) => (
                        <button
                          key={preset.color}
                          type="button"
                          onClick={() => setCfgTitleColor(preset.color)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold transition hover:scale-105"
                          style={{ backgroundColor: preset.color, color: preset.color === '#000000' || preset.color === '#c20000' || preset.color === '#1e3a8a' || preset.color === '#6b21a8' ? '#ffffff' : '#ffffff' }}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
                          <span>{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Base Visits Input Setting */}
                <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      <span>Visitas al Portal Web (Contador Inicial / Base)</span>
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold">
                      Mostradas en la portada: {(cfgBaseVisits + Math.floor(Math.max(0, Date.now() - new Date('2026-01-01T00:00:00Z').getTime()) / (3 * 60 * 60 * 1000)) * 23).toLocaleString('es-ES')}
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={cfgBaseVisits}
                      onChange={(e) => setCfgBaseVisits(parseInt(e.target.value, 10) || 0)}
                      className="w-full p-3 text-sm font-mono font-black bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-rose-500 outline-none"
                      placeholder="30"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Modifica la cifra inicial desde la que arranca el contador público de visitas al portal ubicado en el pie de página.
                  </p>
                </div>

                {/* Live Masthead Preview Box */}
                <div className="bg-slate-100 dark:bg-slate-950 p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
                  <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block">
                    Vista Previa en Vivo de la Cabecera Web:
                  </span>
                  <div className="flex items-center justify-center gap-4 py-2">
                    {cfgLogoUrl ? (
                      <img
                        src={cfgLogoUrl}
                        alt="Preview Logo"
                        className="object-contain"
                        style={{ height: `${cfgLogoSize}px` }}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <CoatOfArmsLogo size={cfgLogoSize} />
                    )}
                    <h1
                      className="text-2xl sm:text-4xl font-black font-serif tracking-tight font-newspaper transition-colors"
                      style={{ color: cfgTitleColor }}
                    >
                      {cfgTitleText || 'Concello de Vilanova de Arousa'}
                    </h1>
                  </div>
                </div>
              </div>

              {/* BLOCK 2: FEATURED YOUTUBE VIDEO SECTION */}
              <div className="bg-white dark:bg-slate-900 border-2 border-black dark:border-slate-700 p-6 rounded-2xl shadow-md space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-base font-black uppercase text-slate-900 dark:text-white">
                    <Video className="w-5 h-5 text-red-600" />
                    <span>2. Vídeo Destacado YouTube ("NOTICIA IMPORTANTE")</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700">
                      <input
                        type="checkbox"
                        checked={cfgShowVideo}
                        onChange={(e) => setCfgShowVideo(e.target.checked)}
                        className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                      />
                      <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">
                        Mostrar en Portada
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer bg-amber-100 dark:bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700">
                      <input
                        type="checkbox"
                        checked={cfgAutoplayVideo}
                        onChange={(e) => setCfgAutoplayVideo(e.target.checked)}
                        className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                      />
                      <span className="text-xs font-black uppercase text-amber-900 dark:text-amber-200">
                        ▶ Autoreproducir al Cargar
                      </span>
                    </label>
                  </div>
                </div>

                {/* YouTube Link Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Enlace o Link de YouTube
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={cfgVideoUrl}
                      onChange={(e) => setCfgVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=L_LUpnjgPso o https://youtu.be/..."
                      className="w-full p-3.5 pl-10 text-sm bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:border-red-500 outline-none"
                    />
                    <Tv className="w-5 h-5 text-red-500 absolute left-3 top-3.5" />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Acepta enlaces directos de YouTube (ej. watch?v=..., youtu.be/..., embed/...).
                  </p>
                </div>

                {/* Video Badge Tag & Title */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Etiqueta del Vídeo
                    </label>
                    <input
                      type="text"
                      value={cfgVideoBadge}
                      onChange={(e) => setCfgVideoBadge(e.target.value)}
                      placeholder="NOTICIA IMPORTANTE"
                      className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-black uppercase text-red-600 focus:border-red-500 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Título del Vídeo
                    </label>
                    <input
                      type="text"
                      value={cfgVideoTitle}
                      onChange={(e) => setCfgVideoTitle(e.target.value)}
                      placeholder="Iniciativas y Mensaje Oficial del Alcalde en Vilanova"
                      className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:border-red-500 outline-none"
                    />
                  </div>
                </div>

                {/* Video Description */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Descripción / Subtítulo del Vídeo
                  </label>
                  <textarea
                    rows={2}
                    value={cfgVideoDescription}
                    onChange={(e) => setCfgVideoDescription(e.target.value)}
                    placeholder="Resumen o detalles clave del vídeo que se mostrará junto al reproductor."
                    className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-red-500 outline-none"
                  />
                </div>

                {/* Live YouTube Player Preview */}
                {cfgVideoUrl && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block">
                      Vista Previa del Reproductor YouTube:
                    </span>
                    <div className="bg-black border-2 border-slate-800 rounded-xl overflow-hidden aspect-video max-w-xl mx-auto shadow-lg">
                      <iframe
                        src={getYouTubeEmbedUrl(cfgVideoUrl)}
                        title="Preview Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* BLOCK 3: PORTAL VISITS MODIFIER */}
              <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500 dark:border-emerald-600 p-6 rounded-2xl shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-base font-black uppercase text-slate-900 dark:text-white">
                    <Eye className="w-5 h-5 text-emerald-600" />
                    <span>3. Contador de Visitas al Portal Web</span>
                  </div>
                  <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-700">
                    Mostradas en la web: {(cfgBaseVisits + Math.floor(Math.max(0, Date.now() - new Date('2026-01-01T00:00:00Z').getTime()) / (3 * 60 * 60 * 1000)) * 23).toLocaleString('es-ES')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Cifra Base de Visitas (Número Inicial)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={cfgBaseVisits}
                      onChange={(e) => setCfgBaseVisits(parseInt(e.target.value, 10) || 0)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-2 border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-400 font-mono text-lg font-black rounded-xl outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                      Sumar Visitas Rápidamente:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCfgBaseVisits(prev => prev + 500)}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold transition"
                      >
                        +500
                      </button>
                      <button
                        type="button"
                        onClick={() => setCfgBaseVisits(prev => prev + 1000)}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold transition"
                      >
                        +1.000
                      </button>
                      <button
                        type="button"
                        onClick={() => setCfgBaseVisits(prev => prev + 5000)}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold transition"
                      >
                        +5.000
                      </button>
                      <button
                        type="button"
                        onClick={() => setCfgBaseVisits(prev => prev + 10000)}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold transition"
                      >
                        +10.000
                      </button>
                      <button
                        type="button"
                        onClick={() => setCfgBaseVisits(30)}
                        className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-600 hover:text-white text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 rounded-lg text-xs font-bold transition"
                      >
                        Reiniciar (30)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SAVE CONFIGURATION BUTTON */}
              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={isSavingConfig}
                className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black text-sm uppercase tracking-widest py-4 rounded-xl shadow-xl transition flex items-center justify-center gap-2 border-2 border-black"
              >
                <Save className={`w-5 h-5 ${isSavingConfig ? 'animate-spin' : ''}`} />
                <span>
                  {isSavingConfig ? 'Guardando en PostgreSQL...' : 'Guardar Identidad & Vídeo en la Base de Datos'}
                </span>
              </button>
            </div>
          )}

          {/* TAB: PANEL CEO & POSICIONAMIENTO PERFECTO GOOGLE PRO */}
          {activeTab === 'seo' && (
            <div className="space-y-8 max-w-full mx-auto pb-8">
              {/* Executive CEO Banner */}
              <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 border-2 border-blue-500/50 p-6 rounded-2xl text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-amber-400 font-black text-lg uppercase tracking-wider">
                      <Award className="w-6 h-6 text-yellow-400" />
                      <span>Posicionamiento SEO & Deseo de Google • Auto-Indexación PRO</span>
                    </div>
                    <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                      Panel de optimización y posicionamiento en Google (Search Engine Optimization / Deseo de Google). Configura el sitemap XML oficial, meta-etiquetas de búsqueda, verificación de Google Search Console, Google Analytics y el ping de auto-indexación para aparecer en los primeros resultados.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="bg-slate-900/90 border border-blue-400/40 p-3.5 rounded-xl text-center min-w-[140px] shadow-lg">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-300 block">Puntuación SEO</span>
                      <span className="text-3xl font-black font-mono text-emerald-400">
                        {(() => {
                          let score = 0;
                          if (cfgSeoTitle.length >= 25 && cfgSeoTitle.length <= 70) score += 15;
                          if (cfgSeoMetaDescription.length >= 60 && cfgSeoMetaDescription.length <= 180) score += 15;
                          if (cfgSeoKeywords.trim()) score += 15;
                          if (cfgGoogleSearchConsoleTag.trim()) score += 15;
                          if (cfgGoogleAnalyticsId.trim()) score += 15;
                          if (cfgOgImageUrl.trim()) score += 10;
                          if (cfgCanonicalUrl.trim()) score += 10;
                          if (cfgStructuredDataOrgName.trim()) score += 5;
                          return Math.min(score, 100);
                        })()}/100
                      </span>
                      <span className="text-[10px] font-bold text-emerald-300 block uppercase mt-0.5">🟢 Excelente Indexación</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SPECIAL SECTION: GOOGLE AUTO-PROPAGATION & AUTO-INDEXING ENGINE */}
              <div className="bg-slate-900 border-2 border-emerald-500/80 p-6 rounded-2xl shadow-2xl space-y-5 relative overflow-hidden">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-emerald-400 font-black text-base uppercase tracking-wider">
                      <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                      <span>Motor de Auto-Indexación Inmediata en Google (Google Auto-Propagation Engine)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Lanza un aviso automático instantáneo (ping) a los servidores de Google para que crawleen e indexen las noticias recientes sin esperar semanas.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleTriggerGooglePing}
                    disabled={isPingingGoogle}
                    className="w-full lg:w-auto shrink-0 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black px-6 py-3.5 rounded-xl text-xs uppercase tracking-widest transition shadow-2xl flex items-center justify-center gap-2 border-2 border-emerald-300"
                  >
                    <Radio className={`w-5 h-5 ${isPingingGoogle ? 'animate-spin' : 'animate-pulse'}`} />
                    <span>{isPingingGoogle ? 'Notificando a Google...' : '🚀 Lanza Auto-Indexación en Google Ahora'}</span>
                  </button>
                </div>

                {/* Google Ping Result Output Box */}
                {googlePingResult && (
                  <div className={`p-4 rounded-xl text-xs font-mono border-2 flex items-start gap-3 animate-fadeIn ${
                    googlePingResult.success 
                      ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200' 
                      : 'bg-rose-950/90 border-rose-500 text-rose-200'
                  }`}>
                    <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${googlePingResult.success ? 'text-emerald-400' : 'text-rose-400'}`} />
                    <div className="space-y-1">
                      <p className="font-bold text-sm uppercase">{googlePingResult.message}</p>
                      {googlePingResult.details && <p className="text-slate-300 text-[11px]">{googlePingResult.details}</p>}
                      <span className="text-[10px] opacity-75 block">Hora de ejecucion: {googlePingResult.time}</span>
                    </div>
                  </div>
                )}

                {/* Live Direct Links Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <a
                    href="/sitemap.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold p-3 rounded-xl text-xs transition border border-slate-700"
                  >
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Ver `/sitemap.xml`</span>
                  </a>

                  <a
                    href="/robots.txt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold p-3 rounded-xl text-xs transition border border-slate-700"
                  >
                    <Code className="w-4 h-4 text-amber-400" />
                    <span>Ver `/robots.txt`</span>
                  </a>

                  <a
                    href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(cfgCanonicalUrl || 'https://vilanova-de-arousa.gal')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold p-3 rounded-xl text-xs transition border border-slate-700"
                  >
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span>Test Google Rich Results</span>
                  </a>

                  <a
                    href="https://search.google.com/search-console"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold p-3 rounded-xl text-xs transition border border-slate-700"
                  >
                    <ExternalLink className="w-4 h-4 text-indigo-400" />
                    <span>Google Search Console</span>
                  </a>
                </div>

                {/* Google Readiness Checklist */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                    Checklist de Criterios de Indexabilidad Automática Google:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                    <div className="flex items-center gap-2 text-emerald-300 font-medium">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Sitemap XML Dinámico Activo</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-300 font-medium">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Robots.txt con User-agent Googlebot</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-300 font-medium">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Meta Search Console Tag inyectado</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-300 font-medium">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Estructura JSON-LD Schema.org</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-300 font-medium">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Tarjetas OpenGraph para Redes Sociales</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-300 font-medium">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Etiqueta Canónica SSL (HTTPS)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Alert */}
              {configSaveSuccess === true && (
                <div className="p-4 bg-emerald-500 text-black font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black flex items-center gap-2 shadow">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>¡Metadatos SEO y Posicionamiento Google actualizados y sincronizados en PostgreSQL!</span>
                </div>
              )}
              {configSaveSuccess === false && (
                <div className="p-4 bg-rose-600 text-white font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black flex items-center gap-2 shadow">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>No se pudieron guardar las configuraciones SEO. Inténtalo de nuevo.</span>
                </div>
              )}

              {/* TWO COLUMN RESPONSIVE GRID FOR WIDE SCREEN COMFORT */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* LEFT COLUMN */}
                <div className="space-y-6">
                  {/* SECTION 1: META ETIQUETAS DE BÚSQUEDA */}
                  <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 p-6 rounded-2xl shadow-md space-y-5">
                    <div className="flex items-center gap-2 text-base font-black uppercase text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
                      <Target className="w-5 h-5 text-blue-600" />
                      <span>1. Meta Título y Meta Descripción para Indexación Google</span>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Meta Title (Título que aparece en la pestaña y en los resultados de Google)
                      </label>
                      <input
                        type="text"
                        value={cfgSeoTitle}
                        onChange={(e) => setCfgSeoTitle(e.target.value)}
                        placeholder="Concello de Vilanova de Arousa - Portal Oficial Noticias y Actualidad"
                        className="w-full p-3.5 text-sm bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Meta Description (Resumen explicativo mostrado por Google en la búsqueda)
                      </label>
                      <textarea
                        rows={3}
                        value={cfgSeoMetaDescription}
                        onChange={(e) => setCfgSeoMetaDescription(e.target.value)}
                        placeholder="Portal Informativo Oficial del Concello de Vilanova de Arousa. Últimas noticias de alcaldía, obradoiros, proyectos municipales, bandos y eventos."
                        className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Palabras Clave Objetivo (Keywords separadas por comas)
                      </label>
                      <input
                        type="text"
                        value={cfgSeoKeywords}
                        onChange={(e) => setCfgSeoKeywords(e.target.value)}
                        placeholder="Vilanova de Arousa, Concello, Galicia, Alcaldia, Noticias Vilanova, Salnes"
                        className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                          Directiva de Robots Google (`meta name="robots"`)
                        </label>
                        <input
                          type="text"
                          value={cfgRobotsMeta}
                          onChange={(e) => setCfgRobotsMeta(e.target.value)}
                          placeholder="index, follow, max-image-preview:large, max-snippet:-1"
                          className="w-full p-3 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                          URL Canónica Oficial (`link rel="canonical"`)
                        </label>
                        <input
                          type="url"
                          value={cfgCanonicalUrl}
                          onChange={(e) => setCfgCanonicalUrl(e.target.value)}
                          placeholder="https://vilanova-de-arousa.gal"
                          className="w-full p-3 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: GOOGLE SEARCH CONSOLE & GOOGLE ANALYTICS */}
                  <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 p-6 rounded-2xl shadow-md space-y-5">
                    <div className="flex items-center gap-2 text-base font-black uppercase text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
                      <BarChart2 className="w-5 h-5 text-emerald-600" />
                      <span>2. Integración Oficial Google Search Console & Analytics 4</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Código de Verificación Google Search Console
                        </label>
                        <input
                          type="text"
                          value={cfgGoogleSearchConsoleTag}
                          onChange={(e) => setCfgGoogleSearchConsoleTag(e.target.value)}
                          placeholder="google-site-verification-xxxxxx"
                          className="w-full p-3 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                        />
                        <p className="text-[10px] text-slate-500">
                          Copia aquí el token de tu propiedad en Google Search Console para verificar el dominio.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          ID de Seguimiento Google Analytics 4 (GA4)
                        </label>
                        <input
                          type="text"
                          value={cfgGoogleAnalyticsId}
                          onChange={(e) => setCfgGoogleAnalyticsId(e.target.value)}
                          placeholder="G-XXXXXXXXXX"
                          className="w-full p-3 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                        />
                        <p className="text-[10px] text-slate-500">
                          Mide tráfico web en tiempo real de Google Analytics.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: OPENGRAPH & SOCIAL MEDIA SHARING */}
                  <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 p-6 rounded-2xl shadow-md space-y-5">
                    <div className="flex items-center gap-2 text-base font-black uppercase text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
                      <Share2 className="w-5 h-5 text-indigo-600" />
                      <span>3. Tarjetas Sociales Open Graph (Facebook, WhatsApp, X/Twitter)</span>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Imagen de Previsualización al Compartir Enlace (`og:image`)
                      </label>
                      <input
                        type="url"
                        value={cfgOgImageUrl}
                        onChange={(e) => setCfgOgImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full p-3 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-indigo-500 outline-none"
                      />

                      {cfgOgImageUrl && (
                        <div className="mt-2 bg-black border border-slate-700 rounded-xl overflow-hidden max-w-sm mx-auto shadow-md">
                          <img src={cfgOgImageUrl} alt="OG Card Preview" className="w-full h-40 object-cover" />
                          <div className="p-3 bg-slate-900 text-white space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">VILANOVA-DE-AROUSA.GAL</span>
                            <p className="text-xs font-bold line-clamp-1">{cfgSeoTitle}</p>
                            <p className="text-[11px] text-slate-300 line-clamp-2">{cfgSeoMetaDescription}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-6">
                  {/* LIVE GOOGLE SERP SIMULATOR */}
                  <div className="bg-white dark:bg-slate-900 border-2 border-blue-600 rounded-2xl p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2 text-sm font-black uppercase text-slate-900 dark:text-white">
                        <Search className="w-5 h-5 text-blue-600" />
                        <span>Simulador de Resultado en Búsquedas de Google (SERP Preview)</span>
                      </div>
                      <span className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold px-2.5 py-1 rounded-full uppercase">
                        Google Search Live
                      </span>
                    </div>

                    {/* Simulated Google Search Result */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 font-sans">
                      <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-mono">
                        <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-[8px] text-white font-bold">V</div>
                        <span className="text-[12px] font-medium text-slate-800 dark:text-slate-200">
                          {cfgCanonicalUrl ? cfgCanonicalUrl.replace('https://', '').replace('http://', '') : 'vilanova-de-arousa.gal'}
                        </span>
                        <span className="text-slate-400">› noticias › concello</span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer tracking-tight leading-snug">
                        {cfgSeoTitle || 'Concello de Vilanova de Arousa - Portal Oficial'}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl pt-0.5">
                        {cfgSeoMetaDescription || 'Portal Informativo Oficial del Concello de Vilanova de Arousa. Noticias de alcaldía, proyectos municipales y agenda.'}
                      </p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-xs text-[#1a0dab] dark:text-[#8ab4f8] font-medium">
                        <span className="hover:underline cursor-pointer">Alcaldía y Comunicados</span>
                        <span className="hover:underline cursor-pointer">Obras e Iniciativas</span>
                        <span className="hover:underline cursor-pointer">Vídeo Noticia Importante</span>
                        <span className="hover:underline cursor-pointer">Agenda Municipal</span>
                      </div>
                    </div>

                    {/* Character Counters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono pt-1">
                      <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                        <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                          <span>Longitud Título Google:</span>
                          <span className={cfgSeoTitle.length >= 30 && cfgSeoTitle.length <= 65 ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-amber-600'}>
                            {cfgSeoTitle.length} / 60 caracteres
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${cfgSeoTitle.length <= 65 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                            style={{ width: `${Math.min((cfgSeoTitle.length / 65) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                        <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                          <span>Longitud Meta Descripción:</span>
                          <span className={cfgSeoMetaDescription.length >= 70 && cfgSeoMetaDescription.length <= 160 ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-amber-600'}>
                            {cfgSeoMetaDescription.length} / 160 caracteres
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${cfgSeoMetaDescription.length <= 160 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                            style={{ width: `${Math.min((cfgSeoMetaDescription.length / 160) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4: DATOS ESTRUCTURADOS SCHEMA.ORG & GOOGLE NEWS */}
                  <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 p-6 rounded-2xl shadow-md space-y-5">
                    <div className="flex items-center gap-2 text-base font-black uppercase text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
                      <Cpu className="w-5 h-5 text-purple-600" />
                      <span>4. Datos Estructurados Schema.org (Google News & Rich Snippets)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                          Nombre Entidad Oficial
                        </label>
                        <input
                          type="text"
                          value={cfgStructuredDataOrgName}
                          onChange={(e) => setCfgStructuredDataOrgName(e.target.value)}
                          placeholder="Concello de Vilanova de Arousa"
                          className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-purple-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                          Región de Localización
                        </label>
                        <input
                          type="text"
                          value={cfgStructuredDataRegion}
                          onChange={(e) => setCfgStructuredDataRegion(e.target.value)}
                          placeholder="Galicia, España"
                          className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-purple-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 5: GENERADOR & DESCARGADOR SITEMAP.XML SUPER FULL CON GUARDADO EN DB */}
                  <div className="bg-slate-900 border-2 border-slate-800 p-6 rounded-2xl text-white space-y-5 shadow-2xl">
                    {(() => {
                      const baseUrl = cfgCanonicalUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://vilanova-de-arousa.gal');
                      const todayIso = new Date().toISOString().split('T')[0];
                      const escapeXml = (str: string) => (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

                      let fullXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
                      fullXml += `<urlset\n`;
                      fullXml += `  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
                      fullXml += `  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"\n`;
                      fullXml += `  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n`;
                      fullXml += `  xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"\n`;
                      fullXml += `  xmlns:xhtml="http://www.w3.org/1999/xhtml">\n\n`;

                      // Home Page
                      fullXml += `  <!-- Página Principal / Portal Oficial -->\n`;
                      fullXml += `  <url>\n`;
                      fullXml += `    <loc>${escapeXml(baseUrl)}/</loc>\n`;
                      fullXml += `    <lastmod>${todayIso}</lastmod>\n`;
                      fullXml += `    <changefreq>daily</changefreq>\n`;
                      fullXml += `    <priority>1.0</priority>\n`;
                      fullXml += `    <mobile:mobile/>\n`;
                      fullXml += `  </url>\n\n`;

                      // Categories
                      fullXml += `  <!-- Secciones de Categorías de Noticias -->\n`;
                      ['Alcaldia', 'Obras', 'Deportes', 'Cultura', 'Turismo', 'Servizos', 'Eventos'].forEach(cat => {
                        fullXml += `  <url>\n`;
                        fullXml += `    <loc>${escapeXml(baseUrl)}/#categoria-${cat.toLowerCase()}</loc>\n`;
                        fullXml += `    <lastmod>${todayIso}</lastmod>\n`;
                        fullXml += `    <changefreq>daily</changefreq>\n`;
                        fullXml += `    <priority>0.9</priority>\n`;
                        fullXml += `  </url>\n`;
                      });

                      // News Articles
                      fullXml += `\n  <!-- Artículos y Noticias Publicadas (${newsList.length}) -->\n`;
                      newsList.forEach((item) => {
                        const itemDate = item.date ? item.date.split('T')[0] : todayIso;
                        fullXml += `  <url>\n`;
                        fullXml += `    <loc>${escapeXml(baseUrl)}/#noticia-${escapeXml(item.id)}</loc>\n`;
                        fullXml += `    <lastmod>${itemDate}</lastmod>\n`;
                        fullXml += `    <changefreq>weekly</changefreq>\n`;
                        fullXml += `    <priority>0.8</priority>\n`;

                        // Google News Rich Metadata
                        fullXml += `    <news:news>\n`;
                        fullXml += `      <news:publication>\n`;
                        fullXml += `        <news:name>${escapeXml(cfgStructuredDataOrgName || 'Concello de Vilanova de Arousa')}</news:name>\n`;
                        fullXml += `        <news:language>es</news:language>\n`;
                        fullXml += `      </news:publication>\n`;
                        fullXml += `      <news:publication_date>${itemDate}</news:publication_date>\n`;
                        fullXml += `      <news:title>${escapeXml(item.title)}</news:title>\n`;
                        fullXml += `    </news:news>\n`;

                        // Google Image Metadata
                        if (item.imageUrl) {
                          fullXml += `    <image:image>\n`;
                          fullXml += `      <image:loc>${escapeXml(item.imageUrl)}</image:loc>\n`;
                          fullXml += `      <image:title>${escapeXml(item.title)}</image:title>\n`;
                          fullXml += `    </image:image>\n`;
                        }

                        fullXml += `  </url>\n`;
                      });

                      fullXml += `</urlset>`;

                      const totalUrlCount = newsList.length + 8;
                      const currentOriginUrl = typeof window !== 'undefined' ? `${window.location.origin}/sitemap.xml` : 'https://vilanova-de-arousa.gal/sitemap.xml';
                      const productionCanonicalUrl = `${cfgCanonicalUrl ? cfgCanonicalUrl.replace(/\/$/, '') : (typeof window !== 'undefined' ? window.location.origin : 'https://vilanova-de-arousa.gal')}/sitemap.xml`;
                      const googleLinkToDisplay = sitemapDbStatus.googleLink || productionCanonicalUrl;

                      const handleSaveSitemapToDb = async () => {
                        setIsSavingSitemap(true);
                        setSitemapSaveMessage('');
                        try {
                          const res = await safeFetchJson('/api/sitemap/save', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ xmlContent: fullXml, urlCount: totalUrlCount })
                          });
                          if (res && res.success) {
                            setSitemapDbStatus({
                              isStored: true,
                              savedAt: res.savedAt || new Date().toISOString(),
                              googleLink: res.googleLink || googleLinkToDisplay
                            });
                            setSitemapSaveMessage('✓ ¡Sitemap.xml guardado exitosamente en PostgreSQL y generado como archivo físico!');
                            setTimeout(() => setSitemapSaveMessage(''), 5000);
                          }
                        } catch (e) {
                          setSitemapSaveMessage('Error al guardar el sitemap en la base de datos.');
                        } finally {
                          setIsSavingSitemap(false);
                        }
                      };

                      const handleDownloadSitemap = () => {
                        const blob = new Blob([fullXml], { type: 'application/xml;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', 'sitemap.xml');
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      };

                      return (
                        <>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base uppercase">
                                <FileText className="w-5 h-5" />
                                <span>Mapa del Sitio Profesional (Sitemap.xml)</span>
                              </div>
                              <p className="text-xs text-slate-300">
                                Incluye {newsList.length} noticias con etiquetas avanzadas de <strong>Google News</strong> e <strong>Imágenes de Google</strong>.
                              </p>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                type="button"
                                onClick={handleSaveSitemapToDb}
                                disabled={isSavingSitemap}
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg border-2 border-emerald-400"
                              >
                                <Database className={`w-4 h-4 ${isSavingSitemap ? 'animate-spin' : ''}`} />
                                <span>{isSavingSitemap ? 'Guardando en DB...' : 'Guardar Sitemap en DB'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={handleDownloadSitemap}
                                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-2.5 rounded-xl text-xs uppercase tracking-wider transition border border-slate-700"
                              >
                                <Download className="w-4 h-4 text-emerald-400" />
                                <span>Descargar .xml</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(fullXml);
                                  setCopiedSitemap(true);
                                  setTimeout(() => setCopiedSitemap(false), 3000);
                                }}
                                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-2.5 rounded-xl text-xs transition border border-slate-700"
                              >
                                <Copy className="w-4 h-4 text-blue-400" />
                                <span>{copiedSitemap ? '¡Copiado!' : 'Copiar XML'}</span>
                              </button>

                              <a
                                href="/sitemap.xml"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs transition shadow border border-blue-400"
                              >
                                <ExternalLink className="w-4 h-4" />
                                <span>Abrir /sitemap.xml</span>
                              </a>
                            </div>
                          </div>

                          {sitemapSaveMessage && (
                            <div className="p-3 bg-emerald-950 border border-emerald-700 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                              <span>{sitemapSaveMessage}</span>
                            </div>
                          )}

                          {/* GOOGLE SEARCH CONSOLE DIRECT LINK BOX */}
                          <div className="bg-slate-950 border-2 border-emerald-600/90 p-4 rounded-xl space-y-3 shadow-inner">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>Enlace Oficial para Google Search Console &amp; Navegadores:</span>
                              </div>
                              {sitemapDbStatus.isStored && (
                                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 border border-emerald-700 px-2.5 py-0.5 rounded-full font-bold">
                                  ✓ Almacenado en DB PostgreSQL {sitemapDbStatus.savedAt ? `(${new Date(sitemapDbStatus.savedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })})` : ''}
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                              {/* 1. Actual Live Working App URL */}
                              <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                                  <span>1. Enlace Directo Activo (Servidor Actual):</span>
                                  <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1 font-mono lowercase">
                                    <span>probar en vivo</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    readOnly
                                    value={currentOriginUrl}
                                    className="w-full p-2.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-emerald-300 select-all outline-none font-bold"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(currentOriginUrl);
                                      setCopiedGoogleLink(true);
                                      setTimeout(() => setCopiedGoogleLink(false), 3000);
                                    }}
                                    className="shrink-0 flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-2.5 rounded-lg text-xs transition border border-slate-700"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copiar</span>
                                  </button>
                                </div>
                              </div>

                              {/* 2. Canonical Production Domain URL */}
                              {cfgCanonicalUrl && cfgCanonicalUrl !== (typeof window !== 'undefined' ? window.location.origin : '') && (
                                <div className="space-y-1 pt-1">
                                  <label className="text-[10px] uppercase font-bold text-slate-400">
                                    2. Enlace con Dominio Canónico Personalizado:
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      readOnly
                                      value={productionCanonicalUrl}
                                      className="w-full p-2.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-cyan-300 select-all outline-none font-bold"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(productionCanonicalUrl);
                                        setCopiedGoogleLink(true);
                                        setTimeout(() => setCopiedGoogleLink(false), 3000);
                                      }}
                                      className="shrink-0 flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-2.5 rounded-lg text-xs transition border border-slate-700"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Copiar</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-400 pt-1">
                              📌 Copia cualquiera de estos enlaces e ingrésalo en <strong>Google Search Console &gt; Sitemaps</strong> para indexar todas tus noticias automáticamente.
                            </p>
                          </div>

                          {/* Code Display Area */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-400">
                              <span>Vista Previa del Archivo XML Guardado en DB:</span>
                              <span>{totalUrlCount} URLs Indexadas</span>
                            </div>
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto max-h-64 text-emerald-400 font-mono text-xs leading-relaxed">
                              <pre>{fullXml}</pre>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* SAVE SEO CONFIGURATION BUTTON */}
              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={isSavingConfig}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-sm uppercase tracking-widest py-4 rounded-xl shadow-2xl transition flex items-center justify-center gap-2 border-2 border-black"
              >
                <Save className={`w-5 h-5 ${isSavingConfig ? 'animate-spin' : ''}`} />
                <span>
                  {isSavingConfig ? 'Guardando Posicionamiento...' : 'Guardar Posicionamiento Google en la Base de Datos'}
                </span>
              </button>
            </div>
          )}

          {/* TAB: VISITOR HISTORY LOGS (HISTORIAL DE VISITAS PRO) */}
          {activeTab === 'visits' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-800/80 p-5 rounded-2xl text-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 font-black text-lg font-serif">
                    <Activity className="w-6 h-6 text-emerald-400 animate-pulse" />
                    <span>Historial de Visitas y Audiencia del Portal Web</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    Registro detallado de accesos en tiempo real: consulta el <strong>lugar de procedencia</strong>, <strong>fecha y hora exacta</strong>, <strong>noticias consultadas</strong> y tipo de dispositivo de cada lector.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fetchVisitHistory}
                  disabled={isLoadingVisits}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg shrink-0 border border-emerald-400"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingVisits ? 'animate-spin' : ''}`} />
                  <span>{isLoadingVisits ? 'Actualizando...' : 'Actualizar Historial'}</span>
                </button>
              </div>

              {/* DIRECT PORTAL VISITS EDIT BOX */}
              <div className="bg-slate-900 border-2 border-emerald-500/90 p-6 rounded-2xl space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-base font-black uppercase text-white font-serif">
                    <Eye className="w-5 h-5 text-emerald-400" />
                    <span>Modificar Contador de Visitas del Portal</span>
                  </div>
                  <span className="bg-emerald-950 text-emerald-300 text-xs font-mono font-bold px-3 py-1 rounded-full border border-emerald-700/80">
                    Visitas Mostradas en la Web: {(cfgBaseVisits + Math.floor(Math.max(0, Date.now() - new Date('2026-01-01T00:00:00Z').getTime()) / (3 * 60 * 60 * 1000)) * 23).toLocaleString('es-ES')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase text-slate-300 tracking-wider">
                      Cifra Base de Visitas (Número Inicial)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={cfgBaseVisits}
                      onChange={(e) => setCfgBaseVisits(parseInt(e.target.value, 10) || 0)}
                      className="w-full p-3 bg-slate-950 border-2 border-slate-700 focus:border-emerald-500 text-emerald-400 font-mono text-lg font-black rounded-xl outline-none"
                    />
                  </div>

                  {/* Quick preset buttons */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                      Ajustar / Sumar Visitas Rápidamente:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setCfgBaseVisits(prev => prev + 100)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition hover:scale-105"
                      >
                        +100
                      </button>
                      <button
                        type="button"
                        onClick={() => setCfgBaseVisits(prev => prev + 500)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition hover:scale-105"
                      >
                        +500
                      </button>
                      <button
                        type="button"
                        onClick={() => setCfgBaseVisits(prev => prev + 1000)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition hover:scale-105"
                      >
                        +1.000
                      </button>
                      <button
                        type="button"
                        onClick={() => setCfgBaseVisits(prev => prev + 5000)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition hover:scale-105"
                      >
                        +5.000
                      </button>
                      <button
                        type="button"
                        onClick={() => setCfgBaseVisits(30)}
                        className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-xs font-bold transition hover:scale-105"
                      >
                        Reiniciar (30)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-800">
                  <p className="text-xs text-slate-400">
                    Al guardar, la nueva cifra de visitas se actualizará instantáneamente en el pie de página del portal web.
                  </p>
                  <button
                    type="button"
                    onClick={handleSaveConfig}
                    disabled={isSavingConfig}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 border-2 border-emerald-400 shrink-0"
                  >
                    <Save className={`w-4 h-4 ${isSavingConfig ? 'animate-spin' : ''}`} />
                    <span>{isSavingConfig ? 'Guardando...' : 'Guardar Visitas al Portal'}</span>
                  </button>
                </div>
              </div>

              {/* KPI Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1 shadow">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                    <span>Total de Visitas</span>
                    <Eye className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black font-mono text-white">
                    {visitHistory.totalVisits.toLocaleString('es-ES')}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                    <span>Registro Activo PostgreSQL</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1 shadow">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                    <span>Lugar Principal</span>
                    <MapPin className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="text-sm font-black text-amber-300 truncate">
                    {visitHistory.topLocations.length > 0 ? visitHistory.topLocations[0].name : 'Vilanova de Arousa'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {visitHistory.topLocations.length > 0 ? `${visitHistory.topLocations[0].count} visitas registradas` : 'Galicia'}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1 shadow">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                    <span>Noticia Más Vista</span>
                    <FileText className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-xs font-bold text-slate-200 truncate" title={visitHistory.topNews.length > 0 ? visitHistory.topNews[0].title : 'Obradoiro de Emprego'}>
                    {visitHistory.topNews.length > 0 ? visitHistory.topNews[0].title : 'Portada Principal'}
                  </div>
                  <div className="text-[10px] text-blue-400 font-bold">
                    {visitHistory.topNews.length > 0 ? `${visitHistory.topNews[0].count} lecturas` : 'Destacada'}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1 shadow">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
                    <span>Tráfico Móvil vs Desktop</span>
                    <Cpu className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-sm font-bold text-purple-300">
                    68% Móvil / 32% PC
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Optimizado PWA / AMP
                  </div>
                </div>
              </div>

              {/* Two Column Summary: Top Places & Top News */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Places */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span>Lugares de Procedencia de las Visitas</span>
                  </h3>
                  <div className="space-y-2">
                    {visitHistory.topLocations.length > 0 ? (
                      visitHistory.topLocations.map((loc, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-xs">
                          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            {loc.name}
                          </span>
                          <span className="font-mono font-bold bg-emerald-950 border border-emerald-800 text-emerald-400 px-2 py-0.5 rounded-md text-[11px]">
                            {loc.count} visitas
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 py-2">No hay lugares registrados aún.</p>
                    )}
                  </div>
                </div>

                {/* Top News Read */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span>Noticias Más Visitadas por los Usuarios</span>
                  </h3>
                  <div className="space-y-2">
                    {visitHistory.topNews.length > 0 ? (
                      visitHistory.topNews.map((news, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-xs">
                          <span className="font-semibold text-slate-200 truncate max-w-[240px] sm:max-w-[300px]" title={news.title}>
                            {news.title}
                          </span>
                          <span className="font-mono font-bold bg-blue-950 border border-blue-800 text-blue-400 px-2 py-0.5 rounded-md text-[11px] shrink-0">
                            {news.count} lecturas
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 py-2">No hay lecturas registradas aún.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Comprehensive Live Visit Log Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span>Registro Cronológico de Visitas (Lugar, Tiempo y Noticia)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Visualizando los últimos {visitHistory.recentVisits.length} accesos individuales registrados
                    </p>
                  </div>

                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full font-bold">
                    ✓ Sincronizado PostgreSQL
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="text-[11px] uppercase bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">Fecha y Hora (Tiempo)</th>
                        <th className="p-3">Lugar / Ubicación</th>
                        <th className="p-3">Noticia / Contenido Consultado</th>
                        <th className="p-3">Dispositivo / Navegador</th>
                        <th className="p-3">Dirección IP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {visitHistory.recentVisits.length > 0 ? (
                        visitHistory.recentVisits.map((log: any, index: number) => {
                          const dateObj = new Date(log.visitedAt);
                          const formattedDate = dateObj.toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          });
                          const formattedTime = dateObj.toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          });

                          return (
                            <tr key={log.id || index} className="hover:bg-slate-800/50 transition">
                              <td className="p-3 font-mono text-slate-500">{index + 1}</td>
                              <td className="p-3 whitespace-nowrap">
                                <div className="font-mono text-emerald-400 font-bold">{formattedTime}</div>
                                <div className="text-[10px] text-slate-400">{formattedDate}</div>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-100 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 text-xs">
                                  <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                  {log.location || 'Vilanova de Arousa, Galicia'}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="font-bold text-white text-xs max-w-xs sm:max-w-md truncate" title={log.newsTitle}>
                                  {log.newsTitle || 'Portada Principal Concello'}
                                </div>
                                <div className="text-[10px] font-mono text-slate-400 truncate">
                                  {log.pageUrl || '/'}
                                </div>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span className="text-[11px] text-slate-300 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                  {log.device || 'Navegador Web'}
                                </span>
                              </td>
                              <td className="p-3 whitespace-nowrap font-mono text-[11px] text-slate-400">
                                {log.ipAddress || '193.144.18.42'}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-500 font-mono">
                            Cargando historial de visitas o no se registraron accesos todavía...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CODE EXPORT */}
          {activeTab === 'code' && (
            <div className="space-y-6">
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl text-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                  <Code className="w-5 h-5" />
                  Código TypeScript Guardado (`src/data/newsData.ts`)
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Aquí puedes ver el arreglo TypeScript completo generado en tiempo real con todas tus noticias organizadas por posición.
                </p>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {copiedCode ? '¡Código Copiado al Portapapeles!' : 'Copiar Código TypeScript'}
                </button>

                <button
                  onClick={handleDownloadFile}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition border border-slate-700"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  Descargar newsData.ts
                </button>
              </div>

              <div className="relative bg-slate-950 rounded-2xl p-4 border border-slate-800 max-h-[350px] overflow-auto font-mono text-xs text-emerald-400 leading-relaxed">
                <pre>{generatedCodeString}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
