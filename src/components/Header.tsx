import React, { useState, useEffect } from 'react';
import { Search, Menu, User, Bookmark, RefreshCw, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { Category, SiteConfig, defaultSiteConfig } from '../types';
import { CoatOfArmsLogo } from './CoatOfArmsLogo';

interface HeaderProps {
  currentCategory: Category;
  onSelectCategory: (category: Category) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAdmin: () => void;
  savedCount: number;
  onOpenSaved: () => void;
  isSavedView: boolean;
  onSaveToCodeDirectly: () => void;
  isSavingToCode: boolean;
  lastSaveSuccess: boolean | null;
  siteConfig?: SiteConfig;
}

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenAdmin,
  savedCount,
  onOpenSaved,
  isSavedView,
  onSaveToCodeDirectly,
  isSavingToCode,
  lastSaveSuccess,
  siteConfig = defaultSiteConfig
}) => {
  const [currentDate, setCurrentDate] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const now = new Date();
    const formatted = now.toLocaleDateString('es-ES', options);
    setCurrentDate(formatted.charAt(0).toUpperCase() + formatted.slice(1));
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const logoSizePx = siteConfig?.logoSize || 48;
  const titleColor = siteConfig?.titleColor || '#c20000';
  const titleText = siteConfig?.titleText || 'Concello de Vilanova de Arousa';

  return (
    <header className="w-full bg-white dark:bg-black transition-colors font-sans-ui border-b border-gray-200 dark:border-gray-800">
      {/* Top Header Utilities & Main Masthead Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-5 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        {/* Left: Hamburger Menu & Admin button */}
        <div className="flex items-center gap-3">
          <button
            className="p-1.5 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900 rounded transition"
            title="Menú Principal"
          >
            <Menu className="w-6 h-6 stroke-[1.75]" />
          </button>
          
          <button
            onClick={onOpenAdmin}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Admin</span>
          </button>

          <span className="hidden lg:inline text-xs text-gray-500 font-medium border-l border-gray-300 dark:border-gray-700 pl-3">
            {currentDate}
          </span>
        </div>

        {/* Center: Brand Title + Coat of Arms Logo or Custom Logo */}
        <div className="flex items-center gap-3 sm:gap-4 cursor-pointer" onClick={() => onSelectCategory('Todas')}>
          {siteConfig?.logoUrl ? (
            <img 
              src={siteConfig.logoUrl} 
              alt="Logo Concello" 
              className="object-contain drop-shadow-sm shrink-0"
              style={{ height: `${logoSizePx}px`, maxWidth: `${logoSizePx * 2.5}px` }}
              onError={(e) => {
                // If custom image fails to load, fallback safely
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <CoatOfArmsLogo 
              size={logoSizePx} 
              className="shrink-0 drop-shadow-sm" 
            />
          )}

          <div className="text-center">
            <h1 
              className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight font-serif font-newspaper select-none transition-colors"
              style={{ color: titleColor }}
            >
              {titleText}
            </h1>
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-sans tracking-widest uppercase font-semibold mt-0.5">
              Portal Informativo Oficial de la Alcaldía
            </p>
          </div>
        </div>

        {/* Right: User Login / Session / Search Quick Trigger */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Bookmark Button */}
          <button
            onClick={onOpenSaved}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold transition ${
              isSavedView 
                ? 'bg-amber-400 text-black font-bold' 
                : 'text-gray-700 dark:text-gray-300 hover:text-black'
            }`}
          >
            <Bookmark className="w-4 h-4 fill-current text-amber-500" />
            <span>({savedCount})</span>
          </button>

          {/* User Sign In Pill matching screenshot */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 dark:text-gray-200 hover:text-[#c20000] cursor-pointer transition">
            <span className="hidden md:inline">Inicia sesión</span>
            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </div>
          </div>

          {/* Code Save */}
          <button
            onClick={onSaveToCodeDirectly}
            disabled={isSavingToCode}
            title="Guardar en Código"
            className="p-1.5 text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition"
          >
            <RefreshCw className={`w-4 h-4 ${isSavingToCode ? 'animate-spin' : ''}`} />
          </button>

          {/* Darkmode */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Sub-Header Banner focusing on Mayor & Municipal News */}
      <div className="border-b border-t border-gray-900 dark:border-gray-200 my-[2px] bg-gray-50 dark:bg-gray-950 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100">
            Información Oficial e Iniciativas del Alcalde de Vilanova de Arousa
          </span>
        </div>
      </div>

      {/* Search Input Bar if Active */}
      {searchQuery && (
        <div className="bg-amber-50 dark:bg-gray-900 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs font-semibold">
          <span>Filtrando noticias por: <strong>"{searchQuery}"</strong></span>
          <button onClick={() => onSearchChange('')} className="text-red-600 font-bold hover:underline">
            Limpiar filtro ✕
          </button>
        </div>
      )}
    </header>
  );
};


