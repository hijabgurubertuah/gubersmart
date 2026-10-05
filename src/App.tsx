import React, { useState, useEffect } from 'react';
import { useStore } from './hooks/useStore';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LoginModal } from './components/common/LoginModal';
import { ToastContainer } from './components/common/ToastContainer';
import { WhatsAppFloating } from './components/common/WhatsAppFloating';
import { RunningTextBanner } from './components/common/RunningTextBanner';

// Public pages
import { HomePage } from './components/public/HomePage';
import { ClassesPage } from './components/public/ClassesPage';
import { ClassDetailPage } from './components/public/ClassDetailPage';
import { ExamplesPage } from './components/public/ExamplesPage';
import { AboutPage } from './components/public/AboutPage';
import { ContactPage } from './components/public/ContactPage';
import { StaticPageView } from './components/public/StaticPageView';
import { NotFoundPage } from './components/public/NotFoundPage';

// Member pages
import { MemberDashboard } from './components/member/MemberDashboard';
import { MemberClassView } from './components/member/MemberClassView';
import { LessonView } from './components/member/LessonView';
import { SkillLibraryPage } from './components/member/SkillLibraryPage';
import { QuizModal } from './components/member/QuizModal';
import { CertificateView } from './components/member/CertificateView';
import { ProfilePage } from './components/member/ProfilePage';
import { MemberAnnouncementsPage } from './components/member/MemberAnnouncementsPage';

// Admin layout
import { AdminLayout } from './components/admin/AdminLayout';

import { Course, Quiz, Lesson, FileDownload } from './types';

export function App() {
  const {
    store,
    auth,
    cms,
    isOnline,
    canInstall,
    installApp,
    toasts,
    showToast,
    dismissToast,
    courses,
    members,
    downloads,
    appExamples,
    testimonials,
    faq,
    announcements,
    contacts,
    logs,
  } = useStore();

  const [currentPath, setCurrentPath] = useState<string>('/');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [certCourseId, setCertCourseId] = useState<string | null>(null);
  const [staticPageSlug, setStaticPageSlug] = useState<string | null>(null);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Apply CMS theme dynamically
  useEffect(() => {
    document.title = cms.identity.appName ? `${cms.identity.appName} - ${cms.identity.tagline}` : 'Guber Smart';
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--primary', cms.theme.primaryColor || '#0B2A5B');
      root.style.setProperty('--secondary', cms.theme.secondaryColor || '#1E4FA8');
      root.style.setProperty('--accent', cms.theme.accentColor || '#FF7A1A');
    }
  }, [cms]);

  // Navigate handler
  const handleNavigate = (path: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (path.startsWith('/halaman/')) {
      const slug = path.replace('/halaman/', '');
      setStaticPageSlug(slug);
      setCurrentPath('/halaman');
      return;
    }

    if (path === '/admin') {
      if (auth.role !== 'Admin' && auth.role !== 'Superadmin') {
        setIsLoginModalOpen(true);
        return;
      }
    }

    if (path === '/member') {
      if (auth.role !== 'Member') {
        setIsLoginModalOpen(true);
        return;
      }
    }

    setCurrentPath(path);
  };

  // Open class detail
  const handleOpenClassDetail = (courseId: string) => {
    setSelectedClassId(courseId);
    setCurrentPath('/kelas-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Member navigation
  const handleMemberOpenClass = (courseId: string) => {
    setSelectedClassId(courseId);
    setCurrentPath('/member/kelas');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMemberOpenLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setCurrentPath('/member/pelajaran');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMemberOpenCert = (courseId: string) => {
    setCertCourseId(courseId);
    setCurrentPath('/member/sertifikat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadFile = (fileOrId?: any, value?: string, fileName?: string) => {
    let downloadVal = value;
    let downloadName = fileName || 'berkas_unduhan';
    let fileId: string | undefined;

    if (typeof fileOrId === 'object' && fileOrId !== null) {
      downloadVal = fileOrId.value;
      downloadName = fileOrId.name;
      fileId = fileOrId.id;
    } else if (typeof fileOrId === 'string') {
      fileId = fileOrId;
    }

    if (fileId) {
      store.incrementDownload(fileId);
    }

    if (downloadVal) {
      const a = document.createElement('a');
      a.href = downloadVal;
      a.target = '_blank';
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Memulai unduhan berkas');
    } else {
      showToast('Tautan unduhan dibuka');
    }
  };

  // Check current view
  const renderCurrentView = () => {
    // 1. Admin Area
    if (currentPath === '/admin') {
      if (auth.role !== 'Admin' && auth.role !== 'Superadmin') {
        return (
          <div className="py-20 text-center space-y-4">
            <h2 className="text-xl font-bold font-heading text-[#0B2A5B]">Akses Ditolak</h2>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="h-10 px-5 text-sm font-semibold text-white bg-[#0B2A5B] rounded-[12px]"
            >
              Masuk
            </button>
          </div>
        );
      }
      return (
        <AdminLayout
          role={auth.role}
          courses={courses}
          modules={store.getModules()}
          lessons={store.getLessons()}
          files={downloads}
          quizzes={store.getQuizzes()}
          members={members}
          progressData={(store as any).progress}
          appExamples={appExamples}
          testimonials={testimonials}
          faq={faq}
          announcements={announcements}
          contacts={contacts}
          logs={logs}
          cms={cms}
          onSaveCourse={(c) => store.saveCourse(c)}
          onDeleteCourse={(id) => store.deleteCourse(id)}
          onRestoreCourse={(c) => store.restoreCourse(c)}
          onSaveModule={(m) => store.saveModule(m)}
          onDeleteModule={(id) => store.deleteModule(id)}
          onSaveLesson={(l) => store.saveLesson(l)}
          onDeleteLesson={(id) => store.deleteLesson(id)}
          onDuplicateLesson={(id) => store.duplicateLesson(id)}
          onSaveFile={(f) => store.saveDownload(f)}
          onDeleteFile={(id) => store.deleteDownload(id)}
          onSaveQuiz={(q) => store.saveQuiz(q)}
          onDeleteQuiz={(id) => store.deleteQuiz(id)}
          onSaveMember={(m) => store.saveMember(m)}
          onDeleteMember={(id) => store.deleteMember(id)}
          onBulkUpdateMembers={(ids, u) => store.bulkUpdateMembers(ids, u)}
          onBulkDeleteMembers={(ids) => store.bulkDeleteMembers(ids)}
          onSaveExample={(item) => store.saveAppExample(item)}
          onDeleteExample={(id) => store.deleteAppExample(id)}
          onSaveTestimonial={(item) => store.saveTestimonial(item)}
          onDeleteTestimonial={(id) => store.deleteTestimonial(id)}
          onSaveFaq={(item) => store.saveFaq(item)}
          onDeleteFaq={(id) => store.deleteFaq(id)}
          onSaveAnnouncement={(item) => store.saveAnnouncement(item)}
          onDeleteAnnouncement={(id) => store.deleteAnnouncement(id)}
          onMarkContactRead={(id) => store.markContactAsRead(id)}
          onDeleteContact={(id) => store.deleteContact(id)}
          onUpdateCMS={(updates) => store.updateCMS(updates)}
          onResetCMS={() => store.resetCMSToDefault()}
          onUpdateSync={(sync) => store.updateCMS({ sync })}
          onExportBackup={() => store.exportBackupJSON()}
          onImportBackup={(json) => store.importBackupJSON(json)}
          onChangeOwnPassword={(curr, nw) => store.changeOwnPassword(curr, nw)}
          onUpdateRolePassword={(r, nw) => store.updateRolePasswordBySuperadmin(r, nw)}
          onToast={showToast}
        />
      );
    }

    // 2. Member Area
    if (currentPath.startsWith('/member')) {
      if (auth.role !== 'Member' || !auth.member) {
        return (
          <div className="py-20 text-center space-y-4">
            <h2 className="text-xl font-bold font-heading text-[#0B2A5B]">Akses Khusus Member</h2>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="h-10 px-5 text-sm font-semibold text-white bg-[#0B2A5B] rounded-[12px]"
            >
              Masuk dengan Kode Akses
            </button>
          </div>
        );
      }

      const member = auth.member;
      const progress = store.getProgress(member.id);

      if (currentPath === '/member/kelas') {
        const currentCourse = courses.find((c) => c.id === selectedClassId) || courses[0];
        const isOwned = member.ownedCourses.includes(currentCourse.id);
        return (
          <MemberClassView
            course={currentCourse}
            isOwned={isOwned}
            defaultLynkUrl={cms.identity.lynkUrl}
            modules={store.getModules(currentCourse.id)}
            lessons={store.getLessons()}
            quizzes={store.getQuizzes(currentCourse.id)}
            progress={progress}
            onBack={() => setCurrentPath('/member')}
            onOpenLesson={handleMemberOpenLesson}
            onOpenQuiz={(q) => setActiveQuiz(q)}
            onOpenCertificate={handleMemberOpenCert}
          />
        );
      }

      if (currentPath === '/member/pelajaran') {
        const lesson = store.getLessonById(selectedLessonId || '') || store.getLessons()[0];
        const course = courses.find((c) => c.id === lesson?.courseId);
        const moduleLessons = store.getLessons(lesson?.moduleId);

        return (
          <LessonView
            lesson={lesson}
            courseTitle={course?.name || 'Kembali'}
            allLessons={moduleLessons}
            progress={progress}
            onBackToCourse={() => {
              setSelectedClassId(lesson.courseId);
              setCurrentPath('/member/kelas');
            }}
            onNavigateLesson={(id) => {
              setSelectedLessonId(id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onToggleComplete={(id) => store.toggleLessonCompleted(member.id, id)}
            onToggleStep={(lId, sId) => store.toggleStepCompleted(member.id, lId, sId)}
            onSaveNote={(lId, nt) => store.saveNote(member.id, lId, nt)}
            onDownloadFile={handleDownloadFile}
            onToast={showToast}
          />
        );
      }

      if (currentPath === '/member/skill') {
        return (
          <SkillLibraryPage
            member={member}
            courses={courses}
            downloads={downloads}
            defaultLynkUrl={cms.identity.lynkUrl}
            onBack={() => setCurrentPath('/member')}
            onDownloadFile={handleDownloadFile}
          />
        );
      }

      if (currentPath === '/member/sertifikat') {
        const certCourse = courses.find((c) => c.id === certCourseId) || courses[0];
        const certData = progress.certificates[certCourse.id];
        return (
          <CertificateView
            member={member}
            course={certCourse}
            certNumber={certData?.certNumber || 'GS-2026-1001'}
            issuedAt={certData?.issuedAt || new Date().toISOString()}
            onBack={() => setCurrentPath('/member')}
          />
        );
      }

      if (currentPath === '/member/pengumuman') {
        return (
          <MemberAnnouncementsPage
            announcements={announcements}
            onBack={() => setCurrentPath('/member')}
          />
        );
      }

      if (currentPath === '/member/profil') {
        return (
          <ProfilePage
            member={member}
            courses={courses}
            onChangePassword={(curr, nw) => store.changeOwnPassword(curr, nw)}
            onToast={showToast}
          />
        );
      }

      // Default member view: MemberDashboard
      return (
        <MemberDashboard
          member={member}
          courses={courses}
          lessons={store.getLessons()}
          progress={progress}
          announcements={announcements}
          onOpenClass={handleMemberOpenClass}
          onOpenLesson={handleMemberOpenLesson}
          onOpenSkills={() => setCurrentPath('/member/skill')}
          onOpenCertificates={handleMemberOpenCert}
          onOpenAnnouncements={() => setCurrentPath('/member/pengumuman')}
        />
      );
    }

    // 3. Public Views
    if (currentPath === '/') {
      return (
        <HomePage
          cms={cms}
          courses={courses}
          appExamples={appExamples}
          testimonials={testimonials}
          faqs={faq}
          onNavigate={handleNavigate}
          onOpenClassDetail={handleOpenClassDetail}
        />
      );
    }

    if (currentPath === '/kelas') {
      return (
        <ClassesPage
          courses={courses}
          defaultLynkUrl={cms.identity.lynkUrl}
          onOpenClassDetail={handleOpenClassDetail}
        />
      );
    }

    if (currentPath === '/kelas-detail') {
      const selectedCourse = courses.find((c) => c.id === selectedClassId) || courses[0];
      return (
        <ClassDetailPage
          course={selectedCourse}
          modules={store.getModules(selectedCourse.id)}
          lessons={store.getLessons()}
          defaultLynkUrl={cms.identity.lynkUrl}
          onBack={() => setCurrentPath('/kelas')}
        />
      );
    }

    if (currentPath === '/contoh') {
      return <ExamplesPage examples={appExamples} />;
    }

    if (currentPath === '/tentang') {
      return <AboutPage />;
    }

    if (currentPath === '/kontak') {
      return (
        <ContactPage
          cms={cms}
          onSubmitContact={(nm, wa, msg) => store.addContact({ name: nm, whatsapp: wa, message: msg })}
          onSuccessToast={(m) => showToast(m)}
        />
      );
    }

    if (currentPath === '/halaman') {
      const pageData = cms.pages.find((p) => p.slug === staticPageSlug) || cms.pages[0];
      return (
        <StaticPageView
          title={pageData?.title || 'Informasi'}
          content={pageData?.content || ''}
          onBack={() => setCurrentPath('/')}
        />
      );
    }

    return <NotFoundPage onBackHome={() => setCurrentPath('/')} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F1F5F9]">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Running Text Announcement Banner */}
      <div className="no-print">
        <RunningTextBanner settings={cms.runningText} />
      </div>

      {/* Navigation Header */}
      <div className="no-print">
        <Navbar
          cms={cms}
          currentPath={currentPath}
          role={auth.role}
          isOnline={isOnline}
          canInstall={canInstall}
          onNavigate={handleNavigate}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onLogout={() => {
            store.logout();
            setCurrentPath('/');
            showToast('Berhasil keluar');
          }}
          onInstall={installApp}
        />
      </div>

      {/* Main View Area */}
      <main className="flex-1">
        {renderCurrentView()}
      </main>

      {/* Public Footer */}
      {!currentPath.startsWith('/admin') && (
        <div className="no-print">
          <Footer cms={cms} onNavigate={handleNavigate} />
        </div>
      )}

      {/* Floating WhatsApp button on public pages */}
      {!currentPath.startsWith('/admin') && !currentPath.startsWith('/member') && cms.features.floatingWhatsApp && (
        <div className="no-print">
          <WhatsAppFloating phone={cms.identity.whatsapp} />
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={(pwd) => store.loginWithPassword(pwd)}
        onSuccess={(r) => {
          showToast(`Berhasil masuk sebagai ${r}`);
          if (r === 'Superadmin' || r === 'Admin') {
            setCurrentPath('/admin');
          } else {
            setCurrentPath('/member');
          }
        }}
      />

      {/* Interactive Quiz Modal */}
      {activeQuiz && auth.member && (
        <QuizModal
          quiz={activeQuiz}
          isOpen={!!activeQuiz}
          onClose={() => setActiveQuiz(null)}
          onSubmitResult={(score, passed) => {
            store.submitQuiz(auth.member!.id, activeQuiz.moduleId, activeQuiz.courseId, score, passed);
            if (passed) {
              showToast(`Lulus kuis dengan nilai ${score}%!`);
            } else {
              showToast(`Nilai ${score}%. Anda dapat mengulang kuis.`, 'info');
            }
          }}
        />
      )}
    </div>
  );
}

export default App;
