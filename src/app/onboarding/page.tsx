import type { Metadata } from "next";
import { requireEmailVerification } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import OnboardingClient from "@/features/onboarding/components/OnBoardingClient";
import { createServerQueryClient } from "@/shared/query/prefetch";
import { userQueries } from "@features/user";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";
import { getCookiesToken } from "@/lib/auth.utils";

export const metadata: Metadata = {
  title: "Set Up Your Profile",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage() {
  const token = (await getCookiesToken()) ?? "";
  const session = await requireEmailVerification();
  const queryClient = createServerQueryClient();
  await queryClient.prefetchQuery(userQueries.detail(token));
  if (session?.onboardingComplete) {
    redirect("/dashboard/home");
  }

  // Resume where the user left off: onboardingStep is the last *completed*
  // step, so the next screen to show is one past it. 0 means nothing has
  // been completed yet, so stay on the welcome screen instead of skipping it.
  const user = queryClient.getQueryData(userQueries.detail(token).queryKey);
  const completedStep = user?.onboardingStep ?? 0;
  const initialStep = completedStep === 0 ? 0 : completedStep + 1;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OnboardingClient initialStep={initialStep} />
    </HydrationBoundary>
  );
}
