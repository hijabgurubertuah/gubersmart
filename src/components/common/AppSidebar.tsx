import React, { useEffect, useRef } from 'react';
import { CMSSettings, Role } from '../../types';
import {
  Menu,
  X,
  Home,
  BookOpen,
  LayoutGrid,
  Info,
  MessageCircle,
  LayoutDashboard,
  LogOut,
  Download,
  LogIn,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  cms: CMSSettings;
  currentPath: string;
  role: Role;
  canInstall: boolean;
  onNavigate: (path: string) => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onInstall: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isOpen,
  onClose,
  onOpen,
  cms,
  currentPath,
  role,
  canInstall,
  onNavigate,
  onOpenLogin,
  onLogout,
  onInstall,
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close on Escape key & Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      const handlePointerDownOutside = (e: MouseEvent | TouchEvent) => {
        if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handlePointerDownOutside);
      document.addEventListener('touchstart', handlePointerDownOutside);

      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('mousedown', handlePointerDownOutside);
        document.removeEventListener('touchstart', handlePointerDownOutside);
      };
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleItemClick = (path: string) => {
    onNavigate(path);
    onClose();
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home':
        return <Home className="w-4 h-4" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4" />;
      case 'LayoutGrid':
        return <LayoutGrid className="w-4 h-4" />;
      case 'Info':
        return <Info className="w-4 h-4" />;
      case 'MessageCircle':
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  const navItems = cms.navigation
    .filter((item) => item.isVisible)
    .sort((a, b) => a.order - b.order);

  const getDashboardPath = () => {
    if (role === 'Superadmin' || role === 'Admin') return '/admin';
    return '/member';
  };

  return (
    <>
      {/* 1. Floating Hamburger Tab (Kiri Tengah Layar HP - Ukuran 120px x 30px) */}
      {!isOpen && (
        <button
          type="button"
          onClick={onOpen}
          aria-label="Buka Menu Sidebar"
          className="fixed left-0 top-1/2 -translate-y-1/2 z-40 md:hidden w-[30px] h-[120px] bg-[#0B2A5B]/95 hover:bg-[#0B2A5B] text-white rounded-r-[14px] shadow-2xl border-y border-r border-slate-600/50 backdrop-blur-md flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 group focus:outline-none"
        >
          <Menu className="w-4 h-4 text-[#FF7A1A] group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-extrabold tracking-widest text-slate-200 [writing-mode:vertical-lr] rotate-180 uppercase select-none">
            MENU
          </span>
        </button>
      )}

      {/* 2. Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* 3. Minimalist Off-Canvas Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar Menu Navigasi"
      >
        {/* Sidebar Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-[#0B2A5B] flex items-center justify-center text-white overflow-hidden shrink-0">
              {cms.identity.logoUrl && cms.identity.logoUrl.trim() !== '' ? (
                <img src={cms.identity.logoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="font-heading font-bold text-sm text-[#FF7A1A]">G</span>
              )}
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-[#0B2A5B] dark:text-white leading-tight">
                {cms.identity.appName || 'Guber Smart'}
              </h3>
              <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                {cms.identity.tagline}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors"
            aria-label="Tutup menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Unified Scrollable Menu List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
            Navigasi Utama
          </div>

          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.path)}
                className={`w-full min-h-[44px] px-3.5 rounded-[12px] flex items-center justify-between text-sm font-semibold transition-colors text-left ${
                  isActive
                    ? 'text-white bg-[#0B2A5B] shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-[#FF7A1A]' : 'text-slate-400'}>
                    {getIcon(item.icon)}
                  </span>
                  <span>{item.label}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white/60' : 'text-slate-300 dark:text-slate-600'}`} />
              </button>
            );
          })}

          {/* Additional CMS Pages if available */}
          {cms.pages && cms.pages.filter((p) => p.isVisible).length > 0 && (
            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
                Informasi & Panduan
              </div>
              {cms.pages
                .filter((p) => p.isVisible)
                .map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleItemClick(`/halaman/${p.slug}`)}
                    className="w-full min-h-[38px] px-3.5 rounded-[10px] flex items-center gap-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <span>•</span>
                    <span className="truncate">{p.title}</span>
                  </button>
                ))}
            </div>
          )}

          {/* PWA Install Button */}
          {canInstall && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onInstall();
                  onClose();
                }}
                className="w-full min-h-[44px] px-3.5 rounded-[12px] flex items-center gap-3 text-sm font-semibold text-[#1E4FA8] dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-left"
              >
                <Download className="w-4 h-4 text-[#FF7A1A]" />
                <span>Pasang Aplikasi (PWA)</span>
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Footer & Auth Button */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
          {role === 'Publik' ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLogin();
              }}
              className="w-full min-h-[44px] px-4 text-sm font-bold text-white bg-[#0B2A5B] hover:bg-[#1E4FA8] rounded-[12px] flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <LogIn className="w-4 h-4 text-[#FF7A1A]" />
              Masuk / Login
            </button>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleItemClick(getDashboardPath())}
                className="w-full min-h-[44px] px-4 text-sm font-bold text-white bg-[#0B2A5B] hover:bg-[#1E4FA8] rounded-[12px] flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-[#FF7A1A]" />
                Dasbor {role}
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="w-full min-h-[38px] px-3 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-[10px] flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar
              </button>
            </div>
          )}

          <div className="text-[10px] text-center text-slate-400 pt-1">
            {cms.footer.copyright || '© 2026 Guber Smart'}
          </div>
        </div>
      </aside>
    </>
  );
};
