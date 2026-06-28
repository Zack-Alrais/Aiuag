export type Locale = "ar" | "en";

export interface NavItem {
  title: string;
  titleAr: string;
  href: string;
  children?: NavItem[];
  icon?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T> {
  meta?: PaginationMeta;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  image?: string;
  emailVerified?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Member {
  id: string;
  userId: string;
  user?: User;
  name: string;
  email: string;
  phone?: string;
  studentId?: string;
  graduationYear?: number;
  faculty?: string;
  department?: string;
  idNumber?: string;
  nationality?: string;
  dateOfBirth?: Date;
  address?: string;
  city?: string;
  country?: string;
  currentJob?: string;
  company?: string;
  specialization?: string;
  membershipType: "regular" | "honorary" | "student" | "corporate";
  status: "active" | "inactive" | "expired";
  joinedAt: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface News {
  id: string;
  title: string;
  titleAr: string;
  slug: string;
  slugAr: string;
  content: string;
  contentAr: string;
  excerpt?: string;
  excerptAr?: string;
  image?: string;
  category: "announcement" | "achievement" | "activity" | "general";
  authorId?: string;
  author?: User;
  published: boolean;
  publishedAt?: Date;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  title: string;
  titleAr: string;
  slug: string;
  slugAr: string;
  description: string;
  descriptionAr: string;
  image?: string;
  location: string;
  locationAr?: string;
  startDate: Date;
  endDate: Date;
  registrationDeadline?: Date;
  capacity?: number;
  registeredCount: number;
  isVirtual: boolean;
  virtualLink?: string;
  isPaid: boolean;
  price?: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  titleAr: string;
  slug: string;
  slugAr: string;
  description: string;
  descriptionAr: string;
  image?: string;
  status: "planning" | "active" | "completed" | "on_hold";
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  currency?: string;
  goals?: string;
  goalsAr?: string;
  outcomes?: string;
  outcomesAr?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Committee {
  id: string;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  headId?: string;
  head?: Member;
  members?: CommitteeMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CommitteeMember {
  id: string;
  committeeId: string;
  memberId: string;
  role: string;
  member?: Member;
  committee?: Committee;
}

export interface BoardMember {
  id: string;
  memberId: string;
  member?: Member;
  position: string;
  positionAr: string;
  order: number;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Gallery {
  id: string;
  title: string;
  titleAr: string;
  description?: string;
  descriptionAr?: string;
  image: string;
  eventId?: string;
  event?: Event;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Partner {
  id: string;
  name: string;
  nameAr: string;
  logo: string;
  website?: string;
  description?: string;
  descriptionAr?: string;
  category: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FAQ {
  id: string;
  question: string;
  questionAr: string;
  answer: string;
  answerAr: string;
  category: "membership" | "events" | "projects" | "donations" | "general" | "technical";
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  type: "feedback" | "complaint" | "suggestion" | "general";
  status: "new" | "read" | "replied" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

export interface Donation {
  id: string;
  donorName?: string;
  donorEmail?: string;
  amount: number;
  currency: string;
  message?: string;
  anonymous: boolean;
  paymentMethod: "credit_card" | "bank_transfer" | "paypal" | "other";
  status: "pending" | "completed" | "failed" | "refunded";
  campaignId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Newsletter {
  id: string;
  email: string;
  name?: string;
  active: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Page {
  id: string;
  title: string;
  titleAr: string;
  slug: string;
  slugAr: string;
  content: string;
  contentAr: string;
  metaTitle?: string;
  metaTitleAr?: string;
  metaDescription?: string;
  metaDescriptionAr?: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}
