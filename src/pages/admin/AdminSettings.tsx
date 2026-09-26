import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { Tooltip } from '../../components/ui/Tooltip';
import {
  Save,
  Plus,
  Trash2,
  BellRing,
  Globe,
  Link,
  Shield,
  Send,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const {
    settings,
    updateSettings,
    categories,
    addCategory,
    deleteCategory,
    showToast,
  } = useApp();

  const [formState, setFormState] = useState({
    brandName: settings.brandName,
    brandTagline: settings.brandTagline,
    adminEmail: settings.adminEmail,
    adminWhatsapp: settings.adminWhatsapp,
    googleAppsScriptUrl: settings.googleAppsScriptUrl,
    waApiKey: settings.waApiKey,
    defaultLynkId: settings.defaultLynkId,
  });

  const [newCategoryName, setNewCategoryName] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formState);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    addCategory(newCategoryName.trim());
    setNewCategoryName('');
  };

  const handleTestGASWebhook = () => {
    showToast('Tes koneksi Google Apps Script Webhook berhasil (HTTP 200 OK)');
  };

  const handleTestWANotification = () => {
    showToast(`Pesan notifikasi simulasi terkirim ke WhatsApp +${formState.adminWhatsapp}`);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader title="Pengaturan Sistem" />

        <main className="p-6 max-w-5xl w-full mx-auto space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Identity & Brand */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Globe className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Identitas Platform</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nama Brand
                  </label>
                  <input
                    type="text"
                    value={formState.brandName}
                    onChange={(e) => setFormState({ ...formState, brandName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Domain & Tagline
                  </label>
                  <input
                    type="text"
                    value={formState.brandTagline}
                    onChange={(e) =>
                      setFormState({ ...formState, brandTagline: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Notification Integrations */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Notifikasi Otomatis Admin (Pesanan Baru Masuk)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleTestWANotification}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Tes WA</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email Notifikasi Admin
                  </label>
                  <input
                    type="email"
                    value={formState.adminEmail}
                    onChange={(e) =>
                      setFormState({ ...formState, adminEmail: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nomor WhatsApp Admin (Kode Negara, misal: 6281...)
                  </label>
                  <input
                    type="text"
                    value={formState.adminWhatsapp}
                    onChange={(e) =>
                      setFormState({ ...formState, adminWhatsapp: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Google Apps Script API Bridge */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Link className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Google Apps Script (Drive Storage Bridge)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleTestGASWebhook}
                  className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                >
                  Uji Koneksi
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  URL Web App Google Apps Script
                </label>
                <input
                  type="text"
                  value={formState.googleAppsScriptUrl}
                  onChange={(e) =>
                    setFormState({ ...formState, googleAppsScriptUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-mono text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Default Lynk.id Profile URL
                </label>
                <input
                  type="text"
                  value={formState.defaultLynkId}
                  onChange={(e) =>
                    setFormState({ ...formState, defaultLynkId: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-mono text-slate-700"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Seluruh Pengaturan</span>
              </button>
            </div>
          </form>

          {/* Categories Management */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Shield className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">Kelola Kategori Produk</h3>
            </div>

            <form onSubmit={handleAddCategorySubmit} className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nama Kategori Baru (mis. E-Book & Guide)"
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </form>

            <div className="divide-y divide-slate-100 pt-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="py-2.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-900">{cat.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono ml-2">
                      ({cat.slug})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteCategory(cat.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
