import React, { useState } from 'react';
import { Member, Course } from '../../types';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

interface ProfilePageProps {
  member: Member;
  courses: Course[];
  onChangePassword: (currentPass: string, newPass: string) => { success: boolean; message?: string };
  onToast: (msg: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  member,
  courses,
  onChangePassword,
  onToast,
}) => {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const ownedCourseList = courses.filter((c) => member.ownedCourses.includes(c.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass || !confirmPass) {
      setError('Semua kolom wajib diisi');
      return;
    }
    if (newPass.length < 6) {
      setError('Kata sandi baru minimal 6 karakter');
      return;
    }
    if (newPass !== confirmPass) {
      setError('Konfirmasi kata sandi tidak cocok');
      return;
    }

    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = onChangePassword(currentPass, newPass);
      setIsLoading(false);
      if (res.success) {
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
        onToast('Kata sandi berhasil diperbarui');
      } else {
        setError(res.message || 'Gagal mengubah kata sandi');
      }
    }, 250);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#0B2A5B] dark:text-white">
          Profil Member
        </h1>
      </div>

      {/* Member Details */}
      <div className="bg-white dark:bg-slate-900 rounded-[14px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-lg font-bold font-heading text-[#0B2A5B] dark:text-white">
          Data Akun
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs text-slate-400 block mb-1">Nama</span>
            <span className="font-semibold text-slate-900 dark:text-white">{member.name}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block mb-1">Nomor WhatsApp</span>
            <span className="font-semibold text-slate-900 dark:text-white">{member.whatsapp}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-400 block mb-2">Kelas yang Dimiliki</span>
          <div className="flex flex-wrap gap-2">
            {ownedCourseList.map((c) => (
              <span
                key={c.id}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950 text-[#1E4FA8] dark:text-blue-300"
              >
                {c.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="bg-white dark:bg-slate-900 rounded-[14px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#1E4FA8]" />
          <h2 className="text-lg font-bold font-heading text-[#0B2A5B] dark:text-white">
            Ubah Kata Sandi
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Kata Sandi Lama *
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPass}
                onChange={(e) => {
                  setCurrentPass(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full h-11 px-3.5 pr-11 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                aria-label="Toggle password"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Kata Sandi Baru *
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPass}
                onChange={(e) => {
                  setNewPass(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full h-11 px-3.5 pr-11 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                aria-label="Toggle password"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Ulangi Kata Sandi Baru *
            </label>
            <input
              type="password"
              value={confirmPass}
              onChange={(e) => {
                setConfirmPass(e.target.value);
                if (error) setError(null);
              }}
              className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40"
            />
          </div>

          {error && <p className="text-xs font-medium text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="min-h-[44px] px-6 text-sm font-semibold text-white bg-[#0B2A5B] hover:bg-[#1E4FA8] rounded-[14px] flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Perbarui Kata Sandi'}
          </button>
        </form>
      </div>
    </div>
  );
};
