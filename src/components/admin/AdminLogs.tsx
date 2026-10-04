import React, { useState } from 'react';
import { ActivityLog, Role } from '../../types';
import { formatDate } from '../../utils/crypto';
import { Clock, Filter, Search } from 'lucide-react';

interface AdminLogsProps {
  logs: ActivityLog[];
}

export const AdminLogs: React.FC<AdminLogsProps> = ({ logs }) => {
  const [roleFilter, setRoleFilter] = useState<string>('semua');
  const [search, setSearch] = useState('');

  const filtered = logs.filter((log) => {
    if (roleFilter !== 'semua' && log.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return log.action.toLowerCase().includes(q) || (log.details && log.details.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold font-heading text-[#0B2A5B] dark:text-white">
          Riwayat Aktivitas
        </h2>

        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 px-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[12px]"
          >
            <option value="semua">Semua Peran</option>
            <option value="Superadmin">Superadmin</option>
            <option value="Admin">Admin</option>
            <option value="Member">Member</option>
          </select>

          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[12px]"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[14px] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            Belum ada data
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((log) => (
              <div key={log.id} className="p-4 flex items-start gap-3">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                      {log.action}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatDate(log.timestamp)}
                    </span>
                  </div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                      log.role === 'Superadmin'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        : log.role === 'Admin'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {log.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
