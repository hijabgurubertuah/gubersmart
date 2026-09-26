import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Lock, Mail, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { Tooltip } from '../../components/ui/Tooltip';

interface LoginPageProps {
  isAdmin?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ isAdmin = false }) => {
  const { loginAsMember, loginAsAdmin, navigate } = useApp();
  const [isModeAdmin, setIsModeAdmin] = useState(isAdmin);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Email wajib diisi');
      return;
    }

    if (isModeAdmin) {
      const res = loginAsAdmin(email, password);
      if (res.success) {
        navigate('/admin/dashboard');
      } else {
        setErrorMessage(res.message || 'Kredensial admin salah.');
      }
    } else {
      const res = loginAsMember(email, password);
      if (res.success) {
        navigate('/member');
      } else {
        setErrorMessage(res.message || 'Login gagal.');
      }
    }
  };

  const handleQuickMemberDemo = () => {
    setEmail('member@gubersmart.my.id');
    setPassword('member123');
    loginAsMember('member@gubersmart.my.id');
    navigate('/member');
  };

  const handleQuickAdminDemo = () => {
    setEmail('admin@gubersmart.my.id');
    setPassword('admin123');
    loginAsAdmin('admin@gubersmart.my.id', 'admin123');
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-md w-full">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl mb-6">
            <button
              onClick={() => {
                setIsModeAdmin(false);
                setErrorMessage('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                !isModeAdmin
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Login Member
            </button>
            <button
              onClick={() => {
                setIsModeAdmin(true);
                setErrorMessage('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                isModeAdmin
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Login Admin
            </button>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-slate-900">
              {isModeAdmin ? 'Masuk Panel Admin' : 'Masuk Member Area'}
            </h1>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-1">
              <span>{isModeAdmin ? 'Pengelola GuberSmart' : 'Akses Materi Pembelajaran'}</span>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email Terdaftar
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password akun Anda"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Masuk</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Demo Access Switchers */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
            <div className="text-[11px] text-slate-400 text-center font-mono">Demo Cepat:</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleQuickMemberDemo}
                className="py-1.5 px-2 text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer truncate"
              >
                Demo Member
              </button>
              <button
                onClick={handleQuickAdminDemo}
                className="py-1.5 px-2 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer truncate"
              >
                Demo Admin
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/cek-status')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
            >
              Belum aktif? Cek Status Pesanan
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
