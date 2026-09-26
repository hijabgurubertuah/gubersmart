import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Order,
  Testimonial,
  Category,
  AppSettings,
  UserSession,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_TESTIMONIALS,
  INITIAL_CATEGORIES,
  INITIAL_SETTINGS,
} from '../data/mockData';
import { ToastMessage, ToastType, ToastContainer } from '../components/ui/Toast';

interface AppContextType {
  products: Product[];
  orders: Order[];
  testimonials: Testimonial[];
  categories: Category[];
  settings: AppSettings;
  currentUser: UserSession;
  currentRoute: string;
  navigate: (path: string) => void;
  showToast: (message: string, type?: ToastType) => void;
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  // Order actions
  createOrder: (data: {
    productId: string;
    customerName: string;
    customerEmail: string;
    customerWhatsapp: string;
  }) => Order;
  submitPaymentProof: (orderId: string, proofUrl: string, fileName: string) => Promise<boolean>;
  approveOrder: (orderId: string) => void;
  rejectOrder: (orderId: string, reason?: string) => void;
  // Testimonials
  addTestimonial: (t: Omit<Testimonial, 'id'>) => void;
  deleteTestimonial: (id: string) => void;
  // Settings & Categories
  updateSettings: (s: Partial<AppSettings>) => void;
  addCategory: (name: string) => void;
  deleteCategory: (id: string) => void;
  // Auth
  loginAsMember: (email: string, password?: string) => { success: boolean; message?: string };
  loginAsAdmin: (email: string, password?: string) => { success: boolean; message?: string };
  logout: () => void;
  // Notification badges
  totalPendingApprovals: number;
  getPendingCountByProduct: (productId: string) => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'gubersmart_products_v1',
  ORDERS: 'gubersmart_orders_v1',
  TESTIMONIALS: 'gubersmart_testimonials_v1',
  CATEGORIES: 'gubersmart_categories_v1',
  SETTINGS: 'gubersmart_settings_v1',
  USER: 'gubersmart_user_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from local storage or defaults
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TESTIMONIALS);
    return saved ? JSON.parse(saved) : INITIAL_TESTIMONIALS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [currentUser, setCurrentUser] = useState<UserSession>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : { role: 'guest', email: '', name: '', approvedProductIds: [] };
  });

  // Simple client routing state
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const path = window.location.pathname;
    return path && path !== '' ? path : '/';
  });

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentRoute(path);
    window.scrollTo(0, 0);
  };

  // Helper calculation for pending approval counts
  const totalPendingApprovals = orders.filter((o) => o.status === 'Menunggu Approval').length;

  const getPendingCountByProduct = (productId: string) => {
    return orders.filter(
      (o) => o.productId === productId && o.status === 'Menunggu Approval'
    ).length;
  };

  // Product management
  const addProduct = (newProd: Omit<Product, 'id' | 'createdAt'>) => {
    const id = `prod-${Date.now()}`;
    const product: Product = {
      ...newProd,
      id,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProducts((prev) => [product, ...prev]);
    showToast('Produk baru berhasil ditambahkan');
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    showToast('Perubahan produk tersimpan');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Produk telah dihapus', 'info');
  };

  // Order management
  const createOrder = ({
    productId,
    customerName,
    customerEmail,
    customerWhatsapp,
  }: {
    productId: string;
    customerName: string;
    customerEmail: string;
    customerWhatsapp: string;
  }): Order => {
    const prod = products.find((p) => p.id === productId);
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      productId,
      productName: prod ? prod.name : 'Produk Digital',
      productPrice: prod ? prod.price : 0,
      customerName,
      customerEmail: customerEmail.trim().toLowerCase(),
      customerWhatsapp,
      status: 'Menunggu Pembayaran',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const submitPaymentProof = async (
    orderId: string,
    proofUrl: string,
    fileName: string
  ): Promise<boolean> => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;

    // Simulate Google Apps Script Webhook payload & Google Drive file naming
    const sanitizedFileName = `${order.customerEmail}_bukti_bayar.jpg`;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'Menunggu Approval',
              paymentProofUrl: proofUrl,
              paymentProofFileName: sanitizedFileName,
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    );

    // Simulate automatic WhatsApp & Email notification trigger to Admin
    showToast('Bukti transfer terkirim. Menunggu konfirmasi admin');
    return true;
  };

  const approveOrder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: 'Disetujui', updatedAt: new Date().toISOString() }
          : o
      )
    );

    // Update member session if logged in with matching email
    if (currentUser.email === order.customerEmail) {
      setCurrentUser((prev) => ({
        ...prev,
        approvedProductIds: Array.from(new Set([...prev.approvedProductIds, order.productId])),
      }));
    }

    showToast(`Pesanan ${order.customerName} disetujui`);
  };

  const rejectOrder = (orderId: string, reason?: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'Ditolak',
              rejectionReason: reason || 'Bukti transfer tidak valid atau belum terverifikasi',
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    );

    showToast(`Pesanan ditolak`, 'error');
  };

  // Testimonials
  const addTestimonial = (t: Omit<Testimonial, 'id'>) => {
    const newTest: Testimonial = {
      ...t,
      id: `test-${Date.now()}`,
    };
    setTestimonials((prev) => [newTest, ...prev]);
    showToast('Testimoni berhasil ditambahkan');
  };

  const deleteTestimonial = (id: string) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    showToast('Testimoni dihapus', 'info');
  };

  // Settings
  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    showToast('Pengaturan sistem diperbarui');
  };

  const addCategory = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name,
      slug,
    };
    setCategories((prev) => [...prev, newCat]);
    showToast('Kategori baru ditambahkan');
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('Kategori dihapus', 'info');
  };

  // Auth functions
  const loginAsMember = (email: string, _password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const userOrders = orders.filter(
      (o) => o.customerEmail.toLowerCase() === cleanEmail
    );

    if (userOrders.length === 0) {
      return {
        success: false,
        message: 'Email belum terdaftar. Silakan lakukan pendaftaran produk terlebih dahulu.',
      };
    }

    const approvedOrders = userOrders.filter((o) => o.status === 'Disetujui');
    const pendingOrders = userOrders.filter((o) => o.status === 'Menunggu Approval' || o.status === 'Menunggu Pembayaran');

    if (approvedOrders.length === 0 && pendingOrders.length > 0) {
      return {
        success: false,
        message: 'Status pendaftaran Anda masih menunggu verifikasi admin.',
      };
    }

    const approvedProductIds = approvedOrders.map((o) => o.productId);
    const customerName = userOrders[0].customerName || cleanEmail.split('@')[0];

    const session: UserSession = {
      role: 'member',
      email: cleanEmail,
      name: customerName,
      approvedProductIds,
    };

    setCurrentUser(session);
    showToast(`Selamat datang kembali, ${customerName}`);
    return { success: true };
  };

  const loginAsAdmin = (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    // Default admin credential test
    if (
      cleanEmail === 'admin@gubersmart.my.id' ||
      cleanEmail === 'gubersmart@gmail.com' ||
      cleanEmail === 'admin'
    ) {
      if (password && password !== 'admin123' && password !== 'admin') {
        return { success: false, message: 'Password admin salah.' };
      }
      const session: UserSession = {
        role: 'admin',
        email: cleanEmail,
        name: 'Administrator',
        approvedProductIds: products.map((p) => p.id),
      };
      setCurrentUser(session);
      showToast('Login admin berhasil');
      return { success: true };
    }

    return {
      success: false,
      message: 'Email atau kredensial admin tidak cocok.',
    };
  };

  const logout = () => {
    setCurrentUser({ role: 'guest', email: '', name: '', approvedProductIds: [] });
    navigate('/');
    showToast('Anda telah keluar akun', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        products,
        orders,
        testimonials,
        categories,
        settings,
        currentUser,
        currentRoute,
        navigate,
        showToast,
        addProduct,
        updateProduct,
        deleteProduct,
        createOrder,
        submitPaymentProof,
        approveOrder,
        rejectOrder,
        addTestimonial,
        deleteTestimonial,
        updateSettings,
        addCategory,
        deleteCategory,
        loginAsMember,
        loginAsAdmin,
        logout,
        totalPendingApprovals,
        getPendingCountByProduct,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
