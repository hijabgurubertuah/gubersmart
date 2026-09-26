import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, VideoPart } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import {
  Play,
  Download,
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  Film,
  FolderOpen,
} from 'lucide-react';
import { Tooltip } from '../../components/ui/Tooltip';

interface MemberCourseViewProps {
  product: Product;
}

export const MemberCourseView: React.FC<MemberCourseViewProps> = ({ product }) => {
  const { navigate } = useApp();
  const [activePartIndex, setActivePartIndex] = useState<number>(0);

  const activeVideo: VideoPart | undefined = product.videos[activePartIndex] || product.videos[0];

  // Helper to extract youtube embed ID
  const getEmbedUrl = (raw: string) => {
    if (!raw) return '';
    if (raw.includes('youtube.com/watch?v=')) {
      const id = raw.split('watch?v=')[1]?.split('&')[0];
      return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (raw.includes('youtu.be/')) {
      const id = raw.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (raw.includes('youtube.com/embed/')) {
      return raw;
    }
    // Assume raw string is video ID
    return `https://www.youtube-nocookie.com/embed/${raw}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <Navbar />

      {/* Top Breadcrumb Bar */}
      <div className="bg-slate-950/80 border-b border-slate-800 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/member')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Daftar Materi</span>
          </button>

          <div className="text-xs font-semibold text-slate-300 truncate max-w-xs sm:max-w-md">
            {product.name}
          </div>

          {product.bonusFileUrl && (
            <Tooltip content="Buka Folder Google Drive">
              <a
                href={product.bonusFileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Unduh Berkas Bonus</span>
              </a>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Main Video & Part Selector Layout */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Video Player Section */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* YouTube Embed Container */}
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
            {activeVideo ? (
              <iframe
                src={getEmbedUrl(activeVideo.youtubeUrlOrId)}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                Materi video belum tersedia.
              </div>
            )}
          </div>

          {/* Active Part Info & Member Benefits */}
          {activeVideo && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
                  <span>Part #{activeVideo.partNumber}</span>
                  {activeVideo.duration && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{activeVideo.duration}</span>
                    </>
                  )}
                </div>
                <h2 className="text-lg font-bold text-white">{activeVideo.title}</h2>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  {activeVideo.description}
                </p>
              </div>

              {/* Exclusive Member Benefits & Notes */}
              {product.landingPage.benefits.length > 0 && (
                <div className="pt-4 border-t border-slate-800">
                  <h3 className="text-xs font-bold text-slate-300 mb-2">Benefit & Fasilitas Member:</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                    {product.landingPage.benefits.map((b, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Bonus File Card if available */}
          {product.bonusFileUrl && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {product.bonusFileName || 'Berkas Bonus Modul & Source Code'}
                  </div>
                  <div className="text-[11px] text-slate-400">Tersimpan di Google Drive</div>
                </div>
              </div>

              <a
                href={product.bonusFileUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-xl transition-colors shrink-0 inline-flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Drive</span>
              </a>
            </div>
          )}
        </div>

        {/* Right: Part List Selector */}
        <div className="lg:col-span-4 bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Film className="w-4 h-4 text-indigo-400" />
              <span>Daftar Video Materi</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 tabular-nums">
              {product.videos.length} Part
            </span>
          </div>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {product.videos.map((vid, idx) => {
              const isCurrent = idx === activePartIndex;
              return (
                <button
                  key={vid.id}
                  onClick={() => setActivePartIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 ${
                    isCurrent
                      ? 'bg-indigo-600/90 text-white shadow-xs border border-indigo-500'
                      : 'bg-slate-900/60 hover:bg-slate-900 text-slate-300 border border-slate-800/80'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[11px] font-bold shrink-0 mt-0.5 ${
                      isCurrent
                        ? 'bg-white text-indigo-700'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {vid.partNumber}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold leading-tight line-clamp-2">
                      {vid.title}
                    </div>
                    {vid.duration && (
                      <div className="text-[10px] font-mono opacity-70 mt-1">
                        {vid.duration}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
