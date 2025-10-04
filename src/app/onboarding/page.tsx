import { requireEmailVerification } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import OnboardingClient from "./onboarding-client";

export default async function OnboardingPage() {
  const session = await requireEmailVerification();

  if (session.onboardingComplete) {
    redirect("/dashboard/home");
  }

  return <OnboardingClient initialUser={session} />;
}
