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

export interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  icon: string;
}
