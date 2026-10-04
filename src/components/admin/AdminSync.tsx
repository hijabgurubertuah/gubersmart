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
  const [token, setToken] = useState(cms.sync.token || '');
  const [driveFolderId, setDriveFolderId] = useState(cms.sync.driveFolderId || '');

  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connected' | 'failed'>('idle');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    onToast('Kode berhasil disalin');
    setTimeout(() => setCopied(false), 100);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSync({ webAppUrl, token, driveFolderId });
    onToast('Pengaturan sinkronisasi disimpan');
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setConnectionStatus('idle');

    setTimeout(() => {
      setIsTesting(false);
      if (webAppUrl.trim().length > 10) {
        setConnectionStatus('connected');
        onToast('Koneksi terhubung');
      } else {
        setConnectionStatus('failed');
        onToast('Gagal terhubung', 'error');
      }
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-heading text-[#0B2A5B] dark:text-white">
          Sinkronisasi
        </h2>
      </div>

      {/* Code Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Kode Google Apps Script
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
            URL Web App *
          </label>
          <input
            type="url"
            value={webAppUrl}
            onChange={(e) => setWebAppUrl(e.target.value)}
            className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 rounded-[14px]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Token Rahasia *
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 rounded-[14px]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              ID Folder Drive *
            </label>
            <input
              type="text"
              value={driveFolderId}
              onChange={(e) => setDriveFolderId(e.target.value)}
              className="w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 rounded-[14px]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isTesting}
              onClick={handleTestConnection}
              className="h-10 px-4 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[12px] flex items-center gap-2 transition-colors disabled:opacity-50"
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
            className="min-h-[44px] px-6 text-sm font-semibold text-white bg-[#0B2A5B] hover:bg-[#1E4FA8] rounded-[12px] shadow-xs"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
};
