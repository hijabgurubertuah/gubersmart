import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface StaticPageViewProps {
  title: string;
  content: string;
  onBack: () => void;
}

export const StaticPageView: React.FC<StaticPageViewProps> = ({ title, content, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0B2A5B] dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </button>

      <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#0B2A5B] dark:text-white">
        {title}
      </h1>

      <div className="p-6 bg-white dark:bg-slate-900 rounded-[14px] border border-slate-100 dark:border-slate-800 shadow-sm text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
        {content}
      </div>
    </div>
  );
};
