import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import {
  UploadCloud,
  CheckCircle2,
  FileImage,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { Tooltip } from '../../components/ui/Tooltip';

export const UploadProofPage: React.FC = () => {
  const { orders, products, submitPaymentProof, navigate } = useApp();

  // Parse URL search params
  const urlParams = new URLSearchParams(window.location.search);
  const initialOrderId = urlParams.get('orderId') || '';
  const initialEmail = urlParams.get('email') || '';

  const [searchEmail, setSearchEmail] = useState(initialEmail);
  const [selectedOrderId, setSelectedOrderId] = useState(initialOrderId);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto select order if matches
  useEffect(() => {
    if (initialOrderId) {
      setSelectedOrderId(initialOrderId);
    }
  }, [initialOrderId]);

  // Find user pending orders
  const candidateOrders = orders.filter((o) => {
    if (selectedOrderId && o.id === selectedOrderId) return true;
    if (searchEmail && o.customerEmail.toLowerCase() === searchEmail.trim().toLowerCase()) {
      return o.status === 'Menunggu Pembayaran' || o.status === 'Menunggu Approval';
    }
    return false;
  });

  const currentOrder = orders.find((o) => o.id === selectedOrderId) || candidateOrders[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder) return;

    setIsSubmitting(true);

    // Fallback preview URL or uploaded blob
    const finalProofUrl =
      previewUrl ||
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80';
    const fileName = `${currentOrder.customerEmail}_bukti_bayar.jpg`;

    await submitPaymentProof(currentOrder.id, finalProofUrl, fileName);

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="text-center mb-6">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Konfirmasi Bukti Transfer</h1>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-1">
              <span>Google Drive Storage Bridge</span>
              <span aria-hidden="true">·</span>
              <span>Notifikasi Admin Otomatis</span>
            </div>
          </div>

          {isSuccess ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Bukti Pembayaran Terkirim
                </h3>
                <p className="mt-1 text-xs text-slate-600">
                  Akun Anda sedang dalam antrean verifikasi admin.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">ID Pesanan:</span>
                  <span className="font-mono text-slate-800">{currentOrder?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Produk:</span>
                  <span className="font-semibold text-slate-800">{currentOrder?.productName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-amber-600">Menunggu Approval</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => navigate('/cek-status')}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
                >
                  Cek Status Pesanan
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Kembali ke Beranda
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* If no order identified, allow email lookup */}
              {!currentOrder && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Cari Pesanan Berdasarkan Email
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              )}

              {currentOrder && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pemesan:</span>
                    <span className="font-semibold text-slate-900">{currentOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="font-mono text-slate-800">{currentOrder.customerEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Produk:</span>
                    <span className="font-medium text-slate-800 truncate pl-2">
                      {currentOrder.productName}
                    </span>
                  </div>
                </div>
              )}

              {/* Upload Dropzone */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Foto Bukti Transfer
                </label>
                <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-5 text-center transition-colors bg-slate-50/50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="proof-file"
                  />
                  {previewUrl ? (
                    <div className="space-y-2">
                      <img
                        src={previewUrl}
                        alt="Preview Bukti"
                        className="max-h-40 mx-auto rounded-lg object-contain border border-slate-200"
                      />
                      <span className="text-[11px] text-slate-500 font-mono">
                        {currentOrder ? `${currentOrder.customerEmail}_bukti_bayar.jpg` : 'bukti.jpg'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1.5 py-3">
                      <FileImage className="w-8 h-8 text-slate-400" />
                      <span className="text-xs font-medium text-slate-700">
                        Klik atau seret foto bukti di sini
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">JPG, PNG, WEBP</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!currentOrder || isSubmitting}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
