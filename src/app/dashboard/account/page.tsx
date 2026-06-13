import type { Metadata } from "next";
import { createServerQueryClient } from "@/shared/query/prefetch";
import { dehydrate } from "@tanstack/react-query";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { api } from "@/shared/api/client";
import { redirect } from "next/navigation";
import { AccountClient } from "@/features/account/components/Account";
import { getCookiesToken } from "@/lib/auth.utils";

export const metadata: Metadata = {
  title: "Account",
};

interface VerifyPaymentData {
  status: string;
  isProUser: boolean;
  currentPeriodEnd?: string | Date | null;
}

const AccountPage = async ({ searchParams }: any) => {
  const resolvedParams = await searchParams;
  const tab = resolvedParams?.tab as string | undefined;
  const event = resolvedParams?.event as string | undefined;
  const reference = resolvedParams?.reference as string | undefined;
  const sessionId = resolvedParams?.session_id as string | undefined;
  const phoneNumber = resolvedParams?.phoneNumber as string | undefined;
  const referrer = resolvedParams?.referrer as string | undefined;

  const token = (await getCookiesToken()) ?? "";
  const queryClient = createServerQueryClient();

  let paymentData: VerifyPaymentData | undefined;

  // ── Paystack return: ?reference=txn_xxx ──────────────────────────────────
  if (reference) {
    try {
      const { data } = await api.get<{ data: VerifyPaymentData }>(
        `/paystack/payments/verify/${reference}`,
        { token },
      );
      paymentData = data;
    } catch {
      // Non-fatal — webhook is the authoritative processor
    }
  }

  // ── Stripe return: ?session_id=cs_xxx ────────────────────────────────────
  if (sessionId && !paymentData?.isProUser) {
    try {
      const { data } = await api.get<{ data: VerifyPaymentData }>(
        `/stripe/checkout/verify/${sessionId}`,
        { token },
      );
      paymentData = data;
    } catch {
      // Non-fatal — webhook will process the payment
    }
  }

  const isProUser = paymentData?.isProUser;
  const currentPeriodEnd = paymentData?.currentPeriodEnd;
  const isExpired = currentPeriodEnd ? new Date(currentPeriodEnd) < new Date() : true;

  // Redirect to clean URL after successful payment (prevents re-verification on refresh)
  if (isProUser && !isExpired && (reference || sessionId)) {
    redirect(
      `/dashboard/account?tab=${tab ?? "billing"}&event=subscription_success`,
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AccountClient
          tab={tab ?? ""}
          event={event ?? ""}
          reference={reference ?? ""}
          stripeSessionId={sessionId ?? ""}
          phoneNumber={phoneNumber}
          referrer={referrer}
        />
      </HydrationBoundary>
    </div>
  );
};

export default AccountPage;
