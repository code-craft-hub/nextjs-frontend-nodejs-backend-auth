import { requireAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { VerifyEmailClient } from "./verify-email-client";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { userQueries } from "@/lib/queries/user.queries";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";
import { getCookiesToken } from "@/lib/auth.utils";

export default async function VerifyEmailPage() {
  const session = await requireAuth();
  const token = (await getCookiesToken()) ?? "";


  // Redirect if email already verified
  if (session.emailVerified) {
    if (!session.onboardingComplete) {
      redirect("/onboarding");
    } else {
      redirect("/dashboard");
    }
  }

  const queryClient = createServerQueryClient();
  await queryClient.fetchQuery(userQueries.detail(token));
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <VerifyEmailClient />
    </HydrationBoundary>
  );
}
