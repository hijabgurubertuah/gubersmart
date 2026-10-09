import React, { useState } from 'react';
import { CMSSettings, Role } from '../../types';
import { ImageUploader } from '../common/ImageUploader';
import { RunningTextBanner } from '../common/RunningTextBanner';
import { firebaseSync } from '../../services/firebaseSync';
import { store } from '../../services/store';
import {
  Save,
  Eye,
  Palette,
  Check,
  Trash2,
  Megaphone,
  Images,
  Layers,
  Sparkles,
  Plus,
  Compass,
  MousePointer,
  FileText,
  Zap,
  MapPin,
  Phone,
  Sliders,
  CloudUpload,
} from 'lucide-react';

interface AdminCMSProps {
  role: Role;
  cms: CMSSettings;
  onUpdateCMS: (updates: Partial<CMSSettings>) => void;
  onResetCMS?: () => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  activeSubTab?: string;
  onSelectSubTab?: (tabId: string) => void;
}

export const AdminCMS: React.FC<AdminCMSProps> = ({
  role,
  cms,
  onUpdateCMS,
  onToast,
  activeSubTab: externalActiveTab,
  onSelectSubTab,
}) => {
  // Local state copy
  const [formData, setFormData] = useState<CMSSettings>(JSON.parse(JSON.stringify(cms)));
  const [hasEdits, setHasEdits] = useState(false);
  const [internalActiveTab, setInternalActiveTab] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('guber_admin_cms_tab');
      if (saved) return saved;
    } catch {
      // ignore
    }
    return role === 'Superadmin' ? 'identity' : 'runningText';
  });

  const activeTab = externalActiveTab || internalActiveTab;

  const handleSelectTab = (tabId: string) => {
    setInternalActiveTab(tabId);
    try {
      localStorage.setItem('guber_admin_cms_tab', tabId);
    } catch {
      // ignore
    }
    if (onSelectSubTab) {
      onSelectSubTab(tabId);
    }
  };

  // Tabs allowed based on role with icons
  const allowedTabs = role === 'Superadmin'
    ? [
        { id: 'identity', label: 'Identitas & Banner', icon: Images },
        { id: 'runningText', label: 'Teks Berjalan', icon: Megaphone },
        { id: 'theme', label: 'Tema', icon: Palette },
        { id: 'navigation', label: 'Navigasi', icon: Compass },
        { id: 'buttons', label: 'Tombol', icon: MousePointer },
        { id: 'sections', label: 'Bagian Halaman', icon: Layers },
        { id: 'pages', label: 'Halaman', icon: FileText },
        { id: 'features', label: 'Fitur', icon: Zap },
        { id: 'media', label: 'Lokasi & Media', icon: MapPin },
        { id: 'footer', label: 'Footer & Kontak', icon: Phone },
        { id: 'save', label: 'Pratinjau & Simpan', icon: Eye },
      ]
    : [
        { id: 'identity', label: 'Identitas & Banner', icon: Images },
        { id: 'runningText', label: 'Teks Berjalan', icon: Megaphone },
        { id: 'sections', label: 'Bagian Halaman', icon: Layers },
        { id: 'pages', label: 'Halaman', icon: FileText },
        { id: 'buttons', label: 'Tombol', icon: MousePointer },
        { id: 'navigation', label: 'Navigasi', icon: Compass },
        { id: 'footer', label: 'Footer & Kontak', icon: Phone },
        { id: 'save', label: 'Pratinjau & Simpan', icon: Eye },
      ];

  const [isSaving, setIsSaving] = useState(false);

  // Sync formData with remote cms updates only if user hasn't made active edits
  React.useEffect(() => {
    if (!isSaving && !hasEdits) {
      setFormData(JSON.parse(JSON.stringify(cms)));
    }
  }, [cms, isSaving, hasEdits]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      onUpdateCMS(formData);
      await firebaseSync.syncCMSToFirebase(formData);
      store.clearDirty('cms');
      setHasEdits(false);
      onToast('Pengaturan CMS berhasil disimpan & disinkronkan ke Firebase');
    } catch (err: any) {
      console.error(err);
      onToast('Gagal menyimpan ke Firebase');
    } finally {
      setIsSaving(false);
    }
  };

  const runningTextData = formData.runningText || {
    enabled: true,
    text: '🔥 Promo Spesial: Dapatkan Akses Seluruh Kelas & Template Aplikasi AI!',
    bgColor: '#FF7A1A',
    textColor: '#FFFFFF',
    speed: 25,
    popupImage: '',
    popupTitle: 'Promo Spesial Member Baru',
    popupDescription: 'Dapatkan akses eksklusif ke seluruh materi, modul update berkala, dan komunitas diskusi.',
  };

  const heroImagesData = Array.isArray(formData.identity.heroImages)
    ? formData.identity.heroImages
    : [];

  return (
    <div className="space-y-6">
      <div className="sticky top-16 z-20 bg-slate-50/95 dark:bg-slate-950/95 py-3 -mt-2 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-heading text-[#0B2A5B] dark:text-white">
              Pengaturan Tampilan (CMS)
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#FF7A1A]/10 text-[#FF7A1A] font-semibold border border-[#FF7A1A]/20">
              {allowedTabs.find((t) => t.id === activeTab)?.label || 'Pengaturan'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pilih menu/tab CMS melalui sidebar panel admin di sebelah kiri.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="h-10 px-5 text-sm font-semibold text-white bg-[#FF7A1A] hover:bg-[#E56A10] active:scale-[0.98] disabled:opacity-75 rounded-[12px] flex items-center gap-2 shadow-sm transition-all"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            {isSaving ? 'Menyimpan ke Cloud...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>

      {/* Konten Formulir CMS Langsung (Menu sudah berada di sidebar panel admin) */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-[14px] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
        {/* 1. Identitas & Logo */}
        {activeTab === 'identity' && (
          <div className="space-y-5 max-w-2xl">
            {/* Logo Aplikasi Minimalis */}
            <div className="p-4 rounded-[14px] border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Logo Aplikasi
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Unggah gambar logo (PNG/JPG/SVG/WebP) atau masukkan URL tautan langsung.
                  </p>
                </div>
                {formData.identity.logoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = {
                        ...formData,
                        identity: { ...formData.identity, logoUrl: '', faviconUrl: '/favicon.svg' },
                      };
                      setFormData(updated);
                      setHasEdits(true);
                      onUpdateCMS(updated);
                      onToast('Logo berhasil dihapus');
                    }}
                    className="px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-[8px] flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus Logo
                  </button>
                )}
              </div>

              <div>
                <ImageUploader
                  label=""
                  source={
                    (formData.identity.logoUrl?.includes('drive.google.com') ||
                    formData.identity.logoUrl?.includes('googleusercontent.com') ||
                    formData.identity.logoUrl?.startsWith('data:'))
                      ? 'drive'
                      : 'tautan'
                  }
                  value={formData.identity.logoUrl || ''}
                  onChange={(_source, val) => {
                    const updated = {
                      ...formData,
                      identity: { ...formData.identity, logoUrl: val, faviconUrl: val },
                    };
                    setFormData(updated);
                    setHasEdits(true);
                    onUpdateCMS(updated);
                  }}
                />
              </div>

              {formData.identity.logoUrl && (
                <div className="flex items-center gap-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400 shrink-0">Pratinjau di Navbar:</span>
                  <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 dark:border-slate-700 shadow-2xs">
                    <div className="w-8 h-8 rounded-[8px] bg-transparent flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src={formData.identity.logoUrl}
                        alt="Logo Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="font-heading font-bold text-slate-900 dark:text-white text-sm">
                      {formData.identity.appName || 'Guber Smart'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Aplikasi *
              </label>
              <input
                type="text"
                value={formData.identity.appName}
                onChange={(e) => {
                  const updated = {
                    ...formData,
                    identity: { ...formData.identity, appName: e.target.value },
                  };
                  setFormData(updated);
                  setHasEdits(true);
                  onUpdateCMS(updated);
                }}
                className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 rounded-[14px]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Judul Utama Banner
                </label>
                {formData.identity.heroTitle && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = {
                        ...formData,
                        identity: { ...formData.identity, heroTitle: '' },
                      };
                      setFormData(updated);
                      setHasEdits(true);
                      onUpdateCMS(updated);
                      onToast('Judul banner telah dikosongkan');
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Kosongkan Judul
                  </button>
                )}
              </div>
              <input
                type="text"
                value={formData.identity.heroTitle || ''}
                onChange={(e) => {
                  const updated = {
                    ...formData,
                    identity: { ...formData.identity, heroTitle: e.target.value },
                  };
                  setFormData(updated);
                  setHasEdits(true);
                  onUpdateCMS(updated);
                }}
                placeholder="(Bisa dikosongkan untuk menampilkan gambar banner penuh tanpa teks)"
                className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px]"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                💡 Jika judul dan subjudul dikosongkan, halaman utama akan menampilkan gambar banner saja tanpa ada warna/lapisan yang menutupi.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Subjudul Banner
                </label>
                {formData.identity.heroSubtitle && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = {
                        ...formData,
                        identity: { ...formData.identity, heroSubtitle: '' },
                      };
                      setFormData(updated);
                      setHasEdits(true);
                      onUpdateCMS(updated);
                      onToast('Subjudul banner telah dikosongkan');
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Kosongkan Subjudul
                  </button>
                )}
              </div>
              <textarea
                rows={3}
                value={formData.identity.heroSubtitle || ''}
                onChange={(e) => {
                  const updated = {
                    ...formData,
                    identity: { ...formData.identity, heroSubtitle: e.target.value },
                  };
                  setFormData(updated);
                  setHasEdits(true);
                  onUpdateCMS(updated);
                }}
                placeholder="(Bisa dikosongkan untuk menampilkan gambar banner penuh tanpa teks)"
                className="w-full p-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px] resize-none"
              />
            </div>

            {/* Gambar Latar Banner Utama (Carousel) */}
            <div className="p-4 sm:p-5 rounded-[14px] border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                    Gambar Cover / Latar Banner Utama
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Gambar cover banner header halaman utama. Disediakan tombol hapus pada masing-masing gambar. Jika judul & subjudul dikosongkan, gambar akan tampil penuh tanpa warna yang menutupi.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-[#1E4FA8] dark:text-blue-300">
                    {heroImagesData.length} Gambar Terpasang
                  </span>
                  {heroImagesData.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = {
                          ...formData,
                          identity: {
                            ...formData.identity,
                            heroImages: [],
                          },
                        };
                        setFormData(updated);
                        setHasEdits(true);
                        onUpdateCMS(updated);
                        onToast('Semua gambar latar cover telah dihapus');
                      }}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 px-3 py-1.5 rounded-[10px] bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus Semua Gambar
                    </button>
                  )}
                </div>
              </div>

              {/* Grid slide images with explicit delete button on each card */}
              <div className="space-y-4">
                {heroImagesData.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {heroImagesData.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="rounded-[14px] overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm flex flex-col"
                      >
                        <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                          <img
                            src={imgUrl}
                            alt={`Banner Slide ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white px-2.5 py-0.5 bg-black/70 rounded-[8px] backdrop-blur-xs shadow-xs">
                              Gambar {idx + 1}
                            </span>
                          </div>
                        </div>

                        {/* Tombol Hapus Pada Masing-Masing Gambar (Selalu Tampil Jelas) */}
                        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]" title={imgUrl}>
                            {imgUrl.startsWith('data:') ? 'Berkas Unggahan' : imgUrl.split('/').pop()?.split('?')[0] || `Gambar ${idx + 1}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updatedImages = heroImagesData.filter((_, i) => i !== idx);
                              const updated = {
                                ...formData,
                                identity: {
                                  ...formData.identity,
                                  heroImages: updatedImages,
                                },
                              };
                              setFormData(updated);
                              setHasEdits(true);
                              onUpdateCMS(updated);
                              onToast(`Gambar cover banner ${idx + 1} berhasil dihapus`);
                            }}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-[10px] text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs shrink-0"
                            title={`Hapus gambar ${idx + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus Gambar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-[14px] bg-slate-100/70 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-1.5 text-slate-500 dark:text-slate-400">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Tidak ada gambar latar cover banner yang terpasang
                    </p>
                    <p className="text-xs max-w-md mx-auto">
                      Header di halaman publik saat ini menggunakan warna gradien bawaan tanpa gambar latar. Anda dapat menambahkan gambar banner di bawah ini.
                    </p>
                  </div>
                )}

                {/* Tambah slide baru */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                    + Tambah Gambar Cover / Latar Banner Baru
                  </label>
                  <ImageUploader
                    label=""
                    source="tautan"
                    value=""
                    onChange={(_source, val) => {
                      if (val && val.trim() !== '') {
                        const updated = [...heroImagesData, val.trim()];
                        const updatedForm = {
                          ...formData,
                          identity: {
                            ...formData.identity,
                            heroImages: updated,
                          },
                        };
                        setFormData(updatedForm);
                        setHasEdits(true);
                        onUpdateCMS(updatedForm);
                        onToast('Gambar latar banner baru berhasil ditambahkan');
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tautan Lynk.id Utama *
                </label>
                <input
                  type="url"
                  value={formData.identity.lynkUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      identity: { ...formData.identity, lynkUrl: e.target.value },
                    })
                  }
                  className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 rounded-[14px]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nomor WhatsApp Utama *
                </label>
                <input
                  type="tel"
                  value={formData.identity.whatsapp}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      identity: { ...formData.identity, whatsapp: e.target.value },
                    })
                  }
                  className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 rounded-[14px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.identity.metaTitle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      identity: { ...formData.identity, metaTitle: e.target.value },
                    })
                  }
                  className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 rounded-[14px]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Meta Description
                </label>
                <input
                  type="text"
                  value={formData.identity.metaDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      identity: { ...formData.identity, metaDescription: e.target.value },
                    })
                  }
                  className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 rounded-[14px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. Teks Berjalan (Running Text) */}
        {activeTab === 'runningText' && (
          <div className="space-y-6 max-w-2xl">
            {/* Toggle Running Text */}
            <div className="flex items-center justify-between p-4 rounded-[14px] border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Aktifkan Teks Berjalan (Running Text)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Teks pengumuman yang bergerak di bagian atas website dan dapat diklik untuk menampilkan popup gambar.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={runningTextData.enabled}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      runningText: {
                        ...runningTextData,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF7A1A]"></div>
              </label>
            </div>

            {/* Isi Teks */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Isi Teks Berjalan *
              </label>
              <textarea
                rows={3}
                value={runningTextData.text}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    runningText: {
                      ...runningTextData,
                      text: e.target.value,
                    },
                  })
                }
                placeholder="Contoh: 🔥 Promo Spesial Bulan Ini! Dapatkan Akses Seluruh Kelas. Klik di sini untuk detail."
                className="w-full p-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40"
              />
            </div>

            {/* Setting Warna & Kecepatan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Warna Latar */}
              <div className="p-4 rounded-[14px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Warna Latar (Background)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={runningTextData.bgColor || '#FF7A1A'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        runningText: {
                          ...runningTextData,
                          bgColor: e.target.value,
                        },
                      })
                    }
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={runningTextData.bgColor || '#FF7A1A'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        runningText: {
                          ...runningTextData,
                          bgColor: e.target.value,
                        },
                      })
                    }
                    className="flex-1 h-10 px-3 text-xs font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px]"
                  />
                </div>
                {/* Color Presets */}
                <div className="flex items-center gap-1.5 pt-1">
                  {['#FF7A1A', '#0B2A5B', '#10B981', '#DC2626', '#7C3AED', '#0F172A'].map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          runningText: { ...runningTextData, bgColor: c },
                        })
                      }
                      style={{ backgroundColor: c }}
                      className="w-5 h-5 rounded-full border border-white/40 shadow-xs hover:scale-110 transition-transform"
                    />
                  ))}
                </div>
              </div>

              {/* Warna Teks */}
              <div className="p-4 rounded-[14px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Warna Teks
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={runningTextData.textColor || '#FFFFFF'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        runningText: {
                          ...runningTextData,
                          textColor: e.target.value,
                        },
                      })
                    }
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={runningTextData.textColor || '#FFFFFF'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        runningText: {
                          ...runningTextData,
                          textColor: e.target.value,
                        },
                      })
                    }
                    className="flex-1 h-10 px-3 text-xs font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px]"
                  />
                </div>
                {/* Color Presets */}
                <div className="flex items-center gap-1.5 pt-1">
                  {['#FFFFFF', '#0F172A', '#FEF08A', '#93C5FD', '#FDE047'].map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          runningText: { ...runningTextData, textColor: c },
                        })
                      }
                      style={{ backgroundColor: c }}
                      className="w-5 h-5 rounded-full border border-slate-300 shadow-xs hover:scale-110 transition-transform"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Section: Gambar Popup Saat Diklik */}
            <div className="p-4 rounded-[14px] border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Gambar Popup (Saat Running Text Diklik)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Pilih atau unggah gambar banner/voucher/pengumuman yang akan muncul dalam popup saat pengunjung mengklik teks berjalan.
                  </p>
                </div>
                {runningTextData.popupImage && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = {
                        ...formData,
                        runningText: {
                          ...runningTextData,
                          popupImage: '',
                        },
                      };
                      setFormData(updated);
                      setHasEdits(true);
                      onUpdateCMS(updated);
                      onToast('Gambar popup berhasil dihapus');
                    }}
                    className="px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-[8px] flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus Gambar Popup
                  </button>
                )}
              </div>

              <ImageUploader
                label="Gambar Pengumuman Popup"
                source="tautan"
                value={runningTextData.popupImage || ''}
                onChange={(_source, val) => {
                  const updated = {
                    ...formData,
                    runningText: {
                      ...runningTextData,
                      popupImage: val,
                    },
                  };
                  setFormData(updated);
                  setHasEdits(true);
                  onUpdateCMS(updated);
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Judul Popup (Opsional)
                  </label>
                  <input
                    type="text"
                    value={runningTextData.popupTitle || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        runningText: {
                          ...runningTextData,
                          popupTitle: e.target.value,
                        },
                      })
                    }
                    placeholder="Contoh: Promo Spesial Member Baru"
                    className="w-full h-10 px-3 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Keterangan Tambahan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={runningTextData.popupDescription || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        runningText: {
                          ...runningTextData,
                          popupDescription: e.target.value,
                        },
                      })
                    }
                    placeholder="Contoh: Berlaku s/d akhir bulan ini."
                    className="w-full h-10 px-3 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px]"
                  />
                </div>
              </div>
            </div>

            {/* Live Preview Bar */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Pratinjau Langsung (Klik untuk uji coba popup):
              </label>
              <div className="rounded-[14px] overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                <RunningTextBanner settings={runningTextData} />
              </div>
            </div>
          </div>
        )}

        {/* 2. Tema (Superadmin) */}
        {activeTab === 'theme' && (
          <div className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Warna Utama
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.theme.primaryColor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        theme: { ...formData.theme, primaryColor: e.target.value },
                      })
                    }
                    className="w-10 h-10 rounded-lg cursor-pointer border"
                  />
                  <span className="text-xs font-mono">{formData.theme.primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Warna Sekunder
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.theme.secondaryColor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        theme: { ...formData.theme, secondaryColor: e.target.value },
                      })
                    }
                    className="w-10 h-10 rounded-lg cursor-pointer border"
                  />
                  <span className="text-xs font-mono">{formData.theme.secondaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Warna Aksen
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.theme.accentColor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        theme: { ...formData.theme, accentColor: e.target.value },
                      })
                    }
                    className="w-10 h-10 rounded-lg cursor-pointer border"
                  />
                  <span className="text-xs font-mono">{formData.theme.accentColor}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Jenis Huruf
                </label>
                <select
                  value={formData.theme.fontFamily}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      theme: { ...formData.theme, fontFamily: e.target.value },
                    })
                  }
                  className="w-full h-11 px-3 text-sm bg-slate-50 border rounded-[14px]"
                >
                  <option value="Inter">Inter</option>
                  <option value="Poppins">Poppins</option>
                  <option value="sans-serif">System Sans-Serif</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Sudut Membulat (px)
                </label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={formData.theme.borderRadius}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      theme: { ...formData.theme, borderRadius: Number(e.target.value) },
                    })
                  }
                  className="w-full h-11 px-3.5 text-sm bg-slate-50 border rounded-[14px]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="dark_toggle"
                checked={formData.theme.darkMode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    theme: { ...formData.theme, darkMode: e.target.checked },
                  })
                }
                className="w-4 h-4 text-[#FF7A1A]"
              />
              <label htmlFor="dark_toggle" className="text-sm font-semibold text-slate-700">
                Mode Gelap Bawaan
              </label>
            </div>
          </div>
        )}

        {/* 3. Navigasi */}
        {activeTab === 'navigation' && (
          <div className="space-y-3">
            {formData.navigation
              .filter((n) => n.path !== '/kelas' && n.path !== '/tentang' && n.path !== '/kontak')
              .map((nav) => {
                const idx = formData.navigation.findIndex((item) => item.id === nav.id);
                return (
                  <div
                    key={nav.id}
                    className="p-3.5 rounded-[12px] bg-slate-50 dark:bg-slate-800 border flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={nav.isVisible}
                        onChange={(e) => {
                          const list = [...formData.navigation];
                          if (idx >= 0) list[idx].isVisible = e.target.checked;
                          setFormData({ ...formData, navigation: list });
                        }}
                        className="w-4 h-4 text-[#FF7A1A]"
                      />
                      <input
                        type="text"
                        value={nav.label}
                        onChange={(e) => {
                          const list = [...formData.navigation];
                          if (idx >= 0) list[idx].label = e.target.value;
                          setFormData({ ...formData, navigation: list });
                        }}
                        className="h-9 px-3 text-xs sm:text-sm font-semibold bg-white border rounded-[8px]"
                      />
                      <span className="text-xs text-slate-400 font-mono">{nav.path}</span>
                    </div>
                    <input
                      type="number"
                      value={nav.order}
                      onChange={(e) => {
                        const list = [...formData.navigation];
                        if (idx >= 0) list[idx].order = Number(e.target.value);
                        setFormData({ ...formData, navigation: list });
                      }}
                      className="w-16 h-8 px-2 text-xs bg-white border rounded-[8px]"
                    />
                  </div>
                );
              })}
          </div>
        )}

        {/* 4. Tombol */}
        {activeTab === 'buttons' && (
          <div className="space-y-3">
            {formData.buttons.map((btn, idx) => (
              <div
                key={btn.id}
                className="p-3.5 rounded-[12px] bg-slate-50 dark:bg-slate-800 border flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={btn.isVisible}
                    onChange={(e) => {
                      const list = [...formData.buttons];
                      list[idx].isVisible = e.target.checked;
                      setFormData({ ...formData, buttons: list });
                    }}
                    className="w-4 h-4 text-[#FF7A1A]"
                  />
                  <input
                    type="text"
                    value={btn.label}
                    onChange={(e) => {
                      const list = [...formData.buttons];
                      list[idx].label = e.target.value;
                      setFormData({ ...formData, buttons: list });
                    }}
                    className="h-9 px-3 text-xs sm:text-sm font-semibold bg-white border rounded-[8px]"
                  />
                </div>
                <span className="text-xs font-mono text-slate-400">{btn.id}</span>
              </div>
            ))}
          </div>
        )}

        {/* 5. Bagian Halaman */}
        {activeTab === 'sections' && (
          <div className="space-y-3">
            {formData.sections.map((sec, idx) => (
              <div
                key={sec.id}
                className="p-4 rounded-[12px] bg-slate-50 dark:bg-slate-800 border space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={sec.isVisible}
                      onChange={(e) => {
                        const list = [...formData.sections];
                        list[idx].isVisible = e.target.checked;
                        setFormData({ ...formData, sections: list });
                      }}
                      className="w-4 h-4 text-[#FF7A1A]"
                    />
                    <span className="text-xs font-bold font-mono text-slate-400">{sec.id}</span>
                  </div>
                  <input
                    type="number"
                    value={sec.order}
                    onChange={(e) => {
                      const list = [...formData.sections];
                      list[idx].order = Number(e.target.value);
                      setFormData({ ...formData, sections: list });
                    }}
                    className="w-16 h-8 px-2 text-xs bg-white border rounded-[8px]"
                  />
                </div>
                <input
                  type="text"
                  value={sec.title}
                  onChange={(e) => {
                    const list = [...formData.sections];
                    list[idx].title = e.target.value;
                    setFormData({ ...formData, sections: list });
                  }}
                  className="w-full h-10 px-3 text-sm font-bold bg-white border rounded-[10px]"
                />
              </div>
            ))}
          </div>
        )}

        {/* 6. Halaman Statis */}
        {activeTab === 'pages' && (
          <div className="space-y-4">
            {formData.pages.map((p, idx) => (
              <div key={p.id} className="p-4 rounded-[12px] bg-slate-50 border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">/{p.slug}</span>
                  <input
                    type="checkbox"
                    checked={p.isVisible}
                    onChange={(e) => {
                      const list = [...formData.pages];
                      list[idx].isVisible = e.target.checked;
                      setFormData({ ...formData, pages: list });
                    }}
                    className="w-4 h-4 text-[#FF7A1A]"
                  />
                </div>
                <input
                  type="text"
                  value={p.title}
                  onChange={(e) => {
                    const list = [...formData.pages];
                    list[idx].title = e.target.value;
                    setFormData({ ...formData, pages: list });
                  }}
                  className="w-full h-10 px-3 text-sm font-bold bg-white border rounded-[10px]"
                />
                <textarea
                  rows={3}
                  value={p.content}
                  onChange={(e) => {
                    const list = [...formData.pages];
                    list[idx].content = e.target.value;
                    setFormData({ ...formData, pages: list });
                  }}
                  className="w-full p-3 text-sm bg-white border rounded-[10px] resize-none"
                />
              </div>
            ))}
          </div>
        )}

        {/* 7. Fitur Sakelar */}
        {activeTab === 'features' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
            {Object.entries(formData.features).map(([key, val]) => (
              <label
                key={key}
                className={`p-3.5 rounded-[12px] border text-xs sm:text-sm font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                  val ? 'bg-blue-50/60 border-blue-200 text-[#0B2A5B]' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <span className="capitalize">{key}</span>
                <input
                  type="checkbox"
                  checked={val}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      features: { ...formData.features, [key]: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-[#FF7A1A]"
                />
              </label>
            ))}
          </div>
        )}

        {/* 8. Media & Video */}
        {activeTab === 'media' && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                URL Video Promosi (YouTube)
              </label>
              <input
                type="url"
                value={formData.media.promoVideoUrl}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    media: { ...formData.media, promoVideoUrl: e.target.value },
                  })
                }
                className="w-full h-11 px-3.5 text-sm bg-slate-50 border rounded-[14px]"
              />
            </div>
          </div>
        )}

        {/* 9. Footer & Kontak */}
        {activeTab === 'footer' && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Alamat</label>
              <input
                type="text"
                value={formData.footer.address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    footer: { ...formData.footer, address: e.target.value },
                  })
                }
                className="w-full h-11 px-3.5 text-sm bg-slate-50 border rounded-[14px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Telepon</label>
                <input
                  type="text"
                  value={formData.footer.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      footer: { ...formData.footer, phone: e.target.value },
                    })
                  }
                  className="w-full h-11 px-3.5 text-sm bg-slate-50 border rounded-[14px]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={formData.footer.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      footer: { ...formData.footer, email: e.target.value },
                    })
                  }
                  className="w-full h-11 px-3.5 text-sm bg-slate-50 border rounded-[14px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jam Layanan</label>
              <input
                type="text"
                value={formData.footer.hours}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    footer: { ...formData.footer, hours: e.target.value },
                  })
                }
                className="w-full h-11 px-3.5 text-sm bg-slate-50 border rounded-[14px]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Teks Hak Cipta</label>
              <input
                type="text"
                value={formData.footer.copyright}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    footer: { ...formData.footer, copyright: e.target.value },
                  })
                }
                className="w-full h-11 px-3.5 text-sm bg-slate-50 border rounded-[14px]"
              />
            </div>
          </div>
        )}

        {/* 10. Pratinjau & Simpan */}
        {activeTab === 'save' && (
          <div className="space-y-6">
            <div className="p-4 rounded-[12px] bg-slate-50 border space-y-3">
              <h4 className="text-sm font-bold text-slate-800">Ringkasan Konfigurasi</h4>
              <p className="text-xs text-slate-500 font-mono">
                Aplikasi: {formData.identity.appName} • Lynk: {formData.identity.lynkUrl}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="min-h-[44px] px-6 text-sm font-semibold text-white bg-[#0B2A5B] hover:bg-[#1E4FA8] disabled:opacity-75 rounded-[12px] flex items-center gap-2 shadow-xs"
              >
                <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
                {isSaving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        )}

        {/* Persistent bottom save action bar on every tab */}
        {activeTab !== 'save' && (
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="min-h-[42px] px-6 text-sm font-semibold text-white bg-[#0B2A5B] hover:bg-[#1E4FA8] active:scale-[0.98] disabled:opacity-75 rounded-[12px] flex items-center gap-2 shadow-xs transition-all"
            >
              <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              {isSaving ? 'Menyimpan ke Cloud...' : 'Simpan Perubahan'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
