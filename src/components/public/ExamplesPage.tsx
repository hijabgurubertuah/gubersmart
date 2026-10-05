import React, { useState } from 'react';
import { AppExample } from '../../types';
import { Search, ExternalLink, LayoutGrid } from 'lucide-react';

interface ExamplesPageProps {
  examples: AppExample[];
}

export const ExamplesPage: React.FC<ExamplesPageProps> = ({ examples }) => {
  const [search, setSearch] = useState('');

  const filtered = examples.filter((item) => {
    if (!item.isVisible) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Title & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#0B2A5B] dark:text-white">
            Contoh Aplikasi
          </h1>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari contoh aplikasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40 focus:border-[#FF7A1A]"
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 font-heading">
            Belum ada data
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((app) => (
            <div
              key={app.id}
              className="bg-white dark:bg-slate-900 rounded-[14px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {app.imageUrl && app.imageUrl.trim() !== '' ? (
                    <img
                      src={app.imageUrl}
                      alt={app.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <LayoutGrid className="w-10 h-10 text-slate-400" />
                  )}
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                    {app.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {app.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <a
                  href={app.appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[44px] px-4 text-xs sm:text-sm font-semibold text-[#0B2A5B] dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-[12px] flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
                >
                  Buka Aplikasi
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
