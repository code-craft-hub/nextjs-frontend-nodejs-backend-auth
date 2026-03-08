import { Button } from "@/components/ui/button";
import { Copy, Info } from "lucide-react";
import { toast } from "sonner";
import type { IUser } from "@/types";

interface ReferralCardProps {
  user: Partial<IUser> | undefined;
}

export function ReferralCard({ user }: ReferralCardProps) {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const referralLink = `${APP_URL}/register?referral=${user?.referralCode ?? "EXA0Q4YZ"}`;
  const usersReferred = user?.referralCount || user?.usersReferred?.length || 0;
  const remaining = Math.max(0, 5 - usersReferred);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral code copied to clipboard!");
  };

  return (
    <main className="flex justify-between items-center gap-4 bg-white border w-full p-4 sm:p-8 rounded-[12px] font-inter">
      <div className="w-full space-y-4">
        <div className="space-y-1">
          <p className="font-semibold text-[18px] leading-6.75 text-[#344054]">
            Referral Program
          </p>
          <p className="font-normal text-[14px] leading-5.25 text-[#667085]">
            Refer 5 friends to unlock 7 extra days of access
          </p>
        </div>

        <section>
          <p className="font-medium text-[14px] leading-5.25 text-[#344054]">Your Referral Link</p>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="box-border flex flex-col justify-center p-2 px-4 w-full bg-[#F9FAFB] border border-[#D0D5DD] rounded-xl">
              <p className="font-semibold text-xs md:text-[16px] leading-6 text-[#101828] tracking-[0.8px]">
                {referralLink}
              </p>
            </div>
            <Button className="h-12" onClick={handleCopy}>
              <Copy /> Copy Link
            </Button>
          </div>
        </section>

        <section>
          <div className="flex flex-row justify-between items-center mb-2">
            <span className="font-inter font-medium text-[14px] leading-5.25 text-[#344054]">
              Referral Progress
            </span>
            <span className="font-inter font-semibold text-[14px] leading-5.25 text-[#4680EE]">
              {usersReferred} of 5 completed
            </span>
          </div>
          <div className="flex items-center w-full h-2.5 bg-[#E5E7EB] rounded-full">
            <div
              className="h-2.5 bg-[#4680EE] rounded-full"
              style={{
                width: `${Math.min(usersReferred * 10 + (usersReferred > 0 ? 50 : 2), 100)}%`,
              }}
            />
          </div>
          <p className="font-['Inter'] mt-3 font-normal text-[12px] leading-4.5 text-[#667085]">
            {remaining > 0
              ? `${remaining} more referral${remaining > 1 ? "s" : ""} needed to unlock 7 extra days`
              : "Referral goal reached! You've unlocked 7 extra days."}
          </p>
        </section>

        <section>
          <div className="box-border flex flex-row items-start gap-3 p-4 bg-[#EFF6FF] border border-[#BEDBFF] rounded-xl">
            <div className="flex flex-col items-start gap-1">
              <p className="flex gap-2 items-center">
                <Info className="text-blue-500 size-5" />
                <span className="font-['Inter'] font-medium text-[13px] leading-5 text-[#344054]">
                  How referrals work
                </span>
              </p>
              <p className="ml-6 font-['Inter'] font-normal text-[12px] leading-4.5 text-[#667085]">
                Share your link with friends. When 5 people sign up using your link during your
                trial, you&apos;ll receive 7 extra days of access.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
