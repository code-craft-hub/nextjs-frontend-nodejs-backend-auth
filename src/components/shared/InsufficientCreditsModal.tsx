"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { userQueries } from "@module/user";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFireworksConfetti } from "../ui/confetti";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { isSubscriptionActive } from "@/lib/utils/helpers";

export default function InsufficientCreditsModal() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { start: startConfetti } = useFireworksConfetti();

  // Re-use the cached user data — no duplicate API call.
  const { data: user, isLoading } = useQuery(userQueries.detail());

  const hasActiveSubscription = isSubscriptionActive(user?.currentPeriodEnd);

  console.log(" DATA ====: ", hasActiveSubscription);

  useEffect(() => {
    if (!user?.isEligibleForReward) return;

    startConfetti();
    toast.success(
      "🎉 You've earned 10 bonus credits for referring 5 users! Valid for 7 days.",
    );

    // Refresh so the UI reflects server-granted credits.
    queryClient.invalidateQueries({ queryKey: userQueries.detail().queryKey });
  }, [user?.isEligibleForReward, startConfetti, queryClient]);

  // Don't render while loading to avoid a flash of the modal.
  if (isLoading || hasActiveSubscription) return null;

  const handleUpgrade = () => router.push("/dashboard/account?tab=billing");

  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex-between">
            <AlertDialogCancel
              className="bg-transparent border-0"
              onClick={handleUpgrade}
            >
              <img
                src="/assets/icons/close.svg"
                alt="Close"
                width={24}
                height={24}
                className="cursor-pointer"
              />
            </AlertDialogCancel>
          </div>

          <img
            src="/assets/images/stacked-coins.png"
            alt="Stacked coins"
            width={462}
            height={122}
          />

          <AlertDialogTitle className="p-24-bold text-dark-600">
            Oops... Looks like you&apos;ve run out of free credits!
          </AlertDialogTitle>

          <AlertDialogDescription className="p-16-regular py-3">
            No worries — you can keep enjoying our services by upgrading to Pro
            or referring Cver AI to a friend.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogAction
            className="button w-full bg-blue-400 bg-cover"
            onClick={handleUpgrade}
          >
            Upgrade or Refer a Friend
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
