import { fileToBase64 } from "@/lib/utils/helpers";
import whatsappApiClient from ".";


export interface EmailFormData {
  userEmail: string;
  recruiterEmail: string;
  subject: string;
  content: string;
  sendImmediately: boolean;
  attachment?: File;
}

export const checkAuthStatus = async (email: string) => {
  const { data } = await whatsappApiClient.get(
    `/email/auth-status/${encodeURIComponent(email)}`
  );
  return data;
};

export const requestAuthUrl = async (email: string) => {
  const { data } = await whatsappApiClient.get(
    `/email/auth-url/${encodeURIComponent(email)}`
  );
  return data;
};

export const sendAuthorizationCode = async (
  userEmail: string,
  code: string
) => {
  const { data } = await whatsappApiClient.post(`/email/auth-callback`, {
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

  const { data } = await whatsappApiClient.post(`/send`, payload);
  return data;
};
