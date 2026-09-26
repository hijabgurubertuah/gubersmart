import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Testimonial } from '../../types';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { Modal } from '../../components/ui/Modal';
import { Tooltip } from '../../components/ui/Tooltip';
import { Plus, Trash2, Star, MessageSquare } from 'lucide-react';

export const AdminTestimonials: React.FC = () => {
  const { testimonials, products, addTestimonial, deleteTestimonial } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: products[0]?.id || '',
    customerName: '',
    customerRole: 'Member Kelas',
    content: '',
    rating: 5,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.content) return;

    addTestimonial({
      productId: formData.productId || products[0]?.id || 'prod-1',
      customerName: formData.customerName,
      customerRole: formData.customerRole,
      content: formData.content,
      rating: Number(formData.rating),
      date: new Date().toISOString().split('T')[0],
    });

    setIsModalOpen(false);
    setFormData({
      productId: products[0]?.id || '',
      customerName: '',
      customerRole: 'Member Kelas',
      content: '',
      rating: 5,
    });
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Kelola Testimoni"
          actionButton={
            <Tooltip content="Tambah Testimoni Baru">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Testimoni</span>
              </button>
            </Tooltip>
          }
        />

        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t) => {
              const prod = products.find((p) => p.id === t.productId);
              return (
                <div
                  key={t.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>

                      <Tooltip content="Hapus Testimoni">
                        <button
                          onClick={() => {
                            if (confirm('Hapus testimoni ini?')) {
                              deleteTestimonial(t.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      &ldquo;{t.content}&rdquo;
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{t.customerName}</div>
                      <div className="text-[11px] text-slate-500">{t.customerRole}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-indigo-600 font-medium block truncate max-w-28">
                        {prod ? prod.name : 'Produk'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{t.date}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Testimoni"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Pilih Produk Terkait
            </label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nama Customer
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Rudi Hermawan"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Profesi / Keterangan
              </label>
              <input
                type="text"
                value={formData.customerRole}
                onChange={(e) => setFormData({ ...formData, customerRole: e.target.value })}
                placeholder="Freelance Web Developer"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Rating Bintang</label>
            <select
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-mono"
            >
              <option value="5">5 Bintang (Sangat Puas)</option>
              <option value="4">4 Bintang (Puas)</option>
              <option value="3">3 Bintang (Cukup)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Isi Ulasan / Testimoni
            </label>
            <textarea
              rows={3}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Ceritakan pengalaman belajar atau manfaat yang dirasakan..."
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
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
              Simpan Testimoni
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
