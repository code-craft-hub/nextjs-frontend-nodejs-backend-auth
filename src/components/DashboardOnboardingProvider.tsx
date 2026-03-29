"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import Joyride, {
  CallBackProps,
  EVENTS,
  STATUS,
  TooltipRenderProps,
} from "react-joyride";
import { checkAuthStatus } from "@/features/email-application/api/gmail-authorization.service";
import { useAuthorizeGmail } from "@/features/email-application/hooks/useAuthorizeGmail";
import { isSubscriptionActive } from "@/lib/utils/helpers";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@/features/user";

// ── Step 1 tooltip: navigate to settings ──────────────────────────────────
const NavToSettingsTooltip: React.FC<
  TooltipRenderProps & { onGoToSettings: () => void }
> = ({ tooltipProps, step, onGoToSettings }) => (
  <div
    {...tooltipProps}
    className="bg-white rounded-2xl shadow-xl p-5 w-72 font-inter"
  >
    <div className="flex items-center gap-2 mb-3">
      <span className="text-2xl">📧</span>
      <h3 className="font-semibold text-gray-900 text-base">
        {step.title as string}
      </h3>
    </div>
    <p className="text-sm text-gray-600 mb-4">{step.content as string}</p>
    <button
      onClick={onGoToSettings}
      className="w-full bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm font-medium py-2 px-4 rounded-lg"
    >
      Go to Settings
    </button>
  </div>
);

// ── Step 2 tooltip: highlight the toggle ──────────────────────────────────
const ToggleTooltip: React.FC<
  TooltipRenderProps & { onClose: () => void; onConnect: () => void }
> = ({ tooltipProps, step, onClose, onConnect }) => (
  <div
    {...tooltipProps}
    className="bg-white rounded-2xl shadow-xl p-5 w-72 font-inter"
  >
    <div className="flex items-center gap-2 mb-3">
      <span className="text-2xl">🔗</span>
      <h3 className="font-semibold text-gray-900 text-base">
        {step.title as string}
      </h3>
    </div>
    <p className="text-sm text-gray-600 mb-4">{step.content as string}</p>
    <button
      onClick={() => {
        onClose();
        onConnect();
      }}
      className="w-full bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm font-medium py-2 px-4 rounded-lg"
    >
      Connect Now
    </button>
  </div>
);

// ── Steps ──────────────────────────────────────────────────────────────────
const STEPS = [
  {
    target: "#onborda-settings-nav",
    title: "Connect your Gmail",
    content:
      "To let Cver AI apply to jobs on your behalf, you need to connect your Gmail account first.",
    placement: "right" as const,
    disableBeacon: true,
  },
  {
    target: "#gmail-authorize-toggle",
    title: "Enable Gmail",
    content:
      "Toggle this switch to connect your Gmail account and start applying automatically.",
    placement: "left" as const,
    disableBeacon: true,
  },
];

// ── Provider ───────────────────────────────────────────────────────────────
export const DashboardOnboardingProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [awaitingSettings, setAwaitingSettings] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const { authorizeGmail } = useAuthorizeGmail();
  const { data: user } = useQuery(userQueries.detail());

  // Poll for #gmail-authorize-toggle once we've navigated to settings
  useEffect(() => {
    if (!awaitingSettings || pathname !== "/dashboard/settings") return;

    const interval = setInterval(() => {
      if (document.querySelector("#gmail-authorize-toggle")) {
        clearInterval(interval);
        clearTimeout(giveUp);
        setAwaitingSettings(false);
        setStepIndex(1);
        setRun(true);
      }
    }, 100);

    // Give up after 8 seconds to avoid polling forever
    const giveUp = setTimeout(() => {
      clearInterval(interval);
      setAwaitingSettings(false);
    }, 8000);

    return () => {
      clearInterval(interval);
      clearTimeout(giveUp);
    };
  }, [awaitingSettings, pathname]);

  useEffect(() => {
    const check = async () => {
      const hasActiveSubscription = isSubscriptionActive(
        user?.currentPeriodEnd,
      );

      console.log("hasActiveSubscription : ", hasActiveSubscription);
      try {
        const { authorized } = await checkAuthStatus();
        if (!authorized) {
          if (isMobile) {
            // On mobile, skip step 1 (sidebar spotlight doesn't work inside Sheet portal).
            // Navigate to settings and poll for the toggle element.
            router.push("/dashboard/settings");
            setAwaitingSettings(true);
          } else {
            if (hasActiveSubscription) setRun(true);
          }
        }
      } catch {
        // silently ignore
      }
    };
    check();
  }, [isMobile, router]);

  const handleGoToSettings = () => {
    setRun(false);
    router.push("/dashboard/settings");
    setAwaitingSettings(true);
  };

  const handleClose = () => setRun(false);

  const handleCallback = (data: CallBackProps) => {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      setRun(false);
      setStepIndex(0);
    }
    if (data.type === EVENTS.TARGET_NOT_FOUND) {
      // target not in DOM yet — wait for it
    }
  };

  const tooltipComponent = (props: TooltipRenderProps) => {
    if (stepIndex === 0) {
      return (
        <NavToSettingsTooltip {...props} onGoToSettings={handleGoToSettings} />
      );
    }
    return (
      <ToggleTooltip
        {...props}
        onClose={handleClose}
        onConnect={authorizeGmail}
      />
    );
  };

  return (
    <>
      <Joyride
        run={run}
        steps={STEPS}
        stepIndex={stepIndex}
        tooltipComponent={tooltipComponent}
        callback={handleCallback}
        continuous
        disableOverlayClose
        disableCloseOnEsc
        spotlightClicks={stepIndex === 1}
        styles={{
          options: {
            zIndex: 10000,
            overlayColor: "rgba(0, 0, 0, 0.65)",
          },
          spotlight: {
            borderRadius: 8,
          },
        }}
      />
      {children}
    </>
  );
};
