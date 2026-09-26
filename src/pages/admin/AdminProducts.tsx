import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, VideoPart } from '../../types';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { Modal } from '../../components/ui/Modal';
import { Tooltip } from '../../components/ui/Tooltip';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Video,
  Download,
  Check,
  X,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    navigate,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'Tayang' | 'Draft'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: categories[0]?.name || 'Kelas Belajar',
    price: 299000,
    coverUrl: '',
    shortDescription: '',
    status: 'Tayang' as 'Tayang' | 'Draft',
    lynkIdUrl: '',
    bonusFileUrl: '',
    bonusFileName: '',
    headline: '',
    subheadline: '',
    benefitsText: '',
  });

  const [videos, setVideos] = useState<VideoPart[]>([]);

  const filteredProducts =
    statusFilter === 'all'
      ? products
      : products.filter((p) => p.status === statusFilter);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      category: categories[0]?.name || 'Kelas Belajar',
      price: 299000,
      coverUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      shortDescription: '',
      status: 'Tayang',
      lynkIdUrl: 'https://lynk.id/gubersmart/',
      bonusFileUrl: '',
      bonusFileName: '',
      headline: '',
      subheadline: '',
      benefitsText: 'Akses seumur hidup\nDownload modul materi\nPembaruan berkala',
    });
    setVideos([
      {
        id: `vid-${Date.now()}-1`,
        partNumber: 1,
        title: 'Pengenalan & Memulai',
        description: 'Penjelasan dasar dan langkah persiapan awal.',
        youtubeUrlOrId: 'dQw4w9WgXcQ',
        duration: '15:00',
      },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      slug: prod.slug,
      category: prod.category,
      price: prod.price,
      coverUrl: prod.coverUrl,
      shortDescription: prod.shortDescription,
      status: prod.status,
      lynkIdUrl: prod.lynkIdUrl,
      bonusFileUrl: prod.bonusFileUrl || '',
      bonusFileName: prod.bonusFileName || '',
      headline: prod.landingPage.headline || '',
      subheadline: prod.landingPage.subheadline || '',
      benefitsText: prod.landingPage.benefits.join('\n'),
    });
    setVideos(prod.videos || []);
    setIsModalOpen(true);
  };

  const handleAddVideoPart = () => {
    const nextNum = videos.length + 1;
    setVideos([
      ...videos,
      {
        id: `vid-${Date.now()}-${nextNum}`,
        partNumber: nextNum,
        title: `Part ${nextNum}: Judul Materi Baru`,
        description: 'Deskripsi pembahasan materi bagian ini.',
        youtubeUrlOrId: 'dQw4w9WgXcQ',
        duration: '10:00',
      },
    ]);
  };

  const handleUpdateVideo = (idx: number, field: keyof VideoPart, value: any) => {
    setVideos(
      videos.map((v, i) => (i === idx ? { ...v, [field]: value } : v))
    );
  };

  const handleDeleteVideo = (idx: number) => {
    setVideos(videos.filter((_, i) => i !== idx));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    const benefitsArray = formData.benefitsText
      .split('\n')
      .map((b) => b.trim())
      .filter(Boolean);

    const productPayload = {
      name: formData.name,
      slug: formData.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: formData.category,
      price: Number(formData.price),
      coverUrl: formData.coverUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      shortDescription: formData.shortDescription,
      status: formData.status,
      lynkIdUrl: formData.lynkIdUrl,
      bonusFileUrl: formData.bonusFileUrl || undefined,
      bonusFileName: formData.bonusFileName || undefined,
      landingPage: {
        headline: formData.headline || formData.name,
        subheadline: formData.subheadline || formData.shortDescription,
        benefits: benefitsArray.length > 0 ? benefitsArray : ['Akses materi lengkap', 'Bonus download'],
        features: editingProduct?.landingPage.features || [
          { title: 'Kurikulum Terstruktur', desc: 'Materi disusun bertahap.' },
        ],
        faq: editingProduct?.landingPage.faq || [
          { q: 'Bagaimana cara mengakses materi?', a: 'Login ke member area setelah pembayaran disetujui.' },
        ],
      },
      videos: videos.map((v, i) => ({ ...v, partNumber: i + 1 })),
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productPayload);
    } else {
      addProduct(productPayload);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Kelola Produk Digital"
          actionButton={
            <Tooltip content="Buat Landing Page & Modul Produk Baru">
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Produk</span>
              </button>
            </Tooltip>
          }
        />

        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Status Filter Tabs */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({products.length})
              </button>
              <button
                onClick={() => setStatusFilter('Tayang')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'Tayang'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tayang ({products.filter((p) => p.status === 'Tayang').length})
              </button>
              <button
                onClick={() => setStatusFilter('Draft')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === 'Draft'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Draft ({products.filter((p) => p.status === 'Draft').length})
              </button>
            </div>
          </div>

          {/* Product Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Produk</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Harga</th>
                  <th className="py-3.5 px-4">Modul Video</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.coverUrl}
                          alt={prod.name}
                          className="w-10 h-7 rounded object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate max-w-xs sm:max-w-sm">
                            {prod.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            /{prod.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{prod.category}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono-tabular">
                      {formatIDR(prod.price)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono-tabular">
                      {prod.videos.length} Part
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() =>
                          updateProduct(prod.id, {
                            status: prod.status === 'Tayang' ? 'Draft' : 'Tayang',
                          })
                        }
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                          prod.status === 'Tayang'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {prod.status === 'Tayang' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Tayang</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3 text-slate-400" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Tooltip content="Lihat Landing Page Publik">
                          <button
                            onClick={() => navigate(`/${prod.slug}`)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip>

                        <Tooltip content="Edit Konten & Video">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip>

                        <Tooltip content="Hapus Produk">
                          <button
                            onClick={() => {
                              if (confirm(`Hapus produk "${prod.name}"?`)) {
                                deleteProduct(prod.id);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Product Editor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Produk Digital' : 'Tambah Produk Digital'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nama Produk
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Kelas Web App Full-Stack"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                URL Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="kelaswebapp"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Harga (IDR)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="299000"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as 'Tayang' | 'Draft' })
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              >
                <option value="Tayang">Tayang (Aktif)</option>
                <option value="Draft">Draft (Tersembunyi)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                URL Gambar Cover
              </label>
              <input
                type="text"
                value={formData.coverUrl}
                onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Link Checkout Lynk.id
              </label>
              <input
                type="text"
                value={formData.lynkIdUrl}
                onChange={(e) => setFormData({ ...formData, lynkIdUrl: e.target.value })}
                placeholder="https://lynk.id/..."
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Deskripsi Singkat
            </label>
            <textarea
              rows={2}
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              placeholder="Ringkasan isi produk untuk kartu katalog..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>

          {/* Bonus File via Google Drive */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Berkas Bonus Member (Google Drive)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Nama Berkas</label>
                <input
                  type="text"
                  value={formData.bonusFileName}
                  onChange={(e) => setFormData({ ...formData, bonusFileName: e.target.value })}
                  placeholder="Template-Boilerplate.zip"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">
                  Link Tautan Google Drive
                </label>
                <input
                  type="text"
                  value={formData.bonusFileUrl}
                  onChange={(e) => setFormData({ ...formData, bonusFileUrl: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Video Parts Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-indigo-600" />
                <span>Modul Video Materi ({videos.length} Part)</span>
              </div>
              <button
                type="button"
                onClick={handleAddVideoPart}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Tambah Part</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {videos.map((vid, idx) => (
                <div
                  key={vid.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-slate-500">#{idx + 1}</span>
                    <input
                      type="text"
                      value={vid.title}
                      onChange={(e) => handleUpdateVideo(idx, 'title', e.target.value)}
                      placeholder="Judul Part"
                      className="flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteVideo(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={vid.youtubeUrlOrId}
                      onChange={(e) =>
                        handleUpdateVideo(idx, 'youtubeUrlOrId', e.target.value)
                      }
                      placeholder="YouTube ID / URL"
                      className="col-span-2 px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-mono text-[11px]"
                    />
                    <input
                      type="text"
                      value={vid.duration || ''}
                      onChange={(e) => handleUpdateVideo(idx, 'duration', e.target.value)}
                      placeholder="Durasi (15:00)"
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-mono text-[11px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Simpan Produk
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
