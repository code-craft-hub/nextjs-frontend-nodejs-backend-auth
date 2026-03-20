"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Onborda,
  OnbordaProvider,
  useOnborda,
  CardComponentProps,
} from "onborda";
import { checkAuthStatus } from "@/features/email-application/api/gmail-authorization.service";

// ── Tour card ──────────────────────────────────────────────────────────────
const GmailTourCard: React.FC<CardComponentProps> = ({ step, arrow }) => {
  const { closeOnborda } = useOnborda();
  const router = useRouter();

  const handleGoToSettings = () => {
    closeOnborda();
    router.push("/dashboard/settings");
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-xl p-5 w-72 font-inter">
      {arrow}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{step.icon}</span>
          <h3 className="font-semibold text-gray-900 text-base">
            {step.title}
          </h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">{step.content}</p>
        <button
          onClick={handleGoToSettings}
          className="w-full bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm font-medium py-2 px-4 rounded-lg"
        >
          Go to Settings
        </button>
      </div>
  );
};

// ── Tour steps ─────────────────────────────────────────────────────────────
const GMAIL_TOUR = [
  {
    tour: "gmail-auth",
    steps: [
      {
        icon: "📧",
        title: "Connect your Gmail",
        content:
          "To let Cver AI apply to jobs on your behalf, you need to connect your Gmail account first. Click below to go to Settings.",
        selector: "#onborda-settings-nav",
        side: "right" as const,
        showControls: false,
        pointerPadding: 8,
        pointerRadius: 8,
      },
    ],
  },
];

// ── Auto-starter ───────────────────────────────────────────────────────────
const GmailAuthTourStarter: React.FC = () => {
  const { startOnborda } = useOnborda();

  useEffect(() => {
    const check = async () => {
      try {
        const { authorized } = await checkAuthStatus();
        if (!authorized) {
          startOnborda("gmail-auth");
        }
      } catch {
        // silently ignore – don't block if check fails
      }
    };
    check();
  }, []);

  return null;
};

// ── Provider ───────────────────────────────────────────────────────────────
export const DashboardOnboardingProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <OnbordaProvider>
    <Onborda
      steps={GMAIL_TOUR}
      interact={false}
      shadowRgb="0,0,0"
      shadowOpacity="0.6"
      cardComponent={GmailTourCard}
    >
      {children}
    </Onborda>
    <GmailAuthTourStarter />
  </OnbordaProvider>
);
