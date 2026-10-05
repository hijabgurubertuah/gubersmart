import React from 'react';
import { CMSSettings } from '../../types';

interface FooterProps {
  cms: CMSSettings;
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="w-full bg-[#0B2A5B] text-slate-300 py-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs sm:text-sm text-slate-300 font-medium">
        Copyright : 2026 Guber Smart.
      </div>
    </footer>
  );
};
