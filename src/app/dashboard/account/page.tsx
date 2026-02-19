import { createServerQueryClient } from "@/lib/query/prefetch";
import { dehydrate } from "@tanstack/react-query";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { api, BACKEND_API_VERSION } from "@/lib/api/client";
import { redirect } from "next/navigation";
import { AccountClient } from "./Account";
import { getCookiesToken } from "@/lib/auth.utils";

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

  const token = (await getCookiesToken()) ?? "";
  const queryClient = createServerQueryClient();

  let paymentData: VerifyPaymentData | undefined;

  if (reference) {
    try {
      // NOTE: This is the server-side verify call.
      // The webhook is the authoritative payment processor; this is for immediate UI feedback.
      const { data } = await api.get<{ data: VerifyPaymentData }>(
        `/${BACKEND_API_VERSION}/paystack/payments/verify/${reference}`,
        { token },
      );
      paymentData = data;
    } catch {
      // Verification failed — non-fatal. The webhook will still process the payment.
      // The user can refresh the billing page once the webhook completes.
    }
  }

  const isProUser = paymentData?.isProUser;
  const currentPeriodEnd = paymentData?.currentPeriodEnd;
  const isExpired = currentPeriodEnd ? new Date(currentPeriodEnd) < new Date() : true;

  // After a successful payment, redirect to a clean URL to:
  // 1. Prevent re-verification on browser refresh
  // 2. Show the confetti/success modal via the `event` param
  if (isProUser && !isExpired && reference) {
    redirect(
      `/dashboard/account?tab=${tab ?? "billing"}&event=subscription_success`,
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AccountClient tab={tab ?? ""} event={event ?? ""} reference={reference ?? ""} />
      </HydrationBoundary>
    </div>
  );
};

export default AccountPage;
