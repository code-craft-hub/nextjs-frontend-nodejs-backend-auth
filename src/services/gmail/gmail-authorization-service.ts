import {
  gmailApi,
  EmailFormData,
  EmailPayload,
} from "@/lib/api/gmail.api";
import { fileToBase64 } from "@/lib/utils/helpers";

export type { EmailFormData };

export const checkAuthStatus = async (token?: string) => {
  return gmailApi.checkAuthStatus(token);
};

export const requestAuthUrl = async (token?: string) => {
  return gmailApi.getAuthUrl(token);
};

export const sendAuthorizationCode = async (
  code: string,
  token?: string
) => {
  return gmailApi.handleAuthCallback(code, token);
};

export const getAccount = async (token?: string) => {
  return gmailApi.getAccount(token);
};

export const revokeAccess = async (token?: string) => {
  return gmailApi.revokeAccess(token);
};

export const sendEmail = async (formData: EmailFormData, token?: string) => {
  const payload: EmailPayload = {
    userEmail: formData.userEmail,
    recruiterEmail: formData.recruiterEmail,
    subject: formData.subject,
    content: formData.content,
    sendImmediately: formData.sendImmediately,
  };

  if (formData.attachment) {
    payload.attachment = {
      filename: formData.attachment.name,
      content: await fileToBase64(formData.attachment),
      contentType: formData.attachment.type || "application/octet-stream",
    };
  }

  return gmailApi.sendEmail(payload, token);
};
