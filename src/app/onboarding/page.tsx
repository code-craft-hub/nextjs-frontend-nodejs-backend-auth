import { requireEmailVerification } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import OnboardingClient from "./OnBoardingClient";

export default async function OnboardingPage() {
  const session = await requireEmailVerification();

  if (session.onboardingComplete) {
    redirect("/dashboard/home");
  }

  return <OnboardingClient initialUser={session} />;
}
