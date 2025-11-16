import { redirectIfAuthenticated } from "@/lib/server-auth";
import RegisterClient from "./register-client";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  await redirectIfAuthenticated();
  const params = await searchParams;
  const referral = params?.referral;
  return <RegisterClient referral={referral} />;
}
