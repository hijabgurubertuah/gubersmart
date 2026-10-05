import React, { useState } from 'react';
import { Course, CourseModule, Lesson } from '../../types';
import { formatRupiah } from '../../utils/crypto';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  ChevronDown,
  Sparkles,
  Users,
  Flame,
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
        <div className="md:col-span-2 space-y-4">
          {course.headline && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF7A1A]/10 text-[#FF7A1A] text-xs sm:text-sm font-bold tracking-wide">
              <Sparkles className="w-4 h-4" />
              {course.headline}
            </div>
          )}

          <h1 className="text-2xl sm:text-4xl font-bold font-heading text-[#0B2A5B] dark:text-white leading-tight">
            {course.name}
          </h1>

          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {course.summary}
          </p>
        </div>

        {/* Right card (Buy box) */}
        <div className="bg-white dark:bg-slate-900 rounded-[14px] p-6 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4 sticky top-24">
          <div className="aspect-video w-full rounded-[10px] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
            {course.coverValue && course.coverValue.trim() !== '' ? (
              <img
                src={course.coverValue}
                alt={course.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <BookOpen className="w-12 h-12 text-slate-400" />
            )}
          </div>

          {/* Promo box */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-[10px] border border-amber-200 dark:border-amber-800/60 text-xs space-y-1">
            <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
              <Flame className="w-4 h-4 shrink-0" />
              <span>PROMO TERBATAS: DISKON 65% + 30%!</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Harga normal turun drastis. Kesempatan ini tidak akan lama!
            </p>
          </div>

          <div>
            <div className="text-xs text-slate-400 line-through">
              Rp 1.140.000
            </div>
            <span className="text-2xl sm:text-3xl font-bold text-[#0B2A5B] dark:text-white font-heading">
              {formatRupiah(course.price)}
            </span>
          </div>

          <a
            href={course.lynkUrl || defaultLynkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[48px] px-6 text-sm sm:text-base font-bold tracking-wider text-white bg-[#FF7A1A] hover:bg-[#E56A10] rounded-[14px] flex items-center justify-center shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            AMBIL PROMO SEKARANG
          </a>
        </div>
      </div>

      {/* Description & What you learn & Target Audience */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="md:col-span-2 space-y-8">
          {/* Detailed description */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold font-heading text-[#0B2A5B] dark:text-white">
              Tentang Kelas
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {course.description}
            </p>
          </div>

          {/* Yang kamu dapatkan */}
          {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
            <div className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-[14px] border border-slate-100 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold font-heading text-[#0B2A5B] dark:text-white flex items-center gap-2">
                <span>Yang Kamu Dapatkan:</span>
              </h2>
              <div className="space-y-3">
                {course.whatYouWillLearn.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cocok untuk kamu yang */}
          {course.targetAudience && course.targetAudience.length > 0 && (
            <div className="space-y-4 bg-blue-50/50 dark:bg-slate-900/80 p-6 rounded-[14px] border border-blue-100 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold font-heading text-[#0B2A5B] dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#1E4FA8]" />
                <span>Cocok Untuk Kamu yang:</span>
              </h2>
              <div className="space-y-2.5">
                {course.targetAudience.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#FF7A1A] shrink-0 mt-2" />
                    <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Closing callout */}
          <div className="p-6 bg-gradient-to-r from-[#0B2A5B] to-[#1E4FA8] rounded-[16px] text-white space-y-3 shadow-md">
            <p className="text-base sm:text-lg font-semibold leading-relaxed">
              "Kamu tidak perlu jadi programmer. Kamu hanya perlu punya ide dan mau belajar."
            </p>
            <div className="pt-2">
              <a
                href={course.lynkUrl || defaultLynkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] px-6 py-2.5 text-xs sm:text-sm font-bold tracking-wider text-white bg-[#FF7A1A] hover:bg-[#E56A10] rounded-[12px] items-center justify-center transition-all shadow-sm active:scale-95"
              >
                AMBIL PROMO SEKARANG
              </a>
            </div>
          </div>

          {/* Curriculum Accordion */}
          {courseModules.length > 0 && (
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
          )}
        </div>
      </div>
    </div>
  );
};

