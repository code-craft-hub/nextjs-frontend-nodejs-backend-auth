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



export interface JobApplication {
  id: string;
  userId: string;
  jobId: string;
  status: string;
  appliedAt?: string | Date;
  statusUpdatedAt?: string | Date | null;
  updatedAt?: string | Date | null;
  deletedAt?: string | Date | null;
  resumeId?: string | null;
  coverLetter?: string | null;
  metadata?: Record<string, any> | null;
}



export interface ProfileData {
  id: string;
  title: string;
  description: string;
  date: string;
  key?: string;
  data?: string;
  jobLevelPreference?: string;
  jobTypePreference?: string;
  rolesOfInterest?: { label: string; value: string }[];
  remoteWorkPreference?: string;
  relocationWillingness?: string;
  location?: string;
  gcsPath?: string;
  salaryExpectation?: string;
  availabilityToStart?: string;
  defaultDataSource?: string;
  activeDataSource?: string;
  profile: string;
  originalName: string;
}

export interface IUser {
  // ─── Identity ──────────────────────────────────────────────
  id: string;
  userId: string;
  email?: string;
  emailVerified?: boolean;
  displayName?: string;
  photoURL?: string;
  providerId?: string;
  provider?: string;

  // ─── Profile ───────────────────────────────────────────────
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  phoneVerified: boolean | null;
  address?: string;
  country?: string;
  countryCode?: string;
  state?: string;
  locale: string | null;
  timezone: string | null;

  // ─── Account status ────────────────────────────────────────
  accountStatus:
    | "active"
    | "inactive"
    | "suspended"
    | "pending_verification"
    | "locked";
  /** "basic" | "pro" — controls feature gating */
  accountTier: string;
  role?: any[];

  // ─── Subscription (from userSubscriptions table) ───────────
  /** Whether the user currently has an active Pro subscription */
  isProUser: boolean | null;
  subscriptionTier: string | null;
  subscriptionStatus: string | null;
  /** The date the current subscription period ends (next billing date) */
  currentPeriodEnd: Date | null;

  // ─── Credits (from userCredits table) ──────────────────────
  creditBalance: number | null;

  // ─── Referrals (from userReferrals table) ──────────────────
  referralCode?: string;
  referralCount?: number;
  usersReferred?: string[];
  referredBy?: string;
  isEligibleForReward?: boolean;

  // ─── Preferences (from userPreferences table) ──────────────
  theme: string | null;
  emailNotifications: boolean | null;
  pushNotifications: boolean | null;
  smsNotifications: boolean | null;
  whatsappNotifications: boolean | null;
  profileVisibility: string | null;
  notificationFrequency: string | null;
  maxRecommendationsPerDay: number | null;

  // ─── Onboarding ────────────────────────────────────────────
  onboardingComplete?: boolean;
  onboardingStep: number | null;

  // ─── Misc ──────────────────────────────────────────────────
  defaultDataSource?: string;
  cvJobTitle?: string;
  website?: string;
  portfolio?: string;
  profile: string;
  recommendationsData?: any[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type Resume = ResumeFormData;

export interface PreviewResumeProps {
  data: ResumeFormData;
  resumeId: string;
  isStreaming?: boolean;
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

export interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
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


export interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  label: string;
  type?: string;
  className?: string;
  showPasswordToggle?: boolean;
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
  jobId?: string;
  jobDescription: string;
}

export interface UseResumeStreamReturn {
  streamData: StreamData;
  streamStatus: StreamStatus;
  startStream: (jobDescription: string, jobId?: string) => Promise<void>;
  stopStream: () => void;
  documentId: string | null;
  title: string;
}

export interface InterviewQuestion {
  fullContent?: { answer: string; question: string; type: string }[];
  parsedContent?: { answer: string; question: string; type: string }[];
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
  content: string;
  type: string;
  generatedAt: string;
  recruiterEmail: string;
}

export interface QAItem {
  question: string;
  answer: string;
}
