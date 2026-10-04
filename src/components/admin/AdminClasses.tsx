import React, { useState } from 'react';
import { Course, FileSource } from '../../types';
import { ImageUploader } from '../common/ImageUploader';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatRupiah, generateId } from '../../utils/crypto';
import { Plus, Edit2, Trash2, Search, ArrowUpDown, Eye, EyeOff } from 'lucide-react';

interface AdminClassesProps {
  courses: Course[];
  onSaveCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => Course | null;
  onRestoreCourse: (course: Course) => void;
  onToast: (msg: string) => void;
}

export const AdminClasses: React.FC<AdminClassesProps> = ({
  courses,
  onSaveCourse,
  onDeleteCourse,
  onRestoreCourse,
  onToast,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [lynkUrl, setLynkUrl] = useState('');
  const [coverSource, setCoverSource] = useState<FileSource>('tautan');
  const [coverValue, setCoverValue] = useState('');
  const [duration, setDuration] = useState('3 Jam');
  const [status, setStatus] = useState<'tampil' | 'sembunyi'>('tampil');
  const [order, setOrder] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setName('');
    setSummary('');
    setDescription('');
    setPrice(149000);
    setLynkUrl('');
    setCoverSource('tautan');
    setCoverValue('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80');
    setDuration('3 Jam');
    setStatus('tampil');
    setOrder(courses.length + 1);
    setErrors({});
    setIsEditing(true);
  };

  const handleOpenEdit = (c: Course) => {
    setEditingCourse(c);
    setName(c.name);
    setSummary(c.summary);
    setDescription(c.description);
    setPrice(c.price);
    setLynkUrl(c.lynkUrl);
    setCoverSource(c.coverSource);
    setCoverValue(c.coverValue);
    setDuration(c.duration);
    setStatus(c.status);
    setOrder(c.order);
    setErrors({});
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Nama kelas wajib diisi';
    if (!summary.trim()) newErrors.summary = 'Ringkasan wajib diisi';
    if (!description.trim()) newErrors.description = 'Deskripsi wajib diisi';
    if (!coverValue.trim()) newErrors.coverValue = 'Sampul wajib diisi';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload: Course = {
      id: editingCourse ? editingCourse.id : generateId('course'),
      name: name.trim(),
      summary: summary.trim(),
      description: description.trim(),
      price: Number(price) || 0,
      lynkUrl: lynkUrl.trim(),
      coverSource,
      coverValue: coverValue.trim(),
      duration: duration.trim(),
      status,
      order: Number(order) || 1,
      whatYouWillLearn: editingCourse?.whatYouWillLearn || ['Fondasi praktis', 'Instruksi AI', 'Publikasi domain'],
    };

    onSaveCourse(payload);
    setIsEditing(false);
    onToast('Berhasil disimpan');
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetId) return;
    const deleted = onDeleteCourse(deleteTargetId);
    setDeleteTargetId(null);
    if (deleted) {
      onToast('Kelas berhasil dihapus');
    }
  };

  const filtered = courses.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold font-heading text-[#0B2A5B] dark:text-white">
          Kelola Kelas
        </h2>

        {!isEditing && (
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[12px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40"
              />
            </div>
            <button
              onClick={handleOpenAdd}
              className="h-10 px-4 text-xs sm:text-sm font-semibold text-white bg-[#FF7A1A] hover:bg-[#E56A10] rounded-[12px] flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              Tambah Kelas
            </button>
          </div>
        )}
      </div>

      {/* Editor Form Modal / View */}
      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-[14px] p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
          <h3 className="text-lg font-bold font-heading text-[#0B2A5B] dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            {editingCourse ? 'Ubah Kelas' : 'Tambah Kelas Baru'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Kelas *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40"
              />
              {errors.name && <p className="text-xs font-medium text-rose-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Harga (Rp) *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tautan Lynk.id *
              </label>
              <input
                type="url"
                value={lynkUrl}
                onChange={(e) => setLynkUrl(e.target.value)}
                className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Durasi
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Urutan
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-11 px-3 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40"
              >
                <option value="tampil">Tampil</option>
                <option value="sembunyi">Sembunyi</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <ImageUploader
                label="Sampul Kelas"
                source={coverSource}
                value={coverValue}
                onChange={(src, val) => {
                  setCoverSource(src);
                  setCoverValue(val);
                }}
                required
              />
              {errors.coverValue && (
                <p className="text-xs font-medium text-rose-600 mt-1">{errors.coverValue}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Ringkasan Singkat *
              </label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full p-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40 resize-none"
              />
              {errors.summary && (
                <p className="text-xs font-medium text-rose-600 mt-1">{errors.summary}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Deskripsi Lengkap *
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40 resize-none"
            />
            {errors.description && (
              <p className="text-xs font-medium text-rose-600 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Action buttons positioned at bottom right */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="min-h-[44px] px-5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 rounded-[12px] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-6 text-sm font-semibold text-white bg-[#0B2A5B] hover:bg-[#1E4FA8] rounded-[12px] transition-colors shadow-xs"
            >
              Simpan
            </button>
          </div>
        </form>
      ) : (
        /* List / Responsive Cards */
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Belum ada data
            </div>
          ) : (
            filtered.map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-slate-900 rounded-[14px] p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-16 h-12 rounded-[10px] overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                    <img src={course.coverValue} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">#{course.order}</span>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {course.name}
                      </h4>
                      {course.status === 'tampil' ? (
                        <span className="p-0.5 text-emerald-600">
                          <Eye className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="p-0.5 text-slate-400">
                          <EyeOff className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {formatRupiah(course.price)} • {course.duration}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => handleOpenEdit(course)}
                    className="h-9 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-[10px] flex items-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Ubah
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(course.id)}
                    className="h-9 px-3 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 rounded-[10px] flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Hapus Kelas Ini?"
        confirmLabel="Hapus"
        cancelLabel="Batal"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
