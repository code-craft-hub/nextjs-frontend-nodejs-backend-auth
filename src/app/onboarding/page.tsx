import { requireEmailVerification } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import OnboardingClient from "@/features/onboarding/components/OnBoardingClient";
import { createServerQueryClient } from "@/shared/query/prefetch";
import { userQueries } from "@features/user";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";
import { getCookiesToken } from "@/lib/auth.utils";

export default async function OnboardingPage() {
  const token = (await getCookiesToken()) ?? "";
  const session = await requireEmailVerification();
  const queryClient = createServerQueryClient();
  await queryClient.prefetchQuery(userQueries.detail(token));
  if (session?.onboardingComplete) {
    redirect("/dashboard/home");
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OnboardingClient />
    </HydrationBoundary>
  );
}
