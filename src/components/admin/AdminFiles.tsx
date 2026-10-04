import React, { useState } from 'react';
import { FileDownload, Course, FileSource } from '../../types';
import { FileUploader } from '../common/FileUploader';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatDate, generateId } from '../../utils/crypto';
import { Plus, Edit2, Trash2, Search, Download, Sparkles, FileText } from 'lucide-react';

interface AdminFilesProps {
  files: FileDownload[];
  courses: Course[];
  onSaveFile: (file: FileDownload) => void;
  onDeleteFile: (id: string) => FileDownload | null;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminFiles: React.FC<AdminFilesProps> = ({
  files,
  courses,
  onSaveFile,
  onDeleteFile,
  onToast,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingFile, setEditingFile] = useState<FileDownload | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Skill Claude' | 'Template' | 'Dokumen' | 'Lainnya'>('Skill Claude');
  const [version, setVersion] = useState('v1.0.0');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState<string>(courses[0]?.id || '');
  const [source, setSource] = useState<FileSource>('tautan');
  const [value, setValue] = useState('');

  const handleOpenAdd = () => {
    setEditingFile(null);
    setName('');
    setCategory('Skill Claude');
    setVersion('v1.0.0');
    setDescription('');
    setCourseId(courses[0]?.id || '');
    setSource('tautan');
    setValue('');
    setIsEditing(true);
  };

  const handleOpenEdit = (f: FileDownload) => {
    setEditingFile(f);
    setName(f.name);
    setCategory(f.category);
    setVersion(f.version);
    setDescription(f.description);
    setCourseId(f.courseId);
    setSource(f.source);
    setValue(f.value);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onToast('Nama file wajib diisi', 'error');
      return;
    }

    const payload: FileDownload = {
      id: editingFile ? editingFile.id : generateId('file'),
      name: name.trim(),
      category,
      version: version.trim() || 'v1.0',
      description: description.trim(),
      courseId,
      source,
      value: value.trim(),
      downloadCount: editingFile ? editingFile.downloadCount : 0,
      updatedAt: new Date().toISOString(),
    };

    onSaveFile(payload);
    setIsEditing(false);
    onToast('Berkas berhasil disimpan');
  };

  const filtered = files.filter((f) => {
    if (selectedCategory !== 'semua' && f.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold font-heading text-[#0B2A5B] dark:text-white">
          Pustaka File
        </h2>

        {!isEditing && (
          <div className="flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[12px]"
            >
              <option value="semua">Semua Jenis</option>
              <option value="Skill Claude">Skill Claude</option>
              <option value="Template">Template</option>
              <option value="Dokumen">Dokumen</option>
              <option value="Lainnya">Lainnya</option>
            </select>

            <button
              onClick={handleOpenAdd}
              className="h-10 px-4 text-xs sm:text-sm font-semibold text-white bg-[#FF7A1A] hover:bg-[#E56A10] rounded-[12px] flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Tambah File
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-[14px] p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
          <h3 className="text-lg font-bold font-heading text-[#0B2A5B] dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            {editingFile ? 'Ubah File' : 'Tambah File Baru'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama File *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Jenis File *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full h-11 px-3 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px]"
              >
                <option value="Skill Claude">Skill Claude</option>
                <option value="Template">Template</option>
                <option value="Dokumen">Dokumen</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Versi
              </label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Kelas Asal *
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full h-11 px-3 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px]"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Keterangan Singkat
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px]"
              />
            </div>
          </div>

          <FileUploader
            label="Sumber File"
            source={source}
            value={value}
            fileName={name}
            onChange={(src, val, fName) => {
              setSource(src);
              setValue(val);
              if (fName && !name) setName(fName);
            }}
            required
          />

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
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Belum ada data
            </div>
          ) : (
            filtered.map((file) => (
              <div
                key={file.id}
                className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-[#1E4FA8] shrink-0 mt-0.5">
                    {file.category === 'Skill Claude' ? <Sparkles className="w-5 h-5 text-[#FF7A1A]" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#1E4FA8]">
                        {file.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {file.name}
                      </h4>
                      <span className="text-xs font-mono text-slate-400">
                        {file.version}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Diunduh {file.downloadCount} kali • {formatDate(file.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleOpenEdit(file)}
                    className="h-8 px-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[8px] flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Ubah
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(file.id)}
                    className="h-8 px-2.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-[8px] flex items-center gap-1"
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

      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="Hapus File Ini?"
        confirmLabel="Hapus"
        cancelLabel="Batal"
        onConfirm={() => {
          if (deleteTargetId) {
            onDeleteFile(deleteTargetId);
            setDeleteTargetId(null);
            onToast('File berhasil dihapus');
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
