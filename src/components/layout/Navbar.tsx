import React from 'react';
import { useApp } from '../../context/AppContext';
import { PWAInstallButton } from '../ui/PWAInstallButton';
import { Tooltip } from '../ui/Tooltip';
import { LogOut, ShoppingBag, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, navigate, logout, totalPendingApprovals } = useApp();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:bg-indigo-700 transition-colors">
              G
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
              GuberSmart
            </span>
          </button>
        </div>

        {/* Action Controls & Session State */}
        <div className="flex items-center gap-2.5">
          <PWAInstallButton />

          {currentUser.role === 'member' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/member')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Member Area</span>
              </button>
              <Tooltip content="Keluar Akun">
                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          )}

          {currentUser.role === 'admin' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Panel Admin</span>
                {totalPendingApprovals > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full">
                    {totalPendingApprovals}
                  </span>
                )}
              </button>
              <Tooltip content="Keluar Admin">
                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  aria-label="Logout Admin"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

