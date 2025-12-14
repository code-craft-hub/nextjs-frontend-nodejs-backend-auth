import { Button } from "@/components/ui/button";
import { Copy, Info } from "lucide-react";
import { UpgradeModal } from "./UpgradeModal";
import { useState } from "react";
import { ProModal } from "./ProSubscription";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries/user.queries";
import { formatFirestoreDate, getDaysRemaining } from "@/lib/utils/helpers";
import { toast } from "sonner";

export const Billing = ({ reference }: any) => {

  const { data: user } = useQuery(userQueries.detail());
  const [completed, setCompleted] = useState(user?.isPro || false);
  const [showPlan, setShowPlan] = useState(false);
  const handleStateChange = (value: boolean) => {
    setCompleted(value);
  };
  const handleShowPlan = (value: boolean) => {
    setShowPlan(value);
  };

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const remainingDays = getDaysRemaining(user?.expiryTime ?? "");
  const REFERRAL = `${APP_URL}/register?referral=${
    user?.referralCode ?? "EXA0Q4YZ"
  }`;
  const usersReferred = user?.usersReferred?.length || 0;

  const handleReferralCopy = () => {
    navigator.clipboard.writeText(REFERRAL);
    toast.success("Referral code copied to clipboard!");
  };


  return !completed ? (
    showPlan ? (
      <UpgradeModal
        trxReference={reference}
        handleStateChange={handleStateChange}
        handleShowPlan={handleShowPlan}
      />
    ) : (
      <div className="flex flex-col items-center gap-[30px] relative ">
        <section className="bg-gradient-to-b space-y-4 from-[#FF9A56] to-[#FF6B35] rounded-[12px] w-full p-4 sm:p-8">
          <div className="flex gap-4 justify-between w-full">
            <div className="text-white space-y-2">
              <h1 className="font-semibold font-inter text-2xl">Free Trial</h1>
              <p className="text-white/80">
                Explore all features with your trial period
              </p>
            </div>
            {Number(remainingDays) > 0 && (
              <div className="flex shrink-0 flex-col justify-center items-center gap-[4px] w-[97.67px] h-[81px] bg-[rgba(255,255,255,0.2)] rounded-[8px]">
                <p className="font-inter text-center font-semibold text-[32px] leading-[32px] text-white">
                  {remainingDays}
                </p>
                <p className="font-inter font-medium text-[14px] leading-[21px] text-center text-white">
                  day{Number(remainingDays) > 1 && "s"} left
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center  gap-4 relative">
            {/* <SegmentedProgress
              percentage={40}
              size={64}
              bgColor="bg-blue-600"
              segmentColor="white"
              textColor="text-white"
              fontSize="text-lg"
            /> */}
            <div className="flex flex-col items-start gap-[4px]">
              <p className="relative">
                <span className=" font-['Inter'] font-medium text-[14px] leading-[21px] text-white">
                  Trial expires on {formatFirestoreDate(user?.expiryTime ?? "")}
                </span>
              </p>
              <p className=" opacity-80 relative">
                <span className="font-inter font-normal text-[12px] leading-[18px] text-white">
                  Upgrade now or refer friends to extend access
                </span>
              </p>
            </div>
          </div>
        </section>

        <main className="flex justify-between items-center gap-4 bg-white border w-full p-4 sm:p-8 rounded-[12px] text-white font-inter">
          <div className="w-full space-y-4">
            <div className="space-y-1">
              <p className=" font-semibold text-[18px] leading-[27px] text-[#344054]">
                Referral Program
              </p>
              <p className=" font-normal text-[14px] leading-[21px] text-[#667085]">
                Refer 5 friends to unlock 7 extra days of access
              </p>
            </div>
            <section className="">
              <p className=" font-medium text-[14px] leading-[21px] text-[#344054]">
                Your Referral Code
              </p>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="box-border flex flex-col justify-center p-2 px-4 w-full bg-[#F9FAFB] border border-[#D0D5DD] rounded-[8px]">
                  <p className="font-semibold text-[16px] leading-[24px] text-[#101828] tracking-[0.8px]">
                    {REFERRAL}
                  </p>
                </div>
                <Button className="h-12" onClick={handleReferralCopy}>
                  <Copy /> Copy Code
                </Button>
              </div>
            </section>
            <section className="">
              <div className="flex space-y-2 flex-row justify-between items-center relative">
                <p className=" relative">
                  <span className="font-inter font-medium text-[14px] leading-[21px] text-[#344054]">
                    Referral Progress
                  </span>
                </p>
                <p className=" relative">
                  <span className="font-inter font-semibold text-[14px] leading-[21px] text-[#4680EE]">
                    {usersReferred} of 5 completed
                  </span>
                </p>
              </div>
              <div className="flex items-center w-full h-[10px] bg-[#E5E7EB] rounded-full relative">
                <div
                  className="h-[10px] bg-[#4680EE] rounded-full"
                  style={{
                    width: `${Math.min(
                      usersReferred * 10 + (usersReferred > 0 ? 50 : 2),
                      100
                    )}%`,
                  }}
                />
              </div>

              <p className="font-['Inter'] mt-3 font-normal text-[12px] leading-[18px] text-[#667085] ">
                {5 - usersReferred} more referrals needed to unlock 7 extra days
              </p>
            </section>

            <section className="">
              <div className="box-border flex flex-row items-start gap-[12px] p-4  bg-[#EFF6FF] border border-[#BEDBFF] rounded-[8px]">
                <div className="flex flex-col items-start gap-[4px] relative">
                  <p className="relative flex gap-2 items-center">
                    <Info className="text-blue-500 size-5 " />
                    <span className=" font-['Inter'] font-medium text-[13px] leading-[20px] text-[#344054]">
                      How referrals work
                    </span>
                  </p>
                  <p className="ml-6 font-['Inter'] font-normal text-[12px] leading-[18px] text-[#667085]">
                    Share your code with friends. When 5 people sign up using
                    your code during your trial, you&apos;ll receive 7 extra
                    days of access
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>
        <main className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-b w-full p-4 sm:p-8 from-[#4680EE] to-[#3A6FD4] rounded-[12px] text-white font-inter">
          <div className="w-full">
            <p className="font-semibold text-[20px] leading-[30px]">
              Ready to Upgrade?
            </p>
            <p className="font-normal text-[14px] leading-[21px]">
              Get unlimited access with a paid subscription
            </p>
          </div>

          <Button
            onClick={() => {
              handleShowPlan(true);
            }}
            className="max-sm:w-full"
            variant={"outline"}
          >
            Upgrade Now
          </Button>
        </main>
      </div>
    )
  ) : (
    <ProModal />
  );
};
