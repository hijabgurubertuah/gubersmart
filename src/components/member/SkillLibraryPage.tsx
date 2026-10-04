import React, { useState } from 'react';
import { FileDownload, Course, Member } from '../../types';
import { formatDate } from '../../utils/crypto';
import {
  Sparkles,
  Search,
  Download,
  Lock,
  ExternalLink,
  ArrowLeft,
  Calendar,
} from 'lucide-react';

interface SkillLibraryPageProps {
  member: Member;
  courses: Course[];
  downloads: FileDownload[];
  defaultLynkUrl: string;
  onBack: () => void;
  onDownloadFile: (file: FileDownload) => void;
}

export const SkillLibraryPage: React.FC<SkillLibraryPageProps> = ({
  member,
  courses,
  downloads,
  defaultLynkUrl,
  onBack,
  onDownloadFile,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('semua');

  // Filter only 'Skill Claude' files
  const skillFiles = downloads.filter((d) => d.category === 'Skill Claude');

  const filtered = skillFiles.filter((item) => {
    if (selectedCourseId !== 'semua' && item.courseId !== selectedCourseId) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.version.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getCourseName = (courseId: string) => {
    const c = courses.find((item) => item.id === courseId);
    return c?.name || 'Kelas Terkait';
  };

  const getCourseLynk = (courseId: string) => {
    const c = courses.find((item) => item.id === courseId);
    return c?.lynkUrl || defaultLynkUrl;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0B2A5B] dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dasbor
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1E4FA8] dark:text-blue-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FF7A1A]" />
              Pustaka Eksklusif Member
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#0B2A5B] dark:text-white">
              Skill Claude
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Filter Course */}
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="h-11 px-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40"
            >
              <option value="semua">Semua Kelas</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40 focus:border-[#FF7A1A]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 font-heading">
            Belum ada data
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((file) => {
            const isOwned = member.ownedCourses.includes(file.courseId);
            const courseName = getCourseName(file.courseId);
            const buyUrl = getCourseLynk(file.courseId);

            return (
              <div
                key={file.id}
                className="bg-white dark:bg-slate-900 rounded-[14px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950 text-[#1E4FA8] dark:text-blue-300 truncate max-w-[190px]">
                      {courseName}
                    </span>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {file.version}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                    {file.name}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {file.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Diperbarui {formatDate(file.updatedAt)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  {isOwned ? (
                    <button
                      onClick={() => onDownloadFile(file)}
                      className="w-full min-h-[44px] px-4 text-sm font-semibold text-white bg-[#0B2A5B] hover:bg-[#1E4FA8] rounded-[12px] flex items-center justify-center gap-2 transition-colors shadow-xs active:scale-[0.98]"
                    >
                      <Download className="w-4 h-4 text-[#FF7A1A]" />
                      Unduh Berkas
                    </button>
                  ) : (
                    <a
                      href={buyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full min-h-[44px] px-4 text-sm font-semibold text-white bg-[#FF7A1A] hover:bg-[#E56A10] rounded-[12px] flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.98]"
                    >
                      <Lock className="w-4 h-4" />
                      Buka Akses di Lynk.id
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
