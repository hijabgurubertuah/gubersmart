import React, { useState } from 'react';
import { Quiz } from '../../types';
import { X, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface QuizModalProps {
  quiz: Quiz;
  isOpen: boolean;
  onClose: () => void;
  onSubmitResult: (score: number, passed: boolean) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  quiz,
  isOpen,
  onClose,
  onSubmitResult,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isPassed, setIsPassed] = useState(false);

  if (!isOpen) return null;

  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const handleSelect = (questionId: string, optionIndex: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answeredCount < totalQuestions) return;

    let correctCount = 0;
    quiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / totalQuestions) * 100);
    const passed = calculatedScore >= quiz.passingScore;

    setScore(calculatedScore);
    setIsPassed(passed);
    setSubmitted(true);
    onSubmitResult(calculatedScore, passed);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
    setIsPassed(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[14px] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold font-heading text-[#0B2A5B] dark:text-white">
            Kuis Evaluasi Modul
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div
                className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
                  isPassed
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                    : 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                }`}
              >
                {isPassed ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
              </div>

              <div>
                <span className="text-3xl font-bold font-heading text-slate-900 dark:text-white">
                  {score}%
                </span>
                <p
                  className={`text-sm font-semibold mt-1 ${
                    isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isPassed ? 'Lulus' : 'Belum Lulus'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Batas Kelulusan: {quiz.passingScore}%
                </p>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="min-h-[44px] px-5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-[12px] flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Ulangi Kuis
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[44px] px-6 text-sm font-semibold text-white bg-[#0B2A5B] hover:bg-[#1E4FA8] rounded-[12px] transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          ) : (
            <form id="quiz-form" onSubmit={handleSubmit} className="space-y-6">
              {quiz.questions.map((q, qIndex) => (
                <div
                  key={q.id}
                  className="space-y-3 p-4 rounded-[12px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800"
                >
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {qIndex + 1}. {q.question}
                  </h4>

                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[q.id] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelect(q.id, optIdx)}
                          className={`w-full min-h-[44px] p-3 text-left text-xs sm:text-sm rounded-[10px] border transition-all flex items-center gap-3 ${
                            isSelected
                              ? 'bg-blue-50 border-[#1E4FA8] text-[#0B2A5B] font-semibold dark:bg-blue-950/60 dark:text-blue-300'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border shrink-0 ${
                              isSelected
                                ? 'border-[#1E4FA8] bg-[#1E4FA8] text-white'
                                : 'border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </form>
          )}
        </div>

        {/* Footer */}
        {!submitted && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-500">
              {answeredCount} dari {totalQuestions} terjawab
            </span>
            <button
              type="submit"
              form="quiz-form"
              disabled={answeredCount < totalQuestions}
              className="min-h-[44px] px-6 text-sm font-semibold text-white bg-[#FF7A1A] hover:bg-[#E56A10] disabled:opacity-50 rounded-[12px] transition-colors shadow-xs"
            >
              Kirim Jawaban
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
