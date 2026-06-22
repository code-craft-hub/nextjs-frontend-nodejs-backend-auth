import { api } from "@/shared/api/client";

export type ApplicationEventType = "manual_click" | "auto_email" | "auto_form";

export interface LogApplicationEventPayload {
  jobId?: string | null;
  jobTitleSnapshot: string;
  companySnapshot?: string | null;
  applicationType: ApplicationEventType;
  /** ISO date string — the real submission moment. Defaults server-side to now if omitted. */
  submittedAt?: string;
  metadata?: Record<string, unknown>;
}

export const applicationEventsApi = {
  /**
   * Records a single application_submitted event. Used by client-driven
   * apply flows that have no other server round-trip at submission time
   * (e.g. a manual click on an external apply link).
   */
  logEvent: (data: LogApplicationEventPayload) =>
    api.post<{ success: boolean }>("/application-events", data),
};
