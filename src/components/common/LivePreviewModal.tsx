import React, { useState } from 'react';
import {
  X,
  Monitor,
  Tablet,
  Smartphone,
  Calendar,
  User,
  Tag,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { sanitizeHtml, calculateContentStats } from '../../utils/sanitize';
import { formatRupiah } from '../../utils/crypto';

interface LivePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    title: string;
    slug?: string;
    excerpt?: string;
    content: string;
    coverUrl?: string;
    category?: string;
    tags?: string[];
    authorName?: string;
    publishDate?: string;
    price?: number;
    lynkUrl?: string;
    isFeatured?: boolean;
    isPinned?: boolean;
    status?: string;
  };
}

export const LivePreviewModal: React.FC<LivePreviewModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  if (!isOpen) return null;

  const sanitized = sanitizeHtml(data.content);
  const stats = calculateContentStats(data.content);

  const containerWidth =
    device === 'mobile'
      ? 'max-w-[390px]'
      : device === 'tablet'
      ? 'max-w-[768px]'
      : 'max-w-4xl';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-between p-2 sm:p-4 animate-in fade-in duration-200">
      {/* Top Controls Bar */}
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-[14px] px-4 py-2.5 flex items-center justify-between shadow-2xl shrink-0">
        <div className="flex items-center gap-2 text-white">
          <span className="font-heading font-bold text-sm">Pratinjau Langsung (Live Preview)</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {stats.wordCount} kata • ~{stats.readTimeMinutes} mnt baca
          </span>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center bg-slate-800/90 rounded-[10px] p-1 gap-1 border border-slate-700">
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all ${
              device === 'desktop'
                ? 'bg-[#FF7A1A] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all ${
              device === 'tablet'
                ? 'bg-[#FF7A1A] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all ${
              device === 'mobile'
                ? 'bg-[#FF7A1A] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Simulated Device Frame */}
      <div className="flex-1 w-full flex items-center justify-center overflow-hidden py-3">
        <div
          className={`w-full ${containerWidth} h-full bg-white dark:bg-slate-900 rounded-[18px] border-4 border-slate-800 shadow-2xl overflow-y-auto transition-all duration-300 flex flex-col`}
        >
          {/* Header Preview Bar */}
          <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {data.category && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#1E4FA8]/10 text-[#1E4FA8] dark:text-blue-400 font-semibold">
                  {data.category}
                </span>
              )}
              {data.isFeatured && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  Sorotan Utama
                </span>
              )}
              {data.isPinned && (
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold">
                  📌 Disematkan
                </span>
              )}
              {data.status && (
                <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 uppercase text-[10px] font-bold">
                  {data.status}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold font-heading text-[#0B2A5B] dark:text-white leading-tight">
              {data.title || 'Judul Konten'}
            </h1>

            {data.excerpt && (
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 italic">
                {data.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {data.authorName || 'Admin'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {data.publishDate || new Date().toLocaleDateString('id-ID', { dateStyle: 'medium' })}
              </span>
              {data.price !== undefined && data.price > 0 && (
                <span className="font-bold text-[#0B2A5B] dark:text-white">
                  {formatRupiah(data.price)}
                </span>
              )}
            </div>
          </div>

          {/* Featured Image */}
          {data.coverUrl && (
            <div className="w-full max-h-[380px] overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={data.coverUrl}
                alt={data.title}
                className="w-full h-full object-cover object-center"
              />
            </div>
          )}

          {/* Sanitized HTML Body */}
          <div className="p-5 sm:p-8 flex-1">
            {sanitized ? (
              <div
                className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitized }}
              />
            ) : (
              <p className="text-slate-400 italic text-center py-12">
                Konten masih kosong. Mulai ketik di editor untuk melihat pratinjau.
              </p>
            )}

            {/* Tags */}
            {data.tags && data.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-8 mt-8 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  Tag:
                </span>
                {data.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-[8px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
