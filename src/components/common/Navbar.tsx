import React, { useState, useEffect } from 'react';
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
  WifiOff,
  LogIn,
} from 'lucide-react';

interface NavbarProps {
  cms: CMSSettings;
  currentPath: string;
  role: Role;
  isOnline: boolean;
  canInstall: boolean;
  onNavigate: (path: string) => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onInstall: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cms,
  currentPath,
  role,
  isOnline,
  canInstall,
  onNavigate,
  onOpenLogin,
  onLogout,
  onInstall,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setIsOpen(false);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home':
        return <Home className="w-5 h-5" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5" />;
      case 'LayoutGrid':
        return <LayoutGrid className="w-5 h-5" />;
      case 'Info':
        return <Info className="w-5 h-5" />;
      case 'MessageCircle':
        return <MessageCircle className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
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
    <header className="sticky top-0 z-40 w-full h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left Side: Hamburger (Mobile) + Brand / Logo */}
        <div className="flex items-center gap-2">
          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-11 h-11 -ml-1.5 flex items-center justify-center rounded-[12px] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Brand / Logo */}
          <button
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-2.5 focus:outline-none group text-left"
          >
            <div className="w-9 h-9 rounded-[10px] bg-[#0B2A5B] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform overflow-hidden shrink-0">
              {cms.identity.logoUrl ? (
                <img src={cms.identity.logoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="font-heading font-bold text-lg text-[#FF7A1A]">G</span>
              )}
            </div>
            <span className="font-heading font-bold text-lg text-[#0B2A5B] dark:text-white tracking-tight">
              {cms.identity.appName}
            </span>
          </button>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                className={`px-3.5 py-2 text-sm font-semibold rounded-[12px] transition-colors ${
                  isActive
                    ? 'text-[#0B2A5B] bg-slate-100 dark:text-white dark:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {/* PWA Install Button */}
          {canInstall && (
            <button
              onClick={onInstall}
              className="px-3.5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[12px] flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-[#FF7A1A]" />
              Pasang Aplikasi
            </button>
          )}

          {/* Offline Badge */}
          {!isOnline && (
            <div className="ml-2 px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs font-semibold rounded-full flex items-center gap-1">
              <WifiOff className="w-3.5 h-3.5" />
              Offline
            </div>
          )}

          {/* Auth Actions (Desktop) */}
          <div className="ml-4 pl-4 border-l border-slate-200 dark:border-slate-800 flex items-center gap-2">
            {role === 'Publik' ? (
              <button
                onClick={onOpenLogin}
                className="h-10 px-5 text-sm font-semibold text-white bg-[#0B2A5B] hover:bg-[#1E4FA8] rounded-[14px] transition-all shadow-xs active:scale-[0.98]"
              >
                Masuk
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleNavClick(getDashboardPath())}
                  className="h-10 px-4 text-sm font-semibold text-white bg-[#0B2A5B] hover:bg-[#1E4FA8] rounded-[14px] flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dasbor
                </button>
                <button
                  onClick={onLogout}
                  className="h-10 px-3 text-sm font-semibold text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[14px] transition-colors"
                  aria-label="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Controls Right */}
        <div className="flex items-center gap-2 md:hidden">
          {!isOnline && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs font-semibold rounded-md flex items-center gap-1">
              <WifiOff className="w-3 h-3" />
              Offline
            </span>
          )}
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 top-16 bg-black/50 z-40 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer (Width ~85%, slides from left) */}
      <div
        className={`fixed top-16 left-0 h-[calc(100dvh-4rem)] w-[85%] max-w-[340px] bg-white dark:bg-slate-900 z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out md:hidden border-r border-slate-200 dark:border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Unified Scrollable list */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-2 pb-12">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                className={`w-full min-h-[48px] px-3.5 rounded-[14px] flex items-center gap-3 text-base font-semibold transition-colors text-left ${
                  isActive
                    ? 'text-white bg-[#0B2A5B]'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {getIcon(item.icon)}
                {item.label}
              </button>
            );
          })}

          {canInstall && (
            <button
              onClick={() => {
                onInstall();
                setIsOpen(false);
              }}
              className="w-full min-h-[48px] px-3.5 rounded-[14px] flex items-center gap-3 text-base font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
            >
              <Download className="w-5 h-5 text-[#FF7A1A]" />
              Pasang Aplikasi
            </button>
          )}

          {/* Integrated Masuk / Dasbor / Keluar item directly in the navigation list */}
          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {role === 'Publik' ? (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenLogin();
                }}
                className="w-full min-h-[48px] px-3.5 rounded-[14px] flex items-center gap-3 text-base font-semibold text-white bg-[#FF7A1A] hover:bg-[#E56A10] transition-all shadow-xs active:scale-[0.98] text-left"
              >
                <LogIn className="w-5 h-5" />
                Masuk
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleNavClick(getDashboardPath())}
                  className={`w-full min-h-[48px] px-3.5 rounded-[14px] flex items-center gap-3 text-base font-semibold transition-colors text-left ${
                    currentPath.startsWith('/admin') || currentPath.startsWith('/member')
                      ? 'text-white bg-[#0B2A5B]'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dasbor
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onLogout();
                  }}
                  className="w-full min-h-[48px] px-3.5 rounded-[14px] flex items-center gap-3 text-base font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-[14px] transition-colors text-left"
                >
                  <LogOut className="w-5 h-5" />
                  Keluar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

