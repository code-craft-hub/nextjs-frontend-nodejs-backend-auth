import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { memo, useMemo } from "react";



export const RecentActivityCard = memo(() => {
  const badgeData = useMemo(
    () => [
      { text: "Full-Time", variant: "teal" as const },
      { text: "Lagos, Nigeria", variant: "blue" as const },
      { text: "92% match", variant: "orange" as const },
    ],
    []
  );

  return (
    <div className="flex bg-slate-50 p-4 sm:p-6 rounded-xl gap-4 sm:gap-6 border border-[#cbd5e1]">
      <div className="shrink-0">
        <img src="./company.svg" alt="" loading="lazy" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-inter">Social Media Assistant</h1>
        <p className="font-poppins text-cverai-brown text-xs">
          Nomad · <span className="font-inter">$2,000-5,000 / Monthly</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {badgeData.map((badge, badgeIndex) => (
            <div key={badgeIndex} className="flex items-center gap-2">
              <Badge
                className={cn(
                  "rounded-full font-epilogue font-semibold",
                  badge.variant === "teal"
                    ? "bg-cverai-teal/10 text-cverai-teal"
                    : badge.variant === "blue"
                    ? "text-cverai-blue border-cverai-blue bg-white"
                    : "text-cverai-orange border-cverai-orange bg-white"
                )}
              >
                {badge.text}
              </Badge>
              {badgeIndex === 0 && <div className="bg-slate-500 w-[1px] h-7" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

RecentActivityCard.displayName = "RecentActivityCard";