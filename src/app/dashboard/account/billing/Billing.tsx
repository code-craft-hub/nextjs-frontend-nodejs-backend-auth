import { UpgradeModal } from "./UpgradeModal";
import { useEffect, useRef, useState } from "react";
import { useFireworksConfetti } from "@/components/ui/confetti";
import { PremiumUserPage } from "./PremiumUserPage";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@module/user";
import { isSubscriptionActive } from "@/lib/utils/helpers";
import { TrialBanner } from "./TrialBanner";
import { ReferralCard } from "./ReferralCard";
import { UpgradeBanner } from "./UpgradeBanner";

export const Billing = ({ reference }: { reference: string }) => {
  const { data: user } = useQuery(userQueries.detail());
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [justUpgraded, setJustUpgraded] = useState(false);

  const isPro = user?.accountTier === "pro";

  const { start: startConfetti } = useFireworksConfetti();
  const prevMilestoneRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (user?.milestoneCount == null) return;
    if (
      prevMilestoneRef.current !== undefined &&
      user.milestoneCount > prevMilestoneRef.current
    ) {
      startConfetti();
    }
    prevMilestoneRef.current = user.milestoneCount;
  }, [user?.milestoneCount, startConfetti]);

  if (isPro) {
    return <PremiumUserPage />;
  }

  if (showUpgradeModal) {
    return (
      <UpgradeModal
        trxReference={reference}
        handleStateChange={(value: boolean) => {
          if (value) setJustUpgraded(true);
        }}
        handleShowPlan={setShowUpgradeModal}
      />
    );
  }

  return (
    <div className="flex flex-col items-center max-w-5xl mx-auto gap-7.5 relative">
      <TrialBanner user={user} />
      <ReferralCard user={user} />
      <UpgradeBanner onUpgrade={() => setShowUpgradeModal(true)} />
    </div>
  );
};
