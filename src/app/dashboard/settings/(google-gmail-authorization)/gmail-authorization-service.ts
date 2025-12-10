import { api } from "@/lib/api/client";
// import authClient from "@/lib/axios/auth-api";
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

export const checkAuthStatus = async () => {
  const data = await api.get<any>(
    `/google-gmail-oauth/auth-status/`
  );
  return data?.data;
};

export const requestAuthUrl = async () => {
  const data = await api.get<any>(
    `/google-gmail-oauth/auth-url/`
  );
  return data?.data;
};

export const sendAuthorizationCode = async (
  userEmail: string,
  code: string
) => {
  const data = await api.post<any>(`/google-gmail-oauth/auth-callback`, {
    userEmail,
    code,
  });
  return data?.data;
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

  const data = await api.post<any>(`/google-gmail-oauth/send`, payload);
  return data?.data;
};
