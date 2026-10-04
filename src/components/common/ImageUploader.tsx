import React, { useState, useRef } from 'react';
import { FileSource } from '../../types';
import { compressImageFile } from '../../services/appsScript';
import { Trash2, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  source: FileSource;
  value: string;
  onChange: (source: FileSource, value: string) => void;
  required?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  source,
  value,
  onChange,
  required = false,
}) => {
  const [activeTab, setActiveTab] = useState<FileSource>(source || 'tautan');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTabSwitch = (tab: FileSource) => {
    setActiveTab(tab);
    setError(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation (only shown on failure)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Format file tidak didukung');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file melebihi batas');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // Auto compress image
      const compressed = await compressImageFile(file, 1200, 0.82);
      onChange('drive', compressed.dataUrl);
      setActiveTab('drive');
      setImgError(false);
    } catch {
      setError('Gagal memproses file');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    onChange('tautan', '');
    setImgError(false);
    setError(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label} {required && '*'}
        </label>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => handleTabSwitch('tautan')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeTab === 'tautan'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Tautan
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('drive')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeTab === 'drive'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Unggah
          </button>
        </div>
      </div>

      {activeTab === 'tautan' ? (
        <div className="flex gap-2">
          <input
            type="url"
            value={value}
            onChange={(e) => {
              onChange('tautan', e.target.value);
              setImgError(false);
            }}
            placeholder="https://..."
            className="flex-1 h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40 focus:border-[#FF7A1A]"
          />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            disabled={isLoading}
            onClick={() => fileInputRef.current?.click()}
            className="h-11 px-4 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-[14px] flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#FF7A1A]" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
            Pilih Gambar
          </button>
        </div>
      )}

      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}

      {/* Preview and Delete */}
      {value && value.trim() !== '' && (
        <div className="relative inline-block mt-1 group">
          <div className="w-24 h-24 rounded-[12px] overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            {imgError ? (
              <div className="w-full h-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
            ) : (
              <img
                src={value}
                alt=""
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="absolute -top-2 -right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md transition-transform active:scale-95"
            aria-label="Hapus gambar"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
