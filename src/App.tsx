import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HomePage } from './pages/public/HomePage';
import { LandingPage } from './pages/public/LandingPage';
import { UploadProofPage } from './pages/public/UploadProofPage';
import { LoginPage } from './pages/public/LoginPage';
import { CheckStatusPage } from './pages/public/CheckStatusPage';
import { MemberDashboard } from './pages/member/MemberDashboard';
import { MemberCourseView } from './pages/member/MemberCourseView';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminTestimonials } from './pages/admin/AdminTestimonials';
import { AdminSettings } from './pages/admin/AdminSettings';

const AppRouter: React.FC = () => {
  const { currentRoute, products, currentUser, navigate } = useApp();

  // Normalize path
  const path = currentRoute.split('?')[0];

  // Check static public & admin routes
  if (path === '/' || path === '') {
    return <HomePage />;
  }

  if (path === '/admin') {
    return currentUser.role === 'admin' ? <AdminDashboard /> : <LoginPage isAdmin={true} />;
  }

  if (path === '/login') {
    return <LoginPage isAdmin={false} />;
  }

  if (path === '/admin/login') {
    return <LoginPage isAdmin={true} />;
  }

  if (path === '/cek-status') {
    return <CheckStatusPage />;
  }

  if (path === '/upload-bukti' || path.startsWith('/daftar/') && path.includes('/bukti-bayar')) {
    return <UploadProofPage />;
  }

  // Admin Protected Routes
  if (path === '/admin/dashboard') {
    return <AdminDashboard />;
  }
  if (path === '/admin/produk') {
    return <AdminProducts />;
  }
  if (path === '/admin/pesanan') {
    return <AdminOrders />;
  }
  if (path === '/admin/testimoni') {
    return <AdminTestimonials />;
  }
  if (path === '/admin/pengaturan') {
    return <AdminSettings />;
  }

  // Member Area Routes
  if (path === '/member') {
    return <MemberDashboard />;
  }

  if (path.startsWith('/member/')) {
    const slug = path.replace('/member/', '');
    const product = products.find((p) => p.slug === slug);
    if (product) {
      return <MemberCourseView product={product} />;
    }
    return <MemberDashboard />;
  }

  // Landing Page per product slug (e.g. /kelaswebapp, /beliwebsite)
  const productSlug = path.startsWith('/') ? path.substring(1) : path;
  const matchedProduct = products.find((p) => p.slug === productSlug);

  if (matchedProduct) {
    return <LandingPage product={matchedProduct} />;
  }

  // Fallback to HomePage
  return <HomePage />;
};

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
