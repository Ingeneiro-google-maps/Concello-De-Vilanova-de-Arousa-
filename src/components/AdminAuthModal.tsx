import React, { useState } from 'react';
import { Lock, KeyRound, X, ShieldAlert, ArrowRight } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '8069987') {
      setError(false);
      setPassword('');
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-gray-950 border-2 border-gray-900 dark:border-gray-100 shadow-2xl p-6 sm:p-8 space-y-6 rounded-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 text-white flex items-center justify-center rounded">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold font-serif tracking-tight text-gray-900 dark:text-white">
                Acceso de Administración
              </h3>
              <p className="text-xs font-sans-ui text-gray-500 uppercase tracking-wider">
                Concello de Vilanova de Arousa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-red-600 hover:text-white transition rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-red-600" />
              Ingresa la Clave de Administrador:
            </label>
            <input
              type="password"
              autoFocus
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-base font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:border-red-600 rounded-sm"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-600 text-white flex items-center gap-2 text-xs font-bold uppercase tracking-wide rounded-sm">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Clave incorrecta. Inténtalo de nuevo.</span>
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold text-xs uppercase tracking-wider hover:bg-gray-200 transition rounded-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-2/3 py-2.5 bg-[#c20000] hover:bg-black text-white font-bold text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 rounded-sm"
            >
              Acceder al Panel
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

