import { api } from "@/shared/api/client";
import type {
  SubmitApplicationPayload,
  SubmitApplicationResponse,
  ResumeApplicationPayload,
} from "../types/browser-automation.types";

const BASE = `/browser-automation`;

export const browserAutomationApi = {
  submitApplication: (payload: SubmitApplicationPayload, token?: string) =>
    api.post<SubmitApplicationResponse>(
      `${BASE}/submit-application`,
      payload,
      { token },
    ),

  resumeApplication: (payload: ResumeApplicationPayload, token?: string) =>
    api.post<{ success: boolean; message: string }>(
      `${BASE}/resume`,
      payload,
      { token },
    ),
};
