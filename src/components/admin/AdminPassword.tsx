import React, { useState } from 'react';
import { Role } from '../../types';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

interface AdminPasswordProps {
  role: Role;
  onChangeOwnPassword: (currentPass: string, newPass: string) => { success: boolean; message?: string };
  onUpdateRolePassword?: (targetRole: 'Admin' | 'Superadmin', newPass: string) => boolean;
  onToast: (msg: string) => void;
}

export const AdminPassword: React.FC<AdminPasswordProps> = ({
  role,
  onChangeOwnPassword,
  onUpdateRolePassword,
  onToast,
}) => {
  // Own password state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [errorOwn, setErrorOwn] = useState<string | null>(null);

  // Superadmin managing other roles
  const [targetRole, setTargetRole] = useState<'Admin' | 'Superadmin'>('Admin');
  const [roleNewPass, setRoleNewPass] = useState('');
  const [errorRole, setErrorRole] = useState<string | null>(null);

  const handleSaveOwn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass || !confirmPass) {
      setErrorOwn('Semua kolom wajib diisi');
      return;
    }
    if (newPass.length < 8) {
      setErrorOwn('Kata sandi baru minimal 8 karakter');
      return;
    }
    if (newPass !== confirmPass) {
      setErrorOwn('Konfirmasi kata sandi tidak cocok');
      return;
    }

    const res = onChangeOwnPassword(currentPass, newPass);
    if (res.success) {
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setErrorOwn(null);
      onToast('Kata sandi Anda berhasil diperbarui');
    } else {
      setErrorOwn(res.message || 'Gagal mengubah kata sandi');
    }
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleNewPass) {
      setErrorRole('Kata sandi baru wajib diisi');
      return;
    }
    if (roleNewPass.length < 8) {
      setErrorRole('Kata sandi baru minimal 8 karakter');
      return;
    }

    if (onUpdateRolePassword) {
      const ok = onUpdateRolePassword(targetRole, roleNewPass);
      if (ok) {
        setRoleNewPass('');
        setErrorRole(null);
        onToast(`Kata sandi peran ${targetRole} berhasil diperbarui`);
      } else {
        setErrorRole('Gagal memperbarui kata sandi peran');
      }
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <h2 className="text-xl font-bold font-heading text-[#0B2A5B] dark:text-white">
        Kelola Kata Sandi
      </h2>

      {/* Own password update */}
      <div className="bg-white dark:bg-slate-900 rounded-[14px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">
          Ubah Kata Sandi Saya
        </h3>

        <form onSubmit={handleSaveOwn} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Kata Sandi Saat Ini *
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPass}
                onChange={(e) => {
                  setCurrentPass(e.target.value);
                  if (errorOwn) setErrorOwn(null);
                }}
                className="w-full h-11 px-3.5 pr-11 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 rounded-[14px]"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400"
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
                  if (errorOwn) setErrorOwn(null);
                }}
                className="w-full h-11 px-3.5 pr-11 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 rounded-[14px]"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400"
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
                if (errorOwn) setErrorOwn(null);
              }}
              className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 rounded-[14px]"
            />
          </div>

          {errorOwn && <p className="text-xs font-medium text-rose-600">{errorOwn}</p>}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="min-h-[44px] px-6 text-sm font-semibold text-white bg-[#0B2A5B] hover:bg-[#1E4FA8] rounded-[12px] shadow-xs"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>

      {/* Superadmin ability to update passwords for other roles */}
      {role === 'Superadmin' && onUpdateRolePassword && (
        <div className="bg-white dark:bg-slate-900 rounded-[14px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">
            Atur Kata Sandi Peran
          </h3>

          <form onSubmit={handleSaveRole} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Peran *
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as any)}
                className="w-full h-11 px-3 text-sm bg-slate-50 border rounded-[14px]"
              >
                <option value="Admin">Admin</option>
                <option value="Superadmin">Superadmin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Kata Sandi Baru *
              </label>
              <input
                type="text"
                value={roleNewPass}
                onChange={(e) => {
                  setRoleNewPass(e.target.value);
                  if (errorRole) setErrorRole(null);
                }}
                className="w-full h-11 px-3.5 text-sm font-mono bg-slate-50 border rounded-[14px]"
              />
            </div>

            {errorRole && <p className="text-xs font-medium text-rose-600">{errorRole}</p>}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="min-h-[44px] px-6 text-sm font-semibold text-white bg-[#FF7A1A] hover:bg-[#E56A10] rounded-[12px] shadow-xs"
              >
                Perbarui
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
