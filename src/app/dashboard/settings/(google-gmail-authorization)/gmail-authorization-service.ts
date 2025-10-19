import authClient from "@/lib/axios/auth-api";
import { fileToBase64 } from "@/lib/utils/helpers";
// import { fileToBase64 } from "@/utils/file";

export interface EmailFormData {
  userEmail: string;
  recruiterEmail: string;
  subject: string;
  content: string;
  sendImmediately: boolean;
  attachment?: File;
}

export const checkAuthStatus = async (email: string) => {
  const { data } = await authClient.get(
    `/google-gmail-oauth/auth-status/${encodeURIComponent(email)}`
  );
  return data;
};

export const requestAuthUrl = async (email: string) => {
  const { data } = await authClient.get(
    `/google-gmail-oauth/auth-url/${encodeURIComponent(email)}`
  );
  return data;
};

export const sendAuthorizationCode = async (
  userEmail: string,
  code: string
) => {
  const { data } = await authClient.post(`/google-gmail-oauth/auth-callback`, {
    userEmail,
    code,
  });
  return data;
};

export const sendEmail = async (formData: EmailFormData) => {
  const payload: any = { ...formData };

  if (formData.attachment) {
    payload.attachment = {
      filename: formData.attachment.name,
      content: await fileToBase64(formData.attachment),
      contentType: formData.attachment.type || "application/octet-stream",
    };
  }

  const { data } = await authClient.post(`/google-gmail-oauth/send`, payload);
  return data;
};
