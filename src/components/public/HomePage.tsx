import React, { useState, useEffect } from 'react';
import { CMSSettings, Course, AppExample, Testimonial, FaqItem } from '../../types';
import { formatRupiah } from '../../utils/crypto';
import {
  Smartphone,
  Layers,
  ArrowRight,
  ChevronDown,
  ShieldCheck,
  Zap,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  ExternalLink,
  Star,
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

  // Background Carousel Slides
  const defaultHeroSlides = [
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop',
  ];

  const heroSlides =
    cms.identity.heroImages && cms.identity.heroImages.length > 0
      ? cms.identity.heroImages
      : defaultHeroSlides;

  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-slide carousel every 5.5s
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const getSection = (id: string) => cms.sections.find((s) => s.id === id);

  const secHero = getSection('sec_hero');
  const secFeatured = getSection('sec_featured');
  const secBenefits = getSection('sec_benefits');
  const secHow = getSection('sec_how');
  const secExamples = getSection('sec_examples');
  const secTesti = getSection('sec_testimonials');
  const secFaq = getSection('sec_faq');
  const secCta = getSection('sec_cta');

  const visibleCourses = courses
    .filter((c) => c.status === 'tampil')
    .slice(0, 6);

  const visibleExamples = appExamples
    .filter((e) => e.isVisible)
    .slice(0, 4);

  const visibleTestimonials = testimonials
    .filter((t) => t.isVisible);

  const visibleFaqs = faqs
    .filter((f) => f.isVisible);

  return (
    <div className="w-full space-y-16 sm:space-y-24 pb-20">
      {/* 1. Hero Section with Background Carousel */}
      {secHero?.isVisible && (
        <section className="relative overflow-hidden min-h-[220px] sm:min-h-[280px] lg:min-h-[320px] flex items-center justify-center bg-slate-950 group">
          {/* Background Images Carousel */}
          <div className="absolute inset-0 z-0">
            {heroSlides.map((slideUrl, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                  idx === activeSlide
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-105 pointer-events-none'
                }`}
              >
                <img
                  src={slideUrl}
                  alt={`Hero Slide ${idx + 1}`}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            ))}

            {/* Dark Aesthetic Translucent Gradient Overlay for crisp text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-900/60 backdrop-blur-[1px]" />
          </div>

          {/* Carousel Arrows on Desktop (Hover) */}
          {heroSlides.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevSlide}
                className="absolute left-3 sm:left-5 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white flex items-center justify-center backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 active:scale-95"
                aria-label="Slide sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextSlide}
                className="absolute right-3 sm:right-5 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white flex items-center justify-center backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 active:scale-95"
                aria-label="Slide selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Hero Content (Compact, without action buttons) */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center">
            <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight sm:leading-tight drop-shadow-md">
                {cms.identity.heroTitle}
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed font-normal max-w-2xl mx-auto drop-shadow-sm">
                {cms.identity.heroSubtitle}
              </p>
            </div>
          </div>

          {/* Carousel Slide Indicator Dots */}
          {heroSlides.length > 1 && (
            <div className="absolute bottom-2.5 inset-x-0 z-20 flex items-center justify-center gap-1.5">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  className={`transition-all rounded-full ${
                    idx === activeSlide
                      ? 'w-6 h-1.5 bg-[#FF7A1A]'
                      : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Ke slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 2. Produk Guber Smart (LANGSUNG SETELAH HEADER) */}
      {secFeatured?.isVisible && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#0B2A5B] dark:text-white">
                Produk Guber Smart
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
                    className="aspect-video w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 cursor-pointer flex items-center justify-center"
                  >
                    {course.coverValue && course.coverValue.trim() !== '' ? (
                      <img
                        src={course.coverValue}
                        alt={course.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <BookOpen className="w-10 h-10 text-slate-400 group-hover:scale-110 transition-transform" />
                    )}
                  </div>
                  <div className="p-5 space-y-2">
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
                  <div>
                    <a
                      href={course.lynkUrl || cms.identity.lynkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 px-5 text-xs font-semibold text-white bg-[#FF7A1A] hover:bg-[#E56A10] rounded-[12px] flex items-center gap-1.5 transition-colors shadow-xs active:scale-[0.98]"
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

      {/* 3. Benefits Section */}
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

      {/* 4. How It Works Section */}
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
                  <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {app.imageUrl && app.imageUrl.trim() !== '' ? (
                      <img
                        src={app.imageUrl}
                        alt={app.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <LayoutGrid className="w-8 h-8 text-slate-400" />
                    )}
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
                  {item.avatarUrl && item.avatarUrl.trim() !== '' ? (
                    <img
                      src={item.avatarUrl}
                      alt={item.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#0B2A5B] text-white flex items-center justify-center font-bold text-sm">
                      {item.name.charAt(0)}
                    </div>
                  )}
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
