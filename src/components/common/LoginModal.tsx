import React, { useState } from 'react';
import { Eye, EyeOff, X, Loader2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: string) => void;
  onLogin: (password: string) => { success: boolean; role?: string; message?: string };
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess, onLogin }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Kata sandi wajib diisi');
      return;
    }
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = onLogin(password);
      setIsLoading(false);
      if (res.success && res.role) {
        setPassword('');
        setError(null);
        onSuccess(res.role);
        onClose();
      } else {
        setError(res.message || 'Kata sandi salah');
      }
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[14px] shadow-2xl border border-slate-100 dark:border-slate-800 p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold font-heading text-[#0B2A5B] dark:text-white">
            Masuk
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Kata Sandi *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                className={`w-full h-12 px-3.5 pr-11 text-base bg-slate-50 dark:bg-slate-800/80 border rounded-[14px] text-slate-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40 focus:border-[#FF7A1A] ${
                  error ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                }`}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {error && (
              <p className="mt-1.5 text-sm font-medium text-rose-600 dark:text-rose-400">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 mt-2 flex items-center justify-center font-semibold text-white bg-[#FF7A1A] hover:bg-[#E56A10] active:scale-[0.99] rounded-[14px] transition-all shadow-md hover:shadow-lg disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
};
