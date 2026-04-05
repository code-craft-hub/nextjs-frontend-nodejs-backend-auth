import type { Metadata } from "next";
// import { redirectIfAuthenticated } from "@/lib/server-auth";
import RegisterClient from "@/features/auth/components/register-client";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a free Cver AI account and start auto-applying to jobs today.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  // await redirectIfAuthenticated();
  const params = await searchParams;
  const referral = params?.referral;
  return <RegisterClient referral={referral} />;
}
