import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  collection,
  onSnapshot,
} from 'firebase/firestore';
import { db, testConnection, handleFirestoreError, OperationType, sanitizeForQuota } from './firebase';
import { CMSSettings, Course, Announcement, Testimonial, AppExample, FaqItem, Member, UserProgress, ContactMessage } from '../types';
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

    // 4. Sync App Examples from Firestore
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

    // 5. Sync Testimonials from Firestore
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

    // 6. Sync FAQs from Firestore
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

  public async syncMember(member: Member): Promise<void> {
    try {
      const sanitized = sanitizeForQuota(member);
      const docRef = doc(db, 'members', member.id);
      await setDoc(docRef, sanitized, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `members/${member.id}`);
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
  syncAnnouncement: (ann) => {
    firebaseSync.syncAnnouncement(ann).catch((e) => console.warn('Sync Announcement warning:', e));
  },
  deleteAnnouncement: (id) => {
    firebaseSync.deleteAnnouncement(id).catch((e) => console.warn('Delete Announcement warning:', e));
  },
  syncMember: (m) => {
    firebaseSync.syncMember(m).catch((e) => console.warn('Sync Member warning:', e));
  },
  syncProgress: (p) => {
    firebaseSync.syncProgress(p).catch((e) => console.warn('Sync Progress warning:', e));
  },
  syncContactMessage: (msg) => {
    firebaseSync.syncContactMessage(msg).catch((e) => console.warn('Sync Contact warning:', e));
  },
});
