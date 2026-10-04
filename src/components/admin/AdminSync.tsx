import React, { useState } from 'react';
import { CMSSettings } from '../../types';
import { APPS_SCRIPT_CODE } from '../../services/appsScript';
import { Copy, Check, Wifi, AlertCircle, Loader2 } from 'lucide-react';

interface AdminSyncProps {
  cms: CMSSettings;
  onUpdateSync: (sync: CMSSettings['sync']) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminSync: React.FC<AdminSyncProps> = ({ cms, onUpdateSync, onToast }) => {
  const [webAppUrl, setWebAppUrl] = useState(cms.sync.webAppUrl || '');
  const [driveFolderId, setDriveFolderId] = useState(cms.sync.driveFolderId || '');

  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connected' | 'failed'>('idle');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    onToast('Kode berhasil disalin');
    setTimeout(() => setCopied(false), 500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSync({ webAppUrl, driveFolderId, token: '' });
    onToast('Pengaturan sinkronisasi disimpan');
  };

  const handleTestConnection = async () => {
    if (!webAppUrl || webAppUrl.trim().length < 10) {
      setConnectionStatus('failed');
      onToast('Masukkan URL Web App terlebih dahulu', 'error');
      return;
    }

    setIsTesting(true);
    setConnectionStatus('idle');

    try {
      const response = await fetch(webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'ping',
        }),
      });

      const resText = await response.text();
      let resData: any = {};
      try {
        resData = JSON.parse(resText);
      } catch {
        resData = { status: 'error', message: resText };
      }

      if (resData.status === 'success') {
        setConnectionStatus('connected');
        onToast('Koneksi ke Google Apps Script & Drive Berhasil!', 'success');
      } else {
        setConnectionStatus('failed');
        onToast(resData.message || 'Apps Script bermasalah', 'error');
      }
    } catch (err: any) {
      setConnectionStatus('failed');
      onToast('Gagal menghubungi Apps Script: ' + (err.message || 'Periksa URL Web App'), 'error');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-heading text-[#0B2A5B] dark:text-white">
            Sinkronisasi Google Drive
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cukup salin kode di bawah ke Apps Script dan tempel URL Web App. Tanpa token atau kata sandi!
          </p>
        </div>
      </div>

      {/* Troubleshooting Card for Exception: Akses ditolak: DriveApp */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-[14px] flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed space-y-2">
          <p className="font-bold text-sm text-amber-900 dark:text-amber-300">
            Muncul Error: "Exception: Akses ditolak: DriveApp."? Ini Solusinya:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 pl-1">
            <li>
              <strong>Penyebab 1: Pengaturan Deploy salah.</strong> Buka menu <em>Deploy &gt; Manage deployments &gt; Edit (ikon pensil)</em>:
              <ul className="list-disc list-inside pl-4 mt-0.5 text-slate-700 dark:text-slate-300">
                <li><strong>Execute as (Jalankan sebagai):</strong> Wajib pilih <strong>"Me" (Saya / email Anda)</strong>. <span className="text-rose-600 font-semibold">(Jangan pilih "User accessing")</span>.</li>
                <li><strong>Who has access (Akses):</strong> Wajib pilih <strong>"Anyone" (Siapa saja)</strong>.</li>
              </ul>
            </li>
            <li>
              <strong>Penyebab 2: Belum memberikan izin otorisasi Google Drive.</strong> Di editor Google Script:
              <ul className="list-disc list-inside pl-4 mt-0.5 text-slate-700 dark:text-slate-300">
                <li>Pilih fungsi <code>initPermissions</code> pada dropdown fungsi di samping tombol Run.</li>
                <li>Klik tombol <strong>Run (Jalankan)</strong>.</li>
                <li>Klik <strong>Review Permissions</strong> &gt; Pilih Akun Google &gt; Klik <strong>Advanced (Lanjutan)</strong> &gt; Klik <strong>Go to ... (unsafe)</strong> &gt; Klik <strong>Allow (Izinkan)</strong>.</li>
              </ul>
            </li>
            <li>
              <strong>Setelah itu buat versi baru:</strong> Klik <em>Deploy &gt; Manage deployments &gt; Edit &gt; Version: New version &gt; Deploy</em>. Salin URL Web App barunya ke bawah ini.
            </li>
          </ol>
        </div>
      </div>

      {/* Code Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Kode Google Apps Script (Tanpa Token)
          </label>
          <button
            type="button"
            onClick={handleCopyCode}
            className="h-8 px-3 text-xs font-semibold text-white bg-[#0B2A5B] hover:bg-[#1E4FA8] rounded-[8px] flex items-center gap-1.5 transition-colors shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Tersalin' : 'Salin Kode'}
          </button>
        </div>
        <div className="relative rounded-[14px] bg-slate-900 border border-slate-800 p-4 overflow-hidden shadow-inner">
          <pre className="text-xs font-mono text-slate-200 overflow-x-auto max-h-56 leading-relaxed">
            {APPS_SCRIPT_CODE}
          </pre>
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-[14px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            URL Web App (dari Deployment Apps Script)
          </label>
          <input
            type="url"
            placeholder="https://script.google.com/macros/s/.../exec"
            value={webAppUrl}
            onChange={(e) => setWebAppUrl(e.target.value)}
            required
            className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px] text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            ID Folder Google Drive (Opsional)
          </label>
          <input
            type="text"
            placeholder="Kosongkan jika ingin disimpan di folder utama Drive (Root)"
            value={driveFolderId}
            onChange={(e) => setDriveFolderId(e.target.value)}
            className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px] text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Jika dikosongkan, gambar akan otomatis diletakkan di direktori utama Google Drive Anda.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isTesting}
              onClick={handleTestConnection}
              className="h-10 px-4 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-[12px] flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
              Uji Koneksi
            </button>

            {connectionStatus === 'connected' && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Terhubung
              </span>
            )}

            {connectionStatus === 'failed' && (
              <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Gagal
              </span>
            )}
          </div>

          <button
            type="submit"
            className="min-h-[44px] px-6 text-sm font-semibold text-white bg-[#0B2A5B] hover:bg-[#1E4FA8] active:scale-[0.98] rounded-[12px] shadow-xs transition-all"
          >
            Simpan Konfigurasi
          </button>
        </div>
      </form>
    </div>
  );
};

