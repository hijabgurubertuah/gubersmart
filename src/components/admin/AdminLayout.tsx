import React, { useState } from 'react';
import { Role, Course, CourseModule, Lesson, FileDownload, Quiz, Member, UserProgress, AppExample, Testimonial, FaqItem, Announcement, ContactMessage, ActivityLog, CMSSettings } from '../../types';
import { AdminDashboard } from './AdminDashboard';
import { AdminClasses } from './AdminClasses';
import { AdminLessons } from './AdminLessons';
import { AdminFiles } from './AdminFiles';
import { AdminQuizzes } from './AdminQuizzes';
import { AdminMembers } from './AdminMembers';
import { AdminCMS } from './AdminCMS';
import { AdminSimpleCrud } from './AdminSimpleCrud';
import { AdminSync } from './AdminSync';
import { AdminBackup } from './AdminBackup';
import { AdminFirebaseQuota } from './AdminFirebaseQuota';
import { AdminLogs } from './AdminLogs';
import { AdminPassword } from './AdminPassword';
import {
  LayoutDashboard,
  BookOpen,
  FileCode,
  FolderDown,
  HelpCircle,
  Users,
  LayoutGrid,
  Star,
  MessageCircle,
  Bell,
  Sliders,
  RefreshCw,
  Database,
  BarChart,
  History,
  Lock,
  Menu,
  X,
} from 'lucide-react';

interface AdminLayoutProps {
  role: Role;
  courses: Course[];
  modules: CourseModule[];
  lessons: Lesson[];
  files: FileDownload[];
  quizzes: Quiz[];
  members: Member[];
  progressData: Record<string, UserProgress>;
  appExamples: AppExample[];
  testimonials: Testimonial[];
  faq: FaqItem[];
  announcements: Announcement[];
  contacts: ContactMessage[];
  logs: ActivityLog[];
  cms: CMSSettings;
  onSaveCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => Course | null;
  onRestoreCourse: (course: Course) => void;
  onSaveModule: (mod: CourseModule) => void;
  onDeleteModule: (id: string) => CourseModule | null;
  onSaveLesson: (lesson: Lesson) => void;
  onDeleteLesson: (id: string) => Lesson | null;
  onDuplicateLesson: (id: string) => Lesson | null;
  onSaveFile: (file: FileDownload) => void;
  onDeleteFile: (id: string) => FileDownload | null;
  onSaveQuiz: (quiz: Quiz) => void;
  onDeleteQuiz: (id: string) => void;
  onSaveMember: (member: Member) => void;
  onDeleteMember: (id: string) => Member | null;
  onBulkUpdateMembers: (ids: string[], updates: Partial<Member>) => void;
  onBulkDeleteMembers: (ids: string[]) => void;
  onSaveExample: (item: AppExample) => void;
  onDeleteExample: (id: string) => void;
  onSaveTestimonial: (item: Testimonial) => void;
  onDeleteTestimonial: (id: string) => void;
  onSaveFaq: (item: FaqItem) => void;
  onDeleteFaq: (id: string) => void;
  onSaveAnnouncement: (item: Announcement) => void;
  onDeleteAnnouncement: (id: string) => void;
  onMarkContactRead: (id: string) => void;
  onDeleteContact: (id: string) => void;
  onUpdateCMS: (updates: Partial<CMSSettings>) => void;
  onResetCMS: () => void;
  onUpdateSync: (sync: CMSSettings['sync']) => void;
  onExportBackup: () => string;
  onImportBackup: (json: string) => boolean;
  onChangeOwnPassword: (currentPass: string, newPass: string) => { success: boolean; message?: string };
  onUpdateRolePassword?: (targetRole: 'Admin' | 'Superadmin', newPass: string) => boolean;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = (props) => {
  const { role, cms, onToast } = props;
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isSuperadmin = role === 'Superadmin';

  const menuItems = [
    { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'classes', label: 'Kelas', icon: BookOpen },
    { id: 'lessons', label: 'Pelajaran', icon: FileCode },
    { id: 'files', label: 'Pustaka File', icon: FolderDown },
    { id: 'quizzes', label: 'Kuis', icon: HelpCircle },
    { id: 'members', label: 'Member', icon: Users },
    { id: 'examples', label: 'Contoh Aplikasi', icon: LayoutGrid },
    { id: 'testimonials', label: 'Testimoni', icon: Star },
    { id: 'faq', label: 'Tanya Jawab', icon: MessageCircle },
    { id: 'announcements', label: 'Pengumuman', icon: Bell },
    { id: 'contacts', label: 'Pesan Kontak', icon: MessageCircle },
    { id: 'cms', label: 'CMS', icon: Sliders },
    { id: 'logs', label: 'Riwayat', icon: History },
    { id: 'passwords', label: 'Kata Sandi', icon: Lock },
    ...(isSuperadmin
      ? [
          { id: 'sync', label: 'Sinkronisasi', icon: RefreshCw },
          { id: 'backup', label: 'Cadangan', icon: Database },
          { id: 'firebase', label: 'Firebase Quota', icon: BarChart },
        ]
      : []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Mobile Menu Dropdown / Bar */}
      <div className="lg:hidden mb-6 flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-[14px] border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Menu Admin:</span>
          <span className="text-sm font-bold text-[#0B2A5B] dark:text-white">
            {menuItems.find((m) => m.id === activeTab)?.label}
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="h-9 px-3 text-xs font-semibold rounded-[8px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
        >
          {mobileMenuOpen ? 'Tutup' : 'Ganti Menu'}
        </button>
      </div>

      {/* Mobile Drawer if open */}
      {mobileMenuOpen && (
        <div className="lg:hidden mb-6 p-3 bg-white dark:bg-slate-900 rounded-[14px] border border-slate-200 dark:border-slate-800 shadow-md grid grid-cols-2 gap-1.5 animate-in fade-in">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-[10px] text-xs font-semibold flex items-center gap-2 text-left transition-colors ${
                  isActive
                    ? 'bg-[#0B2A5B] text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Desktop Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Desktop Sidebar (Col 1) */}
        <aside className="hidden lg:block lg:col-span-1 bg-white dark:bg-slate-900 rounded-[14px] p-3 border border-slate-100 dark:border-slate-800 shadow-xs space-y-1 sticky top-24">
          <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Menu Dasbor
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full min-h-[44px] px-3.5 rounded-[12px] text-sm font-semibold flex items-center gap-3 text-left transition-all ${
                  isActive
                    ? 'bg-[#0B2A5B] text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Panel (Col 2-5) */}
        <main className="lg:col-span-4 min-w-0">
          {activeTab === 'dashboard' && (
            <AdminDashboard
              role={role}
              courses={props.courses}
              members={props.members}
              contacts={props.contacts}
              logs={props.logs}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'classes' && (
            <AdminClasses
              courses={props.courses}
              onSaveCourse={props.onSaveCourse}
              onDeleteCourse={props.onDeleteCourse}
              onRestoreCourse={props.onRestoreCourse}
              onToast={onToast}
            />
          )}

          {activeTab === 'lessons' && (
            <AdminLessons
              courses={props.courses}
              modules={props.modules}
              lessons={props.lessons}
              onSaveLesson={props.onSaveLesson}
              onDeleteLesson={props.onDeleteLesson}
              onDuplicateLesson={props.onDuplicateLesson}
              onSaveModule={props.onSaveModule}
              onDeleteModule={props.onDeleteModule}
              onToast={onToast}
            />
          )}

          {activeTab === 'files' && (
            <AdminFiles
              files={props.files}
              courses={props.courses}
              onSaveFile={props.onSaveFile}
              onDeleteFile={props.onDeleteFile}
              onToast={onToast}
            />
          )}

          {activeTab === 'quizzes' && (
            <AdminQuizzes
              quizzes={props.quizzes}
              courses={props.courses}
              modules={props.modules}
              onSaveQuiz={props.onSaveQuiz}
              onDeleteQuiz={props.onDeleteQuiz}
              onToast={onToast}
            />
          )}

          {activeTab === 'members' && (
            <AdminMembers
              members={props.members}
              courses={props.courses}
              progressData={props.progressData}
              onSaveMember={props.onSaveMember}
              onDeleteMember={props.onDeleteMember}
              onBulkUpdate={props.onBulkUpdateMembers}
              onBulkDelete={props.onBulkDeleteMembers}
              onToast={onToast}
            />
          )}

          {activeTab === 'examples' && (
            <AdminSimpleCrud
              type="examples"
              appExamples={props.appExamples}
              testimonials={props.testimonials}
              faq={props.faq}
              announcements={props.announcements}
              contacts={props.contacts}
              onSaveExample={props.onSaveExample}
              onDeleteExample={props.onDeleteExample}
              onSaveTestimonial={props.onSaveTestimonial}
              onDeleteTestimonial={props.onDeleteTestimonial}
              onSaveFaq={props.onSaveFaq}
              onDeleteFaq={props.onDeleteFaq}
              onSaveAnnouncement={props.onSaveAnnouncement}
              onDeleteAnnouncement={props.onDeleteAnnouncement}
              onMarkContactRead={props.onMarkContactRead}
              onDeleteContact={props.onDeleteContact}
              onToast={onToast}
            />
          )}

          {activeTab === 'testimonials' && (
            <AdminSimpleCrud
              type="testimonials"
              appExamples={props.appExamples}
              testimonials={props.testimonials}
              faq={props.faq}
              announcements={props.announcements}
              contacts={props.contacts}
              onSaveExample={props.onSaveExample}
              onDeleteExample={props.onDeleteExample}
              onSaveTestimonial={props.onSaveTestimonial}
              onDeleteTestimonial={props.onDeleteTestimonial}
              onSaveFaq={props.onSaveFaq}
              onDeleteFaq={props.onDeleteFaq}
              onSaveAnnouncement={props.onSaveAnnouncement}
              onDeleteAnnouncement={props.onDeleteAnnouncement}
              onMarkContactRead={props.onMarkContactRead}
              onDeleteContact={props.onDeleteContact}
              onToast={onToast}
            />
          )}

          {activeTab === 'faq' && (
            <AdminSimpleCrud
              type="faq"
              appExamples={props.appExamples}
              testimonials={props.testimonials}
              faq={props.faq}
              announcements={props.announcements}
              contacts={props.contacts}
              onSaveExample={props.onSaveExample}
              onDeleteExample={props.onDeleteExample}
              onSaveTestimonial={props.onSaveTestimonial}
              onDeleteTestimonial={props.onDeleteTestimonial}
              onSaveFaq={props.onSaveFaq}
              onDeleteFaq={props.onDeleteFaq}
              onSaveAnnouncement={props.onSaveAnnouncement}
              onDeleteAnnouncement={props.onDeleteAnnouncement}
              onMarkContactRead={props.onMarkContactRead}
              onDeleteContact={props.onDeleteContact}
              onToast={onToast}
            />
          )}

          {activeTab === 'announcements' && (
            <AdminSimpleCrud
              type="announcements"
              appExamples={props.appExamples}
              testimonials={props.testimonials}
              faq={props.faq}
              announcements={props.announcements}
              contacts={props.contacts}
              onSaveExample={props.onSaveExample}
              onDeleteExample={props.onDeleteExample}
              onSaveTestimonial={props.onSaveTestimonial}
              onDeleteTestimonial={props.onDeleteTestimonial}
              onSaveFaq={props.onSaveFaq}
              onDeleteFaq={props.onDeleteFaq}
              onSaveAnnouncement={props.onSaveAnnouncement}
              onDeleteAnnouncement={props.onDeleteAnnouncement}
              onMarkContactRead={props.onMarkContactRead}
              onDeleteContact={props.onDeleteContact}
              onToast={onToast}
            />
          )}

          {activeTab === 'contacts' && (
            <AdminSimpleCrud
              type="contacts"
              appExamples={props.appExamples}
              testimonials={props.testimonials}
              faq={props.faq}
              announcements={props.announcements}
              contacts={props.contacts}
              onSaveExample={props.onSaveExample}
              onDeleteExample={props.onDeleteExample}
              onSaveTestimonial={props.onSaveTestimonial}
              onDeleteTestimonial={props.onDeleteTestimonial}
              onSaveFaq={props.onSaveFaq}
              onDeleteFaq={props.onDeleteFaq}
              onSaveAnnouncement={props.onSaveAnnouncement}
              onDeleteAnnouncement={props.onDeleteAnnouncement}
              onMarkContactRead={props.onMarkContactRead}
              onDeleteContact={props.onDeleteContact}
              onToast={onToast}
            />
          )}

          {activeTab === 'cms' && (
            <AdminCMS
              role={role}
              cms={cms}
              onUpdateCMS={props.onUpdateCMS}
              onResetCMS={props.onResetCMS}
              onToast={onToast}
            />
          )}

          {activeTab === 'logs' && (
            <AdminLogs logs={props.logs} />
          )}

          {activeTab === 'passwords' && (
            <AdminPassword
              role={role}
              onChangeOwnPassword={props.onChangeOwnPassword}
              onUpdateRolePassword={props.onUpdateRolePassword}
              onToast={onToast}
            />
          )}

          {isSuperadmin && activeTab === 'sync' && (
            <AdminSync
              cms={cms}
              onUpdateSync={props.onUpdateSync}
              onToast={onToast}
            />
          )}

          {isSuperadmin && activeTab === 'backup' && (
            <AdminBackup
              onExport={props.onExportBackup}
              onImport={props.onImportBackup}
              onToast={onToast}
            />
          )}

          {isSuperadmin && activeTab === 'firebase' && (
            <AdminFirebaseQuota />
          )}
        </main>
      </div>
    </div>
  );
};
