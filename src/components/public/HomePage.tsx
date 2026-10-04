import React, { useState } from 'react';
import { CMSSettings, Course, AppExample, Testimonial, FaqItem } from '../../types';
import { formatRupiah } from '../../utils/crypto';
import {
  Sparkles,
  Smartphone,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Star,
  Check,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface HomePageProps {
  cms: CMSSettings;
  courses: Course[];
  appExamples: AppExample[];
  testimonials: Testimonial[];
  faqs: FaqItem[];
  onNavigate: (path: string) => void;
  onOpenClassDetail: (classId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  cms,
  courses,
  appExamples,
  testimonials,
  faqs,
  onNavigate,
  onOpenClassDetail,
}) => {
  const [openFaqId, setOpenFaqId] = useState<string | null>(faqs[0]?.id || null);

  const getSection = (id: string) => cms.sections.find((s) => s.id === id);

  const secHero = getSection('sec_hero');
  const secBenefits = getSection('sec_benefits');
  const secHow = getSection('sec_how');
  const secFeatured = getSection('sec_featured');
  const secExamples = getSection('sec_examples');
  const secTesti = getSection('sec_testimonials');
  const secFaq = getSection('sec_faq');
  const secCta = getSection('sec_cta');

  const visibleCourses = courses
    .filter((c) => c.status === 'tampil')
    .slice(0, 3);

  const visibleExamples = appExamples
    .filter((e) => e.isVisible)
    .slice(0, 4);

  const visibleTestimonials = testimonials
    .filter((t) => t.isVisible);

  const visibleFaqs = faqs
    .filter((f) => f.isVisible);

  return (
    <div className="w-full space-y-16 sm:space-y-24 pb-20">
      {/* 1. Hero Section */}
      {secHero?.isVisible && (
        <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 bg-gradient-to-b from-blue-50/60 to-transparent dark:from-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B2A5B]/10 dark:bg-blue-400/10 text-[#0B2A5B] dark:text-blue-300 text-xs sm:text-sm font-semibold tracking-wide">
                <Sparkles className="w-4 h-4 text-[#FF7A1A]" />
                {cms.identity.tagline}
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-heading text-[#0B2A5B] dark:text-white tracking-tight leading-tight sm:leading-tight">
                {cms.identity.heroTitle}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
                {cms.identity.heroSubtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
                <button
                  onClick={() => onNavigate('/kelas')}
                  className="w-full sm:w-auto min-h-[48px] px-8 py-3 text-base font-semibold text-white bg-[#FF7A1A] hover:bg-[#E56A10] rounded-[14px] shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Lihat Kelas
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('/kontak')}
                  className="w-full sm:w-auto min-h-[48px] px-8 py-3 text-base font-semibold text-[#0B2A5B] dark:text-white bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-[14px] transition-colors flex items-center justify-center"
                >
                  Hubungi Kami
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Benefits Section */}
      {secBenefits?.isVisible && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#0B2A5B] dark:text-white">
              {secBenefits.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-[12px] bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-[#1E4FA8] dark:text-blue-400 mb-4">
                <Zap className="w-6 h-6 text-[#FF7A1A]" />
              </div>
              <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white mb-2">
                Instruksi Bahasa Manusia
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Cukup deskripsikan aplikasi yang Anda inginkan, teknologi AI akan memandu perwujudannya selangkah demi selangkah.
              </p>
            </div>

            <div className="p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-[12px] bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-[#1E4FA8] dark:text-blue-400 mb-4">
                <Layers className="w-6 h-6 text-[#FF7A1A]" />
              </div>
              <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white mb-2">
                Pustaka Skill Claude
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Unduh berkas keahlian siap pasang untuk mempercepat pembuatan modul absensi, toko online, dan portal web.
              </p>
            </div>

            <div className="p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-[12px] bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-[#1E4FA8] dark:text-blue-400 mb-4">
                <Smartphone className="w-6 h-6 text-[#FF7A1A]" />
              </div>
              <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white mb-2">
                Sempurna di Layar HP
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Seluruh aplikasi hasil latihan responsif dan nyaman digunakan dengan satu tangan di layar ponsel.
              </p>
            </div>

            <div className="p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-[12px] bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-[#1E4FA8] dark:text-blue-400 mb-4">
                <ShieldCheck className="w-6 h-6 text-[#FF7A1A]" />
              </div>
              <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white mb-2">
                Sertifikat Kelulusan Resmi
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Dapatkan sertifikat digital dengan nomor verifikasi unik setelah menuntaskan seluruh pelajaran dan kuis.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 3. How It Works Section */}
      {secHow?.isVisible && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#0B2A5B] dark:text-white">
              {secHow.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-900 rounded-[14px] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-[#0B2A5B] text-white font-heading font-bold text-xl flex items-center justify-center mb-5">
                1
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white mb-2">
                Beli Kelas di Lynk.id
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Pilih topik kelas yang Anda butuhkan dan selesaikan pembelian secara aman di halaman Lynk.id.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-900 rounded-[14px] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-[#1E4FA8] text-white font-heading font-bold text-xl flex items-center justify-center mb-5">
                2
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white mb-2">
                Aktivasi Kode Akses
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Gunakan kode akses pribadi dari admin untuk masuk ke ruang member portal belajar Guber Smart.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-900 rounded-[14px] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-[#FF7A1A] text-white font-heading font-bold text-xl flex items-center justify-center mb-5">
                3
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white mb-2">
                Praktik dan Terbitkan
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Ikuti video, centang panduan bertahap, unduh skill pendukung, dan luncurkan aplikasi web Anda.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 4. Featured Classes */}
      {secFeatured?.isVisible && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#0B2A5B] dark:text-white">
                {secFeatured.title}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/kelas')}
              className="text-sm font-semibold text-[#1E4FA8] dark:text-blue-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              Semua Kelas
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-slate-900 rounded-[14px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div
                    onClick={() => onOpenClassDetail(course.id)}
                    className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
                  >
                    <img
                      src={course.coverValue}
                      alt={course.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{course.duration}</span>
                      <span>{course.modulesCount || 4} Modul</span>
                    </div>

                    <h3
                      onClick={() => onOpenClassDetail(course.id)}
                      className="text-lg font-bold font-heading text-slate-900 dark:text-white hover:text-[#1E4FA8] transition-colors cursor-pointer"
                    >
                      {course.name}
                    </h3>

                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {course.summary}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-lg font-bold text-[#0B2A5B] dark:text-white">
                      {formatRupiah(course.price)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenClassDetail(course.id)}
                      className="h-10 px-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-[12px] transition-colors"
                    >
                      Rincian
                    </button>
                    <a
                      href={course.lynkUrl || cms.identity.lynkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 px-4 text-xs font-semibold text-white bg-[#FF7A1A] hover:bg-[#E56A10] rounded-[12px] flex items-center gap-1.5 transition-colors shadow-xs active:scale-[0.98]"
                    >
                      Beli
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. App Examples Highlights */}
      {secExamples?.isVisible && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#0B2A5B] dark:text-white">
                {secExamples.title}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/contoh')}
              className="text-sm font-semibold text-[#1E4FA8] dark:text-blue-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              Lihat Galeri
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleExamples.map((app) => (
              <div
                key={app.id}
                className="bg-white dark:bg-slate-900 rounded-[14px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={app.imageUrl}
                      alt={app.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-50 dark:bg-blue-950 text-[#1E4FA8] dark:text-blue-300">
                      {app.category}
                    </span>
                    <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">
                      {app.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {app.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <a
                    href={app.appUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-[44px] px-3 text-xs font-semibold text-[#0B2A5B] dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-[12px] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    Buka Aplikasi
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Testimonials */}
      {secTesti?.isVisible && visibleTestimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#0B2A5B] dark:text-white">
              {secTesti.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleTestimonials.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                    "{item.content}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <img
                    src={item.avatarUrl}
                    alt={item.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.name}
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {item.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. FAQ Section */}
      {secFaq?.isVisible && visibleFaqs.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#0B2A5B] dark:text-white">
              {secFaq.title}
            </h2>
          </div>

          <div className="space-y-3">
            {visibleFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full min-h-[52px] px-5 py-4 flex items-center justify-between text-left text-base font-semibold text-slate-900 dark:text-white transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#FF7A1A]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 8. Call to Action Banner */}
      {secCta?.isVisible && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[18px] bg-gradient-to-r from-[#0B2A5B] to-[#1E4FA8] p-8 sm:p-14 text-white text-center space-y-6 shadow-xl relative overflow-hidden">
            <h2 className="text-2xl sm:text-4xl font-bold font-heading max-w-2xl mx-auto leading-tight">
              Mulai Bangun Aplikasi Web Anda Hari Ini
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('/kelas')}
                className="w-full sm:w-auto min-h-[48px] px-8 py-3 text-base font-semibold text-white bg-[#FF7A1A] hover:bg-[#E56A10] rounded-[14px] shadow-lg transition-all active:scale-[0.98]"
              >
                Pilih Kelas
              </button>
              <a
                href={cms.identity.lynkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto min-h-[48px] px-8 py-3 text-base font-semibold text-white bg-white/15 hover:bg-white/25 rounded-[14px] border border-white/20 transition-colors flex items-center justify-center gap-2"
              >
                Beli di Lynk.id
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
