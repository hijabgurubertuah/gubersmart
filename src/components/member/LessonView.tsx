import React, { useState, useEffect } from 'react';
import { Lesson, UserProgress, ContentBlock, StepItem } from '../../types';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Copy,
  Check,
  Download,
  ExternalLink,
  Save,
  Clock,
  Sparkles,
  FileText,
} from 'lucide-react';

interface LessonViewProps {
  lesson: Lesson;
  courseTitle: string;
  allLessons: Lesson[];
  progress: UserProgress;
  onBackToCourse: () => void;
  onNavigateLesson: (lessonId: string) => void;
  onToggleComplete: (lessonId: string) => void;
  onToggleStep: (lessonId: string, stepId: string) => void;
  onSaveNote: (lessonId: string, note: string) => void;
  onDownloadFile: (fileId?: string, value?: string, fileName?: string) => void;
  onToast: (msg: string) => void;
}

export const LessonView: React.FC<LessonViewProps> = ({
  lesson,
  courseTitle,
  allLessons,
  progress,
  onBackToCourse,
  onNavigateLesson,
  onToggleComplete,
  onToggleStep,
  onSaveNote,
  onDownloadFile,
  onToast,
}) => {
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null);
  const [note, setNote] = useState<string>(progress.notes[lesson.id] || '');
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    setNote(progress.notes[lesson.id] || '');
    setNoteSaved(false);
  }, [lesson.id, progress.notes]);

  const isCompleted = progress.completedLessons.includes(lesson.id);
  const completedSteps = progress.completedSteps[lesson.id] || [];

  // Find prev / next lesson
  const sortedLessons = [...allLessons].sort((a, b) => a.order - b.order);
  const currentIndex = sortedLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;

  const handleCopyPrompt = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptIndex(index);
    onToast('Teks berhasil disalin');
    setTimeout(() => setCopiedPromptIndex(null), 100);
  };

  const handleNoteBlur = () => {
    onSaveNote(lesson.id, note);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 100);
  };

  // Helper for Youtube Embed URL
  const getYoutubeEmbed = (url: string, start = 0) => {
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    } else {
      videoId = url;
    }
    const params = start > 0 ? `?start=${start}&autoplay=0` : '';
    return `https://www.youtube.com/embed/${videoId}${params}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onBackToCourse}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0B2A5B] dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {courseTitle}
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleComplete(lesson.id)}
            className={`min-h-[44px] px-4 text-xs sm:text-sm font-semibold rounded-[12px] flex items-center gap-2 transition-all ${
              isCompleted
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200'
                : 'bg-[#FF7A1A] text-white hover:bg-[#E56A10] shadow-xs active:scale-[0.98]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {isCompleted ? 'Selesai' : 'Tandai Selesai'}
          </button>
        </div>
      </div>

      {/* Lesson Title & Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Clock className="w-3.5 h-3.5 text-[#1E4FA8]" />
          <span>{lesson.duration}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#0B2A5B] dark:text-white leading-tight">
          {lesson.title}
        </h1>
      </div>

      {/* Blocks Rendering in Order */}
      <div className="space-y-8">
        {lesson.blocks.map((block: ContentBlock, idx: number) => {
          switch (block.type) {
            case 'youtube':
              return (
                <div key={idx} className="w-full aspect-video rounded-[14px] overflow-hidden shadow-md bg-black">
                  <iframe
                    src={getYoutubeEmbed(block.videoUrl, block.startSeconds)}
                    title={lesson.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              );

            case 'text':
              return (
                <div
                  key={idx}
                  className="prose prose-slate dark:prose-invert max-w-none text-base sm:text-lg text-slate-800 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-line"
                >
                  {block.content}
                </div>
              );

            case 'steps':
              return (
                <div key={idx} className="space-y-4 bg-white dark:bg-slate-900 rounded-[14px] p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-lg font-bold font-heading text-[#0B2A5B] dark:text-white mb-4">
                    Panduan Bertahap
                  </h3>
                  <div className="space-y-4">
                    {block.steps.map((step: StepItem) => {
                      const isStepDone = completedSteps.includes(step.id);
                      return (
                        <div
                          key={step.id}
                          className={`p-4 rounded-[12px] border transition-all ${
                            isStepDone
                              ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-start gap-3.5">
                            <button
                              type="button"
                              onClick={() => onToggleStep(lesson.id, step.id)}
                              className="mt-0.5 text-slate-400 hover:text-[#FF7A1A] transition-colors focus:outline-none"
                              aria-label="Centang tahapan"
                            >
                              {isStepDone ? (
                                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                              )}
                            </button>

                            <div className="flex-1 space-y-2">
                              <h4
                                className={`text-base font-bold font-heading ${
                                  isStepDone
                                    ? 'text-slate-500 line-through'
                                    : 'text-slate-900 dark:text-white'
                                }`}
                              >
                                {step.title}
                              </h4>
                              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                {step.description}
                              </p>

                              {step.imageUrl && (
                                <div className="mt-3 rounded-[10px] overflow-hidden max-w-md border border-slate-100 dark:border-slate-800">
                                  <img src={step.imageUrl} alt="" className="w-full object-cover" />
                                </div>
                              )}

                              {step.videoUrl && (
                                <div className="mt-3 aspect-video max-w-md rounded-[10px] overflow-hidden bg-black">
                                  <iframe
                                    src={getYoutubeEmbed(step.videoUrl, step.startSeconds)}
                                    title={step.title}
                                    className="w-full h-full border-0"
                                    allowFullScreen
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );

            case 'download':
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 rounded-[14px] p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-[12px] bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-[#1E4FA8] shrink-0">
                      {block.category === 'Skill Claude' ? (
                        <Sparkles className="w-6 h-6 text-[#FF7A1A]" />
                      ) : (
                        <FileText className="w-6 h-6" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-[#1E4FA8] dark:text-blue-300">
                          {block.category}
                        </span>
                        <span className="text-xs text-slate-400">{block.version}</span>
                      </div>
                      <h4 className="text-base font-bold font-heading text-slate-900 dark:text-white">
                        {block.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {block.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onDownloadFile(block.fileId, block.value, block.name)}
                    className="min-h-[44px] px-5 text-sm font-semibold text-white bg-[#0B2A5B] hover:bg-[#1E4FA8] rounded-[12px] flex items-center justify-center gap-2 transition-colors shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    Unduh
                  </button>
                </div>
              );

            case 'prompt':
              const isCopied = copiedPromptIndex === idx;
              return (
                <div key={idx} className="relative rounded-[14px] bg-slate-900 text-slate-100 p-5 font-mono text-sm leading-relaxed overflow-hidden border border-slate-800 shadow-inner group">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">
                      Prompt
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(block.content, idx)}
                      className="px-3 py-1.5 rounded-[8px] bg-slate-800 hover:bg-slate-700 text-xs font-sans font-semibold text-white flex items-center gap-1.5 transition-colors"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          Tersalin
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Salin
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-slate-200">
                    {block.content}
                  </pre>
                </div>
              );

            case 'link':
              return (
                <div key={idx} className="pt-2">
                  <a
                    href={block.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#1E4FA8] hover:bg-[#0B2A5B] rounded-[12px] transition-colors shadow-xs"
                  >
                    {block.label}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              );

            case 'image':
              return (
                <div key={idx} className="space-y-2">
                  <div className="rounded-[14px] overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[500px]">
                    <img src={block.value} alt="" className="w-full h-full object-cover" />
                  </div>
                  {block.caption && (
                    <p className="text-xs text-center text-slate-500 italic">
                      {block.caption}
                    </p>
                  )}
                </div>
              );

            default:
              return null;
          }
        })}
      </div>

      {/* Personal Notes Section */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">
            Catatan Pribadi
          </h3>
          {noteSaved && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Tersimpan
            </span>
          )}
        </div>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={handleNoteBlur}
          placeholder="Tulis catatan penting di sini..."
          className="w-full p-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40 focus:border-[#FF7A1A] resize-none"
        />
      </div>

      {/* Bottom Prev / Next Nav */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        {prevLesson ? (
          <button
            onClick={() => onNavigateLesson(prevLesson.id)}
            className="min-h-[44px] px-4 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[12px] flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Sebelumnya
          </button>
        ) : <div />}

        {nextLesson ? (
          <button
            onClick={() => onNavigateLesson(nextLesson.id)}
            className="min-h-[44px] px-5 text-xs sm:text-sm font-semibold text-white bg-[#0B2A5B] hover:bg-[#1E4FA8] rounded-[12px] flex items-center gap-2 transition-colors shadow-xs"
          >
            Berikutnya
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onBackToCourse}
            className="min-h-[44px] px-5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-[12px] flex items-center gap-2 transition-colors shadow-xs"
          >
            Selesai ke Daftar Modul
          </button>
        )}
      </div>
    </div>
  );
};
