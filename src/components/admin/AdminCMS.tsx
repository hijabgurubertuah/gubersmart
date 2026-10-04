import React, { useState } from 'react';
import { CMSSettings, Role } from '../../types';
import { ImageUploader } from '../common/ImageUploader';
import { RotateCcw, Save, Eye, Palette, Check } from 'lucide-react';

interface AdminCMSProps {
  role: Role;
  cms: CMSSettings;
  onUpdateCMS: (updates: Partial<CMSSettings>) => void;
  onResetCMS: () => void;
  onToast: (msg: string) => void;
}

export const AdminCMS: React.FC<AdminCMSProps> = ({
  role,
  cms,
  onUpdateCMS,
  onResetCMS,
  onToast,
}) => {
  // Local state copy
  const [formData, setFormData] = useState<CMSSettings>(JSON.parse(JSON.stringify(cms)));
  const [activeTab, setActiveTab] = useState<string>(
    role === 'Superadmin' ? 'identity' : 'sections'
  );

  // Tabs allowed based on role
  // Superadmin: all 10
  // Admin: Bagian Halaman (sections), Halaman (pages), Tombol (buttons), Navigasi (nav), Footer dan Kontak (footer)
  const allowedTabs = role === 'Superadmin'
    ? [
        { id: 'identity', label: 'Identitas' },
        { id: 'theme', label: 'Tema' },
        { id: 'navigation', label: 'Navigasi' },
        { id: 'buttons', label: 'Tombol' },
        { id: 'sections', label: 'Bagian Halaman' },
        { id: 'pages', label: 'Halaman' },
        { id: 'features', label: 'Fitur' },
        { id: 'media', label: 'Lokasi & Media' },
        { id: 'footer', label: 'Footer & Kontak' },
        { id: 'save', label: 'Pratinjau & Simpan' },
      ]
    : [
        { id: 'sections', label: 'Bagian Halaman' },
        { id: 'pages', label: 'Halaman' },
        { id: 'buttons', label: 'Tombol' },
        { id: 'navigation', label: 'Navigasi' },
        { id: 'footer', label: 'Footer & Kontak' },
        { id: 'save', label: 'Pratinjau & Simpan' },
      ];

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    onUpdateCMS(formData);
    onToast('Pengaturan CMS berhasil disimpan & disinkronkan ke Firebase');
    setTimeout(() => setIsSaving(false), 600);
  };

  const handleReset = () => {
    onResetCMS();
    setFormData(JSON.parse(JSON.stringify(cms)));
    onToast('Pengaturan dipulihkan ke bawaan');
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-16 z-20 bg-slate-50/95 dark:bg-slate-950/95 py-3 -mt-2 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold font-heading text-[#0B2A5B] dark:text-white">
          Pengaturan Tampilan (CMS)
        </h2>
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

      {/* Tabs pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {allowedTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`min-h-[40px] px-4 py-2 rounded-[12px] text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === t.id
                ? 'bg-[#0B2A5B] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="bg-white dark:bg-slate-900 rounded-[14px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
        {/* 1. Identitas (Superadmin) */}
        {activeTab === 'identity' && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Aplikasi *
              </label>
              <input
                type="text"
                value={formData.identity.appName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    identity: { ...formData.identity, appName: e.target.value },
                  })
                }
                className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 rounded-[14px]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Slogan *
              </label>
              <input
                type="text"
                value={formData.identity.tagline}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    identity: { ...formData.identity, tagline: e.target.value },
                  })
                }
                className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 rounded-[14px]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Judul Utama Banner *
              </label>
              <input
                type="text"
                value={formData.identity.heroTitle}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    identity: { ...formData.identity, heroTitle: e.target.value },
                  })
                }
                className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 rounded-[14px]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Subjudul Banner *
              </label>
              <textarea
                rows={3}
                value={formData.identity.heroSubtitle}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    identity: { ...formData.identity, heroSubtitle: e.target.value },
                  })
                }
                className="w-full p-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 rounded-[14px] resize-none"
              />
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
            {formData.navigation.map((nav, idx) => (
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
                      list[idx].isVisible = e.target.checked;
                      setFormData({ ...formData, navigation: list });
                    }}
                    className="w-4 h-4 text-[#FF7A1A]"
                  />
                  <input
                    type="text"
                    value={nav.label}
                    onChange={(e) => {
                      const list = [...formData.navigation];
                      list[idx].label = e.target.value;
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
                    list[idx].order = Number(e.target.value);
                    setFormData({ ...formData, navigation: list });
                  }}
                  className="w-16 h-8 px-2 text-xs bg-white border rounded-[8px]"
                />
              </div>
            ))}
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
                onClick={handleReset}
                className="min-h-[44px] px-5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-[12px] flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Pulihkan Bawaan
              </button>
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
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="min-h-[42px] px-4 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[12px] flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Pulihkan Bawaan
            </button>
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
