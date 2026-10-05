import React, { useState, useEffect, useRef } from 'react';
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
  Shield,
  ChevronRight,
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

  // Read initial tab from URL hash / localStorage so refresh stays on the exact admin tab
  const getInitialTab = () => {
    try {
      const hash = window.location.hash;
      if (hash.includes('tab=')) {
        const tabMatch = hash.match(/tab=([^&]+)/);
        if (tabMatch && tabMatch[1]) return tabMatch[1];
      }
      const saved = localStorage.getItem('guber_admin_tab');
      if (saved) return saved;
    } catch {
      // ignore
    }
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const sidebarDrawerRef = useRef<HTMLDivElement>(null);

  const isSuperadmin = role === 'Superadmin';

  // Sync activeTab to localStorage & URL hash
  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setMobileSidebarOpen(false);
    try {
      localStorage.setItem('guber_admin_tab', tabId);
      let newHash = '#/admin?tab=' + tabId;
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, '', newHash);
      }
    } catch {
      // ignore
    }
  };

  // Close mobile sidebar on Escape key or outside click
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMobileSidebarOpen(false);
        }
      };

      const handlePointerDown = (e: MouseEvent | TouchEvent) => {
        if (
          sidebarDrawerRef.current &&
          !sidebarDrawerRef.current.contains(e.target as Node)
        ) {
          setMobileSidebarOpen(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handlePointerDown);
      document.addEventListener('touchstart', handlePointerDown);

      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('mousedown', handlePointerDown);
        document.removeEventListener('touchstart', handlePointerDown);
      };
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileSidebarOpen]);

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

  const currentMenuLabel = menuItems.find((m) => m.id === activeTab)?.label || 'Ringkasan';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 relative">
      {/* 1. Mobile Floating Hamburger Button (Kiri Tengah Layar HP - Ukuran 120px x 30px) */}
      {!mobileSidebarOpen && (
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Buka Menu Panel Admin"
          className="fixed left-0 top-1/2 -translate-y-1/2 z-40 lg:hidden w-[30px] h-[120px] bg-[#0B2A5B]/95 hover:bg-[#0B2A5B] text-white rounded-r-[14px] shadow-2xl border-y border-r border-slate-600/50 backdrop-blur-md flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 group focus:outline-none"
        >
          <Menu className="w-4 h-4 text-[#FF7A1A] group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-extrabold tracking-widest text-slate-200 [writing-mode:vertical-lr] rotate-180 uppercase select-none">
            MENU
          </span>
        </button>
      )}

      {/* 2. Mobile Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity duration-300 animate-in fade-in"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* 3. Mobile Off-Canvas Sidebar Drawer */}
      <aside
        ref={sidebarDrawerRef}
        className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ease-out lg:hidden ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar Menu Admin Mobile"
      >
        {/* Mobile Sidebar Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-[#0B2A5B] flex items-center justify-center text-white shrink-0">
              <Shield className="w-4 h-4 text-[#FF7A1A]" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-[#0B2A5B] dark:text-white leading-tight">
                Panel {role}
              </h3>
              <p className="text-[10px] text-slate-400">
                Pilih menu manajemen
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors"
            aria-label="Tutup menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Menu Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
            Menu Manajemen Admin
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`w-full min-h-[42px] px-3.5 rounded-[12px] text-xs font-semibold flex items-center justify-between text-left transition-all ${
                  isActive
                    ? 'bg-[#0B2A5B] text-white shadow-xs font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FF7A1A]' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white/60' : 'text-slate-300 dark:text-slate-600'}`} />
              </button>
            );
          })}
        </div>

        {/* Mobile Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-center text-slate-400">
          Sedang aktif: <span className="font-bold text-[#0B2A5B] dark:text-white">{currentMenuLabel}</span>
        </div>
      </aside>

      {/* 4. Desktop Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Desktop Sidebar (Col 1) */}
        <aside className="hidden lg:block lg:col-span-1 bg-white dark:bg-slate-900 rounded-[14px] p-3 border border-slate-100 dark:border-slate-800 shadow-xs space-y-1 sticky top-24">
          <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Menu Dasbor</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
              {role}
            </span>
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full min-h-[44px] px-3.5 rounded-[12px] text-sm font-semibold flex items-center gap-3 text-left transition-all ${
                  isActive
                    ? 'bg-[#0B2A5B] text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FF7A1A]' : ''}`} />
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
              onNavigateTab={(tab) => handleSelectTab(tab)}
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
