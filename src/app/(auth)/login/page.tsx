import type { Metadata } from "next";
import { redirectIfAuthenticated } from '@/lib/server-auth';
import {LoginClient} from '@/features/auth/components/login-client';

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your Cver AI account to manage your job applications.",
};

export default async function LoginPage() {
  await redirectIfAuthenticated();
  return <LoginClient />;
}