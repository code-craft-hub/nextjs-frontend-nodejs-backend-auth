import { api } from "@/shared/api/client";
import type {
  SubmitApplicationPayload,
  SubmitApplicationResponse,
} from "../types/browser-automation.types";

// ─── Constants ────────────────────────────────────────────────────

const BROWSER_AUTOMATION_BASE = `/browser-automation`;

// ─── API Client ───────────────────────────────────────────────────

export const browserAutomationApi = {
  /**
   * Queues a background BullMQ job that navigates to the job's `applyUrl`,
   * fills the application form with the user's profile data, and submits it.
   *
   * The server responds with **202 Accepted** immediately — the actual
   * form-submission runs asynchronously via the automation queue.
   *
   * Idempotent: a second call for the same (userId, jobId) pair within the
   * same queue window returns `deduplicated: true` without re-enqueueing.
   */
  submitApplication: (payload: SubmitApplicationPayload, token?: string) =>
    api.post<SubmitApplicationResponse>(
      `${BROWSER_AUTOMATION_BASE}/submit-application`,
      payload,
      { token },
    ),
};
