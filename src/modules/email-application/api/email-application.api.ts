import { api, BACKEND_API_VERSION } from "@/lib/api/client";
import type {
  SendEmailApplicationPayload,
  SendEmailApplicationResponse,
} from "./email-application.api.types";

const EMAIL_APPLICATION_BASE = `/${BACKEND_API_VERSION}/email-applications`;

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


};
