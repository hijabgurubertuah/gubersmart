import React, { useState } from 'react';
import { Course, CourseModule, Lesson, ContentBlock, BlockType, StepItem } from '../../types';
import { ImageUploader } from '../common/ImageUploader';
import { FileUploader } from '../common/FileUploader';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { generateId } from '../../utils/crypto';
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  Eye,
  ChevronUp,
  ChevronDown,
  Video,
  FileText,
  ListOrdered,
  Download,
  Terminal,
  Link,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

interface AdminLessonsProps {
  courses: Course[];
  modules: CourseModule[];
  lessons: Lesson[];
  onSaveLesson: (lesson: Lesson) => void;
  onDeleteLesson: (id: string) => Lesson | null;
  onDuplicateLesson: (id: string) => Lesson | null;
  onSaveModule: (mod: CourseModule) => void;
  onDeleteModule: (id: string) => CourseModule | null;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminLessons: React.FC<AdminLessonsProps> = ({
  courses,
  modules,
  lessons,
  onSaveLesson,
  onDeleteLesson,
  onDuplicateLesson,
  onSaveModule,
  onDeleteModule,
  onToast,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');

  // Lesson editor state
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDuration, setLessonDuration] = useState('15 Menit');
  const [lessonOrder, setLessonOrder] = useState<number>(1);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [isPreview, setIsPreview] = useState(false);

  // New module modal
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');

  // Delete targets
  const [deleteLessonId, setDeleteLessonId] = useState<string | null>(null);
  const [deleteModuleId, setDeleteModuleId] = useState<string | null>(null);

  const courseModules = modules
    .filter((m) => m.courseId === selectedCourseId)
    .sort((a, b) => a.order - b.order);

  const activeModuleId = selectedModuleId || courseModules[0]?.id || '';
  const moduleLessons = lessons
    .filter((l) => l.moduleId === activeModuleId)
    .sort((a, b) => a.order - b.order);

  const handleOpenAddLesson = () => {
    if (!activeModuleId) {
      onToast('Tambahkan modul terlebih dahulu', 'error');
      return;
    }
    setEditingLesson(null);
    setLessonTitle('');
    setLessonDuration('15 Menit');
    setLessonOrder(moduleLessons.length + 1);
    setBlocks([
      { type: 'text', content: '' },
    ]);
    setIsEditingLesson(true);
    setIsPreview(false);
  };

  const handleOpenEditLesson = (les: Lesson) => {
    setEditingLesson(les);
    setLessonTitle(les.title);
    setLessonDuration(les.duration);
    setLessonOrder(les.order);
    setBlocks(JSON.parse(JSON.stringify(les.blocks || [])));
    setIsEditingLesson(true);
    setIsPreview(false);
  };

  const handleDuplicate = (lessonId: string) => {
    const copy = onDuplicateLesson(lessonId);
    if (copy) {
      onToast('Pelajaran berhasil diduplikasi');
    }
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim()) {
      onToast('Judul pelajaran wajib diisi', 'error');
      return;
    }

    const payload: Lesson = {
      id: editingLesson ? editingLesson.id : generateId('les'),
      moduleId: activeModuleId,
      courseId: selectedCourseId,
      title: lessonTitle.trim(),
      duration: lessonDuration.trim(),
      order: Number(lessonOrder) || 1,
      blocks,
    };

    onSaveLesson(payload);
    setIsEditingLesson(false);
    onToast('Pelajaran berhasil disimpan');
  };

  const handleSaveNewModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;

    const mod: CourseModule = {
      id: generateId('mod'),
      courseId: selectedCourseId,
      title: newModuleTitle.trim(),
      order: courseModules.length + 1,
    };
    onSaveModule(mod);
    setSelectedModuleId(mod.id);
    setNewModuleTitle('');
    setIsAddingModule(false);
    onToast('Modul berhasil ditambahkan');
  };

  // Block management
  const addBlock = (type: BlockType) => {
    let newBlock: ContentBlock;
    switch (type) {
      case 'youtube':
        newBlock = { type: 'youtube', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', startSeconds: 0 };
        break;
      case 'text':
        newBlock = { type: 'text', content: '' };
        break;
      case 'steps':
        newBlock = {
          type: 'steps',
          steps: [
            { id: generateId('step'), title: 'Langkah 1', description: '' },
          ],
        };
        break;
      case 'download':
        newBlock = {
          type: 'download',
          name: 'File Materi',
          category: 'Dokumen',
          version: 'v1.0',
          description: '',
          source: 'tautan',
          value: '',
        };
        break;
      case 'prompt':
        newBlock = { type: 'prompt', content: '' };
        break;
      case 'link':
        newBlock = { type: 'link', label: 'Buka Tautan', url: 'https://' };
        break;
      case 'image':
        newBlock = { type: 'image', source: 'tautan', value: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80' };
        break;
    }
    setBlocks([...blocks, newBlock]);
  };

  const removeBlock = (index: number) => {
    const list = [...blocks];
    list.splice(index, 1);
    setBlocks(list);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const list = [...blocks];
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    setBlocks(list);
  };

  const updateBlock = (index: number, updates: Partial<ContentBlock>) => {
    const list = [...blocks];
    list[index] = { ...list[index], ...updates } as ContentBlock;
    setBlocks(list);
  };

  return (
    <div className="space-y-6">
      {/* Header & Course Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold font-heading text-[#0B2A5B] dark:text-white">
          Modul & Pelajaran
        </h2>

        {!isEditingLesson && (
          <div className="flex items-center gap-3">
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setSelectedModuleId('');
              }}
              className="h-10 px-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[12px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isEditingLesson ? (
        /* Lesson Block Editor Form */
        <form onSubmit={handleSaveLesson} className="bg-white dark:bg-slate-900 rounded-[14px] p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold font-heading text-[#0B2A5B] dark:text-white">
              {editingLesson ? 'Ubah Pelajaran' : 'Tambah Pelajaran'}
            </h3>
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className="h-9 px-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-[10px] flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-4 h-4" />
              {isPreview ? 'Tutup Pratinjau' : 'Pratinjau'}
            </button>
          </div>

          {/* Title & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Judul Pelajaran *
              </label>
              <input
                type="text"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Durasi
              </label>
              <input
                type="text"
                value={lessonDuration}
                onChange={(e) => setLessonDuration(e.target.value)}
                className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40"
              />
            </div>
          </div>

          {/* Block List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold font-heading text-[#0B2A5B] dark:text-white">
                Susunan Blok Konten
              </label>
            </div>

            {blocks.map((block, idx) => (
              <div
                key={idx}
                className="p-4 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
              >
                {/* Block header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                    Blok #{idx + 1}: {block.type}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveBlock(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      aria-label="Geser ke atas"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBlock(idx, 'down')}
                      disabled={idx === blocks.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      aria-label="Geser ke bawah"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(idx)}
                      className="p-1 text-rose-500 hover:text-rose-700 ml-2"
                      aria-label="Hapus blok"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Block contents */}
                {block.type === 'youtube' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        Tautan Video YouTube *
                      </label>
                      <input
                        type="url"
                        value={block.videoUrl}
                        onChange={(e) => updateBlock(idx, { videoUrl: e.target.value })}
                        className="w-full h-10 px-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 rounded-[10px]"
                      />
                    </div>
                  </div>
                )}

                {block.type === 'text' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Teks Materi *
                    </label>
                    <textarea
                      rows={4}
                      value={block.content}
                      onChange={(e) => updateBlock(idx, { content: e.target.value })}
                      className="w-full p-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 rounded-[10px] resize-none"
                    />
                  </div>
                )}

                {block.type === 'prompt' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">
                      Isi Prompt Siap Salin *
                    </label>
                    <textarea
                      rows={3}
                      value={block.content}
                      onChange={(e) => updateBlock(idx, { content: e.target.value })}
                      className="w-full p-3 font-mono text-sm bg-white dark:bg-slate-900 border border-slate-200 rounded-[10px] resize-none"
                    />
                  </div>
                )}

                {block.type === 'link' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        Label Tombol *
                      </label>
                      <input
                        type="text"
                        value={block.label}
                        onChange={(e) => updateBlock(idx, { label: e.target.value })}
                        className="w-full h-10 px-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 rounded-[10px]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">
                        Tujuan Tautan *
                      </label>
                      <input
                        type="url"
                        value={block.url}
                        onChange={(e) => updateBlock(idx, { url: e.target.value })}
                        className="w-full h-10 px-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 rounded-[10px]"
                      />
                    </div>
                  </div>
                )}

                {block.type === 'image' && (
                  <ImageUploader
                    label="Gambar Materi"
                    source={block.source}
                    value={block.value}
                    onChange={(src, val) => updateBlock(idx, { source: src, value: val })}
                  />
                )}

                {block.type === 'download' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">
                          Nama File *
                        </label>
                        <input
                          type="text"
                          value={block.name}
                          onChange={(e) => updateBlock(idx, { name: e.target.value })}
                          className="w-full h-10 px-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 rounded-[10px]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">
                          Jenis *
                        </label>
                        <select
                          value={block.category}
                          onChange={(e) => updateBlock(idx, { category: e.target.value as any })}
                          className="w-full h-10 px-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 rounded-[10px]"
                        >
                          <option value="Skill Claude">Skill Claude</option>
                          <option value="Template">Template</option>
                          <option value="Dokumen">Dokumen</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">
                          Versi
                        </label>
                        <input
                          type="text"
                          value={block.version}
                          onChange={(e) => updateBlock(idx, { version: e.target.value })}
                          className="w-full h-10 px-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 rounded-[10px]"
                        />
                      </div>
                    </div>
                    <FileUploader
                      label="Sumber Berkas"
                      source={block.source}
                      value={block.value}
                      fileName={block.name}
                      onChange={(src, val, fName) => {
                        updateBlock(idx, { source: src, value: val, name: fName || block.name });
                      }}
                    />
                  </div>
                )}

                {block.type === 'steps' && (
                  <div className="space-y-3">
                    {block.steps.map((st, stIdx) => (
                      <div key={st.id} className="p-3 bg-white dark:bg-slate-900 rounded-[10px] border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">Langkah #{stIdx + 1}</span>
                          {block.steps.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newSteps = [...block.steps];
                                newSteps.splice(stIdx, 1);
                                updateBlock(idx, { steps: newSteps });
                              }}
                              className="text-rose-500 text-xs hover:underline"
                            >
                              Hapus Langkah
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={st.title}
                          onChange={(e) => {
                            const newSteps = [...block.steps];
                            newSteps[stIdx].title = e.target.value;
                            updateBlock(idx, { steps: newSteps });
                          }}
                          placeholder="Judul langkah"
                          className="w-full h-9 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-[8px]"
                        />
                        <textarea
                          rows={2}
                          value={st.description}
                          onChange={(e) => {
                            const newSteps = [...block.steps];
                            newSteps[stIdx].description = e.target.value;
                            updateBlock(idx, { steps: newSteps });
                          }}
                          placeholder="Uraian langkah"
                          className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-[8px] resize-none"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newSteps = [
                          ...block.steps,
                          { id: generateId('step'), title: `Langkah ${block.steps.length + 1}`, description: '' },
                        ];
                        updateBlock(idx, { steps: newSteps });
                      }}
                      className="text-xs font-semibold text-[#1E4FA8] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah Langkah
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Add Block Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-semibold text-slate-500 mr-2">Tambah Blok:</span>
              <button
                type="button"
                onClick={() => addBlock('youtube')}
                className="h-8 px-3 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-[8px] flex items-center gap-1.5"
              >
                <Video className="w-3.5 h-3.5 text-rose-500" />
                Video
              </button>
              <button
                type="button"
                onClick={() => addBlock('text')}
                className="h-8 px-3 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-[8px] flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                Teks
              </button>
              <button
                type="button"
                onClick={() => addBlock('steps')}
                className="h-8 px-3 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-[8px] flex items-center gap-1.5"
              >
                <ListOrdered className="w-3.5 h-3.5 text-emerald-500" />
                Panduan
              </button>
              <button
                type="button"
                onClick={() => addBlock('download')}
                className="h-8 px-3 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-[8px] flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#FF7A1A]" />
                Unduhan
              </button>
              <button
                type="button"
                onClick={() => addBlock('prompt')}
                className="h-8 px-3 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-[8px] flex items-center gap-1.5"
              >
                <Terminal className="w-3.5 h-3.5 text-slate-700" />
                Prompt
              </button>
              <button
                type="button"
                onClick={() => addBlock('link')}
                className="h-8 px-3 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-[8px] flex items-center gap-1.5"
              >
                <Link className="w-3.5 h-3.5 text-indigo-500" />
                Tautan
              </button>
              <button
                type="button"
                onClick={() => addBlock('image')}
                className="h-8 px-3 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-[8px] flex items-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                Gambar
              </button>
            </div>
          </div>

          {/* Form Actions bottom right */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditingLesson(false)}
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
        /* Modules & Lessons Layout */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Col 1: Modules */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-heading text-[#0B2A5B] dark:text-white">
                Daftar Modul
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingModule(true)}
                className="h-8 px-2.5 text-xs font-semibold text-white bg-[#1E4FA8] hover:bg-[#0B2A5B] rounded-[8px] flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Modul
              </button>
            </div>

            {isAddingModule && (
              <form onSubmit={handleSaveNewModule} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 rounded-[12px] space-y-2">
                <input
                  type="text"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  placeholder="Judul modul"
                  className="w-full h-9 px-3 text-xs bg-slate-50 border rounded-[8px]"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingModule(false)}
                    className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs font-semibold text-white bg-[#FF7A1A] rounded"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {courseModules.map((m) => {
                const isActive = m.id === activeModuleId;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedModuleId(m.id)}
                    className={`p-3.5 rounded-[12px] border transition-all cursor-pointer flex items-center justify-between group ${
                      isActive
                        ? 'bg-blue-50/80 border-[#1E4FA8] dark:bg-blue-950/60 dark:border-blue-700'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                      {m.title}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteModuleId(m.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:text-rose-700 rounded transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Col 2 & 3: Lessons in Active Module */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-heading text-[#0B2A5B] dark:text-white">
                Daftar Pelajaran
              </h3>
              <button
                type="button"
                onClick={handleOpenAddLesson}
                className="h-9 px-3.5 text-xs font-semibold text-white bg-[#FF7A1A] hover:bg-[#E56A10] rounded-[10px] flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Tambah Pelajaran
              </button>
            </div>

            {moduleLessons.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-[14px] border border-slate-200 dark:border-slate-800">
                Belum ada data
              </div>
            ) : (
              <div className="space-y-3">
                {moduleLessons.map((les) => (
                  <div
                    key={les.id}
                    className="p-4 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">#{les.order}</span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {les.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500">
                        {les.duration} • {les.blocks?.length || 0} Blok Konten
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleDuplicate(les.id)}
                        className="h-8 px-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-[8px] flex items-center gap-1"
                        aria-label="Duplikasi"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Duplikasi
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditLesson(les)}
                        className="h-8 px-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[8px] flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Ubah
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteLessonId(les.id)}
                        className="h-8 px-2.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-[8px] flex items-center gap-1"
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
        </div>
      )}

      {/* Confirm dialogs */}
      <ConfirmDialog
        isOpen={!!deleteLessonId}
        title="Hapus Pelajaran Ini?"
        confirmLabel="Hapus"
        cancelLabel="Batal"
        onConfirm={() => {
          if (deleteLessonId) {
            onDeleteLesson(deleteLessonId);
            setDeleteLessonId(null);
            onToast('Pelajaran berhasil dihapus');
          }
        }}
        onCancel={() => setDeleteLessonId(null)}
      />

      <ConfirmDialog
        isOpen={!!deleteModuleId}
        title="Hapus Modul Ini?"
        confirmLabel="Hapus"
        cancelLabel="Batal"
        onConfirm={() => {
          if (deleteModuleId) {
            onDeleteModule(deleteModuleId);
            setDeleteModuleId(null);
            onToast('Modul berhasil dihapus');
          }
        }}
        onCancel={() => setDeleteModuleId(null)}
      />
    </div>
  );
};
