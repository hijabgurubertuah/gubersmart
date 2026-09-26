import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import {
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  CheckCircle,
  LogIn,
  Search,
  Clock,
  XCircle,
} from 'lucide-react';
import { Tooltip } from '../../components/ui/Tooltip';

interface LandingPageProps {
  product: Product;
}

export const LandingPage: React.FC<LandingPageProps> = ({ product }) => {
  const { createOrder, loginAsMember, orders, navigate } = useApp();

  const [activeTab, setActiveTab] = useState<'register' | 'login' | 'status'>('register');

  // Registration Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    whatsapp: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Status Lookup State
  const [statusEmail, setStatusEmail] = useState('');
  const [statusResult, setStatusResult] = useState<any[] | null>(null);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const validateRegistration = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Nama lengkap wajib diisi';
    if (!formData.email.trim() || !formData.email.includes('@'))
      errs.email = 'Format email belum valid';
    if (!formData.password || formData.password.length < 6)
      errs.password = 'Password minimal 6 karakter';
    if (!formData.whatsapp.trim() || formData.whatsapp.length < 9)
      errs.whatsapp = 'Nomor WhatsApp belum valid';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegistration()) return;

    const order = createOrder({
      productId: product.id,
      customerName: formData.name,
      customerEmail: formData.email,
      customerWhatsapp: formData.whatsapp,
    });

    setCreatedOrder(order);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim()) {
      setLoginError('Email wajib diisi');
      return;
    }

    const res = loginAsMember(loginEmail, loginPassword);
    if (res.success) {
      navigate(`/member/${product.slug}`);
    } else {
      setLoginError(res.message || 'Login gagal.');
    }
  };

  const handleStatusCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = statusEmail.trim().toLowerCase();
    const matches = orders.filter(
      (o) =>
        o.customerEmail.toLowerCase() === cleanEmail &&
        o.productId === product.id
    );
    setStatusResult(matches);
  };

  const proceedToLynkId = () => {
    if (product.lynkIdUrl) {
      window.open(product.lynkIdUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Product Information */}
            <div className="lg:col-span-6 space-y-6">
              {/* Product Cover Preview */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-900 aspect-video">
                <img
                  src={product.coverUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-md">
                  {product.category}
                </div>
              </div>

              {/* Product Details */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
                  <span>{product.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>Akses Member Area</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {product.name}
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {product.shortDescription}
                </p>

                <div className="pt-4 border-t border-slate-100 flex items-baseline justify-between gap-2">
                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-slate-400">
                      Biaya Akses
                    </span>
                    <span className="text-2xl font-extrabold text-slate-900 font-mono-tabular">
                      {formatIDR(product.price)}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Sekali bayar</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Portal Box (Pendaftaran, Login Member, Cek Status) */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                {/* Segmented Control Switcher */}
                <div className="flex items-center p-1 bg-slate-100 rounded-xl mb-6">
                  <button
                    onClick={() => {
                      setActiveTab('register');
                      setLoginError('');
                    }}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'register'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Daftar Baru
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('login');
                      setLoginError('');
                    }}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'login'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Login Member
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('status');
                      setStatusResult(null);
                    }}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'status'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Cek Status
                  </button>
                </div>

                {/* TAB 1: FORMULIR PENDAFTARAN */}
                {activeTab === 'register' && (
                  <div>
                    {!createdOrder ? (
                      <form onSubmit={handleRegisterSubmit} className="space-y-4">
                        <div className="text-center mb-2">
                          <h2 className="text-base font-bold text-slate-900">
                            Formulir Pendaftaran
                          </h2>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Isi data diri untuk membuat akun member
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Nama Lengkap
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="Budi Santoso"
                              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                            />
                          </div>
                          {errors.name && (
                            <p className="mt-1 text-[11px] text-rose-600">{errors.name}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Email (Username Login)
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="nama@email.com"
                              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                            />
                          </div>
                          {errors.email && (
                            <p className="mt-1 text-[11px] text-rose-600">{errors.email}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Password Akun
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="password"
                              value={formData.password}
                              onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                              }
                              placeholder="Minimal 6 karakter"
                              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                            />
                          </div>
                          {errors.password && (
                            <p className="mt-1 text-[11px] text-rose-600">{errors.password}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Nomor WhatsApp
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="tel"
                              value={formData.whatsapp}
                              onChange={(e) =>
                                setFormData({ ...formData, whatsapp: e.target.value })
                              }
                              placeholder="081234567890"
                              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                            />
                          </div>
                          {errors.whatsapp && (
                            <p className="mt-1 text-[11px] text-rose-600">{errors.whatsapp}</p>
                          )}
                        </div>

                        <div className="pt-2">
                          <button
                            type="submit"
                            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                          >
                            <span>Daftar & Lanjut Bayar</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4 text-center py-2">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle className="w-5 h-5" />
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            Pendaftaran Berhasil Dicatat
                          </h3>
                          <div className="text-xs text-slate-500 font-mono-tabular mt-0.5">
                            ID: {createdOrder.id}
                          </div>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Email:</span>
                            <span className="font-semibold text-slate-900">
                              {createdOrder.customerEmail}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Total:</span>
                            <span className="font-bold text-indigo-600 font-mono-tabular">
                              {formatIDR(createdOrder.productPrice)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 pt-1">
                          <button
                            onClick={proceedToLynkId}
                            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Bayar di Lynk.id</span>
                          </button>

                          <button
                            onClick={() =>
                              navigate(
                                `/daftar/${product.slug}/bukti-bayar?orderId=${createdOrder.id}&email=${encodeURIComponent(
                                  createdOrder.customerEmail
                                )}`
                              )
                            }
                            className="w-full py-2.5 px-4 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Upload Bukti Transfer</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: LOGIN MEMBER */}
                {activeTab === 'login' && (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="text-center mb-2">
                      <h2 className="text-base font-bold text-slate-900">Login Member Area</h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Masuk untuk membuka materi video dan berkas unduhan
                      </p>
                    </div>

                    {loginError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                        {loginError}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Email Member
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="nama@email.com"
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Password akun Anda"
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Buka Member Area</span>
                      </button>
                    </div>

                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginEmail('member@gubersmart.my.id');
                          setLoginPassword('member123');
                          loginAsMember('member@gubersmart.my.id');
                          navigate(`/member/${product.slug}`);
                        }}
                        className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
                      >
                        (Gunakan Akun Demo Member)
                      </button>
                    </div>
                  </form>
                )}

                {/* TAB 3: CEK STATUS PESANAN */}
                {activeTab === 'status' && (
                  <div className="space-y-4">
                    <div className="text-center mb-2">
                      <h2 className="text-base font-bold text-slate-900">Cek Status Pesanan</h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Periksa status verifikasi bukti transfer Anda
                      </p>
                    </div>

                    <form onSubmit={handleStatusCheck} className="flex gap-2">
                      <input
                        type="email"
                        value={statusEmail}
                        onChange={(e) => setStatusEmail(e.target.value)}
                        placeholder="nama@email.com"
                        required
                        className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Cari</span>
                      </button>
                    </form>

                    {statusResult !== null && (
                      <div className="space-y-2 pt-2">
                        {statusResult.length === 0 ? (
                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                            Tidak ditemukan pesanan untuk produk ini dengan email tersebut.
                          </div>
                        ) : (
                          statusResult.map((order) => (
                            <div
                              key={order.id}
                              className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[11px] text-slate-500">
                                  {order.id}
                                </span>
                                {order.status === 'Disetujui' ? (
                                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    Disetujui (Aktif)
                                  </span>
                                ) : order.status === 'Menunggu Approval' ? (
                                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                    Menunggu Approval
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                                    Menunggu Pembayaran
                                  </span>
                                )}
                              </div>

                              <div className="pt-2 border-t border-slate-200/60 flex justify-end">
                                {order.status === 'Disetujui' ? (
                                  <button
                                    onClick={() => {
                                      loginAsMember(order.customerEmail);
                                      navigate(`/member/${product.slug}`);
                                    }}
                                    className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                                  >
                                    Masuk Member Area
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      navigate(
                                        `/daftar/${product.slug}/bukti-bayar?orderId=${order.id}&email=${encodeURIComponent(
                                          order.customerEmail
                                        )}`
                                      )
                                    }
                                    className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
                                  >
                                    Upload Bukti Transfer
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
