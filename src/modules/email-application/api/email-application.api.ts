import { api } from "@/lib/api/client";
import { COLLECTIONS } from "@/lib/utils/constants";
import type {
  SendEmailApplicationPayload,
  SendEmailApplicationResponse,
  DeleteEmailApplicationPayload,
  DeleteEmailApplicationResponse,
} from "./email-application.api.types";

const EMAIL_APPLICATION_BASE = "/v1/email-applications";

/**
 * Email Application API Client
 * Handles HTTP communication for email application operations
 */
export const emailApplicationApi = {
  /**
   * Send an email application with resume and cover letter
   */
  sendApplication: (payload: SendEmailApplicationPayload) =>
    api.post<SendEmailApplicationResponse>(EMAIL_APPLICATION_BASE, payload),

  /**
   * Delete an email application record
   */
  deleteApplication: (
    autoApplyId: string,
    resumeId: string,
    coverLetterId: string,
  ) =>
    api.delete<DeleteEmailApplicationResponse>(
      `/delete-document/${autoApplyId}?docType=${COLLECTIONS.AI_APPLY}&resumeId=${resumeId}&coverLetterId=${coverLetterId}`,
    ),
};
