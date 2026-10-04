import React, { useState, useRef, useEffect } from 'react';
import { FileSource } from '../../types';
import { compressImageFile, uploadFileToDrive } from '../../services/appsScript';
import { store } from '../../services/store';
import { Trash2, Loader2, Image as ImageIcon, CheckCircle2, Cloud, AlertCircle } from 'lucide-react';

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
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(value || '');
  const [driveSaved, setDriveSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync previewUrl when external value changes
  useEffect(() => {
    setPreviewUrl(value || '');
    if (value && (value.includes('google.com') || value.includes('googleusercontent.com'))) {
      setDriveSaved(true);
    } else {
      setDriveSaved(false);
    }
  }, [value]);

  const handleTabSwitch = (tab: FileSource) => {
    setActiveTab(tab);
    setError(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Format file tidak didukung (gunakan JPG, PNG, WebP, SVG, GIF)');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('Ukuran file melebihi batas 15MB');
      return;
    }

    setError(null);
    setIsLoading(true);
    setUploadStatus('Mengompres & memproses gambar...');

    try {
      // 1. Client-side compression for instant base64 preview
      const compressed = await compressImageFile(file, 1200, 0.85);
      setPreviewUrl(compressed.dataUrl);
      setImgError(false);

      // 2. Check Google Apps Script configuration
      const syncConfig = store.getCMS().sync;
      const isScriptConfigured = Boolean(
        syncConfig &&
        syncConfig.webAppUrl &&
        syncConfig.webAppUrl.trim().startsWith('https://script.google.com')
      );

      if (isScriptConfigured) {
        setUploadStatus('Mengunggah ke Google Drive...');
        try {
          const driveRes = await uploadFileToDrive({
            webAppUrl: syncConfig.webAppUrl,
            driveFolderId: syncConfig.driveFolderId,
            file: file,
            compressedDataUrl: compressed.dataUrl,
          });

          if (driveRes.directUrl) {
            // Save direct Google Drive text link so Firebase stores lightweight URL
            onChange('drive', driveRes.directUrl);
            setDriveSaved(true);
            setUploadStatus(null);
            return;
          }
        } catch (driveErr: any) {
          console.warn('Apps Script upload issue, fallback to dataUrl:', driveErr);
          setError('Gagal mengunggah ke Drive: ' + (driveErr.message || 'Koneksi bermasalah') + '. Gambar disimpan sebagai preview lokal.');
        }
      } else {
        setUploadStatus(null);
      }

      // Fallback: save compressed dataUrl locally
      onChange('drive', compressed.dataUrl);
      setDriveSaved(false);
    } catch {
      setError('Gagal membaca dan memproses berkas gambar.');
    } finally {
      setIsLoading(false);
      setUploadStatus(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    setPreviewUrl('');
    setDriveSaved(false);
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
            Tautan Link
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
            Unggah Berkas
          </button>
        </div>
      </div>

      {activeTab === 'tautan' ? (
        <div className="space-y-1.5">
          <input
            type="url"
            value={value}
            onChange={(e) => {
              const val = e.target.value;
              setPreviewUrl(val);
              onChange('tautan', val);
              setImgError(false);
            }}
            placeholder="https://images.unsplash.com/... atau https://drive.google.com/..."
            className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40 focus:border-[#FF7A1A]"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              disabled={isLoading}
              onClick={() => fileInputRef.current?.click()}
              className="h-11 px-4 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-[14px] flex items-center gap-2 transition-all shadow-xs disabled:opacity-50 active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#FF7A1A]" />
              ) : (
                <ImageIcon className="w-4 h-4 text-[#1E4FA8] dark:text-sky-400" />
              )}
              {isLoading ? 'Sedang Memproses...' : 'Pilih Gambar dari Perangkat'}
            </button>

            {isLoading && uploadStatus && (
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {uploadStatus}
              </span>
            )}

            {!store.getCMS().sync?.webAppUrl && (
              <p className="w-full text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                💡 <span className="font-medium">Google Drive Apps Script:</span> Sambungkan di menu <strong>Sinkronisasi</strong> agar gambar otomatis tersimpan permanen ke Drive dan link teksnya tersimpan ke Firebase.
              </p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-[10px] flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Preview Section */}
      {previewUrl && previewUrl.trim() !== '' && (
        <div className="pt-2 flex items-start gap-4">
          <div className="relative group">
            <div className="w-28 h-20 rounded-[12px] overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-xs">
              {isLoading ? (
                <div className="w-full h-full bg-slate-900/60 flex flex-col items-center justify-center text-white p-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#FF7A1A]" />
                  <span className="text-[10px] mt-1 text-center font-medium">Mengunggah...</span>
                </div>
              ) : imgError ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center text-xs">
                  <ImageIcon className="w-6 h-6 mb-1" />
                  <span>Gambar Tidak Tampil</span>
                </div>
              ) : (
                <img
                  src={previewUrl}
                  alt="Preview"
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
              title="Hapus gambar"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 text-xs space-y-1 pt-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
              {driveSaved ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Tersimpan di Google Drive
                </span>
              ) : (
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Cloud className="w-3.5 h-3.5 text-[#1E4FA8]" />
                  Preview Siap Disimpan
                </span>
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] line-clamp-2 break-all">
              {value && value.startsWith('data:') ? 'Tersedia sebagai data gambar lokal' : value}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

