// lib/api/user-activity.api.ts
import { api } from "./client";

export interface TrackActivityPayload {
  action: string;
  page?: string;
  route?: string;
  component?: string;
  description?: string;
  durationSeconds?: number;
  metadata?: Record<string, unknown>;
}

export const userActivityApi = {
  /**
   * Fire-and-forget activity tracking.
   * Silently swallows errors so tracking never breaks the UI.
   */
  track: (payload: TrackActivityPayload): void => {
    api
      .post<void>("/user-activity/track", payload)
      .catch(() => {
        // Intentionally swallowed — tracking must never surface errors to the user
      });
  },
};
