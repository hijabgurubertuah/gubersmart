import React, { useState } from 'react';
import { Course } from '../../types';
import { formatRupiah } from '../../utils/crypto';
import { Search, ExternalLink } from 'lucide-react';

interface ClassesPageProps {
  courses: Course[];
  defaultLynkUrl: string;
  onOpenClassDetail: (classId: string) => void;
}

export const ClassesPage: React.FC<ClassesPageProps> = ({
  courses,
  defaultLynkUrl,
  onOpenClassDetail,
}) => {
  const [search, setSearch] = useState('');

  const filtered = courses.filter((c) => {
    if (c.status !== 'tampil') return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#0B2A5B] dark:text-white">
            Daftar Kelas
          </h1>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40 focus:border-[#FF7A1A]"
          />
        </div>
      </div>

      {/* Course Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 font-heading">
            Belum ada data
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-slate-900 rounded-[14px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div
                  onClick={() => onOpenClassDetail(course.id)}
                  className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
                >
                  <img
                    src={course.coverValue}
                    alt={course.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{course.duration}</span>
                    <span>{course.modulesCount || 4} Modul</span>
                  </div>

                  <h3
                    onClick={() => onOpenClassDetail(course.id)}
                    className="text-lg font-bold font-heading text-slate-900 dark:text-white hover:text-[#1E4FA8] transition-colors cursor-pointer"
                  >
                    {course.name}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {course.summary}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between gap-3">
                <div>
                  <span className="text-lg font-bold text-[#0B2A5B] dark:text-white">
                    {formatRupiah(course.price)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenClassDetail(course.id)}
                    className="h-10 px-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-[12px] transition-colors"
                  >
                    Rincian
                  </button>
                  <a
                    href={course.lynkUrl || defaultLynkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 px-4 text-xs font-semibold text-white bg-[#FF7A1A] hover:bg-[#E56A10] rounded-[12px] flex items-center gap-1.5 transition-colors shadow-xs active:scale-[0.98]"
                  >
                    Beli
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
