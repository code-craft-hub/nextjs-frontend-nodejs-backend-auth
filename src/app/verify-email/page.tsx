import { requireAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { VerifyEmailClient } from "@/features/auth/components/verify-email-client";
import { createServerQueryClient } from "@/shared/query/prefetch";
import { userQueries } from "@features/user";
import { authQueries } from "@/features/auth";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";
import { getCookiesToken } from "@/lib/auth.utils";

export default async function VerifyEmailPage() {
  const session = await requireAuth();
  const token = await getCookiesToken();

  // Redirect if email already verified
  if (session?.emailVerified) {
    if (!session.onboardingComplete) {
      redirect("/onboarding");
    } else {
      redirect("/dashboard");
    }
  }

  const queryClient = createServerQueryClient();
  await Promise.all([
    token ? queryClient.fetchQuery(userQueries.detail(token)) : Promise.resolve(),
    queryClient.fetchQuery(authQueries.verificationTokenStatus(token ?? undefined)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <VerifyEmailClient />
    </HydrationBoundary>
  );
}
