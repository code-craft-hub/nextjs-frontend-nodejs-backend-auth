import { api } from "@/shared/api/client";
import type {
  SubmitFeedbackPayload,
  SubmitFeedbackResponse,
  UserFeedbackListResponse,
  IUserFeedback,
} from "./user-feedback.api.types";

export const userFeedbackApi = {
  /** Submit feedback from the current authenticated user. */
  submit: (payload: SubmitFeedbackPayload) =>
    api.post<SubmitFeedbackResponse>(`/user-feedback`, payload),

  /** Fetch all feedback submitted by the current user. */
  getMyFeedback: () =>
    api.get<{ success: boolean; data: IUserFeedback[] }>(`/user-feedback/me`),

  /** Admin: paginated list with optional filters. */
  list: (params?: {
    page?: number;
    limit?: number;
    userId?: string;
    feedbackType?: string;
    status?: string;
    resourceType?: string;
    resourceId?: string;
  }) =>
    api.get<UserFeedbackListResponse>(`/user-feedback`, { params: params as any }),

  /** Admin: fetch a single feedback entry. */
  getById: (id: string) =>
    api.get<{ success: boolean; data: IUserFeedback }>(`/user-feedback/${id}`),

  /** Admin: update the status of a feedback entry. */
  updateStatus: (id: string, status: string) =>
    api.patch<{ success: boolean; data: IUserFeedback }>(
      `/user-feedback/${id}/status`,
      { status },
    ),

  /** All feedback for a specific resource (job, resume, etc.). */
  getByResource: (resourceType: string, resourceId: string) =>
    api.get<{ success: boolean; data: IUserFeedback[] }>(
      `/user-feedback/resource/${resourceType}/${resourceId}`,
    ),
};
