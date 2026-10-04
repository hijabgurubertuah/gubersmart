import React from 'react';
import { Course, Member } from '../../types';
import { formatDate } from '../../utils/crypto';
import { Printer, Download, ArrowLeft, Award, ShieldCheck } from 'lucide-react';

interface CertificateViewProps {
  member: Member;
  course: Course;
  certNumber: string;
  issuedAt: string;
  onBack: () => void;
}

export const CertificateView: React.FC<CertificateViewProps> = ({
  member,
  course,
  certNumber,
  issuedAt,
  onBack,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top action bar (hidden on print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0B2A5B] dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dasbor
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="min-h-[44px] px-4 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-[12px] flex items-center gap-2 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            Unduh PDF
          </button>
          <button
            onClick={handlePrint}
            className="min-h-[44px] px-5 text-xs sm:text-sm font-semibold text-white bg-[#0B2A5B] hover:bg-[#1E4FA8] rounded-[12px] flex items-center gap-2 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            Cetak
          </button>
        </div>
      </div>

      {/* Official Certificate Container */}
      <div className="bg-white text-slate-900 border-[10px] border-[#0B2A5B] rounded-[18px] p-8 sm:p-14 shadow-2xl relative overflow-hidden select-none">
        {/* Decorative corner lines */}
        <div className="absolute top-2 left-2 w-12 h-12 border-t-2 border-l-2 border-[#FF7A1A]" />
        <div className="absolute top-2 right-2 w-12 h-12 border-t-2 border-r-2 border-[#FF7A1A]" />
        <div className="absolute bottom-2 left-2 w-12 h-12 border-b-2 border-l-2 border-[#FF7A1A]" />
        <div className="absolute bottom-2 right-2 w-12 h-12 border-b-2 border-r-2 border-[#FF7A1A]" />

        {/* Certificate Content */}
        <div className="text-center space-y-6 sm:space-y-8 relative z-10">
          {/* Header */}
          <div className="space-y-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 flex items-center justify-center text-[#0B2A5B] mb-2">
              <Award className="w-10 h-10 text-[#FF7A1A]" />
            </div>
            <h4 className="text-xs sm:text-sm tracking-[0.25em] font-bold text-[#1E4FA8] uppercase font-sans">
              SERTIFIKAT KELULUSAN RESMI
            </h4>
            <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-[#0B2A5B] tracking-tight">
              Guber Smart
            </h1>
          </div>

          <p className="text-sm sm:text-base text-slate-500 font-sans">
            Diberikan dengan bangga kepada:
          </p>

          {/* Recipient Name */}
          <div className="py-2">
            <h2 className="text-2xl sm:text-4xl font-bold font-heading text-slate-900 border-b-2 border-slate-300 pb-2 inline-block px-8">
              {member.name}
            </h2>
          </div>

          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Atas dedikasi dan keberhasilan menyelesaikan seluruh modul kurikulum, praktik bertahap, dan kuis evaluasi pada kelas:
          </p>

          <h3 className="text-xl sm:text-2xl font-bold font-heading text-[#0B2A5B]">
            {course.name}
          </h3>

          {/* Footer credentials and signature */}
          <div className="pt-8 sm:pt-12 grid grid-cols-2 gap-8 items-end border-t border-slate-200">
            <div className="text-left space-y-1">
              <p className="text-xs text-slate-400">Nomor Sertifikat:</p>
              <p className="text-sm font-mono font-bold text-slate-800">{certNumber}</p>
              <p className="text-xs text-slate-400 pt-1">Tanggal Terbit:</p>
              <p className="text-xs font-medium text-slate-700">{formatDate(issuedAt)}</p>
            </div>

            <div className="text-right space-y-1 flex flex-col items-end">
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mb-2 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Terverifikasi Digital
              </div>
              <div className="h-10 border-b border-slate-400 w-40" />
              <p className="text-xs font-bold text-slate-800 pt-1">Direktur Pembelajaran</p>
              <p className="text-xs text-slate-400">Guber Smart Indonesia</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
