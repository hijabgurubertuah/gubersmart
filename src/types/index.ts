export type Role = 'Publik' | 'Member' | 'Admin' | 'Superadmin';

export type FileSource = 'tautan' | 'drive';

export interface BaseItem {
  id: string;
  order: number;
}

// Content Blocks for Lessons
export type BlockType = 'youtube' | 'text' | 'steps' | 'download' | 'prompt' | 'link' | 'image';

export interface StepItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  startSeconds?: number;
}

export interface YoutubeBlock {
  type: 'youtube';
  videoUrl: string;
  startSeconds?: number;
}

export interface TextBlock {
  type: 'text';
  content: string;
}

export interface StepsBlock {
  type: 'steps';
  steps: StepItem[];
}

export interface DownloadBlock {
  type: 'download';
  name: string;
  category: 'Skill Claude' | 'Template' | 'Dokumen' | 'Lainnya';
  version: string;
  description: string;
  source: FileSource;
  value: string;
  fileId?: string;
}

export interface PromptBlock {
  type: 'prompt';
  content: string;
}

export interface LinkBlock {
  type: 'link';
  label: string;
  url: string;
}

export interface ImageBlock {
  type: 'image';
  source: FileSource;
  value: string;
  caption?: string;
}

export type ContentBlock =
  | YoutubeBlock
  | TextBlock
  | StepsBlock
  | DownloadBlock
  | PromptBlock
  | LinkBlock
  | ImageBlock;

// Courses, Modules, Lessons
export interface Course {
  id: string;
  name: string;
  summary: string;
  description: string;
  price: number;
  lynkUrl: string;
  coverSource: FileSource;
  coverValue: string;
  status: 'tampil' | 'sembunyi';
  order: number;
  duration: string;
  modulesCount?: number;
  lessonsCount?: number;
  whatYouWillLearn: string[];
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  order: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  duration: string;
  order: number;
  blocks: ContentBlock[];
}

// Downloads / Skill Claude Library
export interface FileDownload {
  id: string;
  name: string;
  category: 'Skill Claude' | 'Template' | 'Dokumen' | 'Lainnya';
  version: string;
  description: string;
  source: FileSource;
  value: string;
  courseId: string;
  downloadCount: number;
  updatedAt: string;
}

// Quiz
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Quiz {
  id: string;
  moduleId: string;
  courseId: string;
  passingScore: number; // e.g. 80
  questions: QuizQuestion[];
}

// Member & Progress
export interface Member {
  id: string;
  name: string;
  whatsapp: string;
  ownedCourses: string[]; // course IDs
  expiresAt?: string; // ISO date string or undefined for lifetime
  accessCodeHash: string;
  plainAccessCode?: string;
  status: 'aktif' | 'nonaktif';
  createdAt: string;
}

export interface UserProgress {
  memberId: string;
  completedLessons: string[]; // lesson IDs
  completedSteps: { [lessonId: string]: string[] }; // step IDs
  notes: { [lessonId: string]: string };
  quizResults: {
    [moduleId: string]: {
      score: number;
      passed: boolean;
      date: string;
      attempts: number;
    };
  };
  certificates: {
    [courseId: string]: {
      certNumber: string;
      issuedAt: string;
    };
  };
}

// App Examples
export interface AppExample {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  appUrl: string;
  order: number;
  isVisible: boolean;
}

// Testimonials
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  rating: number;
  content: string;
  order: number;
  isVisible: boolean;
}

// FAQ
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  order: number;
  isVisible: boolean;
}

// Announcements
export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  order: number;
  isVisible: boolean;
}

// Contact Messages
export interface ContactMessage {
  id: string;
  name: string;
  whatsapp: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

// Activity Log
export interface ActivityLog {
  id: string;
  role: Role;
  action: string;
  timestamp: string;
  details?: string;
}

// CMS & Settings
export interface CMSSettings {
  identity: {
    appName: string;
    tagline: string;
    heroTitle: string;
    heroSubtitle: string;
    lynkUrl: string;
    whatsapp: string;
    logoUrl: string;
    faviconUrl: string;
    metaTitle: string;
    metaDescription: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    borderRadius: number;
    darkMode: boolean;
  };
  navigation: {
    id: string;
    label: string;
    path: string;
    icon: string;
    isVisible: boolean;
    order: number;
  }[];
  buttons: {
    id: string;
    label: string;
    url?: string;
    color?: string;
    isVisible: boolean;
  }[];
  sections: {
    id: string;
    title: string;
    description: string;
    isVisible: boolean;
    order: number;
  }[];
  pages: {
    id: string;
    slug: string;
    title: string;
    content: string;
    isVisible: boolean;
  }[];
  features: {
    testimonials: boolean;
    faq: boolean;
    contactForm: boolean;
    floatingWhatsApp: boolean;
    quiz: boolean;
    certificate: boolean;
    personalNotes: boolean;
    announcements: boolean;
    skillLibrary: boolean;
    stepGuides: boolean;
  };
  media: {
    promoVideoUrl: string;
    gallery: string[];
  };
  footer: {
    address: string;
    phone: string;
    email: string;
    hours: string;
    social: {
      instagram?: string;
      youtube?: string;
      tiktok?: string;
      github?: string;
    };
    copyright: string;
  };
  sync: {
    webAppUrl: string;
    token?: string;
    driveFolderId?: string;
  };
}
