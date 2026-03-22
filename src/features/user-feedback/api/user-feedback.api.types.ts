// ─── Feedback type literals ────────────────────────────────────────────────────
// Must stay in sync with server controller VALID_FEEDBACK_TYPES.

export const FEEDBACK_TYPES = [
  "product_feedback",
  "job_quality",
  "resume_cv_generation",
  "bug_report",
  "crash_technical_issue",
  "other",
  "job_review",
  "cv_quality",
  "resume_quality"
] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
  product_feedback: "Product Feedback",
  job_quality: "Job Quality/Recommendation",
  resume_cv_generation: "Resume/CV Generation",
  bug_report: "Bug Report",
  crash_technical_issue: "Crash/Technical Issue",
  other: "Other",
  job_review: "Job Review",
  cv_quality: "CV Quality",
  resume_quality: "Resume Quality",
};

// ─── Request payloads ─────────────────────────────────────────────────────────

export interface SubmitFeedbackPayload {
  feedbackType: FeedbackType;
  details?: string;
  /** 0/1 for job_review; 1–5 for cv_quality; omit for general feedback. */
  rating?: number;
  /** Required for job_review and cv_quality. */
  resourceType?: string;
  /** Required for job_review and cv_quality. */
  resourceId?: string;
  metadata?: Record<string, unknown>;
}

// ─── Response shapes ──────────────────────────────────────────────────────────

export interface IUserFeedback {
  id: string;
  userId: string;
  feedbackType: FeedbackType;
  rating: number | null;
  resourceType: string | null;
  resourceId: string | null;
  details: string | null;
  status: "open" | "in_review" | "resolved" | "closed";
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitFeedbackResponse {
  success: boolean;
  data: IUserFeedback;
}

export interface UserFeedbackListResponse {
  success: boolean;
  data: {
    items: IUserFeedback[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
