import React, { useState } from 'react';
import { Download, Upload, Check, AlertCircle } from 'lucide-react';

interface AdminBackupProps {
  onExport: () => string;
  onImport: (jsonStr: string) => boolean;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminBackup: React.FC<AdminBackupProps> = ({ onExport, onImport, onToast }) => {
  const [jsonInput, setJsonInput] = useState('');

  const handleDownload = () => {
    const json = onExport();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_gubersmart_${new Date().toISOString().substring(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    onToast('Cadangan data berhasil diunduh');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonInput(content);
    };
    reader.readAsText(file);
  };

  const handleRestore = () => {
    if (!jsonInput.trim()) {
      onToast('Data JSON belum dimasukkan', 'error');
      return;
    }
    const success = onImport(jsonInput);
    if (success) {
      setJsonInput('');
      onToast('Data berhasil dipulihkan');
    } else {
      onToast('Format file cadangan tidak valid', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-heading text-[#0B2A5B] dark:text-white">
          Cadangan & Pemulihan Data
        </h2>
      </div>

      {/* Export Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[14px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">
          Unduh Cadangan
        </h3>
        <button
          onClick={handleDownload}
          className="min-h-[44px] px-5 text-sm font-semibold text-white bg-[#0B2A5B] hover:bg-[#1E4FA8] rounded-[12px] flex items-center gap-2 shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          Unduh Cadangan JSON
        </button>
      </div>

      {/* Import Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[14px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">
            Pulihkan Data
          </h3>
          <label className="h-9 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[8px] flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            Pilih File JSON
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        <textarea
          rows={6}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="Tempel teks JSON di sini..."
          className="w-full p-3.5 font-mono text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-[14px] text-slate-900 dark:text-white resize-none"
        />

        <div className="flex justify-end">
          <button
            onClick={handleRestore}
            className="min-h-[44px] px-6 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-[12px] flex items-center gap-2 shadow-xs transition-colors"
          >
            Pulihkan Data
          </button>
        </div>
      </div>
    </div>
  );
};
