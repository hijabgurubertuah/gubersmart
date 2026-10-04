import React from 'react';
import { Course, Member, ContactMessage, ActivityLog, Role } from '../../types';
import { formatDate } from '../../utils/crypto';
import {
  Users,
  BookOpen,
  Award,
  MessageCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface AdminDashboardProps {
  role: Role;
  courses: Course[];
  members: Member[];
  contacts: ContactMessage[];
  logs: ActivityLog[];
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  role,
  courses,
  members,
  contacts,
  logs,
  onNavigateTab,
}) => {
  const activeMembersCount = members.filter((m) => m.status === 'aktif').length;
  const unreadMessagesCount = contacts.filter((c) => !c.isRead).length;

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-[14px] p-5 border border-slate-100 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Member</span>
            <Users className="w-4 h-4 text-[#1E4FA8]" />
          </div>
          <div className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
            {members.length}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {activeMembersCount} Aktif
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[14px] p-5 border border-slate-100 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Kelas</span>
            <BookOpen className="w-4 h-4 text-[#1E4FA8]" />
          </div>
          <div className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
            {courses.length}
          </div>
          <div className="text-xs text-slate-500">
            {courses.filter((c) => c.status === 'tampil').length} Ditampilkan
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[14px] p-5 border border-slate-100 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Pesan Masuk</span>
            <MessageCircle className="w-4 h-4 text-[#FF7A1A]" />
          </div>
          <div className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
            {contacts.length}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            {unreadMessagesCount} Belum Dibaca
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[14px] p-5 border border-slate-100 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Peran Anda</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-heading text-[#0B2A5B] dark:text-white">
            {role}
          </div>
          <div className="text-xs text-slate-500">
            Akses Penuh
          </div>
        </div>
      </div>

      {/* 2-Columns: Recent Messages & Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Contact Messages */}
        <div className="bg-white dark:bg-slate-900 rounded-[14px] p-6 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-heading text-[#0B2A5B] dark:text-white">
              Pesan Kontak Masuk
            </h3>
            <button
              onClick={() => onNavigateTab('contacts')}
              className="text-xs font-semibold text-[#1E4FA8] dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Lihat Semua
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {contacts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Belum ada data
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.slice(0, 3).map((msg) => (
                <div
                  key={msg.id}
                  className="p-3.5 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {msg.name} ({msg.whatsapp})
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Logs */}
        <div className="bg-white dark:bg-slate-900 rounded-[14px] p-6 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-heading text-[#0B2A5B] dark:text-white">
              Aktivitas Terbaru
            </h3>
            <button
              onClick={() => onNavigateTab('logs')}
              className="text-xs font-semibold text-[#1E4FA8] dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Lihat Semua
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Belum ada data
            </div>
          ) : (
            <div className="space-y-2.5">
              {logs.slice(0, 4).map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-2.5 rounded-[10px] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatDate(log.timestamp)}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      {log.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
