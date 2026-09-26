import React from 'react';
import { useApp } from '../../context/AppContext';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { PlayCircle, Download, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';
import { Tooltip } from '../../components/ui/Tooltip';

export const MemberDashboard: React.FC = () => {
  const { currentUser, products, navigate } = useApp();

  // Find products approved for this member
  const memberProducts = products.filter((p) =>
    currentUser.approvedProductIds.includes(p.id)
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Akun Member Terverifikasi</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Selamat Datang, {currentUser.name || currentUser.email}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih produk digital Anda di bawah untuk mengakses materi video dan berkas unduhan.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
            {currentUser.email}
          </div>
        </div>

        {/* Member Products List */}
        {memberProducts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
            <p className="text-sm font-semibold text-slate-700">
              Belum ada produk aktif pada akun ini.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Jika baru saja mendaftar, pastikan bukti pembayaran telah disetujui admin.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => navigate('/cek-status')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cek Status Approval
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
              >
                Lihat Katalog
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col group"
              >
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <img
                    src={prod.coverUrl}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-xs">
                    Akses Aktif
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {prod.name}
                    </h3>

                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 font-mono-tabular">
                      <span>{prod.videos.length} Modul Video</span>
                      {prod.bonusFileName && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Bonus Drive Siap Download</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => navigate(`/member/${prod.slug}`)}
                      className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Buka Materi Pembelajaran</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
