import { Button } from "@/components/ui/button";
import { requestAuthUrl } from "@/features/email-application/api/gmail-authorization.service";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { Analytics } from "@/lib/analytics";

interface ConnectGmailProps {
  onSkip?: () => void;
  onGetStarted?: () => void;
}

export const OnBoardingForm8: React.FC<ConnectGmailProps> = () => {
  const router = useRouter();

  // User is now viewing the Gmail permissions/warning screen
  useEffect(() => {
    Analytics.gmailConnectWarningView();
  }, []);

  const handleSkip = () => {
    router.push("/dashboard/home");
  };

  const handleConnectGmail = async () => {
    Analytics.gmailConnectStart("onboarding");
    const { success, data } = await requestAuthUrl();
    if (!success) return toast.error(`Failed to get auth URL`);

    // ✅ Start Google OAuth
    const authUrl = (data as any)?.authUrl ?? data?.data?.authUrl;
    if (!authUrl) return toast.error(`Failed to get auth URL`);
    window.location.href = authUrl;
  };
  return (
    <div className="min-h-screen w-full flex flex-col bg-linear-to-br from-blue-100 via-slate-50 to-blue-50">
      {/* Top-left logo */}
      <div className="px-4 sm:px-10 pt-8">
        <img src="/logo.svg" alt="" />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 md:p-16">
        <div className="w-full max-w-4xl bg-white flex flex-col items-center rounded-2xl shadow-sm p-4 sm:p-8 md:p-16">
          {/* Title */}
          <h1 className="text-center font-bold text-3xl leading-snug text-gray-900 mb-3">
            Connect Gmail to Start Applying Automatically
          </h1>

          {/* Subtitle */}
          <p className="text-center text-sm leading-relaxed text-gray-500 max-w-md mb-8">
            Connect your Gmail and let{" "}
            <span className="text-blue-600 font-medium">Cver</span> AI send
            personalized job applications on your behalf, so you never have to
            write repetitive emails again.
          </p>

          {/* Illustration */}
          <div className="flex items-center justify-center mb-9">
            <img src="/connect-gmail-onboarding.svg" alt="" />
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 md:flex items-center gap-4 mb-6">
            {/* Skip */}
            <Button onClick={handleSkip} type="button" variant={"outline"}>
              Skip
            </Button>

            {/* Get started */}
            <Button onClick={handleConnectGmail} type="button">
              Get started
            </Button>
          </div>

          {/* Note */}
          <p className="text-center text-xs text-gray-700">
            <span className="text-red-500 font-semibold">Note:</span> You review
            before sending. We never access personal emails. Disconnect anytime
          </p>
        </div>
      </div>
    </div>
  );
};
