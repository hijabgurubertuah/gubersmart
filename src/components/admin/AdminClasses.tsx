import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Course, FileSource, CourseAuthor } from '../../types';
import { ImageUploader } from '../common/ImageUploader';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { RichTextEditor } from '../common/RichTextEditor';
import { formatRupiah, generateId } from '../../utils/crypto';
import { firebaseSync } from '../../services/firebaseSync';
import { store } from '../../services/store';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Eye,
  EyeOff,
  BookOpen,
  Loader2,
  CheckCircle2,
  CloudUpload,
} from 'lucide-react';

interface AdminClassesProps {
  courses: Course[];
  onSaveCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => Course | null;
  onRestoreCourse: (course: Course) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const AUTOSAVE_STORAGE_KEY = 'guber_admin_class_local_draft';

export const AdminClasses: React.FC<AdminClassesProps> = ({
  courses,
  onSaveCourse,
  onDeleteCourse,
  onToast,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingFirebase, setIsSyncingFirebase] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(store.isDirty('courses'));

  useEffect(() => {
    return store.subscribe(() => {
      setHasUnsavedChanges(store.isDirty('courses'));
    });
  }, []);

  // Form states
  const [coverSource, setCoverSource] = useState<FileSource>('tautan');
  const [coverValue, setCoverValue] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [originalPrice, setOriginalPrice] = useState<number | string>('');
  const [lynkUrl, setLynkUrl] = useState('https://lynk.id/guber-smart');
  const [status, setStatus] = useState<'tampil' | 'sembunyi'>('tampil');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Pure local auto-save (saves to localStorage only)
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      try {
        const draftData = {
          coverSource,
          coverValue,
          name,
          description,
          price,
          originalPrice,
          lynkUrl,
          status,
        };
        localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(draftData));
      } catch {
        // ignore
      }
    }, 1000);
  }, [coverSource, coverValue, name, description, price, originalPrice, lynkUrl, status]);

  // Open Add
  const handleOpenAdd = () => {
    setEditingCourse(null);
    setCoverSource('tautan');
    setCoverValue('');
    setName('');
    setDescription('');
    setPrice('');
    setOriginalPrice('');
    setLynkUrl('https://lynk.id/guber-smart');
    setStatus('tampil');
    setErrors({});
    setIsEditing(true);
  };

  // Open Edit
  const handleOpenEdit = (c: Course) => {
    setEditingCourse(c);
    setCoverSource(c.coverSource || 'tautan');
    setCoverValue(c.coverValue || '');
    setName(c.name || c.title || '');
    setDescription(c.description || '');
    setPrice(c.price !== undefined && c.price !== null ? c.price : '');
    setOriginalPrice(c.originalPrice !== undefined && c.originalPrice !== null ? c.originalPrice : '');
    setLynkUrl(c.lynkUrl || 'https://lynk.id/guber-smart');
    setStatus(c.status === 'sembunyi' ? 'sembunyi' : 'tampil');
    setErrors({});
    setIsEditing(true);
  };

  // Submit / Save handler (saves to local store & directly writes to Firestore in real-time)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Nama kelas wajib diisi';
    if (!description.trim()) newErrors.description = 'Deskripsi wajib diisi';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      onToast('Mohon lengkapi kolom yang wajib diisi');
      return;
    }

    setIsSaving(true);

    try {
      const authorPayload: CourseAuthor = {
        name: editingCourse?.author?.name || 'Guber Smart',
        role: 'Instruktur',
      };

      const payload: Course = {
        id: editingCourse ? editingCourse.id : generateId('course'),
        name: name.trim(),
        title: name.trim(),
        summary: editingCourse?.summary || '',
        description: description.trim(),
        price: Number(price) || 0,
        originalPrice: Number(originalPrice) || 0,
        lynkUrl: lynkUrl.trim() || 'https://lynk.id/guber-smart',
        coverSource,
        coverValue: coverValue.trim(),
        category: editingCourse?.category || 'Kelas & Modul AI',
        tags: editingCourse?.tags || ['AI'],
        author: authorPayload,
        status,
        duration: editingCourse?.duration || 'Akses Selamanya',
        order: editingCourse?.order || courses.length + 1,
        createdAt: editingCourse?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        whatYouWillLearn: editingCourse?.whatYouWillLearn || [
          'Skill Claude tingkat lanjut: tahu cara menulis prompt yang tepat',
          'Semua tools GRATIS: tidak perlu keluar uang untuk software tambahan',
          'Dipandu sampai deploy: aplikasimu online lewat Vercel',
          'Responsif di desktop dan mobile',
          'Hasil nyata & dijamin berhasil online',
        ],
        targetAudience: editingCourse?.targetAudience || [
          'Ingin membuat website usaha, toko online, atau portofolio',
          'Punya ide aplikasi tapi bingung mulai dari mana',
          'Pemilik bisnis yang ingin mandiri tanpa bergantung pada developer',
        ],
      };

      // 1. Save to local store
      onSaveCourse(payload);
      setIsEditing(false);
      localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
      setHasUnsavedChanges(true);
      onToast('Kelas disimpan ke lokal. Klik "Simpan ke Firebase" untuk menyimpan permanen ke cloud.');
    } catch (err: any) {
      console.warn('Save notice:', err);
      setIsEditing(false);
      onToast('Kelas berhasil disimpan di lokal');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetId) return;
    const deleted = onDeleteCourse(deleteTargetId);
    setDeleteTargetId(null);
    if (deleted) {
      setHasUnsavedChanges(true);
      onToast('Kelas dihapus dari lokal. Tekan "Simpan ke Firebase" untuk memperbarui database cloud.');
    }
  };

  const handleSaveToFirebase = async () => {
    setIsSyncingFirebase(true);
    try {
      const res = await firebaseSync.syncCoursesToFirebase(courses);
      setHasUnsavedChanges(false);
      onToast(`Berhasil menyimpan ke Firebase! (${res.written} kelas tersimpan, ${res.deleted} kelas terhapus)`);
    } catch (err: any) {
      console.error(err);
      onToast('Gagal menyimpan ke Firebase', 'error');
    } finally {
      setIsSyncingFirebase(false);
    }
  };

  const filtered = courses.filter((c) => {
    return (
      !search.trim() ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-[#0B2A5B] dark:text-white">
            Kelola Kelas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Perubahan hanya tersimpan di lokal sampai Anda menekan tombol Simpan ke Firebase.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSaveToFirebase}
            disabled={isSyncingFirebase}
            className={`h-10 px-4 text-xs sm:text-sm font-semibold text-white rounded-[12px] flex items-center gap-2 shadow-xs transition-all shrink-0 ${
              hasUnsavedChanges
                ? 'bg-[#FF7A1A] hover:bg-[#E56A10] ring-2 ring-[#FF7A1A]/40'
                : 'bg-[#0B2A5B] hover:bg-[#1E4FA8]'
            } disabled:opacity-75`}
            title="Simpan seluruh perubahan daftar kelas ke Firebase Firestore"
          >
            <CloudUpload className={`w-4 h-4 ${isSyncingFirebase ? 'animate-bounce' : 'text-[#FF7A1A]'}`} />
            <span>{isSyncingFirebase ? 'Menyimpan ke Cloud...' : 'Simpan ke Firebase'}</span>
          </button>

          {!isEditing && (
            <>
              <div className="relative w-full sm:w-52">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kelas..."
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
            </>
          )}
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-[12px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>Ada perubahan kelas (tambah/ubah/hapus) yang baru tersimpan di lokal perangkat ini. Tekan tombol <strong>"Simpan ke Firebase"</strong> agar tersimpan permanen dan terlihat di perangkat lain.</span>
          </div>
          <button
            type="button"
            onClick={handleSaveToFirebase}
            disabled={isSyncingFirebase}
            className="h-8 px-3 text-xs font-bold text-white bg-[#FF7A1A] hover:bg-[#E56A10] rounded-lg shrink-0 flex items-center gap-1.5 shadow-xs"
          >
            <CloudUpload className="w-3.5 h-3.5" />
            Simpan Sekarang
          </button>
        </div>
      )}

      {/* Editor Form Modal / View */}
      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-[16px] p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold font-heading text-[#0B2A5B] dark:text-white">
              {editingCourse ? 'Ubah Kelas' : 'Tambah Kelas'}
            </h3>
          </div>

          <div className="space-y-5">
            {/* 1. Sampul di Atas */}
            <div>
              <ImageUploader
                label="Sampul Kelas"
                source={coverSource}
                value={coverValue}
                onChange={(src, val) => {
                  setCoverSource(src);
                  setCoverValue(val);
                  triggerAutoSave();
                }}
                required
              />
              {errors.coverValue && (
                <p className="text-xs font-medium text-rose-600 mt-1">{errors.coverValue}</p>
              )}
            </div>

            {/* 2. Nama Kelas */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Nama Kelas *
              </label>
              <input
                type="text"
                placeholder="Nama kelas"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  triggerAutoSave();
                }}
                className="w-full h-11 px-3.5 text-sm font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[12px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40"
              />
              {errors.name && <p className="text-xs font-medium text-rose-600 mt-1">{errors.name}</p>}
            </div>

            {/* 3. Harga, Harga Normal, Tautan Lynk, Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Harga (Rp)
                </label>
                <input
                  type="number"
                  value={price}
                  placeholder="0"
                  onChange={(e) => {
                    const val = e.target.value;
                    setPrice(val === '' ? '' : Number(val));
                    triggerAutoSave();
                  }}
                  className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[10px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Harga Normal (Rp)
                </label>
                <input
                  type="number"
                  value={originalPrice}
                  placeholder="0"
                  onChange={(e) => {
                    const val = e.target.value;
                    setOriginalPrice(val === '' ? '' : Number(val));
                    triggerAutoSave();
                  }}
                  className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[10px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tautan Lynk.id
                </label>
                <input
                  type="url"
                  value={lynkUrl}
                  onChange={(e) => {
                    setLynkUrl(e.target.value);
                    triggerAutoSave();
                  }}
                  className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[10px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as any);
                    triggerAutoSave();
                  }}
                  className="w-full h-10 px-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[10px]"
                >
                  <option value="tampil">Tampil</option>
                  <option value="sembunyi">Sembunyi</option>
                </select>
              </div>
            </div>

            {/* 4. Deskripsi Lengkap */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Deskripsi Lengkap *
              </label>
              <RichTextEditor
                value={description}
                onChange={(val) => {
                  setDescription(val);
                  triggerAutoSave();
                }}
                placeholder="Tulis deskripsi kelas di sini..."
                minHeight="380px"
              />
              {errors.description && (
                <p className="text-xs font-medium text-rose-600 mt-1">{errors.description}</p>
              )}
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="h-10 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[10px] transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="h-10 px-5 text-xs font-semibold text-white bg-[#0B2A5B] hover:bg-[#1E4FA8] rounded-[10px] flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF7A1A]" />
                    <span>Menyimpan ke Firebase...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Simpan &amp; Sinkronkan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* List View */
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-[14px] border border-slate-100 dark:border-slate-800">
              Belum ada kelas
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filtered.map((course) => (
                <div
                  key={course.id}
                  className="bg-white dark:bg-slate-900 rounded-[14px] p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-16 h-12 rounded-[10px] overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center">
                      {course.coverValue && course.coverValue.trim() !== '' ? (
                        <img src={course.coverValue} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
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
                        {formatRupiah(course.price)}
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
              ))}
            </div>
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
