import React from 'react';
import { Target, Users, Sparkles, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-[#0B2A5B] dark:text-white">
          Tentang Guber Smart
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          Membuka jalan bagi siapa pun untuk menciptakan solusi teknologi dan aplikasi web mandiri tanpa hambatan koding.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-[12px] bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-[#1E4FA8]">
            <Target className="w-6 h-6 text-[#FF7A1A]" />
          </div>
          <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
            Visi Kami
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Menjadikan setiap individu dan pelaku usaha mampu menerjemahkan ide bisnis menjadi aplikasi web nyata secara mandiri, cepat, dan terjangkau.
          </p>
        </div>

        <div className="p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-[12px] bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-[#1E4FA8]">
            <Sparkles className="w-6 h-6 text-[#FF7A1A]" />
          </div>
          <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
            Metode Praktis
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Kurikulum kami berfokus pada hasil akhir. Tidak ada teori berbelit, Anda langsung dibimbing mempraktikkan pembuatan produk nyata.
          </p>
        </div>

        <div className="p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-[12px] bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-[#1E4FA8]">
            <Users className="w-6 h-6 text-[#FF7A1A]" />
          </div>
          <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
            Pustaka Berkelanjutan
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Member mendapatkan akses pembaruan berkas Skill Claude dan materi tambahan yang terus diperbarui seiring perkembangan teknologi.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[14px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
        <h2 className="text-xl font-bold font-heading text-[#0B2A5B] dark:text-white">
          Komitmen Pembelajaran
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Akses materi seumur hidup tanpa biaya langganan berulang
            </span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Optimalisasi penuh untuk perangkat seluler dan komputer
            </span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Evaluasi kuis komprehensif dan sertifikat digital resmi
            </span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Berkas template dan pustaka keahlian siap salin
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
