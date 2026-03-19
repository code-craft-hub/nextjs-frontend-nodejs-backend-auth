/**
 * Email Application API Types
 * Defines request/response contracts for email application operations
 */

export interface SendEmailApplicationPayload {
  autoApplyId: string;
  coverLetterId: string;
  resumeId: string;
  recruiterEmail: string;
  jobDescription: string;
}

export interface SendEmailApplicationResponse {
  success: boolean;
  data: {
    id: string;
    autoApplyId: string;
    status: "sent" | "draft" | "failed";
    sentAt?: string;
    message?: string;
  };
  message: string;
}

export interface DeleteEmailApplicationPayload {
  autoApplyId: string;
  resumeId: string;
  coverLetterId: string;
}

export interface DeleteEmailApplicationResponse {
  success: boolean;
  data: {
    id: string;
    deletedAt: string;
  };
  message: string;
}

export interface EmailApplicationError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
