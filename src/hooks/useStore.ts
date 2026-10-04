import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { store } from '../services/store';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export function useStore() {
  // External store subscription tracking store version for instant reactivity
  useSyncExternalStore(
    (callback) => store.subscribe(callback),
    () => store.getVersion()
  );

  // Network online/offline
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // PWA install prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState<boolean>(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 500); // 0.5 detik
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const installApp = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  return {
    store,
    auth: store.getAuth(),
    cms: store.getCMS(),
    isOnline,
    canInstall,
    installApp,
    toasts,
    showToast,
    dismissToast,
    // quick shortcuts
    courses: store.getCourses(),
    members: store.getMembers(),
    downloads: store.getDownloads(),
    appExamples: store.getAppExamples(),
    testimonials: store.getTestimonials(),
    faq: store.getFaq(),
    announcements: store.getAnnouncements(),
    contacts: store.getContacts(),
    logs: store.getLogs(),
  };
}
