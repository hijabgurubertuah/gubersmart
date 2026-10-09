import React, { useState, useEffect } from 'react';
import { Member, Course, UserProgress } from '../../types';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { generateAccessCode, generateId, formatDate } from '../../utils/crypto';
import { firebaseSync } from '../../services/firebaseSync';
import { store } from '../../services/store';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Key,
  Download,
  Upload,
  CheckSquare,
  Square,
  Award,
  BarChart2,
  X,
  CloudUpload,
} from 'lucide-react';

interface AdminMembersProps {
  members: Member[];
  courses: Course[];
  progressData: Record<string, UserProgress>;
  onSaveMember: (member: Member) => void;
  onDeleteMember: (id: string) => Member | null;
  onBulkUpdate: (ids: string[], updates: Partial<Member>) => void;
  onBulkDelete: (ids: string[]) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminMembers: React.FC<AdminMembersProps> = ({
  members,
  courses,
  progressData,
  onSaveMember,
  onDeleteMember,
  onBulkUpdate,
  onBulkDelete,
  onToast,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'aktif' | 'nonaktif'>('semua');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [isSyncingFirebase, setIsSyncingFirebase] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(store.isDirty('members'));

  useEffect(() => {
    return store.subscribe(() => {
      setHasUnsavedChanges(store.isDirty('members'));
    });
  }, []);

  const handleSaveToFirebase = async () => {
    setIsSyncingFirebase(true);
    try {
      const res = await firebaseSync.syncMembersToFirebase(members);
      store.clearDirty('members');
      setHasUnsavedChanges(false);
      onToast(`Berhasil menyimpan ke Firebase! (${res.written} member tersimpan, ${res.deleted} terhapus)`);
    } catch (err: any) {
      console.error(err);
      onToast('Gagal menyimpan ke Firebase', 'error');
    } finally {
      setIsSyncingFirebase(false);
    }
  };

  // View member progress modal
  const [viewProgressMember, setViewProgressMember] = useState<Member | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [ownedCourses, setOwnedCourses] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [status, setStatus] = useState<'aktif' | 'nonaktif'>('aktif');

  const handleOpenAdd = () => {
    setEditingMember(null);
    setName('');
    setWhatsapp('');
    setOwnedCourses(courses.length > 0 ? [courses[0].id] : []);
    setExpiresAt('');
    setAccessCode(generateAccessCode());
    setStatus('aktif');
    setIsEditing(true);
  };

  const handleOpenEdit = (m: Member) => {
    setEditingMember(m);
    setName(m.name);
    setWhatsapp(m.whatsapp);
    setOwnedCourses([...m.ownedCourses]);
    setExpiresAt(m.expiresAt ? m.expiresAt.substring(0, 10) : '');
    setAccessCode(m.plainAccessCode || '');
    setStatus(m.status);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onToast('Nama member wajib diisi', 'error');
      return;
    }
    if (!accessCode.trim()) {
      onToast('Kode akses wajib diisi', 'error');
      return;
    }

    const payload: Member = {
      id: editingMember ? editingMember.id : generateId('mem'),
      name: name.trim(),
      whatsapp: whatsapp.trim(),
      ownedCourses,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      accessCodeHash: accessCode.trim() + '_hash',
      plainAccessCode: accessCode.trim(),
      status,
      createdAt: editingMember ? editingMember.createdAt : new Date().toISOString(),
    };

    onSaveMember(payload);
    setIsEditing(false);
    onToast('Data member berhasil disimpan');
  };

  // Toggle course in ownedCourses checkbox
  const handleToggleCourse = (courseId: string) => {
    if (ownedCourses.includes(courseId)) {
      setOwnedCourses(ownedCourses.filter((id) => id !== courseId));
    } else {
      setOwnedCourses([...ownedCourses, courseId]);
    }
  };

  // Bulk actions
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedMembers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedMembers.map((m) => m.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDeactivate = () => {
    if (selectedIds.length === 0) return;
    onBulkUpdate(selectedIds, { status: 'nonaktif' });
    setSelectedIds([]);
    onToast('Member dinonaktifkan');
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    onBulkDelete(selectedIds);
    setSelectedIds([]);
    onToast('Member terpilih dihapus');
  };

  // CSV Export & Import
  const handleExportCSV = () => {
    const headers = ['Nama', 'WhatsApp', 'Kelas', 'KodeAkses', 'Status', 'TanggalDaftar'];
    const rows = members.map((m) => [
      `"${m.name}"`,
      `"${m.whatsapp}"`,
      `"${m.ownedCourses.join(';')}"`,
      `"${m.plainAccessCode || ''}"`,
      `"${m.status}"`,
      `"${m.createdAt}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'daftar_member_gubersmart.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      let count = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        if (cols.length >= 2 && cols[0]) {
          const newMem: Member = {
            id: generateId('mem'),
            name: cols[0],
            whatsapp: cols[1] || '',
            ownedCourses: cols[2] ? cols[2].split(';') : [courses[0]?.id || 'course_1'],
            plainAccessCode: cols[3] || generateAccessCode(),
            accessCodeHash: (cols[3] || generateAccessCode()) + '_hash',
            status: (cols[4] === 'nonaktif' ? 'nonaktif' : 'aktif') as any,
            createdAt: cols[5] || new Date().toISOString(),
          };
          onSaveMember(newMem);
          count++;
        }
      }
      onToast(`${count} member berhasil diimpor`);
    };
    reader.readAsText(file);
  };

  // Filter & Pagination
  const filtered = members.filter((m) => {
    if (statusFilter !== 'semua' && m.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.whatsapp.includes(q) ||
        (m.plainAccessCode && m.plainAccessCode.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedMembers = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:items-center justify-between gap-4 w-full">
          <div>
            <h2 className="text-xl font-bold font-heading text-[#0B2A5B] dark:text-white">
              Kelola Member
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Perubahan hanya tersimpan di lokal sampai Anda menekan tombol Simpan ke Firebase.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSaveToFirebase}
              disabled={isSyncingFirebase}
              className={`h-10 px-4 text-xs sm:text-sm font-semibold text-white rounded-[12px] flex items-center gap-2 shadow-xs transition-all shrink-0 ${
                hasUnsavedChanges
                  ? 'bg-[#FF7A1A] hover:bg-[#E56A10] ring-2 ring-[#FF7A1A]/40'
                  : 'bg-[#0B2A5B] hover:bg-[#1E4FA8]'
              } disabled:opacity-75`}
              title="Simpan seluruh data member ke Firebase Firestore"
            >
              <CloudUpload className={`w-4 h-4 ${isSyncingFirebase ? 'animate-bounce' : 'text-[#FF7A1A]'}`} />
              <span>{isSyncingFirebase ? 'Menyimpan...' : 'Simpan ke Firebase'}</span>
            </button>

            {!isEditing && (
              <>
                <button
                  onClick={handleExportCSV}
                  className="h-10 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[10px] flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Ekspor CSV
                </button>
                <label className="h-10 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[10px] flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  Impor CSV
                  <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
                </label>
                <button
                  onClick={handleOpenAdd}
                  className="h-10 px-4 text-xs sm:text-sm font-semibold text-white bg-[#FF7A1A] hover:bg-[#E56A10] rounded-[12px] flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Member
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-[12px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>Ada perubahan data member (tambah/ubah/hapus) di lokal perangkat ini. Tekan tombol <strong>"Simpan ke Firebase"</strong> di kanan atas agar tersimpan permanen di cloud dan terlihat di perangkat lain.</span>
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

      {isEditing ? (
        /* Member Editor Form */
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-[14px] p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
          <h3 className="text-lg font-bold font-heading text-[#0B2A5B] dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            {editingMember ? 'Ubah Data Member' : 'Tambah Member Baru'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Member *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 rounded-[14px]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nomor WhatsApp *
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 rounded-[14px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Kode Akses (Kata Sandi) *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="flex-1 h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 rounded-[14px] font-mono font-bold text-[#0B2A5B]"
                />
                <button
                  type="button"
                  onClick={() => setAccessCode(generateAccessCode())}
                  className="h-11 px-3.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[12px] flex items-center gap-1.5 shrink-0"
                >
                  <Key className="w-3.5 h-3.5 text-[#FF7A1A]" />
                  Kode Acak
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Status Akun
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-11 px-3 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 rounded-[14px]"
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Kelas yang Dimiliki
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {courses.map((course) => {
                const checked = ownedCourses.includes(course.id);
                return (
                  <label
                    key={course.id}
                    className={`p-3 rounded-[12px] border text-xs sm:text-sm font-semibold flex items-center gap-2.5 cursor-pointer transition-colors ${
                      checked
                        ? 'bg-blue-50 border-[#1E4FA8] text-[#0B2A5B]'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleCourse(course.id)}
                      className="w-4 h-4 text-[#FF7A1A] rounded"
                    />
                    <span className="truncate">{course.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Tanggal Berakhir Akses (Kosongkan jika selamanya)
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full sm:w-64 h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 rounded-[14px]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
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
        /* Member List & Bulk Toolbar */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[12px]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setPage(1);
                }}
                className="h-10 px-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 rounded-[12px]"
              >
                <option value="semua">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">
                  {selectedIds.length} Terpilih
                </span>
                <button
                  onClick={handleBulkDeactivate}
                  className="h-8 px-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[8px]"
                >
                  Nonaktifkan
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="h-8 px-2.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-[8px]"
                >
                  Hapus
                </button>
              </div>
            )}
          </div>

          {paginatedMembers.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Belum ada data
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedMembers.map((member) => {
                const isSelected = selectedIds.includes(member.id);
                return (
                  <div
                    key={member.id}
                    className={`p-4 rounded-[14px] border shadow-xs transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50/50 border-[#1E4FA8]'
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(member.id)}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-[#1E4FA8]" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {member.name}
                          </h4>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              member.status === 'aktif'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {member.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {member.whatsapp} • Kode:{' '}
                          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                            {member.plainAccessCode}
                          </span>{' '}
                          • {member.ownedCourses.length} Kelas
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => setViewProgressMember(member)}
                        className="h-8 px-2.5 text-xs font-semibold text-[#1E4FA8] bg-blue-50 hover:bg-blue-100 rounded-[8px] flex items-center gap-1"
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                        Progres
                      </button>
                      <button
                        onClick={() => handleOpenEdit(member)}
                        className="h-8 px-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[8px] flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Ubah
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(member.id)}
                        className="h-8 px-2.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-[8px] flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3">
              <span className="text-xs text-slate-400">
                Halaman {page} dari {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="h-8 px-3 text-xs font-semibold rounded bg-slate-100 disabled:opacity-40"
                >
                  Sebelumnya
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="h-8 px-3 text-xs font-semibold rounded bg-slate-100 disabled:opacity-40"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress Dialog for Member */}
      {viewProgressMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[14px] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold font-heading text-[#0B2A5B] dark:text-white">
                Progres: {viewProgressMember.name}
              </h3>
              <button
                onClick={() => setViewProgressMember(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {viewProgressMember.ownedCourses.map((cId) => {
                const crs = courses.find((c) => c.id === cId);
                const prg = progressData[viewProgressMember.id];
                const cert = prg?.certificates[cId];

                return (
                  <div key={cId} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-[10px] space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                      <span>{crs?.name || cId}</span>
                      {cert && (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" />
                          Lulus
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Pelajaran Selesai: {prg?.completedLessons?.length || 0}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Hapus Member Ini?"
        confirmLabel="Hapus"
        cancelLabel="Batal"
        onConfirm={() => {
          if (deleteTargetId) {
            onDeleteMember(deleteTargetId);
            setDeleteTargetId(null);
            onToast('Member berhasil dihapus');
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
