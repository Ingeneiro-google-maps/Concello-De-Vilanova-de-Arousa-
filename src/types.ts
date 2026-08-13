export type Category = 
  | 'Todas'
  | 'Alcaldía'
  | 'Municipal';

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
  // Video Configuration
  videoUrl: string; // YouTube video URL or ID
  videoTitle: string; // Video title text
  videoBadge: string; // Badge label, e.g. "NOTICIA IMPORTANTE"
  videoDescription: string; // Brief description
  showVideo: boolean; // Whether video is visible on main page
  videoPosition: 'top' | 'middle' | 'sidebar'; // Position on page
  autoplayVideo?: boolean; // Autoplay video on page load
}

export const defaultSiteConfig: SiteConfig = {
  logoUrl: '',
  logoSize: 48,
  titleColor: '#c20000',
  titleText: 'Concello de Vilanova de Arousa',
  videoUrl: 'https://www.youtube.com/watch?v=40GxTki9Krc',
  videoTitle: 'Información y Proyectos Municipales en Vilanova de Arousa',
  videoBadge: 'NOTICIA IMPORTANTE',
  videoDescription: 'Vídeo oficial con las últimas novedades, obras e iniciativas destacadas del Concello.',
  showVideo: true,
  videoPosition: 'top',
  autoplayVideo: true,
};

