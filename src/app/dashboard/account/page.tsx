import { userQueries } from "@/lib/queries/user.queries";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { dehydrate } from "@tanstack/react-query";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { api } from "@/lib/api/client";
import { redirect } from "next/navigation";
import { AccountClient } from "./Account";
import { getCookiesToken } from "@/lib/auth.utils";

const AccountPage = async ({ searchParams }: any) => {
  const tab = (await searchParams)?.tab;
  const token = (await getCookiesToken()) ?? "";

  const reference = (await searchParams)?.reference;

  const queryClient = createServerQueryClient();
  let initialData;
  if (reference) {
    try {
      const { data } = await api.get<{
        data: {
          status: string;
          isPro: boolean;
          expiryTime?: string | Date;
        };
      }>(`/paystack/payments/verify/${reference}`, {token});
      initialData = data;
    } catch (error) {
      console.error("Error verifying payment:", error);
    }
  }

  // Fetch user data AFTER payment verification
  const user = await queryClient.fetchQuery({
    ...userQueries.detail(token),
    // Force a fresh fetch if there was a payment reference
    // staleTime: reference ? 0 : undefined,
  });

  const isPro = user.isPro || initialData?.isPro;
  const expiryTime =
    user.expiryTime || initialData?.expiryTime;

  const isExpired = expiryTime
    ? new Date(expiryTime) < new Date()
    : true;

  // Check if we need to clean the URL (remove search params except 'tab')
  const shouldCleanUrl = !isExpired && isPro && reference;

  if (shouldCleanUrl) {
    // Redirect to clean URL with only the tab param
    redirect(`/dashboard/account?tab=${tab || "billing"}`);
  }

  return (
    <div className="p-4 sm:p-8">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AccountClient tab={tab} reference={reference} />
      </HydrationBoundary>
    </div>
  );
};

export default AccountPage;
