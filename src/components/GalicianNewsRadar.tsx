import React, { useState, useEffect } from 'react';
import { 
  Radio, RefreshCw, CheckCircle2, XCircle, ExternalLink, Plus, Sparkles, 
  Clock, Globe, Filter, Search, Check, AlertCircle, Newspaper, ArrowRight,
  ShieldCheck, Eye, Layers, Settings, Calendar, Award, ChevronDown, ChevronUp
} from 'lucide-react';
import { MonitoredNewsItem, MonitoringSettings, Category, CATEGORIES_LIST, DEFAULT_MONITORED_SOURCES, NewsItem } from '../types';
import { safeFetchJson } from '../utils/apiHelper';

interface GalicianNewsRadarProps {
  onNewsAddedToOfficial: (newOfficialNews: NewsItem[]) => void;
  onRefreshOfficialNews: () => Promise<void>;
}

export const GalicianNewsRadar: React.FC<GalicianNewsRadarProps> = ({
  onNewsAddedToOfficial,
  onRefreshOfficialNews
}) => {
  const [items, setItems] = useState<MonitoredNewsItem[]>([]);
  const [settings, setSettings] = useState<MonitoringSettings>({
    isEnabled: true,
    intervalHours: 12,
    keywords: 'Gonzalo Durán, Alcalde de Vilanova de Arousa, Concello de Vilanova de Arousa',
    monitoredSources: DEFAULT_MONITORED_SOURCES
  });
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, dismissed: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'dismissed'>('pending');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Approval Modal State
  const [approvingItem, setApprovingItem] = useState<MonitoredNewsItem | null>(null);
  const [approvalCategory, setApprovalCategory] = useState<Category>('Alcaldía');
  const [approvalIsBreaking, setApprovalIsBreaking] = useState<boolean>(false);
  const [approvalIsHero, setApprovalIsHero] = useState<boolean>(false);
  const [approvalPosition, setApprovalPosition] = useState<number>(1);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // Settings view toggle
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);

  // Expanded articles for reading
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const fetchMonitoringData = async () => {
    setIsLoading(true);
    try {
      const data = await safeFetchJson('/api/monitoring/news');
      if (data && data.success) {
        setItems(data.items || []);
        if (data.stats) setStats(data.stats);
        if (data.settings) setSettings(data.settings);
      }
    } catch (err: any) {
      console.error('Error fetching monitoring data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  const handleScanNow = async () => {
    setIsScanning(true);
    setMessage({ type: 'info', text: 'Rastreando medios gallegos en busca de noticias sobre Gonzalo Durán...' });
    try {
      const res = await safeFetchJson('/api/monitoring/scan', { method: 'POST' });
      if (res && res.success) {
        setMessage({ 
          type: 'success', 
          text: `Escaneo completado. ${res.newCount !== undefined ? res.newCount : 'Se'} detectaron noticias en prensa gallega.` 
        });
        await fetchMonitoringData();
      } else {
        setMessage({ type: 'error', text: res?.error || 'Error al ejecutar el escaneo' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error en la conexión con el escáner' });
    } finally {
      setIsScanning(false);
    }
  };

  const handleOpenApprovalModal = (item: MonitoredNewsItem) => {
    setApprovingItem(item);
    setApprovalCategory(item.category || 'Alcaldía');
    setApprovalIsBreaking(false);
    setApprovalIsHero(false);
    setApprovalPosition(1);
  };

  const handleConfirmApproval = async () => {
    if (!approvingItem) return;
    setIsPublishing(true);
    try {
      const res = await safeFetchJson('/api/monitoring/approve-and-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: approvingItem.id,
          customCategory: approvalCategory,
          isBreaking: approvalIsBreaking,
          isHero: approvalIsHero,
          position: approvalPosition
        })
      });

      if (res && res.success) {
        setMessage({
          type: 'success',
          text: `¡Noticia agregada con éxito! Se ha publicado en el portal oficial en categoría "${approvalCategory}".`
        });
        setApprovingItem(null);
        await fetchMonitoringData();
        await onRefreshOfficialNews();
      } else {
        setMessage({ type: 'error', text: res?.error || 'No se pudo agregar la noticia' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al publicar la noticia' });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleQuickDismiss = async (id: string) => {
    try {
      const res = await safeFetchJson('/api/monitoring/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'dismissed' })
      });
      if (res && res.success) {
        setItems(prev => prev.map(item => item.id === id ? { ...item, status: 'dismissed' } : item));
        setStats(prev => ({ ...prev, pending: Math.max(0, prev.pending - 1), dismissed: prev.dismissed + 1 }));
      }
    } catch (err: any) {
      console.error('Error dismissing item:', err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await safeFetchJson('/api/monitoring/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      if (res && res.success) {
        setMessage({ type: 'success', text: 'Ajustes del radar de prensa guardados correctamente.' });
        setShowSettings(false);
      } else {
        setMessage({ type: 'error', text: res?.error || 'Error al guardar los ajustes' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al guardar ajustes' });
    } finally {
      setSavingSettings(false);
    }
  };

  // Filtered list
  const filteredItems = items.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (sourceFilter !== 'all' && !item.sourceMedia.toLowerCase().includes(sourceFilter.toLowerCase())) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSub = (item.subtitle || '').toLowerCase().includes(q);
      const matchSource = item.sourceMedia.toLowerCase().includes(q);
      const matchQuote = (item.highlightPhrase || '').toLowerCase().includes(q);
      if (!matchTitle && !matchSub && !matchSource && !matchQuote) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Alert / Status */}
      {message && (
        <div className={`p-4 rounded-xl border-2 font-bold flex items-center justify-between gap-3 ${
          message.type === 'success' ? 'bg-emerald-100 border-emerald-500 text-emerald-950 dark:bg-emerald-950/80 dark:text-emerald-100' :
          message.type === 'error' ? 'bg-rose-100 border-rose-500 text-rose-950 dark:bg-rose-950/80 dark:text-rose-100' :
          'bg-blue-100 border-blue-500 text-blue-950 dark:bg-blue-950/80 dark:text-blue-100'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> :
             message.type === 'error' ? <XCircle className="w-5 h-5 text-rose-600 shrink-0" /> :
             <RefreshCw className="w-5 h-5 text-blue-600 animate-spin shrink-0" />}
            <span className="text-sm">{message.text}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setMessage(null)}
            className="text-xs font-black px-2 py-1 bg-black/10 rounded hover:bg-black/20"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Main Radar Card Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border-4 border-black p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Radio className="w-48 h-48 text-indigo-400" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white text-xs font-black uppercase tracking-wider rounded-full shadow">
                <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-300" />
                Radar Gallego Automático
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold rounded-full">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Revisión programada: Cada 12 Horas
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-tight">
              Monitoreo de Noticias Gallegas: <span className="text-cyan-300">Gonzalo Durán</span>
            </h2>

            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              El sistema rastrea de forma continua y cada 12 horas todos los medios de comunicación y periódicos de Galicia buscando cualquier mención al Alcalde de Vilanova de Arousa. Tú decides con un solo clic si deseas agregar la noticia al portal oficial o descartarla.
            </p>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-300 pt-1">
              <span>Palabras Clave:</span>
              <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-cyan-200">
                "{settings.keywords}"
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleScanNow}
              disabled={isScanning}
              className={`px-5 py-3 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 border-2 transition ${
                isScanning 
                  ? 'bg-indigo-700 text-indigo-200 border-indigo-500 cursor-wait'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-300 active:scale-95'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Rastreando Medios...' : 'Escanear Ahora 🚀'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider border border-slate-600 flex items-center justify-center gap-2 transition"
            >
              <Settings className="w-4 h-4 text-slate-300" />
              <span>{showSettings ? 'Ocultar Ajustes' : 'Ajustes Radar'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Status Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pendientes de Revisión</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{stats.pending}</div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aprobadas / En Web</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{stats.approved}</div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Descartadas</div>
            <div className="text-2xl font-black text-slate-400 mt-1">{stats.dismissed}</div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Detectadas</div>
            <div className="text-2xl font-black text-cyan-300 mt-1">{stats.total}</div>
          </div>
        </div>
      </div>

      {/* Settings Panel (Collapsible) */}
      {showSettings && (
        <form onSubmit={handleSaveSettings} className="bg-slate-100 dark:bg-slate-900 p-6 rounded-2xl border-4 border-black space-y-4">
          <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            Configuración del Monitoreo Automático Cada 12 Horas
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Frecuencia del Escaneo Automático
              </label>
              <select
                value={settings.intervalHours}
                onChange={e => setSettings({ ...settings, intervalHours: parseInt(e.target.value, 10) })}
                className="w-full p-2.5 bg-white dark:bg-slate-800 border-2 border-black rounded-lg font-bold text-sm"
              >
                <option value={6}>Cada 6 Horas (Alta Frecuencia)</option>
                <option value={12}>Cada 12 Horas (Recomendado)</option>
                <option value={24}>Cada 24 Horas (Una vez al día)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Estado del Escáner en Segundo Plano
              </label>
              <div className="flex items-center gap-3 mt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-sm">
                  <input
                    type="checkbox"
                    checked={settings.isEnabled}
                    onChange={e => setSettings({ ...settings, isEnabled: e.target.checked })}
                    className="w-5 h-5 accent-emerald-600 rounded"
                  />
                  <span>Activar escáner automático en segundo plano</span>
                </label>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Palabras Clave de Detección en Medios Gallegos
              </label>
              <input
                type="text"
                value={settings.keywords}
                onChange={e => setSettings({ ...settings, keywords: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-800 border-2 border-black rounded-lg font-mono text-sm"
                placeholder="Gonzalo Durán, Alcalde de Vilanova de Arousa..."
              />
              <p className="text-xs text-slate-500 mt-1">
                El sistema rastreará periódicos gallegos buscando noticias que coincidan con estos términos.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Medios y Periódicos Gallegos Monitoreados:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DEFAULT_MONITORED_SOURCES.map((source, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="truncate">{source}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-300 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="px-4 py-2 border-2 border-black bg-slate-200 dark:bg-slate-800 font-bold text-xs rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savingSettings}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-lg border-2 border-black flex items-center gap-2 shadow"
            >
              <Check className="w-4 h-4" />
              <span>{savingSettings ? 'Guardando...' : 'Guardar Ajustes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border-2 border-black flex flex-wrap items-center justify-between gap-4 shadow-sm">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition border ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-black border-black shadow'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200'
            }`}
          >
            🟡 Pendientes ({stats.pending})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition border ${
              statusFilter === 'approved'
                ? 'bg-emerald-600 text-white border-black shadow'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200'
            }`}
          >
            🟢 Aprobadas ({stats.approved})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('dismissed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition border ${
              statusFilter === 'dismissed'
                ? 'bg-slate-900 text-white border-black shadow'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200'
            }`}
          >
            ⚪ Descartadas ({stats.dismissed})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition border ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white border-black shadow'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200'
            }`}
          >
            Todas ({items.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar en noticias detectadas..."
              className="w-full pl-9 pr-3 py-1.5 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* News List */}
      {isLoading ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border-2 border-black">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
            Cargando noticias monitoreadas de medios gallegos...
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border-2 border-black space-y-4">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-950/60 rounded-full flex items-center justify-center mx-auto text-indigo-600">
            <Newspaper className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-base font-black text-slate-900 dark:text-white">
              {statusFilter === 'pending' ? 'No hay noticias pendientes de revisión' : 'No se encontraron noticias'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Haz clic en "Escanear Ahora" para rastrear las últimas publicaciones de la prensa gallega sobre Gonzalo Durán.
            </p>
          </div>
          <button
            type="button"
            onClick={handleScanNow}
            disabled={isScanning}
            className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg border-2 border-black shadow hover:bg-indigo-700"
          >
            Escanear Medios Gallegos Ahora 🚀
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map(item => {
            const isExpanded = expandedIds.has(item.id);
            return (
              <div 
                key={item.id} 
                className={`bg-white dark:bg-slate-800 rounded-2xl border-2 transition-all shadow-md overflow-hidden ${
                  item.status === 'pending' ? 'border-amber-400 dark:border-amber-500' :
                  item.status === 'approved' ? 'border-emerald-500 dark:border-emerald-600 opacity-90' :
                  'border-slate-300 dark:border-slate-700 opacity-60'
                }`}
              >
                {/* Header Bar */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left: Thumbnail & Core Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {item.imageUrl && (
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 border-2 border-black shadow-sm bg-slate-100 relative group">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    <div className="space-y-2 flex-1 min-w-0">
                      {/* Media & Tag Bar */}
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="px-2.5 py-0.5 bg-slate-900 text-white font-black rounded-md tracking-wider">
                          📰 {item.sourceMedia}
                        </span>

                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 font-bold rounded-md">
                          🏷️ {item.category || 'Alcaldía'}
                        </span>

                        <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.publishedDate}
                        </span>

                        {item.status === 'approved' && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black rounded-md text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> AGREGADA A LA WEB
                          </span>
                        )}

                        {item.status === 'dismissed' && (
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 font-bold rounded-md text-[11px]">
                            DESCARTADA
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-serif leading-snug">
                        {item.title}
                      </h3>

                      {/* Subtitle */}
                      {item.subtitle && (
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                          {item.subtitle}
                        </p>
                      )}

                      {/* Highlight Mention Quote Box */}
                      {item.highlightPhrase && (
                        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 rounded-r-lg text-xs text-amber-900 dark:text-amber-200 font-medium italic">
                          <span className="font-bold uppercase not-italic text-[10px] text-amber-700 dark:text-amber-400 block mb-0.5">
                            ⚡ Mención al Alcalde Gonzalo Durán:
                          </span>
                          "{item.highlightPhrase}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-slate-700">
                    <a
                      href={item.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                      title="Abrir noticia original en el periódico"
                    >
                      <span>Ver Fuente Original</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {item.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuickDismiss(item.id)}
                          className="px-3 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition"
                          title="Descartar noticia"
                        >
                          Descartar
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenApprovalModal(item)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black shadow-md flex items-center gap-1.5 transition active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                          <span>¿Agregar a la Web?</span>
                        </button>
                      </div>
                    )}

                    {item.status === 'dismissed' && (
                      <button
                        type="button"
                        onClick={() => handleOpenApprovalModal(item)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition"
                      >
                        Reactivar & Agregar
                      </button>
                    )}
                  </div>
                </div>

                {/* Collapsible Content Bar */}
                <div className="px-5 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.id)}
                    className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 font-bold flex items-center gap-1"
                  >
                    <span>{isExpanded ? 'Ocultar texto completo' : 'Leer artículo completo extraído'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <span className="text-[11px] text-slate-400">
                    Detectado: {new Date(item.detectedAt).toLocaleDateString('es-ES')}
                  </span>
                </div>

                {/* Expanded Article Body */}
                {isExpanded && (
                  <div className="p-5 bg-slate-100 dark:bg-slate-900/80 border-t border-slate-300 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                    {item.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Approval & Publishing Confirmation Modal */}
      {approvingItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border-4 border-black rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-xl">
                  <CheckCircle2 className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">
                    Confirmar Adición al Portal Oficial
                  </h3>
                  <p className="text-xs text-slate-500">
                    Fuente: {approvingItem.sourceMedia}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setApprovingItem(null)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Article Summary Box */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <h4 className="font-black text-sm text-slate-900 dark:text-white font-serif">
                {approvingItem.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                {approvingItem.subtitle || approvingItem.content}
              </p>
            </div>

            {/* Publishing Customization Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  1. Categoría Municipal para la Noticia
                </label>
                <select
                  value={approvalCategory}
                  onChange={e => setApprovalCategory(e.target.value as Category)}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border-2 border-black rounded-xl font-bold text-sm"
                >
                  {CATEGORIES_LIST.filter(c => c.id !== 'Todas').map(c => (
                    <option key={c.id} value={c.id}>
                      {c.label} ({c.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    2. Posición en la Portada
                  </label>
                  <select
                    value={approvalPosition}
                    onChange={e => setApprovalPosition(parseInt(e.target.value, 10))}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border-2 border-black rounded-xl font-bold text-sm"
                  >
                    <option value={1}>Posición 1 (Cabecera / Destacada)</option>
                    <option value={2}>Posición 2 (Primera Fila)</option>
                    <option value={3}>Posición 3 (Primera Fila)</option>
                    <option value={4}>Posición 4 (Segunda Fila)</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end space-y-2 pt-2 sm:pt-0">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={approvalIsBreaking}
                      onChange={e => setApprovalIsBreaking(e.target.checked)}
                      className="w-4 h-4 accent-rose-600 rounded"
                    />
                    <span>🔴 Destacar en Cintillo (Última Hora)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={approvalIsHero}
                      onChange={e => setApprovalIsHero(e.target.checked)}
                      className="w-4 h-4 accent-indigo-600 rounded"
                    />
                    <span>⭐ Convertir en Noticia Hero Principal</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black">
              <button
                type="button"
                onClick={() => setApprovingItem(null)}
                className="px-4 py-2.5 border-2 border-black bg-slate-200 dark:bg-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-300"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmApproval}
                disabled={isPublishing}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black shadow-lg flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{isPublishing ? 'Publicando en Portal...' : 'Sí, Agregar al Portal Oficial 🚀'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
