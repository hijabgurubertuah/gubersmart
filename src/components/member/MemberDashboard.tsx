import React from 'react';
import { Member, Course, Lesson, UserProgress, Announcement } from '../../types';
import { BookOpen, Sparkles, ArrowRight, Bell, Award, CheckCircle2 } from 'lucide-react';

interface MemberDashboardProps {
  member: Member;
  courses: Course[];
  lessons: Lesson[];
  progress: UserProgress;
  announcements: Announcement[];
  onOpenClass: (courseId: string) => void;
  onOpenLesson: (lessonId: string) => void;
  onOpenSkills: () => void;
  onOpenCertificates: (courseId: string) => void;
  onOpenAnnouncements: () => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  member,
  courses,
  lessons,
  progress,
  announcements,
  onOpenClass,
  onOpenLesson,
  onOpenSkills,
  onOpenCertificates,
  onOpenAnnouncements,
}) => {
  // Owned courses
  const ownedCourses = courses.filter((c) => member.ownedCourses.includes(c.id));

  // Determine latest / next lesson for a course
  const getContinueLesson = (courseId: string) => {
    const courseLessons = lessons
      .filter((l) => l.courseId === courseId)
      .sort((a, b) => a.order - b.order);

    const nextUncompleted = courseLessons.find((l) => !progress.completedLessons.includes(l.id));
    return nextUncompleted || courseLessons[courseLessons.length - 1];
  };

  const getCourseProgress = (courseId: string) => {
    const courseLessons = lessons.filter((l) => l.courseId === courseId);
    if (courseLessons.length === 0) return 0;
    const completed = courseLessons.filter((l) => progress.completedLessons.includes(l.id)).length;
    return Math.round((completed / courseLessons.length) * 100);
  };

  const activeAnnouncements = announcements
    .filter((a) => a.isVisible)
    .slice(0, 2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#0B2A5B] dark:text-white">
            Halo, {member.name}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {member.whatsapp}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSkills}
            className="min-h-[44px] px-4 text-xs sm:text-sm font-semibold text-[#1E4FA8] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-[12px] flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-[#FF7A1A]" />
            Skill Claude
          </button>
        </div>
      </div>

      {/* Announcements Bar if any */}
      {activeAnnouncements.length > 0 && (
        <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900 rounded-[14px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                {activeAnnouncements[0].title}
              </h4>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/80 line-clamp-1">
                {activeAnnouncements[0].content}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAnnouncements}
            className="text-xs font-semibold text-amber-900 dark:text-amber-200 hover:underline self-end sm:self-auto shrink-0"
          >
            Lihat Semua
          </button>
        </div>
      )}

      {/* Kelas Saya */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold font-heading text-[#0B2A5B] dark:text-white">
          Kelas Saya
        </h2>

        {ownedCourses.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-[14px] border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 font-heading">
              Belum ada data
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ownedCourses.map((course) => {
              const percent = getCourseProgress(course.id);
              const continueLesson = getContinueLesson(course.id);
              const hasCert = !!progress.certificates[course.id];

              return (
                <div
                  key={course.id}
                  className="bg-white dark:bg-slate-900 rounded-[14px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div
                      onClick={() => onOpenClass(course.id)}
                      className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
                    >
                      <img
                        src={course.coverValue}
                        alt={course.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="p-5 space-y-4">
                      <h3
                        onClick={() => onOpenClass(course.id)}
                        className="text-lg font-bold font-heading text-slate-900 dark:text-white hover:text-[#1E4FA8] transition-colors cursor-pointer"
                      >
                        {course.name}
                      </h3>

                      {/* Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                          <span>Progres Belajar</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-[#FF7A1A] rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenClass(course.id)}
                      className="h-10 px-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-[12px] flex items-center gap-1.5 transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-[#1E4FA8]" />
                      Modul
                    </button>

                    {hasCert ? (
                      <button
                        onClick={() => onOpenCertificates(course.id)}
                        className="h-10 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-[12px] flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Award className="w-4 h-4" />
                        Sertifikat
                      </button>
                    ) : continueLesson ? (
                      <button
                        onClick={() => onOpenLesson(continueLesson.id)}
                        className="h-10 px-4 text-xs font-semibold text-white bg-[#FF7A1A] hover:bg-[#E56A10] rounded-[12px] flex items-center gap-1.5 transition-colors shadow-xs active:scale-[0.98]"
                      >
                        Lanjutkan
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenClass(course.id)}
                        className="h-10 px-4 text-xs font-semibold text-white bg-[#0B2A5B] hover:bg-[#1E4FA8] rounded-[12px] flex items-center gap-1.5 transition-colors"
                      >
                        Buka
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
