import {
  Role,
  Course,
  CourseModule,
  Lesson,
  FileDownload,
  Quiz,
  Member,
  UserProgress,
  AppExample,
  Testimonial,
  FaqItem,
  Announcement,
  ContactMessage,
  ActivityLog,
  CMSSettings,
  ContentBlock,
} from '../types';
import {
  INITIAL_CMS_SETTINGS,
  INITIAL_COURSES,
  INITIAL_MODULES,
  INITIAL_LESSONS,
  INITIAL_DOWNLOADS,
  INITIAL_QUIZZES,
  INITIAL_MEMBERS,
  INITIAL_PROGRESS,
  INITIAL_APP_EXAMPLES,
  INITIAL_TESTIMONIALS,
  INITIAL_FAQS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_CONTACT_MESSAGES,
  INITIAL_LOGS,
} from '../data/initialData';
import { generateCertificateId, generateId } from '../utils/crypto';

export interface AuthState {
  role: Role;
  member?: Member;
  lastActive: number;
}

export interface PasswordConfig {
  adminPass: string;
  superadminPass: string;
}

export interface StoreSyncHandlers {
  syncCMS?: (cms: CMSSettings) => void;
  syncCourse?: (course: Course) => void;
  deleteCourse?: (id: string) => void;
  syncModule?: (mod: CourseModule) => void;
  deleteModule?: (id: string) => void;
  syncLesson?: (lesson: Lesson) => void;
  deleteLesson?: (id: string) => void;
  syncDownload?: (file: FileDownload) => void;
  deleteDownload?: (id: string) => void;
  syncQuiz?: (quiz: Quiz) => void;
  deleteQuiz?: (id: string) => void;
  syncMember?: (member: Member) => void;
  deleteMember?: (id: string) => void;
  syncProgress?: (progress: UserProgress) => void;
  syncAppExample?: (item: AppExample) => void;
  deleteAppExample?: (id: string) => void;
  syncTestimonial?: (item: Testimonial) => void;
  deleteTestimonial?: (id: string) => void;
  syncFaq?: (item: FaqItem) => void;
  deleteFaq?: (id: string) => void;
  syncAnnouncement?: (announcement: Announcement) => void;
  deleteAnnouncement?: (id: string) => void;
  syncContactMessage?: (msg: ContactMessage) => void;
}

const STORAGE_KEYS = {
  CMS: 'gs_cms_v1',
  COURSES: 'gs_courses_v1',
  MODULES: 'gs_modules_v1',
  LESSONS: 'gs_lessons_v1',
  DOWNLOADS: 'gs_downloads_v1',
  QUIZZES: 'gs_quizzes_v1',
  MEMBERS: 'gs_members_v1',
  PROGRESS: 'gs_progress_v1',
  APP_EXAMPLES: 'gs_examples_v1',
  TESTIMONIALS: 'gs_testi_v1',
  FAQ: 'gs_faq_v1',
  ANNOUNCEMENTS: 'gs_ann_v1',
  CONTACTS: 'gs_contacts_v1',
  LOGS: 'gs_logs_v1',
  PASSWORDS: 'gs_passwords_v1',
  AUTH: 'gs_auth_v1',
};

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

class StoreManager {
  private cms: CMSSettings;
  private courses: Course[];
  private modules: CourseModule[];
  private lessons: Lesson[];
  private downloads: FileDownload[];
  private quizzes: Quiz[];
  private members: Member[];
  private progress: Record<string, UserProgress>;
  private appExamples: AppExample[];
  private testimonials: Testimonial[];
  private faq: FaqItem[];
  private announcements: Announcement[];
  private contacts: ContactMessage[];
  private logs: ActivityLog[];
  private passwords: PasswordConfig;
  private auth: AuthState;
  private syncHandlers?: StoreSyncHandlers;
  private version: number = 1;

  private listeners: Set<() => void> = new Set();
  private inactivityTimer: any = null;

  public getVersion(): number {
    return this.version;
  }

  public setSyncHandlers(handlers: StoreSyncHandlers): void {
    this.syncHandlers = handlers;
  }

  constructor() {
    this.cms = this.load(STORAGE_KEYS.CMS, INITIAL_CMS_SETTINGS);
    this.courses = this.load(STORAGE_KEYS.COURSES, INITIAL_COURSES);
    this.modules = this.load(STORAGE_KEYS.MODULES, INITIAL_MODULES);
    this.lessons = this.load(STORAGE_KEYS.LESSONS, INITIAL_LESSONS);
    this.downloads = this.load(STORAGE_KEYS.DOWNLOADS, INITIAL_DOWNLOADS);
    this.quizzes = this.load(STORAGE_KEYS.QUIZZES, INITIAL_QUIZZES);
    this.members = this.load(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
    this.progress = this.load(STORAGE_KEYS.PROGRESS, INITIAL_PROGRESS);
    this.appExamples = this.load(STORAGE_KEYS.APP_EXAMPLES, INITIAL_APP_EXAMPLES);
    this.testimonials = this.load(STORAGE_KEYS.TESTIMONIALS, INITIAL_TESTIMONIALS);
    this.faq = this.load(STORAGE_KEYS.FAQ, INITIAL_FAQS);
    this.announcements = this.load(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    this.contacts = this.load(STORAGE_KEYS.CONTACTS, INITIAL_CONTACT_MESSAGES);
    this.logs = this.load(STORAGE_KEYS.LOGS, INITIAL_LOGS);
    this.passwords = this.load(STORAGE_KEYS.PASSWORDS, {
      adminPass: 'admin123',
      superadminPass: 'superadmin123',
    });
    this.auth = this.load(STORAGE_KEYS.AUTH, {
      role: 'Publik',
      lastActive: Date.now(),
    });

    this.initInactivityListener();
  }

  private load<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private save(key: string, value: any): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }

  private notify(): void {
    this.version++;
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Listener notification error:', err);
      }
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Activity & Auto-logout
  private initInactivityListener(): void {
    if (typeof window === 'undefined') return;

    const resetTimer = () => {
      if (this.auth.role !== 'Publik') {
        this.auth.lastActive = Date.now();
        this.save(STORAGE_KEYS.AUTH, this.auth);
      }
    };

    ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'].forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    setInterval(() => {
      if (this.auth.role !== 'Publik') {
        const inactiveTime = Date.now() - this.auth.lastActive;
        if (inactiveTime > INACTIVITY_TIMEOUT_MS) {
          this.logout();
        }
      }
    }, 15000);
  }

  // Auth Methods
  public getAuth(): AuthState {
    return { ...this.auth };
  }

  public loginWithPassword(password: string): { success: boolean; role?: Role; message?: string } {
    const trimmed = password.trim();
    if (!trimmed) {
      return { success: false, message: 'Kata sandi wajib diisi' };
    }

    // Check Superadmin
    if (trimmed === this.passwords.superadminPass) {
      this.auth = { role: 'Superadmin', lastActive: Date.now() };
      this.save(STORAGE_KEYS.AUTH, this.auth);
      this.addLog('Superadmin', 'Masuk ke sistem');
      this.notify();
      return { success: true, role: 'Superadmin' };
    }

    // Check Admin
    if (trimmed === this.passwords.adminPass) {
      this.auth = { role: 'Admin', lastActive: Date.now() };
      this.save(STORAGE_KEYS.AUTH, this.auth);
      this.addLog('Admin', 'Masuk ke sistem');
      this.notify();
      return { success: true, role: 'Admin' };
    }

    // Check Member by access code (plainAccessCode or exact match)
    const foundMember = this.members.find(
      (m) => (m.plainAccessCode && m.plainAccessCode === trimmed) || m.accessCodeHash === trimmed
    );

    if (foundMember) {
      if (foundMember.status === 'nonaktif') {
        return { success: false, message: 'Akun member tidak aktif' };
      }
      if (foundMember.expiresAt) {
        const exp = new Date(foundMember.expiresAt).getTime();
        if (exp < Date.now()) {
          return { success: false, message: 'Masa aktif akses telah berakhir' };
        }
      }

      this.auth = { role: 'Member', member: foundMember, lastActive: Date.now() };
      this.save(STORAGE_KEYS.AUTH, this.auth);
      this.addLog('Member', `Member ${foundMember.name} masuk ke portal`);
      this.notify();
      return { success: true, role: 'Member' };
    }

    return { success: false, message: 'Kata sandi salah' };
  }

  public logout(): void {
    if (this.auth.role !== 'Publik') {
      this.addLog(this.auth.role, 'Keluar dari sistem');
    }
    this.auth = { role: 'Publik', lastActive: Date.now() };
    this.save(STORAGE_KEYS.AUTH, this.auth);
    this.notify();
  }

  public changeOwnPassword(currentPass: string, newPass: string): { success: boolean; message?: string } {
    if (this.auth.role === 'Superadmin') {
      if (currentPass !== this.passwords.superadminPass) {
        return { success: false, message: 'Kata sandi saat ini salah' };
      }
      if (newPass.length < 8) {
        return { success: false, message: 'Kata sandi baru minimal 8 karakter' };
      }
      this.passwords.superadminPass = newPass;
      this.save(STORAGE_KEYS.PASSWORDS, this.passwords);
      this.addLog('Superadmin', 'Memperbarui kata sandi Superadmin');
      this.notify();
      return { success: true };
    }

    if (this.auth.role === 'Admin') {
      if (currentPass !== this.passwords.adminPass) {
        return { success: false, message: 'Kata sandi saat ini salah' };
      }
      if (newPass.length < 8) {
        return { success: false, message: 'Kata sandi baru minimal 8 karakter' };
      }
      this.passwords.adminPass = newPass;
      this.save(STORAGE_KEYS.PASSWORDS, this.passwords);
      this.addLog('Admin', 'Memperbarui kata sandi Admin');
      this.notify();
      return { success: true };
    }

    if (this.auth.role === 'Member' && this.auth.member) {
      const currentMember = this.members.find((m) => m.id === this.auth.member?.id);
      if (!currentMember) return { success: false, message: 'Data member tidak ditemukan' };
      if (currentPass !== currentMember.plainAccessCode && currentPass !== currentMember.accessCodeHash) {
        return { success: false, message: 'Kata sandi saat ini salah' };
      }
      if (newPass.length < 6) {
        return { success: false, message: 'Kata sandi baru minimal 6 karakter' };
      }
      currentMember.plainAccessCode = newPass;
      currentMember.accessCodeHash = newPass + '_hash';
      this.save(STORAGE_KEYS.MEMBERS, this.members);
      this.auth.member = currentMember;
      this.save(STORAGE_KEYS.AUTH, this.auth);
      this.addLog('Member', `Member ${currentMember.name} memperbarui kata sandi`);
      this.notify();
      return { success: true };
    }

    return { success: false, message: 'Akses ditolak' };
  }

  public updateRolePasswordBySuperadmin(targetRole: 'Admin' | 'Superadmin', newPass: string): boolean {
    if (this.auth.role !== 'Superadmin') return false;
    if (newPass.length < 8) return false;
    if (targetRole === 'Superadmin') {
      this.passwords.superadminPass = newPass;
    } else {
      this.passwords.adminPass = newPass;
    }
    this.save(STORAGE_KEYS.PASSWORDS, this.passwords);
    this.addLog('Superadmin', `Mengubah kata sandi peran ${targetRole}`);
    this.notify();
    return true;
  }

  // CMS
  public getCMS(): CMSSettings {
    return { ...this.cms };
  }

  public updateCMS(updates: Partial<CMSSettings>): void {
    this.cms = { ...this.cms, ...updates };
    this.save(STORAGE_KEYS.CMS, this.cms);
    this.syncHandlers?.syncCMS?.(this.cms);
    this.addLog(this.auth.role, 'Memperbarui pengaturan CMS');
    this.notify();
  }

  public applyRemoteCMS(remoteCms: Partial<CMSSettings>): void {
    const mergedIdentity = {
      ...this.cms.identity,
      ...(remoteCms.identity || {}),
      logoUrl: (remoteCms.identity?.logoUrl && remoteCms.identity.logoUrl.trim() !== '')
        ? remoteCms.identity.logoUrl
        : this.cms.identity.logoUrl,
    };

    this.cms = {
      ...this.cms,
      ...remoteCms,
      identity: mergedIdentity,
      sync: {
        ...this.cms.sync,
        ...(remoteCms.sync || {}),
      },
    };
    this.save(STORAGE_KEYS.CMS, this.cms);
    this.notify();
  }

  public applyRemoteAnnouncements(remoteAnnouncements: Announcement[]): void {
    if (remoteAnnouncements.length > 0) {
      this.announcements = remoteAnnouncements;
      this.save(STORAGE_KEYS.ANNOUNCEMENTS, this.announcements);
      this.notify();
    }
  }

  public applyRemoteCourses(remoteCourses: Course[]): void {
    if (remoteCourses.length > 0) {
      this.courses = remoteCourses.map((rc) => {
        const existing = this.courses.find((c) => c.id === rc.id);
        return {
          ...rc,
          coverValue: (rc.coverValue && rc.coverValue.trim() !== '') ? rc.coverValue : (existing?.coverValue || ''),
        };
      });
      this.save(STORAGE_KEYS.COURSES, this.courses);
      this.notify();
    }
  }

  public applyRemoteExamples(remoteExamples: AppExample[]): void {
    if (remoteExamples.length > 0) {
      this.appExamples = remoteExamples.map((re) => {
        const existing = this.appExamples.find((e) => e.id === re.id);
        return {
          ...re,
          imageUrl: (re.imageUrl && re.imageUrl.trim() !== '') ? re.imageUrl : (existing?.imageUrl || ''),
        };
      });
      this.save(STORAGE_KEYS.APP_EXAMPLES, this.appExamples);
      this.notify();
    }
  }

  public applyRemoteTestimonials(remoteTestis: Testimonial[]): void {
    if (remoteTestis.length > 0) {
      this.testimonials = remoteTestis.map((rt) => {
        const existing = this.testimonials.find((t) => t.id === rt.id);
        return {
          ...rt,
          avatarUrl: (rt.avatarUrl && rt.avatarUrl.trim() !== '') ? rt.avatarUrl : (existing?.avatarUrl || ''),
        };
      });
      this.save(STORAGE_KEYS.TESTIMONIALS, this.testimonials);
      this.notify();
    }
  }

  public applyRemoteFaqs(remoteFaqs: FaqItem[]): void {
    if (remoteFaqs.length > 0) {
      this.faq = remoteFaqs;
      this.save(STORAGE_KEYS.FAQ, this.faq);
      this.notify();
    }
  }

  public applyRemoteModules(remoteModules: CourseModule[]): void {
    if (remoteModules.length > 0) {
      this.modules = remoteModules;
      this.save(STORAGE_KEYS.MODULES, this.modules);
      this.notify();
    }
  }

  public applyRemoteLessons(remoteLessons: Lesson[]): void {
    if (remoteLessons.length > 0) {
      this.lessons = remoteLessons;
      this.save(STORAGE_KEYS.LESSONS, this.lessons);
      this.notify();
    }
  }

  public applyRemoteDownloads(remoteDownloads: FileDownload[]): void {
    if (remoteDownloads.length > 0) {
      this.downloads = remoteDownloads;
      this.save(STORAGE_KEYS.DOWNLOADS, this.downloads);
      this.notify();
    }
  }

  public applyRemoteQuizzes(remoteQuizzes: Quiz[]): void {
    if (remoteQuizzes.length > 0) {
      this.quizzes = remoteQuizzes;
      this.save(STORAGE_KEYS.QUIZZES, this.quizzes);
      this.notify();
    }
  }

  public applyRemoteMembers(remoteMembers: Member[]): void {
    if (remoteMembers.length > 0) {
      this.members = remoteMembers;
      this.save(STORAGE_KEYS.MEMBERS, this.members);
      this.notify();
    }
  }

  public applyRemoteContacts(remoteContacts: ContactMessage[]): void {
    if (remoteContacts.length > 0) {
      this.contacts = remoteContacts;
      this.save(STORAGE_KEYS.CONTACTS, this.contacts);
      this.notify();
    }
  }

  public resetCMSToDefault(): void {
    this.cms = JSON.parse(JSON.stringify(INITIAL_CMS_SETTINGS));
    this.save(STORAGE_KEYS.CMS, this.cms);
    this.syncHandlers?.syncCMS?.(this.cms);
    this.addLog(this.auth.role, 'Memulihkan pengaturan CMS ke bawaan');
    this.notify();
  }

  // Courses
  public getCourses(): Course[] {
    return [...this.courses].sort((a, b) => a.order - b.order);
  }

  public getCourseById(id: string): Course | undefined {
    return this.courses.find((c) => c.id === id);
  }

  public saveCourse(course: Course): void {
    const idx = this.courses.findIndex((c) => c.id === course.id);
    if (idx >= 0) {
      this.courses[idx] = course;
    } else {
      this.courses.push(course);
    }
    this.save(STORAGE_KEYS.COURSES, this.courses);
    this.syncHandlers?.syncCourse?.(course);
    this.addLog(this.auth.role, `Menyimpan kelas: ${course.name}`);
    this.notify();
  }

  public deleteCourse(id: string): Course | null {
    const idx = this.courses.findIndex((c) => c.id === id);
    if (idx >= 0) {
      const deleted = this.courses.splice(idx, 1)[0];
      this.save(STORAGE_KEYS.COURSES, this.courses);
      this.syncHandlers?.deleteCourse?.(id);
      this.addLog(this.auth.role, `Menghapus kelas: ${deleted.name}`);
      this.notify();
      return deleted;
    }
    return null;
  }

  public restoreCourse(course: Course): void {
    this.courses.push(course);
    this.save(STORAGE_KEYS.COURSES, this.courses);
    this.notify();
  }

  // Modules
  public getModules(courseId?: string): CourseModule[] {
    const list = courseId ? this.modules.filter((m) => m.courseId === courseId) : this.modules;
    return [...list].sort((a, b) => a.order - b.order);
  }

  public saveModule(mod: CourseModule): void {
    const idx = this.modules.findIndex((m) => m.id === mod.id);
    if (idx >= 0) {
      this.modules[idx] = mod;
    } else {
      this.modules.push(mod);
    }
    this.save(STORAGE_KEYS.MODULES, this.modules);
    this.syncHandlers?.syncModule?.(mod);
    this.notify();
  }

  public deleteModule(id: string): CourseModule | null {
    const idx = this.modules.findIndex((m) => m.id === id);
    if (idx >= 0) {
      const deleted = this.modules.splice(idx, 1)[0];
      this.save(STORAGE_KEYS.MODULES, this.modules);
      this.syncHandlers?.deleteModule?.(id);
      this.notify();
      return deleted;
    }
    return null;
  }

  public restoreModule(mod: CourseModule): void {
    this.modules.push(mod);
    this.save(STORAGE_KEYS.MODULES, this.modules);
    this.syncHandlers?.syncModule?.(mod);
    this.notify();
  }

  // Lessons
  public getLessons(moduleId?: string): Lesson[] {
    const list = moduleId ? this.lessons.filter((l) => l.moduleId === moduleId) : this.lessons;
    return [...list].sort((a, b) => a.order - b.order);
  }

  public getLessonById(id: string): Lesson | undefined {
    return this.lessons.find((l) => l.id === id);
  }

  public saveLesson(lesson: Lesson): void {
    const idx = this.lessons.findIndex((l) => l.id === lesson.id);
    if (idx >= 0) {
      this.lessons[idx] = lesson;
    } else {
      this.lessons.push(lesson);
    }
    this.save(STORAGE_KEYS.LESSONS, this.lessons);
    this.syncHandlers?.syncLesson?.(lesson);
    this.addLog(this.auth.role, `Menyimpan pelajaran: ${lesson.title}`);
    this.notify();
  }

  public deleteLesson(id: string): Lesson | null {
    const idx = this.lessons.findIndex((l) => l.id === id);
    if (idx >= 0) {
      const deleted = this.lessons.splice(idx, 1)[0];
      this.save(STORAGE_KEYS.LESSONS, this.lessons);
      this.syncHandlers?.deleteLesson?.(id);
      this.addLog(this.auth.role, `Menghapus pelajaran: ${deleted.title}`);
      this.notify();
      return deleted;
    }
    return null;
  }

  public duplicateLesson(lessonId: string): Lesson | null {
    const orig = this.lessons.find((l) => l.id === lessonId);
    if (!orig) return null;
    const copy: Lesson = {
      ...JSON.parse(JSON.stringify(orig)),
      id: generateId('les'),
      title: `${orig.title} (Salinan)`,
      order: orig.order + 1,
    };
    this.lessons.push(copy);
    this.save(STORAGE_KEYS.LESSONS, this.lessons);
    this.syncHandlers?.syncLesson?.(copy);
    this.addLog(this.auth.role, `Menduplikasi pelajaran: ${orig.title}`);
    this.notify();
    return copy;
  }

  // Downloads / Skill Claude Library
  public getDownloads(courseId?: string): FileDownload[] {
    const list = courseId ? this.downloads.filter((d) => d.courseId === courseId) : this.downloads;
    return [...list];
  }

  public saveDownload(file: FileDownload): void {
    const idx = this.downloads.findIndex((d) => d.id === file.id);
    if (idx >= 0) {
      this.downloads[idx] = file;
    } else {
      this.downloads.push(file);
    }
    this.save(STORAGE_KEYS.DOWNLOADS, this.downloads);
    this.syncHandlers?.syncDownload?.(file);
    this.addLog(this.auth.role, `Menyimpan berkas: ${file.name}`);
    this.notify();
  }

  public deleteDownload(id: string): FileDownload | null {
    const idx = this.downloads.findIndex((d) => d.id === id);
    if (idx >= 0) {
      const deleted = this.downloads.splice(idx, 1)[0];
      this.save(STORAGE_KEYS.DOWNLOADS, this.downloads);
      this.syncHandlers?.deleteDownload?.(id);
      this.notify();
      return deleted;
    }
    return null;
  }

  public incrementDownload(id: string): void {
    const f = this.downloads.find((d) => d.id === id);
    if (f) {
      f.downloadCount = (f.downloadCount || 0) + 1;
      this.save(STORAGE_KEYS.DOWNLOADS, this.downloads);
      this.syncHandlers?.syncDownload?.(f);
      this.notify();
    }
  }

  // Quizzes
  public getQuizzes(courseId?: string): Quiz[] {
    const list = courseId ? this.quizzes.filter((q) => q.courseId === courseId) : this.quizzes;
    return [...list];
  }

  public getQuizByModule(moduleId: string): Quiz | undefined {
    return this.quizzes.find((q) => q.moduleId === moduleId);
  }

  public saveQuiz(quiz: Quiz): void {
    const idx = this.quizzes.findIndex((q) => q.id === quiz.id);
    if (idx >= 0) {
      this.quizzes[idx] = quiz;
    } else {
      this.quizzes.push(quiz);
    }
    this.save(STORAGE_KEYS.QUIZZES, this.quizzes);
    this.syncHandlers?.syncQuiz?.(quiz);
    this.notify();
  }

  public deleteQuiz(id: string): void {
    this.quizzes = this.quizzes.filter((q) => q.id !== id);
    this.save(STORAGE_KEYS.QUIZZES, this.quizzes);
    this.syncHandlers?.deleteQuiz?.(id);
    this.notify();
  }

  // Members
  public getMembers(): Member[] {
    return [...this.members];
  }

  public saveMember(member: Member): void {
    const idx = this.members.findIndex((m) => m.id === member.id);
    if (idx >= 0) {
      this.members[idx] = member;
    } else {
      this.members.push(member);
    }
    this.save(STORAGE_KEYS.MEMBERS, this.members);
    this.syncHandlers?.syncMember?.(member);
    this.addLog(this.auth.role, `Menyimpan data member: ${member.name}`);
    this.notify();
  }

  public deleteMember(id: string): Member | null {
    const idx = this.members.findIndex((m) => m.id === id);
    if (idx >= 0) {
      const deleted = this.members.splice(idx, 1)[0];
      this.save(STORAGE_KEYS.MEMBERS, this.members);
      this.syncHandlers?.deleteMember?.(id);
      this.addLog(this.auth.role, `Menghapus member: ${deleted.name}`);
      this.notify();
      return deleted;
    }
    return null;
  }

  public bulkUpdateMembers(ids: string[], updates: Partial<Member>): void {
    ids.forEach((id) => {
      const m = this.members.find((item) => item.id === id);
      if (m) {
        Object.assign(m, updates);
        this.syncHandlers?.syncMember?.(m);
      }
    });
    this.save(STORAGE_KEYS.MEMBERS, this.members);
    this.notify();
  }

  public bulkDeleteMembers(ids: string[]): void {
    ids.forEach((id) => {
      this.syncHandlers?.deleteMember?.(id);
    });
    this.members = this.members.filter((m) => !ids.includes(m.id));
    this.save(STORAGE_KEYS.MEMBERS, this.members);
    this.notify();
  }

  // Progress
  public getProgress(memberId: string): UserProgress {
    if (!this.progress[memberId]) {
      this.progress[memberId] = {
        memberId,
        completedLessons: [],
        completedSteps: {},
        notes: {},
        quizResults: {},
        certificates: {},
      };
      this.save(STORAGE_KEYS.PROGRESS, this.progress);
    }
    return this.progress[memberId];
  }

  public toggleLessonCompleted(memberId: string, lessonId: string): boolean {
    const prog = this.getProgress(memberId);
    const idx = prog.completedLessons.indexOf(lessonId);
    let isCompleted = false;
    if (idx >= 0) {
      prog.completedLessons.splice(idx, 1);
      isCompleted = false;
    } else {
      prog.completedLessons.push(lessonId);
      isCompleted = true;
    }
    this.save(STORAGE_KEYS.PROGRESS, this.progress);
    this.syncHandlers?.syncProgress?.(prog);
    this.checkAndAwardCertificate(memberId);
    this.notify();
    return isCompleted;
  }

  public toggleStepCompleted(memberId: string, lessonId: string, stepId: string): boolean {
    const prog = this.getProgress(memberId);
    if (!prog.completedSteps[lessonId]) {
      prog.completedSteps[lessonId] = [];
    }
    const list = prog.completedSteps[lessonId];
    const idx = list.indexOf(stepId);
    let done = false;
    if (idx >= 0) {
      list.splice(idx, 1);
      done = false;
    } else {
      list.push(stepId);
      done = true;
    }
    this.save(STORAGE_KEYS.PROGRESS, this.progress);
    this.syncHandlers?.syncProgress?.(prog);
    this.notify();
    return done;
  }

  public saveNote(memberId: string, lessonId: string, note: string): void {
    const prog = this.getProgress(memberId);
    prog.notes[lessonId] = note;
    this.save(STORAGE_KEYS.PROGRESS, this.progress);
    this.syncHandlers?.syncProgress?.(prog);
    this.notify();
  }

  public submitQuiz(memberId: string, moduleId: string, courseId: string, score: number, passed: boolean): void {
    const prog = this.getProgress(memberId);
    const existing = prog.quizResults[moduleId];
    prog.quizResults[moduleId] = {
      score: existing ? Math.max(existing.score, score) : score,
      passed: (existing?.passed || false) || passed,
      date: new Date().toISOString(),
      attempts: (existing?.attempts || 0) + 1,
    };
    this.save(STORAGE_KEYS.PROGRESS, this.progress);
    this.syncHandlers?.syncProgress?.(prog);
    this.checkAndAwardCertificate(memberId);
    this.notify();
  }

  public checkAndAwardCertificate(memberId: string): void {
    const member = this.members.find((m) => m.id === memberId);
    if (!member) return;

    const prog = this.getProgress(memberId);

    member.ownedCourses.forEach((cId) => {
      if (prog.certificates[cId]) return; // already awarded

      // Check all lessons for this course
      const courseLessons = this.lessons.filter((l) => l.courseId === cId);
      if (courseLessons.length === 0) return;

      const allLessonsDone = courseLessons.every((l) => prog.completedLessons.includes(l.id));
      if (!allLessonsDone) return;

      // Check quizzes for this course
      const courseQuizzes = this.quizzes.filter((q) => q.courseId === cId);
      const allQuizzesPassed = courseQuizzes.every((q) => prog.quizResults[q.moduleId]?.passed);

      if (allLessonsDone && allQuizzesPassed) {
        prog.certificates[cId] = {
          certNumber: generateCertificateId(),
          issuedAt: new Date().toISOString(),
        };
        this.save(STORAGE_KEYS.PROGRESS, this.progress);
        this.addLog('Member', `Sertifikat kelulusan terbit untuk ${member.name}`);
      }
    });
  }

  public getCourseProgressPercent(memberId: string, courseId: string): number {
    const courseLessons = this.lessons.filter((l) => l.courseId === courseId);
    if (courseLessons.length === 0) return 0;
    const prog = this.getProgress(memberId);
    const completed = courseLessons.filter((l) => prog.completedLessons.includes(l.id)).length;
    return Math.round((completed / courseLessons.length) * 100);
  }

  // App Examples
  public getAppExamples(): AppExample[] {
    return [...this.appExamples].sort((a, b) => a.order - b.order);
  }

  public saveAppExample(item: AppExample): void {
    const idx = this.appExamples.findIndex((e) => e.id === item.id);
    if (idx >= 0) {
      this.appExamples[idx] = item;
    } else {
      this.appExamples.push(item);
    }
    this.save(STORAGE_KEYS.APP_EXAMPLES, this.appExamples);
    this.syncHandlers?.syncAppExample?.(item);
    this.notify();
  }

  public deleteAppExample(id: string): AppExample | null {
    const idx = this.appExamples.findIndex((e) => e.id === id);
    if (idx >= 0) {
      const deleted = this.appExamples.splice(idx, 1)[0];
      this.save(STORAGE_KEYS.APP_EXAMPLES, this.appExamples);
      this.syncHandlers?.deleteAppExample?.(id);
      this.notify();
      return deleted;
    }
    return null;
  }

  // Testimonials
  public getTestimonials(): Testimonial[] {
    return [...this.testimonials].sort((a, b) => a.order - b.order);
  }

  public saveTestimonial(item: Testimonial): void {
    const idx = this.testimonials.findIndex((t) => t.id === item.id);
    if (idx >= 0) {
      this.testimonials[idx] = item;
    } else {
      this.testimonials.push(item);
    }
    this.save(STORAGE_KEYS.TESTIMONIALS, this.testimonials);
    this.syncHandlers?.syncTestimonial?.(item);
    this.notify();
  }

  public deleteTestimonial(id: string): Testimonial | null {
    const idx = this.testimonials.findIndex((t) => t.id === id);
    if (idx >= 0) {
      const deleted = this.testimonials.splice(idx, 1)[0];
      this.save(STORAGE_KEYS.TESTIMONIALS, this.testimonials);
      this.syncHandlers?.deleteTestimonial?.(id);
      this.notify();
      return deleted;
    }
    return null;
  }

  // FAQ
  public getFaq(): FaqItem[] {
    return [...this.faq].sort((a, b) => a.order - b.order);
  }

  public saveFaq(item: FaqItem): void {
    const idx = this.faq.findIndex((f) => f.id === item.id);
    if (idx >= 0) {
      this.faq[idx] = item;
    } else {
      this.faq.push(item);
    }
    this.save(STORAGE_KEYS.FAQ, this.faq);
    this.syncHandlers?.syncFaq?.(item);
    this.notify();
  }

  public deleteFaq(id: string): FaqItem | null {
    const idx = this.faq.findIndex((f) => f.id === id);
    if (idx >= 0) {
      const deleted = this.faq.splice(idx, 1)[0];
      this.save(STORAGE_KEYS.FAQ, this.faq);
      this.syncHandlers?.deleteFaq?.(id);
      this.notify();
      return deleted;
    }
    return null;
  }

  // Announcements
  public getAnnouncements(): Announcement[] {
    return [...this.announcements].sort((a, b) => a.order - b.order);
  }

  public saveAnnouncement(item: Announcement): void {
    const idx = this.announcements.findIndex((a) => a.id === item.id);
    if (idx >= 0) {
      this.announcements[idx] = item;
    } else {
      this.announcements.push(item);
    }
    this.save(STORAGE_KEYS.ANNOUNCEMENTS, this.announcements);
    this.syncHandlers?.syncAnnouncement?.(item);
    this.notify();
  }

  public deleteAnnouncement(id: string): Announcement | null {
    const idx = this.announcements.findIndex((a) => a.id === id);
    if (idx >= 0) {
      const deleted = this.announcements.splice(idx, 1)[0];
      this.save(STORAGE_KEYS.ANNOUNCEMENTS, this.announcements);
      this.syncHandlers?.deleteAnnouncement?.(id);
      this.notify();
      return deleted;
    }
    return null;
  }

  // Contact Messages
  public getContacts(): ContactMessage[] {
    return [...this.contacts];
  }

  public addContact(msg: Omit<ContactMessage, 'id' | 'createdAt' | 'isRead'>): void {
    const item: ContactMessage = {
      ...msg,
      id: generateId('msg'),
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    this.contacts.unshift(item);
    this.save(STORAGE_KEYS.CONTACTS, this.contacts);
    this.syncHandlers?.syncContactMessage?.(item);
    this.notify();
  }

  public markContactAsRead(id: string): void {
    const c = this.contacts.find((item) => item.id === id);
    if (c) {
      c.isRead = true;
      this.save(STORAGE_KEYS.CONTACTS, this.contacts);
      this.notify();
    }
  }

  public deleteContact(id: string): void {
    this.contacts = this.contacts.filter((c) => c.id !== id);
    this.save(STORAGE_KEYS.CONTACTS, this.contacts);
    this.notify();
  }

  // Activity Logs
  public getLogs(): ActivityLog[] {
    return [...this.logs];
  }

  public addLog(role: Role, action: string, details?: string): void {
    const item: ActivityLog = {
      id: generateId('log'),
      role,
      action,
      timestamp: new Date().toISOString(),
      details,
    };
    this.logs.unshift(item);
    if (this.logs.length > 200) {
      this.logs.pop();
    }
    this.save(STORAGE_KEYS.LOGS, this.logs);
    this.notify();
  }

  // Full Backup & Restore
  public exportBackupJSON(): string {
    const dump = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      cms: this.cms,
      courses: this.courses,
      modules: this.modules,
      lessons: this.lessons,
      downloads: this.downloads,
      quizzes: this.quizzes,
      members: this.members,
      progress: this.progress,
      appExamples: this.appExamples,
      testimonials: this.testimonials,
      faq: this.faq,
      announcements: this.announcements,
      contacts: this.contacts,
      logs: this.logs,
      passwords: this.passwords,
    };
    return JSON.stringify(dump, null, 2);
  }

  public importBackupJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.cms) {
        this.cms = data.cms;
        this.save(STORAGE_KEYS.CMS, this.cms);
      }
      if (data.courses) {
        this.courses = data.courses;
        this.save(STORAGE_KEYS.COURSES, this.courses);
      }
      if (data.modules) {
        this.modules = data.modules;
        this.save(STORAGE_KEYS.MODULES, this.modules);
      }
      if (data.lessons) {
        this.lessons = data.lessons;
        this.save(STORAGE_KEYS.LESSONS, this.lessons);
      }
      if (data.downloads) {
        this.downloads = data.downloads;
        this.save(STORAGE_KEYS.DOWNLOADS, this.downloads);
      }
      if (data.quizzes) {
        this.quizzes = data.quizzes;
        this.save(STORAGE_KEYS.QUIZZES, this.quizzes);
      }
      if (data.members) {
        this.members = data.members;
        this.save(STORAGE_KEYS.MEMBERS, this.members);
      }
      if (data.progress) {
        this.progress = data.progress;
        this.save(STORAGE_KEYS.PROGRESS, this.progress);
      }
      if (data.appExamples) {
        this.appExamples = data.appExamples;
        this.save(STORAGE_KEYS.APP_EXAMPLES, this.appExamples);
      }
      if (data.testimonials) {
        this.testimonials = data.testimonials;
        this.save(STORAGE_KEYS.TESTIMONIALS, this.testimonials);
      }
      if (data.faq) {
        this.faq = data.faq;
        this.save(STORAGE_KEYS.FAQ, this.faq);
      }
      if (data.announcements) {
        this.announcements = data.announcements;
        this.save(STORAGE_KEYS.ANNOUNCEMENTS, this.announcements);
      }
      if (data.contacts) {
        this.contacts = data.contacts;
        this.save(STORAGE_KEYS.CONTACTS, this.contacts);
      }
      if (data.passwords) {
        this.passwords = data.passwords;
        this.save(STORAGE_KEYS.PASSWORDS, this.passwords);
      }
      this.addLog(this.auth.role, 'Memulihkan data cadangan JSON');
      this.notify();
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }

  // Firebase Quota Metrics (Mocked realistic tracker for free tier)
  public getFirebaseQuota() {
    return {
      reads: { current: 3820, limit: 50000, label: 'Operasi Baca (Harian)' },
      writes: { current: 1240, limit: 20000, label: 'Operasi Tulis (Harian)' },
      deletes: { current: 154, limit: 20000, label: 'Operasi Hapus (Harian)' },
      storageMB: { current: 194, limit: 1024, label: 'Penyimpanan Database (MB)' },
      egressGB: { current: 1.62, limit: 10.0, label: 'Transfer Jaringan (GB / Bulan)' },
    };
  }
}

export const store = new StoreManager();
