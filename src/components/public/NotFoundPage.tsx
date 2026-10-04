import React from 'react';
import { Home } from 'lucide-react';

interface NotFoundPageProps {
  onBackHome: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onBackHome }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center space-y-4">
      <h1 className="text-4xl sm:text-5xl font-bold font-heading text-[#0B2A5B] dark:text-white">
        404
      </h1>
      <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 font-heading">
        Halaman Tidak Ditemukan
      </h2>
      <div className="pt-2">
        <button
          onClick={onBackHome}
          className="min-h-[44px] px-6 text-sm font-semibold text-white bg-[#0B2A5B] hover:bg-[#1E4FA8] rounded-[14px] inline-flex items-center gap-2 transition-colors shadow-xs"
        >
          <Home className="w-4 h-4" />
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
};
