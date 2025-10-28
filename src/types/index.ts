import { ResumeFormData } from "@/lib/schema-validations/resume.schema";
export interface StreamStatus {
  isConnected: boolean;
  isComplete: boolean;
  error: string | null;
  completedSections: Set<string>;
}

export type UploadedFile = {
  file: File | null;
  preview: string;
  type: "image" | "pdf";
};
export type DashboardTab = "ai-apply" | "find-jobs" | "tailor-cv";

export type JobType = {
  id: number;
  title: string;
  company: string;
  companyLogo: string;
  companyIcon: string;
  companyText: string;
  location: string;
  salary: string;
  postedTime: string;
  matchPercentage: string;
  jobType: string;
  isBookmarked: boolean;
  isFilled: boolean;
  companyName: string;
  descriptionText: string;
  link: string;
  salaryInfo: any;
  emailApply: string;
  postedAt: string;
  scrapedDate: string;
  scrapedAt: string;
  sponsorCategory: string;
  employmentType?: string;
};
export interface IUser {
  uid?: string;
  providerId?: string;
  emailVerified?: boolean;
  dataSource?: any[];
  role?: any[];
  isAnonymous?: boolean;
  displayName?: string;
  countryCode?: string;
  defaultactiveDataSource?: string;
  firstName?: string;
  lastName?: string;
  cvJobTitle?: string;
  customClaims?: Record<string, any> | undefined;
  provider?: string;
  password?: string;
  analytics?: {
    totalApplications: number;
    totalResumes: number;
    totalCoverLetters: number;
    totalInterviewQuestions: number;
  };
  aiApplyPreferences?: any;
  baseResume?: string;
  key?: string;
  address?: string;
  country?: string;
  state?: string;
  phoneNumber?: string;
  website?: string;
  portfolio?: string;
  email?: string;
  profile: string;
  credit?: number;
  onboardingComplete?: boolean;
  maxCredit?: number;
  photoURL?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  softSkill?: ResumeFormData["softSkill"];
  hardSkill?: ResumeFormData["hardSkill"];
  project?: ResumeFormData["project"];
  socials?: any[];
  certification?: ResumeFormData["certification"];
  coverLetter?: string;
  workExperience?: ResumeFormData["workExperience"];
  education: ResumeFormData["education"];
}

export type Resume = ResumeFormData;

export interface PreviewResumeProps {
  data: ResumeFormData;
  resumeId: string;
  isStreaming?: boolean;
  // onUpdate?: <T>(field: ResumeField, value: T) => void;
  // cancelTimeout?: () => void;
}

export interface CoverLetterRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  phoneNumber: string;
  portfolio: string;
  title: string;
  coverLetter: string;
  type: string;
  generatedAt: string;
}

export type ResumeField =
  | "profile"
  | "contact"
  | "workExperience"
  | "education"
  | "certification"
  | "project"
  | "softSkill"
  | "hardSkill";

export interface UpdatePayload<T = any> {
  field: ResumeField;
  value: T;
  resumeId: string;
}

export interface UseResumeDataOptions {
  resumeId: string;
  apiUrl?: string;
  onSuccess?: (field: ResumeField) => void;
  onError?: (error: Error, field: ResumeField) => void;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
}
export interface ResumePreviewProps {
  data: ResumeFormData;
  onUpdate: <T>(field: ResumeField, value: T) => void;
  isUpdating?: boolean;
  user: Partial<IUser> | null;
}

export interface FloatingLabelInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  label: string;
  type?: string;
  className?: string;
  showPasswordToggle?: boolean;
  isUpdatingUserLoading?: boolean;
}

export interface InitialUser {
  initialUser: Partial<IUser>;
}
export interface OnboardingFormProps {
  onNext: () => void;
  onPrev: () => void;
  children?: React.ReactNode;
  fromDataSourceStep?: () => void;
}

export interface ResumeSection {
  type:
    | "profile"
    | "education"
    | "workExperience"
    | "certification"
    | "project"
    | "hardSkill"
    | "softSkill";
  content: string;
  isComplete: boolean;
  isStreaming: boolean;
  error?: string;
}

export const intialData = {
  profile: {
    type: "profile",
    content: "",
    isComplete: false,
    isStreaming: false,
  },
  education: {
    type: "education",
    content: "",
    isComplete: false,
    isStreaming: false,
  },
  workExperience: {
    type: "workExperience",
    content: "",
    isComplete: false,
    isStreaming: false,
  },
  certification: {
    type: "certification",
    content: "",
    isComplete: false,
    isStreaming: false,
  },
  project: {
    type: "project",
    content: "",
    isComplete: false,
    isStreaming: false,
  },
  hardSkill: {
    type: "hardSkill",
    content: "",
    isComplete: false,
    isStreaming: false,
  },
  softSkill: {
    type: "softSkill",
    content: "",
    isComplete: false,
    isStreaming: false,
  },
};

export interface FloatingLabelInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  label: string;
  type?: string;
  className?: string;
  showPasswordToggle?: boolean;
}

export type ApprovedT = {
  duration: string;
  message: string;
  paidAt: string;
  plan: string;
  redirecturl: string;
  reference: string;
  price: number;
  status: string;
  transaction: string;
  trxref: string;
};

export type cancelledT = {
  message: string;
  paidAt: string;
  plan: string;
  price: number;
  status: string;
};

export interface ApiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface Media {
  id: number;
  name: string;
  url: string;
  alternativeText?: string | null;
  caption?: string | null;
}

export interface Author {
  name: string;
  avatar?: string | null;
}

export interface Article {
  id: string;
  title: string;
  author_comment: string;
  summary: string;
  subtitle: string;
  author?: Author | null;
  cover?: string | null;
  big_thumbnail?: string | null;
  category?: string | null;
  createdAt?: Date;
  author_avatar: string;
  author_name: string;
  blog_cover: string;
  createdBy?: string;
  description_html: string;
  description_json: string;
  description_text: string;
  related: [];
  status: string;
  uid: string;
}

export interface ArticleData {
  data: Article;
  id: string;
}

export interface ArticleResponse {
  documents: ArticleData[];
}

export interface ArticleState {
  cover: string;
  big_thumbnail: string;
  updatedAt: string;
  title: string;
  description: string;
  avatar: string;
  author: string;
  blog_content: string;
}

// Represents API Error structure
export interface ApiError {
  error: {
    status: number;
    name: string;
    message: string;
    details?: Record<string, any>;
  };
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: "admin" | "user";
  createdAt: string;
  lastLoginAt: string;
  isEmailVerified: boolean;
  customClaims?: Record<string, any>;
}

export type StreamData = ResumeFormData;

export interface StreamEvent {
  type:
    | "sectionStarted"
    | "sectionContent"
    | "sectionCompleted"
    | "generationComplete"
    | "documentSaved"
    | "documentSaveError"
    | "sectionError"
    | "error";
  documentId: string;
  section?: string;
  content?: string;
  fullContent?: string;
  error?: string;
}

export interface RequestPayload {
  user: Partial<IUser>;
  jobDescription: string;
}

export interface UseResumeStreamReturn {
  streamData: StreamData;
  streamStatus: StreamStatus;
  startStream: (user: Partial<IUser>, jobDescription: string) => Promise<void>;
  stopStream: () => void;
}

export interface InterviewQuestion {
  fullContent?: { answer: string; question: string; type: string }[];
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  phoneNumber: string;
  portfolio: string;
  type: string;
  generatedAt: string;
  title: string;
}

export interface CoverLetter {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  phoneNumber: string;
  portfolio: string;
  title: string;
  salutation?: string;
  coverLetter: string;
  type: string;
  generatedAt: string;
  recruiterEmail: string;
}

export interface QAItem {
  question: string;
  answer: string;
}
