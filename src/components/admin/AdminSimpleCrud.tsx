import React, { useState } from 'react';
import { AppExample, Testimonial, FaqItem, Announcement, ContactMessage } from '../../types';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { generateId, formatDate } from '../../utils/crypto';
import { Plus, Edit2, Trash2, Eye, EyeOff, Search, Star, MessageSquare, LayoutGrid } from 'lucide-react';

interface AdminSimpleCrudProps {
  type: 'examples' | 'testimonials' | 'faq' | 'announcements' | 'contacts';
  appExamples: AppExample[];
  testimonials: Testimonial[];
  faq: FaqItem[];
  announcements: Announcement[];
  contacts: ContactMessage[];
  onSaveExample: (item: AppExample) => void;
  onDeleteExample: (id: string) => void;
  onSaveTestimonial: (item: Testimonial) => void;
  onDeleteTestimonial: (id: string) => void;
  onSaveFaq: (item: FaqItem) => void;
  onDeleteFaq: (id: string) => void;
  onSaveAnnouncement: (item: Announcement) => void;
  onDeleteAnnouncement: (id: string) => void;
  onMarkContactRead: (id: string) => void;
  onDeleteContact: (id: string) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminSimpleCrud: React.FC<AdminSimpleCrudProps> = ({
  type,
  appExamples,
  testimonials,
  faq,
  announcements,
  contacts,
  onSaveExample,
  onDeleteExample,
  onSaveTestimonial,
  onDeleteTestimonial,
  onSaveFaq,
  onDeleteFaq,
  onSaveAnnouncement,
  onDeleteAnnouncement,
  onMarkContactRead,
  onDeleteContact,
  onToast,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Generic form fields
  const [field1, setField1] = useState(''); // name / question / title
  const [field2, setField2] = useState(''); // category / role / answer / content
  const [field3, setField3] = useState(''); // description / avatar / date
  const [field4, setField4] = useState(''); // imageUrl / rating (number) / appUrl
  const [field5, setField5] = useState(''); // appUrl
  const [isVisible, setIsVisible] = useState(true);

  const getTitle = () => {
    switch (type) {
      case 'examples': return 'Contoh Aplikasi';
      case 'testimonials': return 'Testimoni';
      case 'faq': return 'Tanya Jawab';
      case 'announcements': return 'Pengumuman';
      case 'contacts': return 'Pesan Kontak';
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setField1('');
    setField2('');
    setField3('');
    setField4(type === 'testimonials' ? '5' : '');
    setField5('');
    setIsVisible(true);
    setIsEditing(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingId(item.id);
    setIsVisible(item.isVisible !== false);
    if (type === 'examples') {
      setField1(item.name);
      setField2(item.category);
      setField3(item.description);
      setField4(item.imageUrl);
      setField5(item.appUrl);
    } else if (type === 'testimonials') {
      setField1(item.name);
      setField2(item.role);
      setField3(item.content);
      setField4(String(item.rating || 5));
      setField5(item.avatarUrl);
    } else if (type === 'faq') {
      setField1(item.question);
      setField2(item.answer);
    } else if (type === 'announcements') {
      setField1(item.title);
      setField2(item.content);
      setField3(item.date || new Date().toISOString().substring(0, 10));
    }
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!field1.trim()) {
      onToast('Judul / Nama wajib diisi', 'error');
      return;
    }

    if (type === 'examples') {
      onSaveExample({
        id: editingId || generateId('app'),
        name: field1.trim(),
        category: field2.trim() || 'Umum',
        description: field3.trim(),
        imageUrl: field4.trim() || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        appUrl: field5.trim() || 'https://gubersmart.com',
        order: appExamples.length + 1,
        isVisible,
      });
    } else if (type === 'testimonials') {
      onSaveTestimonial({
        id: editingId || generateId('testi'),
        name: field1.trim(),
        role: field2.trim() || 'Member',
        content: field3.trim(),
        rating: Number(field4) || 5,
        avatarUrl: field5.trim() || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        order: testimonials.length + 1,
        isVisible,
      });
    } else if (type === 'faq') {
      onSaveFaq({
        id: editingId || generateId('faq'),
        question: field1.trim(),
        answer: field2.trim(),
        order: faq.length + 1,
        isVisible,
      });
    } else if (type === 'announcements') {
      onSaveAnnouncement({
        id: editingId || generateId('ann'),
        title: field1.trim(),
        content: field2.trim(),
        date: field3.trim() || new Date().toISOString().substring(0, 10),
        order: announcements.length + 1,
        isVisible,
      });
    }

    setIsEditing(false);
    onToast('Berhasil disimpan');
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetId) return;
    if (type === 'examples') onDeleteExample(deleteTargetId);
    if (type === 'testimonials') onDeleteTestimonial(deleteTargetId);
    if (type === 'faq') onDeleteFaq(deleteTargetId);
    if (type === 'announcements') onDeleteAnnouncement(deleteTargetId);
    if (type === 'contacts') onDeleteContact(deleteTargetId);

    setDeleteTargetId(null);
    onToast('Berhasil dihapus');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold font-heading text-[#0B2A5B] dark:text-white">
          Kelola {getTitle()}
        </h2>

        {!isEditing && type !== 'contacts' && (
          <button
            onClick={handleOpenAdd}
            className="h-10 px-4 text-xs sm:text-sm font-semibold text-white bg-[#FF7A1A] hover:bg-[#E56A10] rounded-[12px] flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Tambah Data
          </button>
        )}
      </div>

      {isEditing ? (
        /* Dynamic editor form */
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-[14px] p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <h3 className="text-lg font-bold font-heading text-[#0B2A5B] dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            {editingId ? 'Ubah Data' : 'Tambah Data Baru'}
          </h3>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {type === 'faq' ? 'Pertanyaan *' : type === 'announcements' ? 'Judul Pengumuman *' : 'Nama *'}
            </label>
            <input
              type="text"
              value={field1}
              onChange={(e) => setField1(e.target.value)}
              className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 rounded-[14px]"
            />
          </div>

          {type === 'examples' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kategori</label>
                  <input
                    type="text"
                    value={field2}
                    onChange={(e) => setField2(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm bg-slate-50 border rounded-[14px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tautan Aplikasi</label>
                  <input
                    type="url"
                    value={field5}
                    onChange={(e) => setField5(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm bg-slate-50 border rounded-[14px]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">URL Gambar</label>
                <input
                  type="url"
                  value={field4}
                  onChange={(e) => setField4(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm bg-slate-50 border rounded-[14px]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Deskripsi</label>
                <textarea
                  rows={3}
                  value={field3}
                  onChange={(e) => setField3(e.target.value)}
                  className="w-full p-3 text-sm bg-slate-50 border rounded-[14px] resize-none"
                />
              </div>
            </>
          )}

          {type === 'testimonials' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Peran / Profesi</label>
                  <input
                    type="text"
                    value={field2}
                    onChange={(e) => setField2(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm bg-slate-50 border rounded-[14px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bintang (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={field4}
                    onChange={(e) => setField4(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm bg-slate-50 border rounded-[14px]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">URL Avatar</label>
                <input
                  type="url"
                  value={field5}
                  onChange={(e) => setField5(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm bg-slate-50 border rounded-[14px]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Isi Ulasan</label>
                <textarea
                  rows={3}
                  value={field3}
                  onChange={(e) => setField3(e.target.value)}
                  className="w-full p-3 text-sm bg-slate-50 border rounded-[14px] resize-none"
                />
              </div>
            </>
          )}

          {type === 'faq' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jawaban *</label>
              <textarea
                rows={4}
                value={field2}
                onChange={(e) => setField2(e.target.value)}
                className="w-full p-3 text-sm bg-slate-50 border rounded-[14px] resize-none"
              />
            </div>
          )}

          {type === 'announcements' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tanggal</label>
                <input
                  type="date"
                  value={field3}
                  onChange={(e) => setField3(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm bg-slate-50 border rounded-[14px]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Isi Pengumuman</label>
                <textarea
                  rows={4}
                  value={field2}
                  onChange={(e) => setField2(e.target.value)}
                  className="w-full p-3 text-sm bg-slate-50 border rounded-[14px] resize-none"
                />
              </div>
            </>
          )}

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_vis"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              className="w-4 h-4 text-[#FF7A1A]"
            />
            <label htmlFor="is_vis" className="text-sm font-semibold text-slate-700">
              Tampilkan di Situs
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="min-h-[44px] px-5 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-[12px]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-6 text-sm font-semibold text-white bg-[#0B2A5B] hover:bg-[#1E4FA8] rounded-[12px] shadow-xs"
            >
              Simpan
            </button>
          </div>
        </form>
      ) : (
        /* List rendering */
        <div className="space-y-3">
          {type === 'contacts' && (
            contacts.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">Belum ada data</div>
            ) : (
              contacts.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-[14px] border shadow-xs space-y-2 transition-colors ${
                    msg.isRead ? 'bg-white dark:bg-slate-900 border-slate-100' : 'bg-blue-50/50 border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {msg.name} ({msg.whatsapp})
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!msg.isRead && (
                        <button
                          onClick={() => {
                            onMarkContactRead(msg.id);
                            onToast('Ditandai sudah dibaca');
                          }}
                          className="h-8 px-2.5 text-xs font-semibold text-[#1E4FA8] bg-white rounded-[8px] border shadow-xs"
                        >
                          Tandai Dibaca
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteTargetId(msg.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {msg.message}
                  </p>
                </div>
              ))
            )
          )}

          {type === 'examples' && (
            appExamples.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-100 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-10 rounded-[8px] overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                    {item.imageUrl && item.imageUrl.trim() !== '' ? (
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <LayoutGrid className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</h4>
                    <span className="text-xs text-slate-400">{item.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="h-8 px-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[8px] flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Ubah
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(item.id)}
                    className="h-8 px-2.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-[8px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}

          {type === 'testimonials' && (
            testimonials.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-100 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.name} ({item.role})
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1 italic">"{item.content}"</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="h-8 px-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[8px] flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Ubah
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(item.id)}
                    className="h-8 px-2.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-[8px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}

          {type === 'faq' && (
            faq.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-100 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.question}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1">{item.answer}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="h-8 px-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[8px] flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Ubah
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(item.id)}
                    className="h-8 px-2.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-[8px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}

          {type === 'announcements' && (
            announcements.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-100 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                  <p className="text-xs text-slate-400">{formatDate(item.date)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="h-8 px-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[8px] flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Ubah
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(item.id)}
                    className="h-8 px-2.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-[8px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Hapus Data Ini?"
        confirmLabel="Hapus"
        cancelLabel="Batal"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
