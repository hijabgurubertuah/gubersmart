import { Product, Order, Testimonial, Category, AppSettings } from '../types';
import coverWebApp from '../assets/images/cover_web_app_course_1790430804962.jpg';
import coverWebsite from '../assets/images/cover_website_service_1790430821043.jpg';
import coverToolkit from '../assets/images/cover_digital_toolkit_1790430833271.jpg';
import coverSaas from '../assets/images/cover_saas_template_1790430848394.jpg';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Kelas Belajar', slug: 'kelas-belajar' },
  { id: 'cat-2', name: 'Jasa Website', slug: 'jasa-website' },
  { id: 'cat-3', name: 'Tutorial & Asset', slug: 'tutorial-asset' },
  { id: 'cat-4', name: 'Template Web', slug: 'template-web' },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Kelas Belajar Membuat Web App Full-Stack',
    slug: 'kelaswebapp',
    category: 'Kelas Belajar',
    price: 299000,
    coverUrl: coverWebApp,
    shortDescription: 'Panduan langkah-demi-langkah membangun aplikasi web modern dari nol hingga online dan siap monetisasi.',
    status: 'Tayang',
    lynkIdUrl: 'https://lynk.id/gubersmart/kelaswebapp',
    bonusFileUrl: 'https://drive.google.com/drive/folders/1gubersmart-skill-template-fullstack',
    bonusFileName: 'Modul-SourceCode-FullStack-2026.zip',
    landingPage: {
      headline: 'Kuasai Pembuatan Web App Modern dan Hasilkan Karya Nyata',
      subheadline: 'Belajar langsung melalui studi kasus real: frontend React, backend API, database Firestore, dan deployment mandiri.',
      benefits: [
        'Akses seumur hidup ke seluruh modul video interaktif',
        'Download file boilerplate dan template project siap pakai',
        'Studi kasus pembuatan sistem login, member area & payment gateway',
        'Pembaruan materi berkala tanpa biaya tambahan'
      ],
      features: [
        {
          title: 'Fondasi Modern Web App',
          desc: 'Memahami arsitektur React, state management, Tailwind CSS, dan komponen modular.'
        },
        {
          title: 'Integrasi Database & Autentikasi',
          desc: 'Mengonfigurasi Firebase Firestore, user roles, dan proteksi hak akses.'
        },
        {
          title: 'Monetisasi & Payment Gateway',
          desc: 'Integrasi alur checkout Lynk.id, upload bukti bayar, dan approval otomatis.'
        },
        {
          title: 'Deploy PWA & Custom Domain',
          desc: 'Konfigurasi Progressive Web App, manifest, service worker, dan domain sendiri.'
        }
      ],
      faq: [
        {
          q: 'Apakah pemula tanpa pengalaman coding bisa ikut?',
          a: 'Bisa. Materi disusun secara terstruktur mulai dari dasar hingga tingkat mahir dengan contoh praktis.'
        },
        {
          q: 'Bagaimana cara mengakses video materi setelah bayar?',
          a: 'Setelah pembayaran terkonfirmasi, Anda cukup login ke Member Area menggunakan email dan password terdaftar.'
        },
        {
          q: 'Berapa lama masa aktif akses member?',
          a: 'Akses berlaku seumur hidup (lifetime) termasuk seluruh materi update di masa mendatang.'
        }
      ]
    },
    videos: [
      {
        id: 'vid-1-1',
        partNumber: 1,
        title: 'Pengenalan Arsitektur Web App & Setup Project',
        description: 'Menyiapkan workspace Vite, React, Tailwind CSS, dan struktur folder standar industri.',
        youtubeUrlOrId: 'dQw4w9WgXcQ',
        duration: '18:40'
      },
      {
        id: 'vid-1-2',
        partNumber: 2,
        title: 'Membangun Landing Page Konversi Tinggi',
        description: 'Implementasi komponen hero, kartu produk, testimoni, dan form pendaftaran interaktif.',
        youtubeUrlOrId: 'L_LUpnjgPso',
        duration: '24:15'
      },
      {
        id: 'vid-1-3',
        partNumber: 3,
        title: 'Manajemen State & Database Firestore',
        description: 'Menyimpan data pendaftaran, produk, dan pesanan secara terstruktur dengan Firestore.',
        youtubeUrlOrId: 'kJQP7kiw5Fk',
        duration: '32:10'
      },
      {
        id: 'vid-1-4',
        partNumber: 4,
        title: 'Proteksi Member Area & Role-Based Access',
        description: 'Sistem autentikasi email, verifikasi status persetujuan member, dan proteksi rute.',
        youtubeUrlOrId: 'fJ9rUzIMcZQ',
        duration: '21:05'
      },
      {
        id: 'vid-1-5',
        partNumber: 5,
        title: 'Konfigurasi PWA & Deployment Domain gubersmart.my.id',
        description: 'Memasang manifest PWA, service worker, serta menghubungkan custom domain.',
        youtubeUrlOrId: '9bZkp7q19f0',
        duration: '15:50'
      }
    ],
    createdAt: '2026-03-01'
  },
  {
    id: 'prod-2',
    name: 'Jasa Pembuatan Website Bisnis & Portofolio',
    slug: 'beliwebsite',
    category: 'Jasa Website',
    price: 750000,
    coverUrl: coverWebsite,
    shortDescription: 'Layanan pembuatan website profesional cepat jadi, responsif di HP/desktop, SEO friendly, dan siap pakai.',
    status: 'Tayang',
    lynkIdUrl: 'https://lynk.id/gubersmart/beliwebsite',
    bonusFileUrl: 'https://drive.google.com/drive/folders/1gubersmart-panduan-kelola-web',
    bonusFileName: 'Panduan-Admin-Kelola-Konten.pdf',
    landingPage: {
      headline: 'Tingkatkan Kredibilitas Usaha dengan Website Modern & Cepat',
      subheadline: 'Kami buatkan website bisnis siap pakai lengkap dengan custom domain, hosting aman, dan panel pengelola konten.',
      benefits: [
        'Desain eksklusif dan profesional sesuai identitas bisnis Anda',
        'Optimal di semua perangkat: HP, tablet, dan laptop',
        'Dilengkapi formulir kontak langsung ke WhatsApp admin',
        'Garansi perbaikan teknis dan panduan operasional gratis'
      ],
      features: [
        {
          title: 'Pengerjaan Cepat & Rapi',
          desc: 'Website selesai dalam 3-5 hari kerja dengan standar kualitas tinggi.'
        },
        {
          title: 'Integrasi WhatsApp Langsung',
          desc: 'Tombol kontak otomatis menghubungkan calon pelanggan langsung ke WhatsApp Anda.'
        },
        {
          title: 'Kecepatan Muat Maksimal',
          desc: 'Optimasi performa tinggi untuk kenyamanan pengunjung dan skor SEO prima.'
        },
        {
          title: 'Domain & SSL Aman',
          desc: 'Sudah termasuk konfigurasi sertifikat SSL HTTPS untuk keamanan data.'
        }
      ],
      faq: [
        {
          q: 'Berapa lama proses pembuatan website?',
          a: 'Rata-rata 3 hingga 5 hari kerja setelah data dan materi bisnis Anda kami terima.'
        },
        {
          q: 'Apakah bisa meminta revisi desain?',
          a: 'Bisa, kami menyediakan 3 kali sesi revisi minor hingga website sesuai kebutuhan Anda.'
        }
      ]
    },
    videos: [
      {
        id: 'vid-2-1',
        partNumber: 1,
        title: 'Panduan Mengirim Data & Brief Website Anda',
        description: 'Langkah pengisian formulir kebutuhan nama domain, profil usaha, dan logo.',
        youtubeUrlOrId: 'L_LUpnjgPso',
        duration: '10:30'
      },
      {
        id: 'vid-2-2',
        partNumber: 2,
        title: 'Tutorial Mengelola Panel Konten & Menambah Halaman',
        description: 'Cara mudah memperbarui teks, mengganti foto, dan melihat pesan masuk.',
        youtubeUrlOrId: 'dQw4w9WgXcQ',
        duration: '14:20'
      }
    ],
    createdAt: '2026-03-05'
  },
  {
    id: 'prod-3',
    name: 'Digital Creator Toolkit & Prompt Engineering',
    slug: 'digitaltoolkit',
    category: 'Tutorial & Asset',
    price: 149000,
    coverUrl: coverToolkit,
    shortDescription: 'Koleksi aset digital, prompt sistem terbaik, dan workflow praktis untuk akselerasi pembuatan konten.',
    status: 'Tayang',
    lynkIdUrl: 'https://lynk.id/gubersmart/digitaltoolkit',
    bonusFileUrl: 'https://drive.google.com/drive/folders/1gubersmart-prompts-pack',
    bonusFileName: 'Master-Prompts-Bank-2026.zip',
    landingPage: {
      headline: 'Koleksi Template & Prompt Pilihan untuk Hasil Maksimal',
      subheadline: 'Lebih dari 200+ formula prompt teruji dan kumpulan aset digital siap pakai untuk desainer dan kreator.',
      benefits: [
        'Akses kumpulan prompt copywriting, UI design, dan coding',
        'Template siap pakai yang terbukti menghemat waktu berjam-jam',
        'Bonus update berkala setiap bulan'
      ],
      features: [
        {
          title: 'Formula Prompt Teruji',
          desc: 'Dibuat berdasarkan ribuan jam pengujian untuk menghasilkan output presisi.'
        },
        {
          title: 'Aset Grafis & UI Components',
          desc: 'Kumpulan komponen UI siap import untuk percepatan desain.'
        }
      ],
      faq: [
        {
          q: 'Apakah format file mudah dibuka?',
          a: 'Ya, seluruh berkas tersimpan dalam Google Drive dengan format Notion, PDF, dan ZIP.'
        }
      ]
    },
    videos: [
      {
        id: 'vid-3-1',
        partNumber: 1,
        title: 'Memahami Struktur Prompt yang Efektif',
        description: 'Prinsip dasar pembuatan instruksi AI tanpa ambigu.',
        youtubeUrlOrId: 'kJQP7kiw5Fk',
        duration: '12:15'
      }
    ],
    createdAt: '2026-03-10'
  },
  {
    id: 'prod-4',
    name: 'Template SaaS Dashboard & Member Portal React',
    slug: 'saastemplate',
    category: 'Template Web',
    price: 349000,
    coverUrl: coverSaas,
    shortDescription: 'Source code boilerplate aplikasi web siap pakai dengan autentikasi, dashboard analitik, dan role admin.',
    status: 'Draft',
    lynkIdUrl: 'https://lynk.id/gubersmart/saastemplate',
    bonusFileUrl: 'https://drive.google.com/drive/folders/1gubersmart-saas-template-source',
    bonusFileName: 'SaaS-Portal-Boilerplate.zip',
    landingPage: {
      headline: 'Luncurkan Produk Digital Anda Lebih Cepat dengan Template Ini',
      subheadline: 'Boilerplate production-grade dengan UI Tailwind, state management, dan auth siap pakai.',
      benefits: [
        'Hemat waktu pengembangan hingga puluhan jam kerja',
        'Kode bersih dengan TypeScript dan standar modern'
      ],
      features: [
        {
          title: 'Clean Architecture',
          desc: 'Struktur kode modular dan mudah dimodifikasi.'
        }
      ],
      faq: [
        {
          q: 'Apakah boleh digunakan untuk project klien?',
          a: 'Boleh, lisensi komersial tanpa batas pemakaian.'
        }
      ]
    },
    videos: [
      {
        id: 'vid-4-1',
        partNumber: 1,
        title: 'Setup & Konfigurasi Template SaaS',
        description: 'Langkah instalasi dependencies dan deployment ke server.',
        youtubeUrlOrId: 'fJ9rUzIMcZQ',
        duration: '16:00'
      }
    ],
    createdAt: '2026-03-15'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    productId: 'prod-1',
    productName: 'Kelas Belajar Membuat Web App Full-Stack',
    productPrice: 299000,
    customerName: 'Budi Santoso',
    customerEmail: 'budi.santoso@gmail.com',
    customerWhatsapp: '081234567890',
    status: 'Disetujui',
    paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    paymentProofFileName: 'budi.santoso@gmail.com_bukti_bayar.jpg',
    createdAt: '2026-03-24T10:15:00',
    updatedAt: '2026-03-24T11:00:00'
  },
  {
    id: 'ord-102',
    productId: 'prod-1',
    productName: 'Kelas Belajar Membuat Web App Full-Stack',
    productPrice: 299000,
    customerName: 'Ahmad Rizki',
    customerEmail: 'ahmad.rizki@gmail.com',
    customerWhatsapp: '082198765432',
    status: 'Menunggu Approval',
    paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    paymentProofFileName: 'ahmad.rizki@gmail.com_bukti_bayar.jpg',
    createdAt: '2026-03-26T08:30:00',
    updatedAt: '2026-03-26T08:35:00'
  },
  {
    id: 'ord-103',
    productId: 'prod-2',
    productName: 'Jasa Pembuatan Website Bisnis & Portofolio',
    productPrice: 750000,
    customerName: 'Siti Nurhaliza',
    customerEmail: 'siti.nurhaliza@gmail.com',
    customerWhatsapp: '085712349999',
    status: 'Menunggu Approval',
    paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    paymentProofFileName: 'siti.nurhaliza@gmail.com_bukti_bayar.jpg',
    createdAt: '2026-03-26T09:12:00',
    updatedAt: '2026-03-26T09:15:00'
  },
  {
    id: 'ord-104',
    productId: 'prod-3',
    productName: 'Digital Creator Toolkit & Prompt Engineering',
    productPrice: 149000,
    customerName: 'Dimas Pratama',
    customerEmail: 'dimas.pratama@gmail.com',
    customerWhatsapp: '081399887766',
    status: 'Menunggu Pembayaran',
    createdAt: '2026-03-26T09:45:00',
    updatedAt: '2026-03-26T09:45:00'
  },
  {
    id: 'ord-105',
    productId: 'prod-1',
    productName: 'Kelas Belajar Membuat Web App Full-Stack',
    productPrice: 299000,
    customerName: 'Member Demo',
    customerEmail: 'member@gubersmart.my.id',
    customerWhatsapp: '081299998888',
    status: 'Disetujui',
    paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    paymentProofFileName: 'member@gubersmart.my.id_bukti_bayar.jpg',
    createdAt: '2026-03-20T14:00:00',
    updatedAt: '2026-03-20T14:30:00'
  }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    productId: 'prod-1',
    customerName: 'Hendra Kusuma',
    customerRole: 'Freelance Web Developer',
    content: 'Materi kelas sangat runtut dan langsung ke intinya. Dalam 1 minggu saya sudah bisa membuat member area sendiri untuk produk digital saya.',
    rating: 5,
    date: '2026-03-18'
  },
  {
    id: 'test-2',
    productId: 'prod-1',
    customerName: 'Dewi Lestari',
    customerRole: 'Content Creator',
    content: 'Penjelasannya sangat mudah dipahami bahkan untuk yang bukan lulusan IT. Sangat recommended untuk yang ingin punya website sendiri.',
    rating: 5,
    date: '2026-03-21'
  },
  {
    id: 'test-3',
    productId: 'prod-2',
    customerName: 'Rudi Hermawan',
    customerRole: 'Owner Kuliner Nusantara',
    content: 'Jasa pembuatan websitenya sangat cepat dan hasilnya elegan. Pelanggan sekarang langsung order lewat link WhatsApp di web.',
    rating: 5,
    date: '2026-03-15'
  }
];

export const INITIAL_SETTINGS: AppSettings = {
  brandName: 'GuberSmart',
  brandTagline: 'Platform Penjualan & Member Area Produk Digital',
  adminEmail: 'gubersmart@gmail.com',
  adminWhatsapp: '6281234567890',
  googleAppsScriptUrl: 'https://script.google.com/macros/s/AKfycbx_GuberSmart_Upload_API_Sim/exec',
  waApiKey: 'FONNTE_API_KEY_GUBERSMART_2026',
  defaultLynkId: 'https://lynk.id/gubersmart'
};
