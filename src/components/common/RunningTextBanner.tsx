import React, { useState } from 'react';
import { RunningTextSettings } from '../../types';
import { Megaphone, X, ExternalLink, Sparkles, Image as ImageIcon } from 'lucide-react';

interface RunningTextBannerProps {
  settings?: RunningTextSettings;
}

export const RunningTextBanner: React.FC<RunningTextBannerProps> = ({ settings }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  if (!settings || !settings.enabled || !settings.text?.trim()) {
    return null;
  }

  const {
    text,
    bgColor = '#FF7A1A',
    textColor = '#FFFFFF',
    speed = 25,
    popupImage,
    popupTitle,
    popupDescription,
  } = settings;

  // Calculate marquee animation duration based on speed
  const animationDuration = `${Math.max(10, Math.min(60, speed))}s`;

  return (
    <>
      {/* Running Text Bar */}
      <div
        onClick={() => setIsPopupOpen(true)}
        style={{ backgroundColor: bgColor, color: textColor }}
        className="w-full relative overflow-hidden cursor-pointer select-none py-2 px-3 sm:px-4 flex items-center shadow-xs transition-opacity hover:opacity-95 group z-30"
        title="Klik untuk membuka pengumuman / gambar"
      >
        {/* Left Indicator Badge */}
        <div
          style={{ backgroundColor: bgColor }}
          className="relative z-10 flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider pr-3 shrink-0 shadow-sm"
        >
          <span className="p-1 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
            <Megaphone className="w-3.5 h-3.5" />
          </span>
          <span className="hidden sm:inline font-heading text-[11px] font-extrabold tracking-wide">
            Pengumuman
          </span>
        </div>

        {/* Scrolling Text Container with seamless repeat */}
        <div className="flex-1 overflow-hidden relative flex items-center">
          <div
            className="flex whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused]"
            style={{ animationDuration }}
          >
            <span className="text-xs sm:text-sm font-semibold tracking-wide px-4 inline-flex items-center gap-6">
              <span>{text}</span>
              <span className="opacity-50">•</span>
              <span>{text}</span>
              <span className="opacity-50">•</span>
            </span>
          </div>
          <div
            className="flex whitespace-nowrap animate-marquee2 group-hover:[animation-play-state:paused] absolute top-0"
            style={{ animationDuration }}
          >
            <span className="text-xs sm:text-sm font-semibold tracking-wide px-4 inline-flex items-center gap-6">
              <span>{text}</span>
              <span className="opacity-50">•</span>
              <span>{text}</span>
              <span className="opacity-50">•</span>
            </span>
          </div>
        </div>

        {/* Right Hint Badge */}
        <div
          style={{ backgroundColor: bgColor }}
          className="relative z-10 hidden md:flex items-center gap-1 text-[11px] font-medium pl-3 opacity-90 group-hover:opacity-100 shrink-0"
        >
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
            Klik info ↗
          </span>
        </div>
      </div>

      {/* Popup Modal with Image */}
      {isPopupOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsPopupOpen(false)}
        >
          <div
            className="relative w-full max-w-xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-[20px] shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FF7A1A]/10 text-[#FF7A1A] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
                    {popupTitle || 'Informasi & Pengumuman'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Guber Smart Official Announcement
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPopupOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Image if available */}
              {popupImage && popupImage.trim() !== '' ? (
                <div className="relative rounded-[14px] overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 flex items-center justify-center max-h-[60vh] group">
                  <img
                    src={popupImage}
                    alt={popupTitle || 'Gambar Pengumuman'}
                    className="w-full h-auto max-h-[55vh] object-contain"
                  />
                  <a
                    href={popupImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-3 right-3 px-3 py-1.5 bg-black/70 hover:bg-black text-white text-xs font-semibold rounded-lg backdrop-blur-xs flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Buka Ukuran Penuh
                  </a>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-[14px] border border-dashed border-slate-200 dark:border-slate-700">
                  <ImageIcon className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pengumuman teks resmi
                  </p>
                </div>
              )}

              {/* Text & Description */}
              <div className="space-y-2 pt-1">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-[12px] border border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                    {text}
                  </p>
                </div>
                {popupDescription && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed px-1">
                    {popupDescription}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPopupOpen(false)}
                className="h-9 px-4 text-xs font-semibold text-white bg-[#0B2A5B] hover:bg-[#1E4FA8] rounded-[10px] transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
