import { Button } from "@/components/ui/button";
import { Copy, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UpgradeModal } from "./UpgradeModal";
import { SegmentedProgress } from "./SegmentedProgress";
import { useState } from "react";
import { ProModal } from "./ProSubscription";
// import { UpdatePaymentPlan } from "./UpdatePaymentPlan";
export const Billing = () => {
  const [completed, setCompleted] = useState(false);
  const handleStateChange = (value: boolean) => {
    setCompleted(value);
  };

  // return <ProModal />;
  // return <UpdatePaymentPlan />;

  return !completed ? (
    <div className="flex flex-col items-center gap-[30px] relative ">
      <section className="bg-gradient-to-b space-y-4 from-[#FF9A56] to-[#FF6B35] rounded-[12px] w-full p-4 sm:p-8">
        <div className="flex gap-4 justify-between w-full">
          <div className="text-white space-y-2">
            <h1 className="font-semibold font-inter text-2xl">Free Trial</h1>
            <p className="text-white/80">
              Explore all features with your trial period
            </p>
          </div>
          <div className="flex shrink-0 flex-col justify-center items-center gap-[4px] w-[97.67px] h-[81px] bg-[rgba(255,255,255,0.2)] rounded-[8px]">
            <p className="font-inter text-center font-semibold text-[32px] leading-[32px] text-white">
              3
            </p>
            <p className="font-inter font-medium text-[14px] leading-[21px] text-center text-white">
              days left
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center  gap-4 relative">
          {/* <div className="w-[80px] h-[80px] relative rounded-full border-[8px] border-solid border-[rgba(255,255,255,0.3)]">
            <div className="w-[77px] h-[77px] absolute -left-[7px] -top-1.5 rounded-full border-[8px] border-dashed border-white" />
            <p className="font-inter absolute top-1/2 -translate-1/2 left-1/2 -translate-y-1/2 font-semibold text-[18px] leading-[27px] text-white">
              100%
            </p>
          </div> */}

          <SegmentedProgress
            percentage={40}
            size={64}
            bgColor="bg-blue-600"
            segmentColor="white"
            textColor="text-white"
            fontSize="text-lg"
          />
          <div className="flex flex-col items-start gap-[4px]">
            <p className="relative">
              <span className=" font-['Inter'] font-medium text-[14px] leading-[21px] text-white">
                Trial expires on Nov 14, 2025
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
                  ALEXA2024XYZ
                </p>
              </div>
              <Button className="h-12">
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
                  2 of 5 completed
                </span>
              </p>
            </div>
            <div className="flex flex-row items-center  w-full h-[10px] bg-[#E5E7EB] rounded-full relative">
              <div className="w-[397.59px] h-[10px] bg-[#4680EE] rounded-full" />
            </div>
            <p className="font-['Inter'] mt-3 font-normal text-[12px] leading-[18px] text-[#667085] ">
              3 more referrals needed to unlock 7 extra days
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
                  Share your code with friends. When 5 people sign up using your
                  code during your trial, you'll receive 7 extra days of access
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

        <Dialog>
          <form className="max-sm:w-full">
            <DialogTrigger asChild>
              <Button className="max-sm:w-full" variant={"outline"}>
                Upgrade Now
              </Button>
            </DialogTrigger>
            <DialogContent className="!max-w-none h-[90svh] sm:!w-[80svw] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="sr-only">Edit profile</DialogTitle>
                <DialogDescription className="sr-only">
                  Make changes to your profile here. Click save when you&apos;re
                  done.
                </DialogDescription>
              </DialogHeader>
              <UpgradeModal handleStateChange={handleStateChange} />
            </DialogContent>
          </form>
        </Dialog>
      </main>
    </div>
  ) : (
    <ProModal />
  );
};
