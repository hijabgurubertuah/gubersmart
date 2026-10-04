import React from 'react';
import { Announcement } from '../../types';
import { formatDate } from '../../utils/crypto';
import { Bell, ArrowLeft, Calendar } from 'lucide-react';

interface MemberAnnouncementsPageProps {
  announcements: Announcement[];
  onBack: () => void;
}

export const MemberAnnouncementsPage: React.FC<MemberAnnouncementsPageProps> = ({
  announcements,
  onBack,
}) => {
  const visible = announcements.filter((a) => a.isVisible);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0B2A5B] dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Dasbor
      </button>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#0B2A5B] dark:text-white">
          Pengumuman
        </h1>
      </div>

      {visible.length === 0 ? (
        <div className="py-16 text-center">
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 font-heading">
            Belum ada data
          </h3>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((ann) => (
            <div
              key={ann.id}
              className="bg-white dark:bg-slate-900 rounded-[14px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar className="w-4 h-4 text-[#1E4FA8]" />
                  <span>{formatDate(ann.date)}</span>
                </div>
                <Bell className="w-4 h-4 text-[#FF7A1A]" />
              </div>

              <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                {ann.title}
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {ann.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
