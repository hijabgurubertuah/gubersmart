import React from 'react';
import { Database, HardDrive, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface QuotaMetric {
  current: number;
  limit: number;
  label: string;
  unit?: string;
}

export const AdminFirebaseQuota: React.FC = () => {
  const quotas: Record<string, QuotaMetric> = {
    reads: { current: 3820, limit: 50000, label: 'Operasi Baca (Harian)' },
    writes: { current: 1240, limit: 20000, label: 'Operasi Tulis (Harian)' },
    deletes: { current: 154, limit: 20000, label: 'Operasi Hapus (Harian)' },
    storage: { current: 194, limit: 1024, label: 'Kapasitas Penyimpanan', unit: 'MB' },
    bandwidth: { current: 1.62, limit: 10.0, label: 'Transfer Jaringan', unit: 'GB' },
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-heading text-[#0B2A5B] dark:text-white">
          Penggunaan Firebase
        </h2>
        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Paket Spark (Gratis)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(quotas).map(([key, item]) => {
          const percent = Math.min(Math.round((item.current / item.limit) * 100), 100);

          return (
            <div
              key={key}
              className="p-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{item.label}</span>
                <span className="text-xs font-bold text-[#1E4FA8] font-mono">{percent}%</span>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                  {item.current.toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-slate-400">
                  / {item.limit.toLocaleString('id-ID')} {item.unit || ''}
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    percent > 80 ? 'bg-rose-500' : percent > 50 ? 'bg-amber-500' : 'bg-[#1E4FA8]'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
