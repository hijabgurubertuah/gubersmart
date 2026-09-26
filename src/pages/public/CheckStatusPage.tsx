import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Search, ShieldAlert, CheckCircle2, Clock, XCircle, ArrowRight, Upload } from 'lucide-react';
import { Tooltip } from '../../components/ui/Tooltip';

export const CheckStatusPage: React.FC = () => {
  const { orders, navigate } = useApp();
  const [emailInput, setEmailInput] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const cleanEmail = emailInput.trim().toLowerCase();
  const matchedOrders = orders.filter(
    (o) => o.customerEmail.toLowerCase() === cleanEmail
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Disetujui':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Disetujui (Aktif)</span>
          </span>
        );
      case 'Menunggu Approval':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Menunggu Approval Admin</span>
          </span>
        );
      case 'Menunggu Pembayaran':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>Menunggu Pembayaran</span>
          </span>
        );
      case 'Ditolak':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Ditolak</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-slate-900">Cek Status Pesanan</h1>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-1">
              <span>Masukkan Email yang Anda Gunakan Saat Mendaftar</span>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="nama@email.com"
              className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white transition-colors"
              required
            />
            <button
              type="submit"
              className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Cari</span>
            </button>
          </form>

          {hasSearched && (
            <div className="space-y-4">
              {matchedOrders.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-600">
                    Tidak ditemukan data pesanan dengan email <strong>{emailInput}</strong>.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {matchedOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {order.productName}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            ID: {order.id}
                          </div>
                        </div>
                        <div>{getStatusBadge(order.status)}</div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-3">
                        {order.status === 'Disetujui' ? (
                          <button
                            onClick={() => navigate('/login')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                          >
                            <span>Masuk Member Area</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : order.status === 'Menunggu Pembayaran' ? (
                          <button
                            onClick={() =>
                              navigate(
                                `/daftar/produk/bukti-bayar?orderId=${order.id}&email=${encodeURIComponent(
                                  order.customerEmail
                                )}`
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Bukti Bayar</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500">
                            Pembaruan terakhir: {new Date(order.updatedAt).toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
