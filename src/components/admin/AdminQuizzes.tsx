import React, { useState } from 'react';
import { Quiz, QuizQuestion, Course, CourseModule } from '../../types';
import { generateId } from '../../utils/crypto';
import { Plus, Trash2, HelpCircle, Edit2 } from 'lucide-react';

interface AdminQuizzesProps {
  quizzes: Quiz[];
  courses: Course[];
  modules: CourseModule[];
  onSaveQuiz: (quiz: Quiz) => void;
  onDeleteQuiz: (id: string) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminQuizzes: React.FC<AdminQuizzesProps> = ({
  quizzes,
  courses,
  modules,
  onSaveQuiz,
  onDeleteQuiz,
  onToast,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [isEditing, setIsEditing] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  // Form states
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [passingScore, setPassingScore] = useState<number>(80);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  const courseModules = modules.filter((m) => m.courseId === selectedCourseId);
  const courseQuizzes = quizzes.filter((q) => q.courseId === selectedCourseId);

  const handleOpenAdd = () => {
    if (courseModules.length === 0) {
      onToast('Tambahkan modul terlebih dahulu', 'error');
      return;
    }
    setEditingQuiz(null);
    setSelectedModuleId(courseModules[0]?.id || '');
    setPassingScore(80);
    setQuestions([
      {
        id: generateId('q'),
        question: 'Soal nomor 1...',
        options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
        correctIndex: 0,
      },
    ]);
    setIsEditing(true);
  };

  const handleOpenEdit = (q: Quiz) => {
    setEditingQuiz(q);
    setSelectedModuleId(q.moduleId);
    setPassingScore(q.passingScore);
    setQuestions(JSON.parse(JSON.stringify(q.questions)));
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModuleId) {
      onToast('Pilih modul terkait', 'error');
      return;
    }
    if (questions.length === 0) {
      onToast('Minimal satu pertanyaan', 'error');
      return;
    }

    const payload: Quiz = {
      id: editingQuiz ? editingQuiz.id : generateId('quiz'),
      courseId: selectedCourseId,
      moduleId: selectedModuleId,
      passingScore: Number(passingScore) || 80,
      questions,
    };

    onSaveQuiz(payload);
    setIsEditing(false);
    onToast('Kuis berhasil disimpan');
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: generateId('q'),
        question: `Soal nomor ${questions.length + 1}...`,
        options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
        correctIndex: 0,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    const list = [...questions];
    list.splice(index, 1);
    setQuestions(list);
  };

  const updateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    const list = [...questions];
    list[index] = { ...list[index], ...updates };
    setQuestions(list);
  };

  const updateOption = (qIndex: number, optIndex: number, val: string) => {
    const list = [...questions];
    const opts = [...list[qIndex].options];
    opts[optIndex] = val;
    list[qIndex].options = opts;
    setQuestions(list);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold font-heading text-[#0B2A5B] dark:text-white">
          Kelola Kuis
        </h2>

        {!isEditing && (
          <div className="flex items-center gap-3">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="h-10 px-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[12px]"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleOpenAdd}
              className="h-10 px-4 text-xs sm:text-sm font-semibold text-white bg-[#FF7A1A] hover:bg-[#E56A10] rounded-[12px] flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Buat Kuis
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-[14px] p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
          <h3 className="text-lg font-bold font-heading text-[#0B2A5B] dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            {editingQuiz ? 'Ubah Kuis' : 'Buat Kuis Baru'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Modul Terkait *
              </label>
              <select
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                className="w-full h-11 px-3 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px]"
              >
                {courseModules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Batas Kelulusan (%) *
              </label>
              <input
                type="number"
                min={10}
                max={100}
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold font-heading text-[#0B2A5B] dark:text-white">
                Daftar Pertanyaan ({questions.length})
              </label>
              <button
                type="button"
                onClick={addQuestion}
                className="h-8 px-3 text-xs font-semibold text-white bg-[#1E4FA8] rounded-[8px] flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Soal
              </button>
            </div>

            {questions.map((q, qIdx) => (
              <div
                key={q.id}
                className="p-4 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Pertanyaan #{qIdx + 1}</span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIdx)}
                      className="p-1 text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(qIdx, { question: e.target.value })}
                  placeholder="Isi pertanyaan"
                  className="w-full h-10 px-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 rounded-[10px]"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct_${q.id}`}
                        checked={q.correctIndex === oIdx}
                        onChange={() => updateQuestion(qIdx, { correctIndex: oIdx })}
                        className="w-4 h-4 text-[#FF7A1A]"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                        className="flex-1 h-9 px-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 rounded-[8px]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
        <div className="space-y-3">
          {courseQuizzes.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Belum ada data
            </div>
          ) : (
            courseQuizzes.map((quiz) => {
              const mod = modules.find((m) => m.id === quiz.moduleId);
              return (
                <div
                  key={quiz.id}
                  className="p-4 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[10px] bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-[#1E4FA8] shrink-0">
                      <HelpCircle className="w-5 h-5 text-[#FF7A1A]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {mod?.title || 'Kuis Modul'}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {quiz.questions.length} Pertanyaan • Kelulusan {quiz.passingScore}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleOpenEdit(quiz)}
                      className="h-8 px-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[8px] flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Ubah
                    </button>
                    <button
                      onClick={() => {
                        onDeleteQuiz(quiz.id);
                        onToast('Kuis berhasil dihapus');
                      }}
                      className="h-8 px-2.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-[8px] flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
