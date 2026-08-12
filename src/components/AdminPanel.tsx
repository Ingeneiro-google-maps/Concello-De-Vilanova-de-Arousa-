import React, { useState, useEffect } from 'react';
import { 
  X, Plus, ArrowUp, ArrowDown, Edit3, Trash2, Sparkles, Save, Code, Download, 
  CheckCircle2, AlertCircle, RefreshCw, Layers, ShieldCheck, Flame, Image as ImageIcon, Zap, Link as LinkIcon, Globe, ExternalLink, Database, Activity
} from 'lucide-react';
import { NewsItem, Category } from '../types';

interface AdminPanelProps {
  newsList: NewsItem[];
  onClose: () => void;
  onUpdateNewsList: (newList: NewsItem[]) => void;
  onSaveToCodeDirectly: () => Promise<boolean>;
  isSavingToCode: boolean;
  lastSaveSuccess: boolean | null;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  newsList,
  onClose,
  onUpdateNewsList,
  onSaveToCodeDirectly,
  isSavingToCode,
  lastSaveSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'order' | 'create' | 'link' | 'ai' | 'code'>('order');
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);

  // Form State
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
      const res = await fetch('/api/db-health');
      const data = await res.json();
      if (data.success && data.health) {
        setDbHealth(data.health);
      } else {
        setDbHealth({
          connected: false,
          dbName: 'neondb',
          host: 'Neon PostgreSQL',
          latencyMs: 0,
          totalNews: newsList.length,
          error: data.health?.error || 'Error al conectar'
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
      const res = await fetch('/api/import-from-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo extraer la información del enlace proporcionado.');
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
      const res = await fetch('/api/generate-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, category: aiCategory }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al comunicarse con la IA Gemini');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-5xl bg-[#fdfcf8] dark:bg-black border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-black text-white px-6 py-5 flex items-center justify-between border-b-4 border-black dark:border-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-600 flex items-center justify-center font-black text-white border-2 border-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black font-display uppercase tracking-tighter text-white flex items-center gap-2">
                Panel de Administración de Noticias
              </h2>
              <p className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                Concello de Vilanova de Arousa • Gestión de Contenidos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 border-2 border-white bg-rose-600 text-white font-black hover:bg-rose-700 transition"
            title="Cerrar Panel"
          >
            <X className="w-6 h-6" />
          </button>
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


        {/* Global Save to Code Direct Action Banner */}
        <div className="bg-amber-300 text-black px-6 py-3 border-b-4 border-black flex flex-wrap items-center justify-between gap-3 text-xs font-bold uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-black" />
            <span>
              <strong>Guardado en Código:</strong> Las noticias modificadas se guardan en <code className="bg-black text-white px-1.5 py-0.5 font-mono">src/data/news.json</code>.
            </span>
          </div>

          <button
            onClick={onSaveToCodeDirectly}
            disabled={isSavingToCode}
            className={`flex items-center gap-2 px-4 py-1.5 border-2 border-black font-black text-xs uppercase tracking-widest transition ${
              lastSaveSuccess === true 
                ? 'bg-emerald-500 text-black' 
                : 'bg-black text-white hover:bg-rose-600'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSavingToCode ? 'animate-spin' : ''}`} />
            {isSavingToCode ? 'Escribiendo archivo news.json...' : 'Guardar Todo en Código'}
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-200 dark:bg-slate-900 px-6 pt-3 flex border-b-4 border-black dark:border-white overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('order')}
            className={`px-4 py-2.5 font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black dark:border-white transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'order'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-white text-black dark:bg-slate-800 dark:text-white hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            Organizar Posiciones ({newsList.length})
          </button>

          <button
            onClick={() => {
              handleResetForm();
              setActiveTab('create');
            }}
            className={`px-4 py-2.5 font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black dark:border-white transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'create'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-white text-black dark:bg-slate-800 dark:text-white hover:bg-slate-100'
            }`}
          >
            <Plus className="w-4 h-4" />
            {editingItem ? 'Editar Noticia' : 'Agregar Nueva Noticia'}
          </button>

          <button
            onClick={() => setActiveTab('link')}
            className={`px-4 py-2.5 font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black dark:border-white transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'link'
                ? 'bg-amber-300 text-black font-black'
                : 'bg-white text-black dark:bg-slate-800 dark:text-white hover:bg-slate-100'
            }`}
          >
            <LinkIcon className="w-4 h-4 text-rose-600" />
            Pegar Link Noticia 🔗
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2.5 font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black dark:border-white transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'ai'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-white text-black dark:bg-slate-800 dark:text-white hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Redactor IA
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2.5 font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black dark:border-white transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'code'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-white text-black dark:bg-slate-800 dark:text-white hover:bg-slate-100'
            }`}
          >
            <Code className="w-4 h-4" />
            Exportar TS
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: REORDER & POSITION MANAGEMENT */}
          {activeTab === 'order' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                <span>Las noticias se muestran en la portada según su <strong>Posición (1, 2, 3...)</strong>.</span>
                <span>Usa las flechas ▲ ▼ para cambiar el orden fácilmente.</span>
              </div>

              <div className="space-y-3">
                {newsList.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-4 border-2 border-black dark:border-white transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                      index === 0
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
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-black text-white dark:bg-white dark:text-black text-[10px] font-black px-2 py-0.5 border border-black uppercase tracking-wider">
                            {item.category}
                          </span>
                          {index === 0 && (
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
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-2 border border-black dark:border-white bg-white dark:bg-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-30 text-black dark:text-white font-bold transition"
                        title="Subir posición"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === newsList.length - 1}
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
                ))}
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

              {/* Category, Position, Read Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Categoría
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as Category)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:white focus:ring-2 focus:ring-rose-500 outline-none"
                  >
                    <option value="Todas">Todas</option>
                    <option value="Alcaldía">Alcaldía</option>
                    <option value="Municipal">Municipal</option>
                  </select>
                </div>

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
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Categoría sugerida
                  </label>
                  <select
                    value={aiCategory}
                    onChange={(e) => setAiCategory(e.target.value as Category)}
                    className="w-full sm:w-1/2 px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Todas">Todas</option>
                    <option value="Alcaldía">Alcaldía</option>
                    <option value="Municipal">Municipal</option>
                  </select>
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
