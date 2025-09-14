import { EmailVerificationTemplate } from "@/app/components/email-templates/verification-template";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendVerificationEmailProps {
  email: string;
  name?: string;
  verificationCode: string;
}

export async function sendVerificationEmail({
  email,
  name,
  verificationCode,
}: SendVerificationEmailProps) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "michael@cverai.com",
      to: [email],
      subject: "Verify your email address",
      react: await EmailVerificationTemplate({
        name: name || email.split("@")[0],
        verificationCode,
      }),
    });

    if (error) {
      console.error("Email sending error:", error);
      throw new Error("Failed to send verification email");
    }

    return data;
  } catch (error) {
    console.error("Email service error:", error);
    throw error;
  }
}
