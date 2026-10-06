import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FileSource } from '../../types';
import { compressImageFile, uploadFileToDrive, listDriveFiles, DriveFileItem, DriveFolderItem, APPS_SCRIPT_CODE } from '../../services/appsScript';
import { store } from '../../services/store';
import {
  Trash2,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  Cloud,
  AlertCircle,
  RotateCw,
  Search,
  ExternalLink,
  Images,
  Check,
  Copy,
  Sparkles,
  Folder,
  FolderOpen,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  source: FileSource;
  value: string;
  onChange: (source: FileSource, value: string) => void;
  required?: boolean;
}

type TabMode = 'tautan' | 'drive' | 'galeri';

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  source,
  value,
  onChange,
  required = false,
}) => {
  const [activeTab, setActiveTab] = useState<TabMode>(source === 'drive' ? 'drive' : 'tautan');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(value || '');
  const [driveSaved, setDriveSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gallery states
  const [galleryFiles, setGalleryFiles] = useState<DriveFileItem[]>([]);
  const [galleryFolders, setGalleryFolders] = useState<DriveFolderItem[]>([]);
  const [folderStack, setFolderStack] = useState<{ id: string; name: string }[]>([]);
  const [isGalleryLoading, setIsGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasLoadedGalleryOnce, setHasLoadedGalleryOnce] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Sync previewUrl when external value changes
  useEffect(() => {
    setPreviewUrl(value || '');
    if (value && (value.includes('google.com') || value.includes('googleusercontent.com'))) {
      setDriveSaved(true);
    } else {
      setDriveSaved(false);
    }
  }, [value]);

  // Existing images already stored in application database
  const appExistingImages = useMemo(() => {
    const list: { url: string; name: string }[] = [];
    const seen = new Set<string>();

    const addImg = (url?: string, name?: string) => {
      if (!url || !url.startsWith('http') || seen.has(url)) return;
      seen.add(url);
      list.push({ url, name: name || 'Gambar' });
    };

    try {
      const cms = store.getCMS();
      if (cms.identity?.logoUrl) addImg(cms.identity.logoUrl, 'Logo Aplikasi');

      store.getCourses().forEach((c) => addImg(c.coverValue, c.name));
      store.getLessons().forEach((l) => {
        l.blocks?.forEach((b) => {
          if (b.type === 'image' && b.value) addImg(b.value, l.title);
          if (b.type === 'steps') {
            b.steps?.forEach((s) => {
              if (s.imageUrl) addImg(s.imageUrl, s.title);
            });
          }
        });
      });
      store.getAppExamples().forEach((e) => addImg(e.imageUrl, e.name));
      store.getTestimonials().forEach((t) => addImg(t.avatarUrl, t.name));
    } catch (e) {
      console.warn('Error reading existing app images:', e);
    }

    return list;
  }, []);

  const loadGallery = async (force = false, targetFolderId?: string) => {
    const syncConfig = store.getCMS().sync;
    if (!syncConfig || !syncConfig.webAppUrl || !syncConfig.webAppUrl.trim().startsWith('https://script.google.com')) {
      setGalleryError('Google Apps Script belum dikonfigurasi di menu Admin > Sinkronisasi.');
      return;
    }

    const folderToQuery = targetFolderId !== undefined
      ? targetFolderId
      : (folderStack.length > 0 ? folderStack[folderStack.length - 1].id : syncConfig.driveFolderId);

    if (!force && hasLoadedGalleryOnce && galleryFiles.length > 0 && targetFolderId === undefined) {
      return;
    }

    setIsGalleryLoading(true);
    setGalleryError(null);

    try {
      const res = await listDriveFiles({
        webAppUrl: syncConfig.webAppUrl,
        driveFolderId: folderToQuery,
        onlyImages: true,
        limit: 100,
      });

      if (res.status === 'success') {
        setGalleryFiles(res.files || []);
        setGalleryFolders(res.folders || []);
        setHasLoadedGalleryOnce(true);
        if (res.folderId && !folderToQuery && (!syncConfig.driveFolderId || syncConfig.driveFolderId !== res.folderId)) {
          store.updateSyncConfig({
            driveFolderId: res.folderId,
          });
        }
      } else {
        setGalleryError(res.message || 'Gagal memuat galeri gambar.');
      }
    } catch (err: any) {
      setGalleryError(err.message || 'Gagal terhubung ke Google Apps Script');
    } finally {
      setIsGalleryLoading(false);
    }
  };

  const handleOpenSubfolder = (folder: DriveFolderItem) => {
    const newStack = [...folderStack, { id: folder.folderId, name: folder.name }];
    setFolderStack(newStack);
    setSearchQuery('');
    loadGallery(true, folder.folderId);
  };

  const handleGoBackFolder = () => {
    if (folderStack.length === 0) return;
    const newStack = folderStack.slice(0, folderStack.length - 1);
    setFolderStack(newStack);
    setSearchQuery('');
    const parentFolderId = newStack.length > 0 ? newStack[newStack.length - 1].id : store.getCMS().sync?.driveFolderId;
    loadGallery(true, parentFolderId);
  };

  const handleGoToBreadcrumb = (index: number) => {
    setSearchQuery('');
    if (index === -1) {
      setFolderStack([]);
      loadGallery(true, store.getCMS().sync?.driveFolderId);
    } else {
      const newStack = folderStack.slice(0, index + 1);
      setFolderStack(newStack);
      loadGallery(true, newStack[newStack.length - 1].id);
    }
  };

  const handleTabSwitch = (tab: TabMode) => {
    setActiveTab(tab);
    setError(null);
    if (tab === 'galeri') {
      loadGallery(false);
    }
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

          if (driveRes.folderId) {
            const currentSync = store.getCMS().sync;
            if (!currentSync.driveFolderId || currentSync.driveFolderId !== driveRes.folderId) {
              store.updateSyncConfig({
                driveFolderId: driveRes.folderId,
              });
            }
          }

          if (driveRes.directUrl) {
            // Save direct Google Drive text link so Firebase stores lightweight URL
            onChange('drive', driveRes.directUrl);
            setDriveSaved(true);
            setUploadStatus(null);
            // Refresh gallery cache if already loaded
            if (hasLoadedGalleryOnce) {
              loadGallery(true);
            }
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

  const handleCopyAppsScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Filtered files in gallery
  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return galleryFolders;
    const q = searchQuery.toLowerCase();
    return galleryFolders.filter((f) => f.name.toLowerCase().includes(q));
  }, [galleryFolders, searchQuery]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return galleryFiles;
    const q = searchQuery.toLowerCase();
    return galleryFiles.filter((f) => f.name.toLowerCase().includes(q));
  }, [galleryFiles, searchQuery]);

  const filteredAppImages = useMemo(() => {
    if (!searchQuery.trim()) return appExistingImages;
    const q = searchQuery.toLowerCase();
    return appExistingImages.filter((f) => f.name.toLowerCase().includes(q));
  }, [appExistingImages, searchQuery]);

  const syncConfig = store.getCMS().sync;
  const isScriptConfigured = Boolean(
    syncConfig &&
    syncConfig.webAppUrl &&
    syncConfig.webAppUrl.trim().startsWith('https://script.google.com')
  );

  const isOutdatedScript = Boolean(
    galleryError &&
    (galleryError.includes('Aksi tidak dikenal') ||
      galleryError.includes('listImages') ||
      galleryError.includes('listDriveFiles'))
  );

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
          <button
            type="button"
            onClick={() => handleTabSwitch('galeri')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
              activeTab === 'galeri'
                ? 'bg-white dark:bg-slate-700 text-[#0B2A5B] dark:text-sky-300 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Images className="w-3.5 h-3.5 text-[#FF7A1A]" />
            Galeri
          </button>
        </div>
      </div>

      {/* Tab 1: Tautan Link */}
      {activeTab === 'tautan' && (
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
      )}

      {/* Tab 2: Unggah Berkas */}
      {activeTab === 'drive' && (
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

            {!isScriptConfigured && (
              <p className="w-full text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                💡 <span className="font-medium">Google Drive Apps Script:</span> Sambungkan di menu <strong>Sinkronisasi</strong> agar gambar otomatis tersimpan permanen ke Drive dan link teksnya tersimpan ke Firebase.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Galeri */}
      {activeTab === 'galeri' && (
        <div className="space-y-3 p-3 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-[14px]">
          {!isScriptConfigured ? (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-[10px] text-xs text-amber-900 dark:text-amber-200">
              <p className="font-semibold mb-1">Sinkronisasi Google Drive Belum Diatur</p>
              <p>
                Atur URL Web App Google Apps Script di menu <strong>Admin &gt; Sinkronisasi</strong> untuk mengaktifkan galeri otomatis Drive.
              </p>
            </div>
          ) : isOutdatedScript ? (
            /* Specific friendly card when script deployment has not been updated */
            <div className="p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/60 rounded-[12px] space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950 dark:text-amber-100 space-y-2">
                  <p className="font-bold text-sm text-amber-900 dark:text-amber-300">
                    Google Apps Script Perlu Di-Deploy Versi Baru (*New version*)
                  </p>
                  <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                    Pesan <em>"Aksi tidak dikenal: listImages"</em> muncul karena Web App di Google Apps Script Anda masih menjalankan rilis versi lama (belum di-deploy ulang dengan kode galeri).
                  </p>

                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-[8px] border border-amber-200 dark:border-amber-800 space-y-1.5 text-slate-700 dark:text-slate-300">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Langkah 1 Menit untuk Mengaktifkan:</p>
                    <ol className="list-decimal list-inside space-y-1 pl-0.5">
                      <li>Salin kode Apps Script terbaru dengan tombol di bawah.</li>
                      <li>Buka <a href="https://script.google.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-[#1E4FA8] dark:text-sky-400">script.google.com</a>, tempelkan kode & simpan (Ctrl+S).</li>
                      <li>
                        Klik <strong>Deploy &gt; Manage deployments &gt; Edit (ikon pensil)</strong> &gt; pilih <strong>Version: New version</strong> &gt; klik <strong>Deploy</strong>.
                      </li>
                    </ol>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyAppsScript}
                      className="h-8 px-3 text-xs font-semibold text-white bg-[#0B2A5B] hover:bg-[#1E4FA8] rounded-[8px] flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedCode ? 'Kode Berhasil Disalin!' : 'Salin Kode Apps Script Terbaru'}
                    </button>
                    <button
                      type="button"
                      onClick={() => loadGallery(true)}
                      className="h-8 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-[8px] flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-[#FF7A1A]" />
                      Coba Segarkan Lagi
                    </button>
                  </div>
                </div>
              </div>

              {/* Instant fallback: images already used in app */}
              {appExistingImages.length > 0 && (
                <div className="pt-2 border-t border-amber-200 dark:border-amber-800/80">
                  <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF7A1A]" />
                    Atau pilih dari gambar yang sudah tersimpan di aplikasi saat ini:
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-44 overflow-y-auto p-1 scrollbar-thin">
                    {appExistingImages.map((img, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => {
                          setPreviewUrl(img.url);
                          setDriveSaved(true);
                          setImgError(false);
                          onChange('drive', img.url);
                        }}
                        className="group relative aspect-square rounded-[10px] overflow-hidden border-2 border-transparent hover:border-[#1E4FA8] bg-white dark:bg-slate-900 transition-all"
                        title={img.name}
                      >
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/70 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-[10px] text-white truncate">{img.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Breadcrumb Trail & Back Button */}
              <div className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[10px] text-xs">
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none font-medium text-slate-700 dark:text-slate-300">
                  <button
                    type="button"
                    onClick={() => handleGoToBreadcrumb(-1)}
                    className="hover:text-[#1E4FA8] dark:hover:text-sky-400 font-semibold flex items-center gap-1 shrink-0"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-[#FF7A1A]" />
                    <span>Utama</span>
                  </button>
                  {folderStack.map((f, idx) => (
                    <React.Fragment key={f.id}>
                      <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                      <button
                        type="button"
                        onClick={() => handleGoToBreadcrumb(idx)}
                        className={`hover:text-[#1E4FA8] dark:hover:text-sky-400 font-semibold truncate max-w-[120px] ${
                          idx === folderStack.length - 1 ? 'text-[#0B2A5B] dark:text-white font-bold' : ''
                        }`}
                      >
                        {f.name}
                      </button>
                    </React.Fragment>
                  ))}
                </div>

                {folderStack.length > 0 && (
                  <button
                    type="button"
                    onClick={handleGoBackFolder}
                    className="h-7 px-2.5 text-xs font-semibold text-[#0B2A5B] dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-[8px] flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-[#FF7A1A]" />
                    <span>Kembali</span>
                  </button>
                )}
              </div>

              {/* Gallery Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="relative flex-1 min-w-[160px] max-w-xs">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari folder atau gambar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-8 pl-8 pr-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[8px] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#FF7A1A]"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {filteredFolders.length > 0 && `${filteredFolders.length} folder • `}{filteredFiles.length} berkas
                  </span>
                  <button
                    type="button"
                    onClick={() => loadGallery(true)}
                    disabled={isGalleryLoading}
                    className="h-8 px-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-[8px] flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-2xs"
                    title="Segarkan data gambar & folder dari Google Drive"
                  >
                    <RotateCw className={`w-3.5 h-3.5 text-[#1E4FA8] dark:text-sky-400 ${isGalleryLoading ? 'animate-spin' : ''}`} />
                    <span>Segarkan</span>
                  </button>

                  {syncConfig?.driveFolderId && (
                    <a
                      href={`https://drive.google.com/drive/folders/${syncConfig.driveFolderId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 px-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-[8px] flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Buka Folder Drive di tab baru"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Gallery Content */}
              {isGalleryLoading && galleryFiles.length === 0 && galleryFolders.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#FF7A1A]" />
                  <p className="text-xs">Memuat berkas & folder dari Google Drive...</p>
                </div>
              ) : galleryError ? (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-[10px] text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
                  <span>{galleryError}</span>
                  <button
                    type="button"
                    onClick={() => loadGallery(true)}
                    className="font-bold underline ml-2 hover:opacity-80"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : (filteredFiles.length === 0 && filteredFolders.length === 0) ? (
                <div className="space-y-3">
                  <div className="p-5 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-[12px] bg-white dark:bg-slate-900">
                    <Images className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {searchQuery ? 'Tidak ada gambar atau folder yang cocok dengan pencarian' : 'Folder ini masih kosong'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                      {searchQuery
                        ? 'Coba gunakan kata kunci pencarian yang lain.'
                        : 'Anda bisa mengunggah lewat tab "Unggah" atau memasukkan file ke folder ini di Google Drive, lalu klik tombol Segarkan.'}
                    </p>
                  </div>

                  {filteredAppImages.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                        Gambar yang tersedia di aplikasi:
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1 scrollbar-thin">
                        {filteredAppImages.map((img, i) => (
                          <button
                            type="button"
                            key={i}
                            onClick={() => {
                              setPreviewUrl(img.url);
                              setDriveSaved(true);
                              setImgError(false);
                              onChange('drive', img.url);
                            }}
                            className="group relative aspect-square rounded-[10px] overflow-hidden border-2 border-transparent hover:border-[#1E4FA8] bg-slate-100 dark:bg-slate-800 transition-all text-left"
                            title={img.name}
                          >
                            <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-x-0 bottom-0 bg-black/75 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-[10px] text-white truncate">{img.name}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto p-1 scrollbar-thin">
                  {/* Subfolders Grid */}
                  {filteredFolders.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        Folder Dalam ({filteredFolders.length}):
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {filteredFolders.map((folder) => (
                          <button
                            type="button"
                            key={folder.folderId}
                            onClick={() => handleOpenSubfolder(folder)}
                            className="flex items-center gap-2 p-2 rounded-[10px] bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-left transition-all group"
                            title={`Buka folder: ${folder.name}`}
                          >
                            <Folder className="w-4 h-4 text-amber-500 shrink-0 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate flex-1">
                              {folder.name}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Files Grid */}
                  {filteredFiles.length > 0 && (
                    <div className="space-y-1">
                      {filteredFolders.length > 0 && (
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 pt-1">
                          Berkas Gambar ({filteredFiles.length}):
                        </p>
                      )}
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {filteredFiles.map((file) => {
                          const isSelected =
                            value &&
                            (value === file.directUrl ||
                              value === file.viewUrl ||
                              value === file.downloadUrl ||
                              (file.lh3Url && value === file.lh3Url) ||
                              (file.fileId && value.includes(file.fileId)));

                          return (
                            <button
                              type="button"
                              key={file.fileId}
                              onClick={() => {
                                const chosenUrl = file.directUrl || file.viewUrl || '';
                                setPreviewUrl(chosenUrl);
                                setDriveSaved(true);
                                setImgError(false);
                                onChange('drive', chosenUrl);
                              }}
                              className={`group relative aspect-square rounded-[10px] overflow-hidden border-2 transition-all text-left bg-slate-100 dark:bg-slate-800 focus:outline-none ${
                                isSelected
                                  ? 'border-[#FF7A1A] ring-2 ring-[#FF7A1A]/30 scale-[0.98]'
                                  : 'border-transparent hover:border-[#1E4FA8] dark:hover:border-sky-400'
                              }`}
                              title={file.name}
                            >
                              <img
                                src={file.thumbnailUrl || file.directUrl}
                                alt={file.name}
                                loading="lazy"
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                              {isSelected && (
                                <div className="absolute inset-0 bg-[#FF7A1A]/20 flex items-center justify-center">
                                  <div className="w-6 h-6 rounded-full bg-[#FF7A1A] text-white flex items-center justify-center shadow-md">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </div>
                                </div>
                              )}
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-1 pt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-[10px] text-white font-medium truncate leading-tight">
                                  {file.name}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
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
        <div className="pt-2">
          <div className="relative inline-block group">
            <div className="w-32 h-20 rounded-[12px] overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-xs">
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
        </div>
      )}
    </div>
  );
};

