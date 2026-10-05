import React, { useState } from 'react';
import { Course, CourseModule, Lesson, UserProgress, Quiz } from '../../types';
import {
  ArrowLeft,
  ChevronDown,
  CheckCircle2,
  Circle,
  HelpCircle,
  Award,
  Lock,
  ExternalLink,
} from 'lucide-react';

interface MemberClassViewProps {
  course: Course;
  isOwned: boolean;
  defaultLynkUrl: string;
  modules: CourseModule[];
  lessons: Lesson[];
  quizzes: Quiz[];
  progress: UserProgress;
  onBack: () => void;
  onOpenLesson: (lessonId: string) => void;
  onOpenQuiz: (quiz: Quiz) => void;
  onOpenCertificate: (courseId: string) => void;
}

export const MemberClassView: React.FC<MemberClassViewProps> = ({
  course,
  isOwned,
  defaultLynkUrl,
  modules,
  lessons,
  quizzes,
  progress,
  onBack,
  onOpenLesson,
  onOpenQuiz,
  onOpenCertificate,
}) => {
  const courseModules = modules
    .filter((m) => m.courseId === course.id)
    .sort((a, b) => a.order - b.order);

  const [openModuleId, setOpenModuleId] = useState<string | null>(courseModules[0]?.id || null);

  if (!isOwned) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
          Akses Terkunci
        </h2>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onBack}
            className="min-h-[44px] px-5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 rounded-[12px] transition-colors"
          >
            Kembali
          </button>
          <a
            href={course.lynkUrl || defaultLynkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] px-6 text-sm font-bold tracking-wider text-white bg-[#FF7A1A] hover:bg-[#E56A10] rounded-[12px] flex items-center justify-center shadow-md transition-all active:scale-[0.98]"
          >
            AMBIL PROMO SEKARANG
          </a>
        </div>
      </div>
    );
  }

  const courseLessons = lessons.filter((l) => l.courseId === course.id);
  const completedCount = courseLessons.filter((l) => progress.completedLessons.includes(l.id)).length;
  const progressPercent = courseLessons.length > 0 ? Math.round((completedCount / courseLessons.length) * 100) : 0;
  const hasCertificate = !!progress.certificates[course.id];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0B2A5B] dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dasbor
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#0B2A5B] dark:text-white">
              {course.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {completedCount} dari {courseLessons.length} Pelajaran Selesai ({progressPercent}%)
            </p>
          </div>

          {hasCertificate && (
            <button
              onClick={() => onOpenCertificate(course.id)}
              className="h-11 px-5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-[14px] flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
            >
              <Award className="w-4 h-4" />
              Buka Sertifikat
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-[#FF7A1A] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        {courseModules.map((mod) => {
          const isOpen = openModuleId === mod.id;
          const modLessons = lessons
            .filter((l) => l.moduleId === mod.id)
            .sort((a, b) => a.order - b.order);

          const moduleQuiz = quizzes.find((q) => q.moduleId === mod.id);
          const quizResult = moduleQuiz ? progress.quizResults[mod.id] : undefined;

          return (
            <div
              key={mod.id}
              className="rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs"
            >
              <button
                type="button"
                onClick={() => setOpenModuleId(isOpen ? null : mod.id)}
                className="w-full min-h-[56px] px-5 py-3.5 flex items-center justify-between text-left font-heading font-semibold text-slate-900 dark:text-white hover:bg-slate-50/50 transition-colors"
              >
                <span>{mod.title}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    isOpen ? 'rotate-180 text-[#FF7A1A]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
                  {modLessons.map((les) => {
                    const isDone = progress.completedLessons.includes(les.id);
                    return (
                      <div
                        key={les.id}
                        onClick={() => onOpenLesson(les.id)}
                        className="flex items-center justify-between p-3 rounded-[12px] hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" />
                          )}
                          <span
                            className={`text-sm font-medium ${
                              isDone
                                ? 'text-slate-500 dark:text-slate-400 line-through'
                                : 'text-slate-800 dark:text-slate-200 group-hover:text-[#1E4FA8]'
                            }`}
                          >
                            {les.title}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 shrink-0">{les.duration}</span>
                      </div>
                    );
                  })}

                  {/* Module Quiz if configured */}
                  {moduleQuiz && (
                    <div className="mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between p-2">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-[#1E4FA8]" />
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          Kuis Evaluasi Modul
                        </span>
                        {quizResult?.passed && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Lulus ({quizResult.score}%)
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => onOpenQuiz(moduleQuiz)}
                        className="min-h-[40px] px-4 text-xs font-semibold text-white bg-[#0B2A5B] hover:bg-[#1E4FA8] rounded-[10px] transition-colors"
                      >
                        {quizResult ? 'Ulangi Kuis' : 'Mulai Kuis'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
