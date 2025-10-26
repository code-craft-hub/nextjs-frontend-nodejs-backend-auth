import { requireEmailVerification } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import OnboardingClient from "./OnBoardingClient";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { userQueries } from "@/lib/queries/user.queries";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";

export default async function OnboardingPage() {
  const session = await requireEmailVerification();
  const queryClient = createServerQueryClient();
  await queryClient.prefetchQuery(userQueries.detail());
  if (session.onboardingComplete) {
    redirect("/dashboard/home");
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OnboardingClient />
    </HydrationBoundary>
  );
}
