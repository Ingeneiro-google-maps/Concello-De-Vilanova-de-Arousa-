export type Category = 
  | 'Todas'
  | 'Alcaldía'
  | 'Obras'
  | 'Deportes'
  | 'Cultura'
  | 'Turismo'
  | 'Servicios'
  | 'Eventos'
  | 'Municipal';

export interface CategoryInfo {
  id: Category;
  label: string;
  badgeBg: string;
  badgeText: string;
}

export const CATEGORIES_LIST: CategoryInfo[] = [
  { id: 'Todas', label: 'Todas las Noticias', badgeBg: 'bg-slate-900 dark:bg-slate-100', badgeText: 'text-white dark:text-slate-900' },
  { id: 'Alcaldía', label: 'Alcaldía', badgeBg: 'bg-rose-700', badgeText: 'text-white' },
  { id: 'Obras', label: 'Obras e Infraestructuras', badgeBg: 'bg-amber-600', badgeText: 'text-white' },
  { id: 'Deportes', label: 'Deportes', badgeBg: 'bg-blue-600', badgeText: 'text-white' },
  { id: 'Cultura', label: 'Cultura', badgeBg: 'bg-purple-600', badgeText: 'text-white' },
  { id: 'Turismo', label: 'Turismo e Mar', badgeBg: 'bg-emerald-600', badgeText: 'text-white' },
  { id: 'Servicios', label: 'Servicios Sociales', badgeBg: 'bg-teal-600', badgeText: 'text-white' },
  { id: 'Eventos', label: 'Eventos e Agenda', badgeBg: 'bg-fuchsia-600', badgeText: 'text-white' },
  { id: 'Municipal', label: 'Municipal', badgeBg: 'bg-slate-800 dark:bg-slate-200', badgeText: 'text-white dark:text-slate-900' },
];

export interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
  likes: number;
}

export interface NewsItem {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  category: Category;
  imageUrl: string;
  originalUrl?: string; // Link to original source news
  author: string;
  authorRole?: string;
  date: string; // ISO or formatted string
  readTime: string; // e.g. '4 min de lectura'
  isBreaking?: boolean; // Featured in top ticker
  isHero?: boolean; // Main frontpage featured position
  position: number; // Order position (1, 2, 3...)
  views: number;
  likes: number;
  tags: string[];
  comments?: Comment[];
}

export interface SiteConfig {
  logoUrl?: string; // Custom logo image URL, or empty string to use default CoatOfArms SVG logo
  logoSize: number; // Logo size in pixels (e.g. 48)
  titleColor: string; // Header title color hex (e.g. #c20000)
  titleText?: string; // Custom title text (default: Concello de Vilanova de Arousa)
  baseVisits?: number; // Base number of portal visits shown on website
  // Video Configuration
  videoUrl: string; // YouTube video URL or ID
  videoTitle: string; // Video title text
  videoBadge: string; // Badge label, e.g. "NOTICIA IMPORTANTE"
  videoDescription: string; // Brief description
  showVideo: boolean; // Whether video is visible on main page
  videoPosition: 'top' | 'middle' | 'sidebar'; // Position on page
  autoplayVideo?: boolean; // Autoplay video on page load

  // Google SEO & CEO Positioning Suite
  seoTitle?: string;
  seoMetaDescription?: string;
  seoKeywords?: string;
  googleSearchConsoleTag?: string;
  googleAnalyticsId?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
  robotsMeta?: string;
  structuredDataOrgName?: string;
  structuredDataRegion?: string;
}

export const defaultSiteConfig: SiteConfig = {
  logoUrl: '',
  logoSize: 48,
  titleColor: '#c20000',
  titleText: 'Concello de Vilanova de Arousa',
  baseVisits: 30,
  videoUrl: 'https://www.youtube.com/watch?v=40GxTki9Krc',
  videoTitle: 'Información y Proyectos Municipales en Vilanova de Arousa',
  videoBadge: 'NOTICIA IMPORTANTE',
  videoDescription: 'Vídeo oficial con las últimas novedades, obras e iniciativas destacadas del Concello.',
  showVideo: true,
  videoPosition: 'top',
  autoplayVideo: true,

  // Default SEO Settings optimized for Google search index
  seoTitle: 'Concello de Vilanova de Arousa - Portal Oficial Noticias y Actualidad',
  seoMetaDescription: 'Portal Informativo Oficial del Concello de Vilanova de Arousa. Últimas noticias de alcaldía, obradoiros, proyectos municipales, bandos y eventos.',
  seoKeywords: 'Vilanova de Arousa, Concello, Galicia, Alcaldia, Noticias Vilanova, Salnes, Pontevedra, Obras Municipales, Agenda Vilanova',
  googleSearchConsoleTag: 'google-site-verification-vilanova-official-2026',
  googleAnalyticsId: 'G-VILANOVA2026',
  ogImageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
  canonicalUrl: 'https://vilanova-de-arousa.gal',
  robotsMeta: 'index, follow, max-image-preview:large, max-snippet:-1',
  structuredDataOrgName: 'Concello de Vilanova de Arousa',
  structuredDataRegion: 'Galicia, España',
};

export type MonitoredStatus = 'pending' | 'approved' | 'dismissed';

export interface MonitoredNewsItem {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  category: Category;
  imageUrl?: string;
  originalUrl: string;
  sourceMedia: string;
  author?: string;
  publishedDate: string;
  detectedAt: string;
  status: MonitoredStatus;
  relevanceScore?: number;
  highlightPhrase?: string;
}

export interface MonitoringSettings {
  isEnabled: boolean;
  intervalHours: number; // default 12
  lastScanAt?: string;
  nextScanAt?: string;
  keywords: string;
  monitoredSources: string[];
}

export const DEFAULT_MONITORED_SOURCES = [
  'La Voz de Galicia (Arousa / Pontevedra)',
  'Diario de Arousa',
  'Faro de Vigo (Arousa)',
  'PontevedraViva',
  'Nós Diario',
  'CRTVG (Galicia Noticias)',
  'El Correo Gallego',
  'Cadena SER Arousa'
];

