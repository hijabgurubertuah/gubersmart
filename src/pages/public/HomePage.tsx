import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { ArrowRight, Star, ShieldCheck, Zap, Download } from 'lucide-react';
import { Tooltip } from '../../components/ui/Tooltip';

export const HomePage: React.FC = () => {
  const { products, categories, testimonials, navigate } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter only 'Tayang' products
  const publishedProducts = products.filter((p) => p.status === 'Tayang');
  const filteredProducts =
    selectedCategory === 'all'
      ? publishedProducts
      : publishedProducts.filter((p) => p.category === selectedCategory);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>Koleksi Terkurasi Produk & Jasa Digital</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight max-w-3xl mx-auto text-balance leading-tight">
            Belajar Buat Web App & Bangun Portofolio Digital Mandiri
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Akses materi video bertahap, source code siap pakai, layanan pembuatan website bisnis, dan modul pembelajaran praktis.
          </p>

          <div className="mt-8 flex items-center justify-center">
            <button
              onClick={() => {
                const el = document.getElementById('katalog');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <span>Eksplor Katalog Produk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Akses Materi Lifetime</span>
            </div>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <div className="flex items-center gap-1.5">
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Source Code & Modul Google Drive</span>
            </div>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Verifikasi Pembayaran Cepat</span>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section id="katalog" className="py-12 md:py-16 flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Category Segmented Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Katalog Produk Digital</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>{publishedProducts.length} Produk Tersedia</span>
              <span aria-hidden="true">·</span>
              <span>Diperbarui 2026</span>
            </div>
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl overflow-x-auto max-w-full">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.name
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
            <p className="text-sm font-medium text-slate-600">
              Belum ada produk untuk kategori ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col group"
              >
                {/* Cover Image */}
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  <img
                    src={prod.coverUrl}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-md">
                    {prod.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {prod.name}
                    </h3>

                    <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {prod.shortDescription}
                    </p>

                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 font-mono-tabular">
                      <span>{prod.videos.length} Modul Video</span>
                      {prod.bonusFileName && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Bonus Drive</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-slate-400">
                        Investasi
                      </span>
                      <span className="text-base font-bold text-slate-900 font-mono-tabular">
                        {formatIDR(prod.price)}
                      </span>
                    </div>

                    <Tooltip content="Buka Landing Page & Pendaftaran">
                      <button
                        onClick={() => navigate(`/${prod.slug}`)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
                      >
                        <span>Lihat Detail</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Testimonials Proof Section */}
        {testimonials.length > 0 && (
          <div className="mt-20 pt-12 border-t border-slate-200">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="text-2xl font-bold text-slate-900">Ulasan & Bukti Hasil</h2>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-1">
                <span>Testimoni Member Terdaftar</span>
                <span aria-hidden="true">·</span>
                <span>Rating 5.0 / 5.0</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 text-amber-500 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      &ldquo;{t.content}&rdquo;
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{t.customerName}</div>
                      <div className="text-[11px] text-slate-500">{t.customerRole}</div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono-tabular">{t.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};
