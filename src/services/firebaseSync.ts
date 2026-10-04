import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
} from 'firebase/firestore';
import { db, testConnection, handleFirestoreError, OperationType, sanitizeForQuota } from './firebase';
import {
  CMSSettings,
  Course,
  CourseModule,
  Lesson,
  FileDownload,
  Quiz,
  Announcement,
  Testimonial,
  AppExample,
  FaqItem,
  Member,
  UserProgress,
  ContactMessage,
} from '../types';
import { store } from './store';

class FirebaseSyncService {
  private isInitialized = false;
  private isConnected = false;

  public async init(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Test connection
    this.isConnected = await testConnection();
    if (!this.isConnected) {
      console.info('Firebase sync: running in offline/local-first mode.');
    }

    try {
      this.setupListeners();
    } catch (err) {
      console.warn('Could not setup Firebase listeners:', err);
    }
  }

  private setupListeners(): void {
    // 1. Sync CMS Settings from Firestore (Text & Link URLs)
    const cmsDocRef = doc(db, 'cms', 'settings');
    onSnapshot(
      cmsDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const remoteData = snapshot.data() as Partial<CMSSettings>;
          if (remoteData && Object.keys(remoteData).length > 0) {
            store.applyRemoteCMS(remoteData);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'cms/settings');
      }
    );

    // 2. Sync Announcements from Firestore
    const annColRef = collection(db, 'announcements');
    onSnapshot(
      annColRef,
      (snapshot) => {
        const remoteAnnouncements: Announcement[] = [];
        snapshot.forEach((docSnap) => {
          remoteAnnouncements.push(docSnap.data() as Announcement);
        });
        if (remoteAnnouncements.length > 0) {
          store.applyRemoteAnnouncements(remoteAnnouncements);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'announcements');
      }
    );

    // 3. Sync Courses from Firestore (Text, syllabi, links)
    const coursesColRef = collection(db, 'courses');
    onSnapshot(
      coursesColRef,
      (snapshot) => {
        const remoteCourses: Course[] = [];
        snapshot.forEach((docSnap) => {
          remoteCourses.push(docSnap.data() as Course);
        });
        if (remoteCourses.length > 0) {
          store.applyRemoteCourses(remoteCourses);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'courses');
      }
    );

    // 4. Sync Modules from Firestore
    const modulesColRef = collection(db, 'modules');
    onSnapshot(
      modulesColRef,
      (snapshot) => {
        const remoteModules: CourseModule[] = [];
        snapshot.forEach((docSnap) => {
          remoteModules.push(docSnap.data() as CourseModule);
        });
        if (remoteModules.length > 0) {
          store.applyRemoteModules(remoteModules);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'modules');
      }
    );

    // 5. Sync Lessons from Firestore
    const lessonsColRef = collection(db, 'lessons');
    onSnapshot(
      lessonsColRef,
      (snapshot) => {
        const remoteLessons: Lesson[] = [];
        snapshot.forEach((docSnap) => {
          remoteLessons.push(docSnap.data() as Lesson);
        });
        if (remoteLessons.length > 0) {
          store.applyRemoteLessons(remoteLessons);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'lessons');
      }
    );

    // 6. Sync Downloads / Skill Claude Library from Firestore
    const downloadsColRef = collection(db, 'downloads');
    onSnapshot(
      downloadsColRef,
      (snapshot) => {
        const remoteDownloads: FileDownload[] = [];
        snapshot.forEach((docSnap) => {
          remoteDownloads.push(docSnap.data() as FileDownload);
        });
        if (remoteDownloads.length > 0) {
          store.applyRemoteDownloads(remoteDownloads);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'downloads');
      }
    );

    // 7. Sync Quizzes from Firestore
    const quizzesColRef = collection(db, 'quizzes');
    onSnapshot(
      quizzesColRef,
      (snapshot) => {
        const remoteQuizzes: Quiz[] = [];
        snapshot.forEach((docSnap) => {
          remoteQuizzes.push(docSnap.data() as Quiz);
        });
        if (remoteQuizzes.length > 0) {
          store.applyRemoteQuizzes(remoteQuizzes);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'quizzes');
      }
    );

    // 8. Sync App Examples from Firestore
    const examplesColRef = collection(db, 'examples');
    onSnapshot(
      examplesColRef,
      (snapshot) => {
        const remoteExamples: AppExample[] = [];
        snapshot.forEach((docSnap) => {
          remoteExamples.push(docSnap.data() as AppExample);
        });
        if (remoteExamples.length > 0) {
          store.applyRemoteExamples(remoteExamples);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'examples');
      }
    );

    // 9. Sync Testimonials from Firestore
    const testimonialsColRef = collection(db, 'testimonials');
    onSnapshot(
      testimonialsColRef,
      (snapshot) => {
        const remoteTestis: Testimonial[] = [];
        snapshot.forEach((docSnap) => {
          remoteTestis.push(docSnap.data() as Testimonial);
        });
        if (remoteTestis.length > 0) {
          store.applyRemoteTestimonials(remoteTestis);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'testimonials');
      }
    );

    // 10. Sync FAQs from Firestore
    const faqsColRef = collection(db, 'faqs');
    onSnapshot(
      faqsColRef,
      (snapshot) => {
        const remoteFaqs: FaqItem[] = [];
        snapshot.forEach((docSnap) => {
          remoteFaqs.push(docSnap.data() as FaqItem);
        });
        if (remoteFaqs.length > 0) {
          store.applyRemoteFaqs(remoteFaqs);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'faqs');
      }
    );

    // 11. Sync Members from Firestore
    const membersColRef = collection(db, 'members');
    onSnapshot(
      membersColRef,
      (snapshot) => {
        const remoteMembers: Member[] = [];
        snapshot.forEach((docSnap) => {
          remoteMembers.push(docSnap.data() as Member);
        });
        if (remoteMembers.length > 0) {
          store.applyRemoteMembers(remoteMembers);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'members');
      }
    );

    // 12. Sync Contact Messages from Firestore
    const contactsColRef = collection(db, 'contact_messages');
    onSnapshot(
      contactsColRef,
      (snapshot) => {
        const remoteContacts: ContactMessage[] = [];
        snapshot.forEach((docSnap) => {
          remoteContacts.push(docSnap.data() as ContactMessage);
        });
        if (remoteContacts.length > 0) {
          store.applyRemoteContacts(remoteContacts);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'contact_messages');
      }
    );
  }

  // --- WRITE METHODS (Text & Links only, stripped of base64 to save quota) ---

  public async syncCMS(cmsData: CMSSettings): Promise<void> {
    try {
      const sanitized = sanitizeForQuota(cmsData);
      const docRef = doc(db, 'cms', 'settings');
      await setDoc(docRef, { ...sanitized, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'cms/settings');
    }
  }

  public async syncCourse(course: Course): Promise<void> {
    try {
      const sanitized = sanitizeForQuota(course);
      const docRef = doc(db, 'courses', course.id);
      await setDoc(docRef, { ...sanitized, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `courses/${course.id}`);
    }
  }

  public async deleteCourse(courseId: string): Promise<void> {
    try {
      const docRef = doc(db, 'courses', courseId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `courses/${courseId}`);
    }
  }

  public async syncModule(moduleData: CourseModule): Promise<void> {
    try {
      const sanitized = sanitizeForQuota(moduleData);
      const docRef = doc(db, 'modules', moduleData.id);
      await setDoc(docRef, { ...sanitized, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `modules/${moduleData.id}`);
    }
  }

  public async deleteModule(moduleId: string): Promise<void> {
    try {
      const docRef = doc(db, 'modules', moduleId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `modules/${moduleId}`);
    }
  }

  public async syncLesson(lesson: Lesson): Promise<void> {
    try {
      const sanitized = sanitizeForQuota(lesson);
      const docRef = doc(db, 'lessons', lesson.id);
      await setDoc(docRef, { ...sanitized, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `lessons/${lesson.id}`);
    }
  }

  public async deleteLesson(lessonId: string): Promise<void> {
    try {
      const docRef = doc(db, 'lessons', lessonId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `lessons/${lessonId}`);
    }
  }

  public async syncDownload(download: FileDownload): Promise<void> {
    try {
      const sanitized = sanitizeForQuota(download);
      const docRef = doc(db, 'downloads', download.id);
      await setDoc(docRef, { ...sanitized, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `downloads/${download.id}`);
    }
  }

  public async deleteDownload(downloadId: string): Promise<void> {
    try {
      const docRef = doc(db, 'downloads', downloadId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `downloads/${downloadId}`);
    }
  }

  public async syncQuiz(quiz: Quiz): Promise<void> {
    try {
      const sanitized = sanitizeForQuota(quiz);
      const docRef = doc(db, 'quizzes', quiz.id);
      await setDoc(docRef, { ...sanitized, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `quizzes/${quiz.id}`);
    }
  }

  public async deleteQuiz(quizId: string): Promise<void> {
    try {
      const docRef = doc(db, 'quizzes', quizId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `quizzes/${quizId}`);
    }
  }

  public async syncAnnouncement(announcement: Announcement): Promise<void> {
    try {
      const sanitized = sanitizeForQuota(announcement);
      const docRef = doc(db, 'announcements', announcement.id);
      await setDoc(docRef, sanitized, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `announcements/${announcement.id}`);
    }
  }

  public async deleteAnnouncement(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'announcements', id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `announcements/${id}`);
    }
  }

  public async syncAppExample(example: AppExample): Promise<void> {
    try {
      const sanitized = sanitizeForQuota(example);
      const docRef = doc(db, 'examples', example.id);
      await setDoc(docRef, sanitized, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `examples/${example.id}`);
    }
  }

  public async deleteAppExample(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'examples', id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `examples/${id}`);
    }
  }

  public async syncTestimonial(testimonial: Testimonial): Promise<void> {
    try {
      const sanitized = sanitizeForQuota(testimonial);
      const docRef = doc(db, 'testimonials', testimonial.id);
      await setDoc(docRef, sanitized, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `testimonials/${testimonial.id}`);
    }
  }

  public async deleteTestimonial(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'testimonials', id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `testimonials/${id}`);
    }
  }

  public async syncFaq(faq: FaqItem): Promise<void> {
    try {
      const sanitized = sanitizeForQuota(faq);
      const docRef = doc(db, 'faqs', faq.id);
      await setDoc(docRef, sanitized, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `faqs/${faq.id}`);
    }
  }

  public async deleteFaq(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'faqs', id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `faqs/${id}`);
    }
  }

  public async syncMember(member: Member): Promise<void> {
    try {
      const sanitized = sanitizeForQuota(member);
      const docRef = doc(db, 'members', member.id);
      await setDoc(docRef, sanitized, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `members/${member.id}`);
    }
  }

  public async deleteMember(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'members', id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `members/${id}`);
    }
  }

  public async syncProgress(progress: UserProgress): Promise<void> {
    try {
      const sanitized = sanitizeForQuota(progress);
      const docRef = doc(db, 'progress', progress.memberId);
      await setDoc(docRef, { ...sanitized, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `progress/${progress.memberId}`);
    }
  }

  public async syncContactMessage(message: ContactMessage): Promise<void> {
    try {
      const sanitized = sanitizeForQuota(message);
      const docRef = doc(db, 'contact_messages', message.id);
      await setDoc(docRef, sanitized);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `contact_messages/${message.id}`);
    }
  }
}

export const firebaseSync = new FirebaseSyncService();

// Hook store mutations to Firebase Sync
store.setSyncHandlers({
  syncCMS: (cms) => {
    firebaseSync.syncCMS(cms).catch((e) => console.warn('Sync CMS warning:', e));
  },
  syncCourse: (course) => {
    firebaseSync.syncCourse(course).catch((e) => console.warn('Sync Course warning:', e));
  },
  deleteCourse: (id) => {
    firebaseSync.deleteCourse(id).catch((e) => console.warn('Delete Course warning:', e));
  },
  syncModule: (mod) => {
    firebaseSync.syncModule(mod).catch((e) => console.warn('Sync Module warning:', e));
  },
  deleteModule: (id) => {
    firebaseSync.deleteModule(id).catch((e) => console.warn('Delete Module warning:', e));
  },
  syncLesson: (lesson) => {
    firebaseSync.syncLesson(lesson).catch((e) => console.warn('Sync Lesson warning:', e));
  },
  deleteLesson: (id) => {
    firebaseSync.deleteLesson(id).catch((e) => console.warn('Delete Lesson warning:', e));
  },
  syncDownload: (file) => {
    firebaseSync.syncDownload(file).catch((e) => console.warn('Sync Download warning:', e));
  },
  deleteDownload: (id) => {
    firebaseSync.deleteDownload(id).catch((e) => console.warn('Delete Download warning:', e));
  },
  syncQuiz: (quiz) => {
    firebaseSync.syncQuiz(quiz).catch((e) => console.warn('Sync Quiz warning:', e));
  },
  deleteQuiz: (id) => {
    firebaseSync.deleteQuiz(id).catch((e) => console.warn('Delete Quiz warning:', e));
  },
  syncAnnouncement: (ann) => {
    firebaseSync.syncAnnouncement(ann).catch((e) => console.warn('Sync Announcement warning:', e));
  },
  deleteAnnouncement: (id) => {
    firebaseSync.deleteAnnouncement(id).catch((e) => console.warn('Delete Announcement warning:', e));
  },
  syncAppExample: (example) => {
    firebaseSync.syncAppExample(example).catch((e) => console.warn('Sync Example warning:', e));
  },
  deleteAppExample: (id) => {
    firebaseSync.deleteAppExample(id).catch((e) => console.warn('Delete Example warning:', e));
  },
  syncTestimonial: (testi) => {
    firebaseSync.syncTestimonial(testi).catch((e) => console.warn('Sync Testimonial warning:', e));
  },
  deleteTestimonial: (id) => {
    firebaseSync.deleteTestimonial(id).catch((e) => console.warn('Delete Testimonial warning:', e));
  },
  syncFaq: (faq) => {
    firebaseSync.syncFaq(faq).catch((e) => console.warn('Sync FAQ warning:', e));
  },
  deleteFaq: (id) => {
    firebaseSync.deleteFaq(id).catch((e) => console.warn('Delete FAQ warning:', e));
  },
  syncMember: (m) => {
    firebaseSync.syncMember(m).catch((e) => console.warn('Sync Member warning:', e));
  },
  deleteMember: (id) => {
    firebaseSync.deleteMember(id).catch((e) => console.warn('Delete Member warning:', e));
  },
  syncProgress: (p) => {
    firebaseSync.syncProgress(p).catch((e) => console.warn('Sync Progress warning:', e));
  },
  syncContactMessage: (msg) => {
    firebaseSync.syncContactMessage(msg).catch((e) => console.warn('Sync Contact warning:', e));
  },
});

