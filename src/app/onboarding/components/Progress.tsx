import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import React from "react";

const Progress = ({
  min,
  max,
  progress = 55,
  className,
}: {
  min: number;
  max: number;
  progress?: number;
  className?: string;
}) => {
  const isMobile = useIsMobile();
  return (
    <div>
      <div
        className={cn(
          "flex flex-col items-start gap-2 w-full",
          isMobile ? "min-w-32 max-w-44" : "min-w-64",
          className
        )}
      >
        <div className="flex flex-row justify-between items-center w-full">
          <span className="text-xs leading-[15px] text-black font-normal font-poppins">
            Progress
          </span>
          <span className="text-xs leading-[15px] text-black font-normal font-poppins">
            {min}/{max}
          </span>
        </div>
        <div className="relative w-full h-[9px]">
          <div className="absolute w-full h-[9px] bg-[#4680EE] opacity-20 rounded-[30px]" />
          <div
            className="absolute h-[9px] bg-[#4680EE] rounded-[30px]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Progress;
