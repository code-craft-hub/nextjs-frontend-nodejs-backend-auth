import type { Metadata } from "next";
import ResetPasswordClient from "@/features/auth/components/ResetPasswordClient";

export const metadata: Metadata = {
  title: "Reset Password",
  robots: { index: false, follow: false },
};
// import { redirect } from "next/navigation";

export default async function ResetPassword({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const email = (await searchParams)?.email;

  return <ResetPasswordClient email={email} />;
}
