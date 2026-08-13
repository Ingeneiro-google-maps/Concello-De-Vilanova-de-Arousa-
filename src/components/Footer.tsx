import React, { useState, useEffect } from 'react';
import { Mail, Send, Lock, Code, Eye, TrendingUp } from 'lucide-react';
import { Category } from '../types';
import { CoatOfArmsLogo } from './CoatOfArmsLogo';

interface FooterProps {
  onSelectCategory: (category: Category) => void;
  onOpenAdmin: () => void;
  onSaveToCodeDirectly: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenAdmin,
  onSaveToCodeDirectly,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Counter logic: Starts at 30 visits base, increases by 23 visits every 3 hours
  const calculateVisits = () => {
    const ANCHOR_TIME = new Date('2026-01-01T00:00:00Z').getTime();
    const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
    const elapsed = Math.max(0, Date.now() - ANCHOR_TIME);
    const periods = Math.floor(elapsed / THREE_HOURS_MS);
    const BASE_VISITS = 30;
    return BASE_VISITS + (periods * 23);
  };

  const [visits, setVisits] = useState<number>(calculateVisits);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisits(calculateVisits());
    }, 10000); // Check every 10 seconds for rollover
    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-gray-950 text-white border-t-2 border-gray-900 transition-colors font-sans-ui text-xs">
      {/* Top Newsletter Section */}
      <div className="border-b border-gray-800 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-white font-serif tracking-tight flex items-center gap-2">
              <Mail className="w-5 h-5 text-red-500" />
              Boletín Oficial del Concello de Vilanova de Arousa
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Recibe las últimas informaciones y comunicados de la Alcaldía directamente en tu correo.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="email"
              required
              placeholder="tu.correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3.5 py-2 bg-gray-900 border border-gray-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 w-full sm:w-72 rounded-sm"
            />
            <button
              type="submit"
              className="bg-[#c20000] hover:bg-red-700 text-white font-bold px-4 py-2 text-xs uppercase tracking-wider transition shrink-0 flex items-center gap-1.5 rounded-sm"
            >
              <Send className="w-3.5 h-3.5" />
              {subscribed ? '¡Suscrito!' : 'Suscribirme'}
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Brand Column */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CoatOfArmsLogo className="w-8 h-10 shrink-0" />
            <span className="text-2xl font-black text-white font-serif font-newspaper tracking-tight">Concello De Vilanova de Arousa</span>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">
            Portal informativo oficial dedicado a la actualidad, comunicados e iniciativas del Alcalde de Vilanova de Arousa.
          </p>
        </div>

        {/* Corporate & Legal */}
        <div>
          <h4 className="font-bold text-red-500 uppercase tracking-wider mb-3 text-xs border-b border-gray-800 pb-1 font-serif">Información Municipal</h4>
          <ul className="space-y-1.5 text-gray-300">
            <li>Alcaldía & Gabinete de Prensa</li>
            <li>Aviso Legal & Transparencia</li>
            <li>Sede Electrónica Oficial</li>
            <li>Atención al Ciudadano</li>
          </ul>
        </div>

        {/* Admin Access & Code Persist */}
        <div>
          <h4 className="font-bold text-red-500 uppercase tracking-wider mb-3 text-xs border-b border-gray-800 pb-1 font-serif">Administración</h4>
          <p className="text-gray-400 text-xs leading-relaxed mb-3">
            Acceso protegido con clave para la gestión de informaciones y publicaciones.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={onOpenAdmin}
              className="flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white font-bold px-3 py-2 border border-gray-700 text-xs transition rounded-sm"
            >
              <Lock className="w-3.5 h-3.5 text-red-500" />
              <span>Panel de Administración</span>
            </button>

            <button
              onClick={onSaveToCodeDirectly}
              className="flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1.5 text-[11px] font-mono transition rounded-sm"
            >
              <Code className="w-3.5 h-3.5" />
              Guardar estado en news.json
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar with Visit Counter */}
      <div className="border-t border-gray-900 py-4 px-4 sm:px-8 text-center text-[11px] text-gray-500 bg-gray-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Concello de Vilanova de Arousa. Todos los derechos reservados.</p>

          {/* Live Visitor Counter Badge */}
          <div className="flex items-center gap-2.5 bg-gray-900/90 border border-gray-800 px-4 py-1.5 rounded-full text-xs text-gray-300 shadow-inner">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <Eye className="w-4 h-4 text-red-500 shrink-0" />
            <span className="font-semibold text-gray-300">Visitas al Portal:</span>
            <span className="font-mono font-black text-white text-sm tracking-wider">
              {visits.toLocaleString('es-ES')}
            </span>
          </div>

          <p>Portal Informativo Oficial de la Alcaldía</p>
        </div>
      </div>
    </footer>
  );
};


