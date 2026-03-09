import { IUser } from "@/types";

export interface ProfileData {
  jobLevelPreference: string;
  jobTypePreference: string;
  rolesOfInterest: string;
  remoteWorkPreference: string;
  relocationWillingness: string;
  location: string;
  salaryExpectation: string;
  availabilityToStart: string;
}

export interface ProfileResponse {
  id: string;
  userId: string;
  dataSource: ProfileData;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: Partial<IUser>;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface InterviewQuestion {
  id: string;
  userId: string;
  question: string;
  answer?: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  createdAt: string;
  updatedAt: string;
}

export interface Blog {
  id: string;
  userId: string | null;
  title: string;
  subtitle: string | null;
  summary: string | null;
  category: string | null;
  status: "publish" | "draft" | "archived";
  descriptionHtml: string | null;
  descriptionText: string | null;
  descriptionJson: string | null;
  authorName: string | null;
  authorComment: string | null;
  authorAvatar: string | null;
  blogCover: string | null;
  bigThumbnail: string | null;
  userEmail: string | null;
  related: unknown | null;
  fileLocationInStorage: unknown | null;
  createdAt: string;
  updatedAt: string;
  importedAt: string | null;
}

export interface BlogWithViews extends Blog {
  totalViews: number;
}

export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  archivedPosts: number;
  allTimeViews: number;
  todayViews: number;
  yesterdayViews: number;
  thisMonthViews: number;
  lastMonthViews: number;
  thisWeekViews: number;
  last7DaysViews: number;
  last30DaysViews: number;
}

export interface BlogListResponse {
  items: BlogWithViews[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BlogViewHistory {
  date: string;
  views: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
