import React from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings } = useApp();

  return (
    <footer className="w-full bg-white border-t border-slate-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-900">{settings.brandName}</span>
          <span aria-hidden="true">·</span>
          <span>gubersmart.my.id</span>
          <span aria-hidden="true">·</span>
          <span>&copy; {new Date().getFullYear()} Hak Cipta Dilindungi</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href={`https://wa.me/${settings.adminWhatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp Admin</span>
          </a>
          <a
            href={`mailto:${settings.adminEmail}`}
            className="inline-flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{settings.adminEmail}</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

