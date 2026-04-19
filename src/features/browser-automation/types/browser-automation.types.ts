// ─── Request ──────────────────────────────────────────────────────

export interface SubmitApplicationPayload {
  /** UUID of the job_posts record to apply to. */
  jobId: string;
}

// ─── Response ─────────────────────────────────────────────────────

export interface SubmitApplicationData {
  /** ID of the job_applications record created for this submission. */
  jobApplicationId: string;
  /** Interactive Browser-Use live URL — empty string until the browser is ready. */
  liveUrl: string;
  /** True when a prior identical submission is already running. */
  deduplicated: boolean;
}

export interface SubmitApplicationResponse {
  success: boolean;
  message: string;
  data: SubmitApplicationData;
}

// ─── Bot status (SSE stream payload) ──────────────────────────────

export type AutoApplyStatus =
  | "initializing"
  | "running"
  | "awaiting_human"
  | "resuming"
  | "completed"
  | "failed"
  | "recruiter_email_found"
  | "not_found";

export interface BotStatusEvent {
  status: AutoApplyStatus;
  liveUrl?: string;
  stuckReason?: string;
  lastStepSummary?: string;
  screenshotUrl?: string;
  applicationQA?: Array<{ question: string; answer: string }>;
  recruiterEmail?: string;
  updatedAt?: string;
}

// ─── Resume ───────────────────────────────────────────────────────

export interface ResumeApplicationPayload {
  jobApplicationId: string;
}
