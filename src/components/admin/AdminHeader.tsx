import React from 'react';
import { useApp } from '../../context/AppContext';
import { PWAInstallButton } from '../ui/PWAInstallButton';
import { UserCheck } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  actionButton,
}) => {
  const { currentUser } = useApp();

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4">
      {/* Breadcrumb / Title */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-500">Admin</span>
        <span className="text-slate-300">/</span>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
      </div>

      {/* Actions & Profile */}
      <div className="flex items-center gap-3">
        {actionButton}
        <PWAInstallButton />
        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs">
          <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-semibold">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-800">{currentUser.name || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
};
