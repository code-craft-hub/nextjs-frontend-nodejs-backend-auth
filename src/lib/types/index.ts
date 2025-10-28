import { IUser } from "@/types";

export interface ProfileData {
  jobLevelPreference: string;
  jobTypePreference: string;
  roleOfInterest: string;
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
  authorId: string;
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  published: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
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
