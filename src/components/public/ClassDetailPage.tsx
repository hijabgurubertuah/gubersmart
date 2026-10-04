import React, { useState } from 'react';
import { Course, CourseModule, Lesson } from '../../types';
import { formatRupiah } from '../../utils/crypto';
import {
  ArrowLeft,
  ExternalLink,
  Clock,
  BookOpen,
  CheckCircle,
  ChevronDown,
} from 'lucide-react';

interface ClassDetailPageProps {
  course: Course;
  modules: CourseModule[];
  lessons: Lesson[];
  defaultLynkUrl: string;
  onBack: () => void;
}

export const ClassDetailPage: React.FC<ClassDetailPageProps> = ({
  course,
  modules,
  lessons,
  defaultLynkUrl,
  onBack,
}) => {
  const [openModuleId, setOpenModuleId] = useState<string | null>(modules[0]?.id || null);

  const courseModules = modules
    .filter((m) => m.courseId === course.id)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0B2A5B] dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Daftar Kelas
      </button>

      {/* Hero Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left 2 cols */}
        <div className="md:col-span-2 space-y-5">
          <h1 className="text-2xl sm:text-4xl font-bold font-heading text-[#0B2A5B] dark:text-white leading-tight">
            {course.name}
          </h1>

          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {course.summary}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#FF7A1A]" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#1E4FA8]" />
              <span>{courseModules.length} Modul</span>
            </div>
          </div>
        </div>

        {/* Right card (Buy box) */}
        <div className="bg-white dark:bg-slate-900 rounded-[14px] p-6 border border-slate-200 dark:border-slate-800 shadow-lg space-y-5 sticky top-24">
          <div className="aspect-video w-full rounded-[10px] overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img
              src={course.coverValue}
              alt={course.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <span className="text-2xl sm:text-3xl font-bold text-[#0B2A5B] dark:text-white font-heading">
              {formatRupiah(course.price)}
            </span>
          </div>

          <a
            href={course.lynkUrl || defaultLynkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[48px] px-6 text-base font-semibold text-white bg-[#FF7A1A] hover:bg-[#E56A10] rounded-[14px] flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            Beli di Lynk.id
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Description & What you learn */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="md:col-span-2 space-y-8">
          {/* Detailed description */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold font-heading text-[#0B2A5B] dark:text-white">
              Deskripsi Kelas
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {course.description}
            </p>
          </div>

          {/* What you'll learn */}
          {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
            <div className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-[14px] border border-slate-100 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold font-heading text-[#0B2A5B] dark:text-white">
                Materi yang Dikuasai
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.whatYouWillLearn.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Curriculum Accordion */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-heading text-[#0B2A5B] dark:text-white">
              Silabus Modul
            </h2>

            <div className="space-y-3">
              {courseModules.map((mod) => {
                const isOpen = openModuleId === mod.id;
                const modLessons = lessons
                  .filter((l) => l.moduleId === mod.id)
                  .sort((a, b) => a.order - b.order);

                return (
                  <div
                    key={mod.id}
                    className="rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenModuleId(isOpen ? null : mod.id)}
                      className="w-full min-h-[50px] px-5 py-3.5 flex items-center justify-between text-left text-sm sm:text-base font-semibold text-slate-900 dark:text-white transition-colors"
                    >
                      <span className="font-heading">{mod.title}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          isOpen ? 'rotate-180 text-[#FF7A1A]' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                        {modLessons.length === 0 ? (
                          <div className="py-2 text-xs text-slate-400">
                            Belum ada data
                          </div>
                        ) : (
                          modLessons.map((les) => (
                            <div
                              key={les.id}
                              className="flex items-center justify-between py-2 text-sm text-slate-700 dark:text-slate-300"
                            >
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-[#1E4FA8]" />
                                <span>{les.title}</span>
                              </div>
                              <span className="text-xs text-slate-400">{les.duration}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
