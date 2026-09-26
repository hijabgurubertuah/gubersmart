import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Package,
  Inbox,
  MessageSquareQuote,
  Settings,
  ArrowLeft,
  LogOut,
  FolderOpen,
} from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

export const AdminSidebar: React.FC = () => {
  const {
    currentRoute,
    navigate,
    products,
    logout,
    totalPendingApprovals,
    getPendingCountByProduct,
  } = useApp();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      badge: 0,
    },
    {
      id: 'products',
      label: 'Kelola Produk',
      path: '/admin/produk',
      icon: Package,
      badge: 0,
    },
    {
      id: 'orders',
      label: 'Pesanan & Approval',
      path: '/admin/pesanan',
      icon: Inbox,
      badge: totalPendingApprovals,
    },
    {
      id: 'testimonials',
      label: 'Testimoni',
      path: '/admin/testimoni',
      icon: MessageSquareQuote,
      badge: 0,
    },
    {
      id: 'settings',
      label: 'Pengaturan',
      path: '/admin/pengaturan',
      icon: Settings,
      badge: 0,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
            G
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight leading-tight">
              GuberSmart
            </h1>
            <span className="text-[11px] text-slate-400 font-mono">Panel Admin</span>
          </div>
        </div>
      </div>

      {/* Main Nav Items */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-3 mb-2">
          Menu Utama
        </div>
        {navItems.map((item) => {
          const isActive = currentRoute === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-500 text-slate-950 rounded-full tabular-nums">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Product Pending Approval Status Badges */}
        <div className="pt-5 pb-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-3 mb-2 flex items-center justify-between">
            <span>Antrean Produk</span>
            <FolderOpen className="w-3 h-3 text-slate-500" />
          </div>
          <div className="space-y-1">
            {products.map((prod) => {
              const pendingCount = getPendingCountByProduct(prod.id);
              return (
                <button
                  key={prod.id}
                  onClick={() => navigate('/admin/pesanan')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors cursor-pointer text-left"
                >
                  <span className="truncate pr-2">{prod.name}</span>
                  {pendingCount > 0 ? (
                    <Tooltip content={`${pendingCount} pesanan menunggu approval`}>
                      <span className="px-1.5 py-0.2 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full tabular-nums shrink-0">
                        {pendingCount}
                      </span>
                    </Tooltip>
                  ) : (
                    <span className="text-[10px] text-slate-600 font-mono shrink-0">0</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer / Quick Navigation */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
          <span>Lihat Website</span>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
};
