import type { IUser } from "@/shared/types";
import { getDaysRemaining, isSubscriptionActive } from "@/lib/utils/helpers";

interface TrialBannerProps {
  user: Partial<IUser> | undefined;
}

export function TrialBanner({ user }: TrialBannerProps) {
  const remainingDays = getDaysRemaining(user?.currentPeriodEnd ?? null);
  const hasActiveSubscription = isSubscriptionActive(user?.currentPeriodEnd);

  const heading =
    user?.accountTier === "none" || !user?.accountTier
      ? "You're on a Free Trial"
      : `You're on the ${user.accountTier} plan`;

  return (
    <section className="bg-linear-to-b space-y-4 from-[#FF9A56] to-[#FF6B35] rounded-[12px] w-full p-4 sm:p-8">
      <div className="flex gap-4 justify-between w-full">
        <div className="text-white space-y-2">
          <h1 className="font-semibold font-inter sm:text-2xl">{heading}</h1>
          <p className="text-white/80">Explore all features with your trial period</p>
        </div>

        {!hasActiveSubscription && Number(remainingDays) > 0 && (
          <div className="flex shrink-0 flex-col justify-center items-center gap-1 w-[97.67px] h-20.25 bg-[rgba(255,255,255,0.2)] rounded-xl">
            <p className="font-inter text-center font-semibold text-[32px] leading-8 text-white">
              {remainingDays}
            </p>
            <p className="font-inter font-medium text-[14px] leading-5.25 text-center text-white">
              day{Number(remainingDays) > 1 && "s"} left
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-col items-start gap-1">
          {!hasActiveSubscription && (
            <p className="font-['Inter'] font-medium text-[14px] leading-5.25 text-white">
              Upgrade to Pro or refer 5 people to continue enjoying all the features from Cver AI.
            </p>
          )}
          <p className="opacity-80">
            <span className="font-inter font-normal text-[12px] leading-4.5 text-white">
              You have{" "}
              <span className="font-bold underline">
                {user?.creditBalance ?? 0} credits{hasActiveSubscription && " (active)"}
              </span>
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
