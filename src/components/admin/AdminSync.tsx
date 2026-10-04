import React, { useState, useEffect } from 'react';
import { CMSSettings } from '../../types';
import { APPS_SCRIPT_CODE } from '../../services/appsScript';
import { Copy, Check, Wifi, AlertCircle, Loader2, FolderCheck, ExternalLink, Sparkles, Folder } from 'lucide-react';

interface AdminSyncProps {
  cms: CMSSettings;
  onUpdateSync: (sync: CMSSettings['sync']) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminSync: React.FC<AdminSyncProps> = ({ cms, onUpdateSync, onToast }) => {
  const [webAppUrl, setWebAppUrl] = useState(cms.sync.webAppUrl || '');
  const [driveFolderId, setDriveFolderId] = useState(cms.sync.driveFolderId || '');

  const [copied, setCopied] = useState(false);
  const [copiedFolderId, setCopiedFolderId] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connected' | 'failed'>('idle');

  useEffect(() => {
    if (cms.sync.driveFolderId) {
      setDriveFolderId(cms.sync.driveFolderId);
    }
  }, [cms.sync.driveFolderId]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    onToast('Kode Apps Script berhasil disalin');
    setTimeout(() => setCopied(false), 500);
  };

  const handleCopyFolderId = () => {
    if (driveFolderId) {
      navigator.clipboard.writeText(driveFolderId);
      setCopiedFolderId(true);
      onToast('ID Folder berhasil disalin');
      setTimeout(() => setCopiedFolderId(false), 500);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSync({ webAppUrl, driveFolderId, token: '' });
    onToast('Pengaturan sinkronisasi disimpan ke Firebase');
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
          driveFolderId: driveFolderId || '',
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
        if (resData.folderId) {
          setDriveFolderId(resData.folderId);
          onUpdateSync({ webAppUrl, driveFolderId: resData.folderId, token: '' });
          onToast(`Koneksi Berhasil! Folder Drive otomatis terhubung: ${resData.folderName || 'Guber Smart Uploads'}`, 'success');
        } else {
          onToast('Koneksi ke Google Apps Script & Drive Berhasil!', 'success');
        }
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
          <h2 className="text-xl font-bold font-heading text-[#0B2A5B] dark:text-white flex items-center gap-2">
            Sinkronisasi Google Drive Otomatis
            <span className="text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800/60">
              Auto-Folder
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Folder Google Drive akan dibuat otomatis oleh skrip. ID folder otomatis diambil, ditampilkan di aplikasi, dan disimpan ke Firebase!
          </p>
        </div>
      </div>

      {/* Troubleshooting Card for Exception: Akses ditolak: DriveApp */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-[14px] flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed space-y-2">
          <p className="font-bold text-sm text-amber-900 dark:text-amber-300">
            Panduan Deploy Google Apps Script:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 pl-1">
            <li>
              <strong>Buka script.google.com</strong> &gt; buat project baru &gt; tempel kode di bawah &gt; Simpan.
            </li>
            <li>
              <strong>Beri Otorisasi Sekali:</strong> Pada pilihan fungsi di samping tombol Run, pilih <code>initPermissions</code> lalu klik <strong>Run (Jalankan)</strong> &gt; <em>Review Permissions &gt; Advanced &gt; Go to ... (unsafe) &gt; Allow</em>.
            </li>
            <li>
              <strong>Deploy:</strong> Klik <em>Deploy &gt; New deployment &gt; Pilih jenis Web App</em>:
              <ul className="list-disc list-inside pl-4 mt-0.5 text-slate-700 dark:text-slate-300">
                <li><strong>Execute as (Jalankan sebagai):</strong> Pilih <strong>"Me" (Saya / email Anda)</strong>.</li>
                <li><strong>Who has access (Akses):</strong> Pilih <strong>"Anyone" (Siapa saja)</strong>.</li>
              </ul>
            </li>
            <li>
              Salin URL Web App yang muncul (berakhiran <code>/exec</code>) ke formulir di bawah ini!
            </li>
          </ol>
        </div>
      </div>

      {/* Code Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span>Kode Google Apps Script</span>
            <span className="text-[11px] font-normal text-slate-500">
              (Auto Folder & Auto Permission)
            </span>
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
          <pre className="text-xs font-mono text-slate-200 overflow-x-auto max-h-60 leading-relaxed">
            {APPS_SCRIPT_CODE}
          </pre>
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-[14px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
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

        {/* Auto Folder Status Card */}
        <div className="p-4 rounded-[14px] border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Folder className="w-4 h-4 text-[#FF7A1A]" />
              Folder Google Drive (Otomatis)
            </span>
            {driveFolderId ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <FolderCheck className="w-3.5 h-3.5" />
                Folder Aktif & Tersimpan di Firebase
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                Akan Dibuat Otomatis
              </span>
            )}
          </div>

          {driveFolderId ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[10px]">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-400">ID Folder Google Drive:</p>
                  <p className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200 truncate">
                    {driveFolderId}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyFolderId}
                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Salin ID Folder"
                  >
                    {copiedFolderId ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a
                    href={`https://drive.google.com/drive/folders/${driveFolderId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-7 px-2.5 text-xs font-medium text-white bg-[#0B2A5B] hover:bg-[#1E4FA8] rounded-[6px] flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Buka Folder
                  </a>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Nama folder di Drive Anda: <strong>Guber Smart Uploads</strong>. Semua gambar dan berkas yang Anda unggah otomatis masuk ke folder ini.
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Anda tidak perlu membuat atau mencari ID folder sendiri. Begitu Anda mengklik tombol <strong>Uji Koneksi</strong> di bawah atau mengunggah gambar pertama kali, skrip akan <strong>otomatis membuat folder "Guber Smart Uploads"</strong> di Drive Anda, mengambil ID-nya, menampilkannya di sini, dan menyimpannya ke Firebase Firestore!
            </p>
          )}
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
              Uji Koneksi & Buat Folder
            </button>

            {connectionStatus === 'connected' && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Terhubung & Siap
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

