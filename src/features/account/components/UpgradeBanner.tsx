import { Button } from "@/components/ui/button";

interface UpgradeBannerProps {
  onUpgrade: () => void;
}

export function UpgradeBanner({ onUpgrade }: UpgradeBannerProps) {
  return (
    <main className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-linear-to-b w-full p-4 sm:p-8 from-[#4680EE] to-[#3A6FD4] rounded-[12px] text-white font-inter">
      <div className="w-full">
        <p className="font-semibold text-[20px] leading-7.5">Ready to Upgrade?</p>
        <p className="font-normal text-[14px] leading-5.25">
          Get unlimited access with a paid subscription
        </p>
      </div>
      <Button onClick={onUpgrade} className="max-sm:w-full" variant="outline">
        Upgrade Now
      </Button>
    </main>
  );
}
