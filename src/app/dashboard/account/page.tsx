import { createServerQueryClient } from "@/lib/query/prefetch";
import { dehydrate } from "@tanstack/react-query";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { api } from "@/lib/api/client";
import { redirect } from "next/navigation";
import { AccountClient } from "./Account";
import { getCookiesToken } from "@/lib/auth.utils";

const AccountPage = async ({ searchParams }: any) => {
  const tab = (await searchParams)?.tab;
  const event = (await searchParams)?.event;
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
      }>(`/paystack/payments/verify/${reference}`, { token });
      initialData = data;
    } catch (error) {
      console.error("Error verifying payment:", error);
    }
  }

  const isPro =  initialData?.isPro;
  const expiryTime =  initialData?.expiryTime;

  const isExpired = expiryTime ? new Date(expiryTime) < new Date() : true;

  // Check if we need to clean the URL (remove search params except 'tab')
  const shouldCleanUrl = !isExpired && isPro && reference;

  if (shouldCleanUrl) {
    // Redirect to clean URL with only the tab param
    redirect(`/dashboard/account?tab=${tab || "billing"}&event=subscription_success`);
  }

  

  return (
    <div className="p-4 sm:p-8">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AccountClient
          tab={tab}
          event={event}
          reference={reference}
          
        />
      </HydrationBoundary>
    </div>
  );
};

export default AccountPage;
