// ─── Request ──────────────────────────────────────────────────────

export interface SubmitApplicationPayload {
  /** UUID of the job_posts record to apply to. */
  jobId: string;
}

// ─── Response ─────────────────────────────────────────────────────

export interface SubmitApplicationData {
  /** BullMQ job ID — equals idempotencyKey for queue-level deduplication. */
  jobId: string;
  /** ID of the job_applications record created with status "applying". */
  jobApplicationId: string;
  /** SHA-256 hash of `userId:job_application_submit:jobId`. */
  idempotencyKey: string;
  /**
   * True when a prior identical submission is already queued.
   * The caller should surface a softer message in this case.
   */
  deduplicated: boolean;
}

export interface SubmitApplicationResponse {
  success: boolean;
  message: string;
  data: SubmitApplicationData;
}
