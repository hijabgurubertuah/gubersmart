export type ProductStatus = 'Tayang' | 'Draft';

export type OrderStatus = 'Menunggu Pembayaran' | 'Menunggu Approval' | 'Disetujui' | 'Ditolak';

export interface VideoPart {
  id: string;
  partNumber: number;
  title: string;
  description: string;
  youtubeUrlOrId: string;
  duration?: string;
}

export interface LandingPageContent {
  headline: string;
  subheadline: string;
  benefits: string[];
  features: {
    title: string;
    desc: string;
  }[];
  faq: {
    q: string;
    a: string;
  }[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  coverUrl: string;
  shortDescription: string;
  status: ProductStatus;
  lynkIdUrl: string;
  bonusFileUrl?: string;
  bonusFileName?: string;
  landingPage: LandingPageContent;
  videos: VideoPart[];
  createdAt: string;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  customerName: string;
  customerEmail: string;
  customerWhatsapp: string;
  status: OrderStatus;
  paymentProofUrl?: string;
  paymentProofFileName?: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
}

export interface Testimonial {
  id: string;
  productId: string;
  customerName: string;
  customerRole: string;
  content: string;
  rating: number;
  date: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface AppSettings {
  brandName: string;
  brandTagline: string;
  adminEmail: string;
  adminWhatsapp: string;
  googleAppsScriptUrl: string;
  waApiKey: string;
  defaultLynkId: string;
}

export interface UserSession {
  role: 'guest' | 'member' | 'admin';
  email: string;
  name: string;
  approvedProductIds: string[];
}
