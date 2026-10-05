import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Course, FileSource, CourseAuthor } from '../../types';
import { ImageUploader } from '../common/ImageUploader';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { RichTextEditor } from '../common/RichTextEditor';
import { LivePreviewModal } from '../common/LivePreviewModal';
import { formatRupiah, generateId } from '../../utils/crypto';
import { slugify } from '../../utils/sanitize';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Eye,
  EyeOff,
  BookOpen,
  Save,
  CheckCircle,
  Clock,
  Tag,
  User,
  Calendar,
  Sparkles,
  Flame,
  Pin,
  ExternalLink,
  Layers,
  FileText,
  Copy,
  RotateCcw,
} from 'lucide-react';

interface AdminClassesProps {
  courses: Course[];
  onSaveCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => Course | null;
  onRestoreCourse: (course: Course) => void;
  onToast: (msg: string) => void;
}

const CATEGORY_OPTIONS = [
  'Kelas & Modul AI',
  'Akademik',
  'Ekstrakurikuler',
  'Prestasi',
  'Pengumuman',
  'Agenda Sekolah',
  'Karya & Portofolio',
  'Tutorial & Panduan',
];

const AUTOSAVE_STORAGE_KEY = 'guber_smart_admin_class_draft';

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
  const [categoryFilter, setCategoryFilter] = useState('Semua');

  // Preview Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Form states (Metadata & Rich Content)
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(399000);
  const [originalPrice, setOriginalPrice] = useState<number>(1140000);
  const [lynkUrl, setLynkUrl] = useState('https://lynk.id/guber-smart');
  const [coverSource, setCoverSource] = useState<FileSource>('tautan');
  const [coverValue, setCoverValue] = useState('');
  const [duration, setDuration] = useState('Akses Selamanya');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [tags, setTags] = useState<string[]>(['AI', 'NoCode', 'Claude']);
  const [tagInput, setTagInput] = useState('');
  const [authorName, setAuthorName] = useState('Guber Smart Team');
  const [authorRole, setAuthorRole] = useState('Instruktur & Mentor');
  const [publishDate, setPublishDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [status, setStatus] = useState<'tampil' | 'sembunyi' | 'draft' | 'pending' | 'arsip'>('tampil');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [order, setOrder] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-save state
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string | null>(null);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if there is an unsaved auto-save draft in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
      if (saved) {
        setHasSavedDraft(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Update slug automatically when title changes unless manually customized
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isCustomSlug) {
      setSlug(slugify(val));
    }
  };

  // Tag input handling
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingCourse(null);
    setName('');
    setSlug('');
    setIsCustomSlug(false);
    setHeadline('Punya Ide Aplikasi? Wujudkan Tanpa Perlu Bisa Coding! 🚀');
    setSummary('');
    setDescription('');
    setPrice(399000);
    setOriginalPrice(1140000);
    setLynkUrl('https://lynk.id/guber-smart');
    setCoverSource('tautan');
    setCoverValue('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80');
    setDuration('Akses Selamanya');
    setCategory(CATEGORY_OPTIONS[0]);
    setTags(['AI', 'NoCode', 'Claude', 'WebDev']);
    setAuthorName('Guber Smart Team');
    setAuthorRole('Instruktur & Mentor');
    setPublishDate(new Date().toISOString().slice(0, 16));
    setStatus('tampil');
    setIsFeatured(false);
    setIsPinned(false);
    setOrder(courses.length + 1);
    setErrors({});
    setIsEditing(true);
  };

  // Open Edit modal
  const handleOpenEdit = (c: Course) => {
    setEditingCourse(c);
    setName(c.name || c.title || '');
    setSlug(c.slug || slugify(c.name || ''));
    setIsCustomSlug(true);
    setHeadline(c.headline || '');
    setSummary(c.summary || '');
    setDescription(c.description || '');
    setPrice(c.price || 0);
    setOriginalPrice(c.originalPrice || (c.price ? c.price * 2.5 : 0));
    setLynkUrl(c.lynkUrl || 'https://lynk.id/guber-smart');
    setCoverSource(c.coverSource || 'tautan');
    setCoverValue(c.coverValue || '');
    setDuration(c.duration || 'Akses Selamanya');
    setCategory(c.category || CATEGORY_OPTIONS[0]);
    setTags(c.tags || ['Kelas', 'AI']);
    setAuthorName(c.author?.name || 'Guber Smart Team');
    setAuthorRole(c.author?.role || 'Instruktur');
    setPublishDate(c.publishedAt || new Date().toISOString().slice(0, 16));
    setStatus(c.status || 'tampil');
    setIsFeatured(!!c.isFeatured);
    setIsPinned(!!c.isPinned);
    setOrder(c.order || 1);
    setErrors({});
    setIsEditing(true);
  };

  // Auto-save callback
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      try {
        const draftData = {
          name,
          slug,
          headline,
          summary,
          description,
          price,
          originalPrice,
          lynkUrl,
          coverSource,
          coverValue,
          duration,
          category,
          tags,
          authorName,
          authorRole,
          status,
          isFeatured,
          isPinned,
          savedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };
        localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(draftData));
        setLastAutoSaveTime(draftData.savedAt);
        setHasSavedDraft(true);
      } catch {
        // ignore
      }
    }, 1500);
  }, [name, slug, headline, summary, description, price, originalPrice, lynkUrl, coverSource, coverValue, duration, category, tags, authorName, authorRole, status, isFeatured, isPinned]);

  const handleRestoreDraft = () => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
      if (!saved) return;
      const d = JSON.parse(saved);
      if (d.name) setName(d.name);
      if (d.slug) setSlug(d.slug);
      if (d.headline) setHeadline(d.headline);
      if (d.summary) setSummary(d.summary);
      if (d.description) setDescription(d.description);
      if (d.price !== undefined) setPrice(d.price);
      if (d.originalPrice !== undefined) setOriginalPrice(d.originalPrice);
      if (d.lynkUrl) setLynkUrl(d.lynkUrl);
      if (d.coverValue) setCoverValue(d.coverValue);
      if (d.category) setCategory(d.category);
      if (d.tags) setTags(d.tags);
      if (d.authorName) setAuthorName(d.authorName);
      if (d.status) setStatus(d.status);
      onToast('Draf berhasil dipulihkan dari penyimpanan lokal');
    } catch {
      onToast('Gagal memulihkan draf');
    }
  };

  const handleClearDraft = () => {
    localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
    setHasSavedDraft(false);
    setLastAutoSaveTime(null);
    onToast('Draf lokal dibersihkan');
  };

  // Submit / Save handler
  const handleSave = (targetStatus?: 'tampil' | 'draft' | 'pending' | 'arsip') => {
    const finalStatus = targetStatus || status;
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Judul / nama kelas wajib diisi';
    if (!summary.trim()) newErrors.summary = 'Ringkasan singkat wajib diisi';
    if (!description.trim()) newErrors.description = 'Konten deskripsi lengkap wajib diisi';
    if (!coverValue.trim()) newErrors.coverValue = 'Gambar sampul utama wajib diisi';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      onToast('Mohon lengkapi kolom yang wajib diisi');
      return;
    }

    const authorPayload: CourseAuthor = {
      name: authorName.trim() || 'Admin',
      role: authorRole.trim() || 'Instruktur',
    };

    const finalSlug = slug.trim() || slugify(name);

    const payload: Course = {
      id: editingCourse ? editingCourse.id : generateId('course'),
      name: name.trim(),
      title: name.trim(),
      slug: finalSlug,
      headline: headline.trim(),
      summary: summary.trim(),
      description: description.trim(),
      price: Number(price) || 0,
      originalPrice: Number(originalPrice) || 0,
      lynkUrl: lynkUrl.trim() || 'https://lynk.id/guber-smart',
      coverSource,
      coverValue: coverValue.trim(),
      category,
      tags,
      author: authorPayload,
      status: finalStatus,
      duration: duration.trim() || 'Akses Selamanya',
      isFeatured,
      isPinned,
      order: Number(order) || 1,
      createdAt: editingCourse?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: publishDate,
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

    onSaveCourse(payload);
    setIsEditing(false);
    handleClearDraft();
    onToast(finalStatus === 'draft' ? 'Draf kelas disimpan' : 'Kelas berhasil dipublikasikan!');
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetId) return;
    const deleted = onDeleteCourse(deleteTargetId);
    setDeleteTargetId(null);
    if (deleted) {
      onToast('Kelas berhasil dihapus');
    }
  };

  // Filtered courses
  const filtered = courses.filter((c) => {
    const matchSearch =
      !search.trim() ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.summary.toLowerCase().includes(search.toLowerCase()) ||
      (c.category && c.category.toLowerCase().includes(search.toLowerCase()));

    const matchCategory =
      categoryFilter === 'Semua' || (c.category || CATEGORY_OPTIONS[0]) === categoryFilter;

    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-[#0B2A5B] dark:text-white">
            Kelola Kelas & Portal Konten
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sistem manajemen konten portal lengkap dengan WYSIWYG editor modern, metadata SEO, & alur publikasi.
          </p>
        </div>

        {!isEditing && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari konten atau kelas..."
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
              Tambah Kelas Baru
            </button>
          </div>
        )}
      </div>

      {/* Editor Form Modal / Full-Featured View */}
      {isEditing ? (
        <div className="bg-white dark:bg-slate-900 rounded-[16px] p-4 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
          {/* Top Bar inside Editor */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-[#0B2A5B]/10 text-[#0B2A5B] dark:text-white dark:bg-slate-800 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#FF7A1A]" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-heading text-[#0B2A5B] dark:text-white">
                  {editingCourse ? 'Editor Kelas & Berita' : 'Tambah Kelas / Konten Baru'}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  {lastAutoSaveTime ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Tersimpan otomatis pukul {lastAutoSaveTime}
                    </span>
                  ) : (
                    <span>Auto-save aktif</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {hasSavedDraft && !editingCourse && (
                <button
                  type="button"
                  onClick={handleRestoreDraft}
                  className="h-9 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-[10px] flex items-center gap-1.5 hover:bg-amber-100 transition-colors"
                  title="Pulihkan draft dari sesi sebelumnya"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  Pulihkan Draf
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="h-9 px-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-[10px] flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-[#1E4FA8] dark:text-blue-400" />
                Pratinjau Langsung
              </button>

              <button
                type="button"
                onClick={() => handleSave('draft')}
                className="h-9 px-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-[10px] flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Simpan Draf
              </button>

              <button
                type="button"
                onClick={() => handleSave('tampil')}
                className="h-9 px-4 text-xs font-bold text-white bg-[#FF7A1A] hover:bg-[#E56A10] rounded-[10px] flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Publikasikan Sekarang
              </button>
            </div>
          </div>

          {/* TWO-COLUMN LAYOUT: Main Editor (Col 1) + Settings Sidebar (Col 2) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* LEFT COLUMN: Title, Slug, Headline, WYSIWYG Content, Excerpt */}
            <div className="lg:col-span-2 space-y-5">
              {/* 1. Judul & Slug */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    Judul Kelas / Berita (Heading Utama) *
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Buat App Web tanpa perlu paham koding"
                    value={name}
                    onChange={(e) => {
                      handleNameChange(e.target.value);
                      triggerAutoSave();
                    }}
                    className="w-full h-12 px-4 text-base sm:text-lg font-bold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40"
                  />
                  {errors.name && <p className="text-xs font-medium text-rose-600 mt-1">{errors.name}</p>}
                </div>

                {/* Slug Permalinks */}
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-[10px] border border-slate-200/60 dark:border-slate-700/60">
                  <span className="font-mono text-slate-400">Permalink:</span>
                  <span className="text-slate-400">/kelas/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setIsCustomSlug(true);
                      setSlug(slugify(e.target.value));
                      triggerAutoSave();
                    }}
                    className="flex-1 bg-transparent font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:underline"
                    placeholder="slug-otomatis"
                  />
                </div>
              </div>

              {/* 2. Headline / Hook */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tagline / Hook Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Punya Ide Aplikasi? Wujudkan Tanpa Perlu Bisa Coding! 🚀"
                  value={headline}
                  onChange={(e) => {
                    setHeadline(e.target.value);
                    triggerAutoSave();
                  }}
                  className="w-full h-10 px-3.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[12px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40"
                />
              </div>

              {/* 3. Ringkasan Singkat / Excerpt */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  Ringkasan / Excerpt Singkat *
                </label>
                <textarea
                  rows={3}
                  placeholder="Ringkasan padat untuk cuplikan kartu atau meta deskripsi SEO..."
                  value={summary}
                  onChange={(e) => {
                    setSummary(e.target.value);
                    triggerAutoSave();
                  }}
                  className="w-full p-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40 resize-none leading-relaxed"
                />
                {errors.summary && <p className="text-xs font-medium text-rose-600 mt-1">{errors.summary}</p>}
              </div>

              {/* 4. Full WYSIWYG Content Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                    Konten Lengkap & Deskripsi (Rich Text WYSIWYG) *
                  </label>
                  <span className="text-xs text-slate-400">
                    Mendukung Gambar, Tabel, Video Embed, Checklist, & Pewarnaan
                  </span>
                </div>
                <RichTextEditor
                  value={description}
                  onChange={(val) => {
                    setDescription(val);
                    triggerAutoSave();
                  }}
                  placeholder="Tulis artikel berita atau materi pembelajaran lengkap di sini..."
                  minHeight="420px"
                  onAutoSave={triggerAutoSave}
                />
                {errors.description && (
                  <p className="text-xs font-medium text-rose-600 mt-1">{errors.description}</p>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Sidebar Settings & Metadata */}
            <div className="space-y-5 bg-slate-50/70 dark:bg-slate-800/50 p-4 sm:p-5 rounded-[16px] border border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-bold font-heading text-[#0B2A5B] dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                <Layers className="w-4 h-4 text-[#FF7A1A]" />
                Pengaturan Publikasi & Metadata
              </h4>

              {/* Status Alur Kerja */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Status Publikasi (Workflow)
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as any);
                    triggerAutoSave();
                  }}
                  className="w-full h-10 px-3 text-xs sm:text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[12px] text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="tampil">Terbit (Published / Tampil)</option>
                  <option value="draft">Draf (Draft)</option>
                  <option value="pending">Menunggu Persetujuan (Pending Review)</option>
                  <option value="arsip">Arsip (Archived / Sembunyi)</option>
                  <option value="sembunyi">Sembunyi</option>
                </select>
              </div>

              {/* Opsi Sorotan (Featured / Pinned) */}
              <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => {
                      setIsFeatured(e.target.checked);
                      triggerAutoSave();
                    }}
                    className="w-4 h-4 rounded text-[#FF7A1A] focus:ring-[#FF7A1A]"
                  />
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    Tampilkan di Banner Utama (Featured)
                  </span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => {
                      setIsPinned(e.target.checked);
                      triggerAutoSave();
                    }}
                    className="w-4 h-4 rounded text-[#FF7A1A] focus:ring-[#FF7A1A]"
                  />
                  <span className="flex items-center gap-1.5">
                    <Pin className="w-3.5 h-3.5 text-purple-500" />
                    Sematkan di Atas (Sticky / Pinned)
                  </span>
                </label>
              </div>

              {/* Kategori Berita / Kelas */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    triggerAutoSave();
                  }}
                  className="w-full h-10 px-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[12px] text-slate-900 dark:text-white focus:outline-none"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Multi-Tag Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tags (Tekan Enter atau Koma)
                </label>
                <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[12px] space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Ketik tag lalu tekan Enter..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="w-full text-xs bg-transparent focus:outline-none text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Gambar Sampul Utama (Featured Image) */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <ImageUploader
                  label="Gambar Sampul Utama (Featured Image) *"
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

              {/* Harga & Lynk.id (Khusus Kelas / Produk) */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Harga Promo (Rp)
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => {
                        setPrice(Number(e.target.value));
                        triggerAutoSave();
                      }}
                      className="w-full h-10 px-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[12px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Harga Coret (Rp)
                    </label>
                    <input
                      type="number"
                      value={originalPrice}
                      onChange={(e) => {
                        setOriginalPrice(Number(e.target.value));
                        triggerAutoSave();
                      }}
                      className="w-full h-10 px-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[12px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tautan Pembelian (Lynk.id)
                  </label>
                  <input
                    type="url"
                    value={lynkUrl}
                    onChange={(e) => {
                      setLynkUrl(e.target.value);
                      triggerAutoSave();
                    }}
                    className="w-full h-10 px-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[12px]"
                  />
                </div>
              </div>

              {/* Penulis & Tanggal Terbit */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Penulis (Author / Jurnalis)
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => {
                      setAuthorName(e.target.value);
                      triggerAutoSave();
                    }}
                    className="w-full h-10 px-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[12px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Publikasi / Penjadwalan
                  </label>
                  <input
                    type="datetime-local"
                    value={publishDate}
                    onChange={(e) => {
                      setPublishDate(e.target.value);
                      triggerAutoSave();
                    }}
                    className="w-full h-10 px-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[12px]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <button
                  type="button"
                  onClick={() => handleSave('tampil')}
                  className="w-full min-h-[46px] px-4 text-sm font-bold text-white bg-[#0B2A5B] hover:bg-[#1E4FA8] rounded-[12px] shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Save className="w-4 h-4 text-[#FF7A1A]" />
                  Simpan & Publikasikan
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSave('draft')}
                    className="h-10 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px]"
                  >
                    Simpan Draf
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="h-10 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-[10px]"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* LIST VIEW / RESPONSIVE CARDS */
        <div className="space-y-4">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCategoryFilter('Semua')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                categoryFilter === 'Semua'
                  ? 'bg-[#0B2A5B] text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
              }`}
            >
              Semua Kategori ({courses.length})
            </button>
            {CATEGORY_OPTIONS.map((cat) => {
              const count = courses.filter((c) => (c.category || CATEGORY_OPTIONS[0]) === cat).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    categoryFilter === cat
                      ? 'bg-[#0B2A5B] text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-[14px] border border-slate-100 dark:border-slate-800">
              Belum ada kelas atau artikel pada filter ini
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {filtered.map((course) => (
                <div
                  key={course.id}
                  className="bg-white dark:bg-slate-900 rounded-[14px] p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-20 h-14 rounded-[10px] overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center">
                      {course.coverValue && course.coverValue.trim() !== '' ? (
                        <img src={course.coverValue} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">#{course.order}</span>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          {course.name}
                        </h4>
                        {course.isFeatured && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold flex items-center gap-0.5">
                            <Flame className="w-3 h-3" />
                            Featured
                          </span>
                        )}
                        {course.isPinned && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 text-[10px] font-bold">
                            📌 Pinned
                          </span>
                        )}
                        {course.status === 'tampil' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Terbit
                          </span>
                        ) : course.status === 'draft' ? (
                          <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 text-[10px] font-bold">
                            Draf
                          </span>
                        ) : course.status === 'pending' ? (
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-bold">
                            Menunggu Review
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold flex items-center gap-1">
                            <EyeOff className="w-3 h-3" />
                            Arsip
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="font-bold text-[#0B2A5B] dark:text-white">
                          {formatRupiah(course.price)}
                        </span>
                        <span>•</span>
                        <span>{course.category || 'Kelas AI'}</span>
                        {course.author && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              {course.author.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => handleOpenEdit(course)}
                      className="h-9 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-[10px] flex items-center gap-1.5 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Ubah di Editor
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

      {/* Live Preview Modal */}
      <LivePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={{
          title: name || 'Judul Konten',
          slug,
          excerpt: summary,
          content: description,
          coverUrl: coverValue,
          category,
          tags,
          authorName,
          publishDate,
          price,
          lynkUrl,
          isFeatured,
          isPinned,
          status,
        }}
      />

      {/* Confirmation Dialog for Delete */}
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
