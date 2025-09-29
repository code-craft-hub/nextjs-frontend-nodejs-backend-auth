"use client";
import { InitialUser, IUser } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  memo,
  useMemo,
} from "react";
import JobDashboard from "./FindJobClient";



interface ProfileOption {
  value: string;
  label: string;
  icon: string;
}

type ActionValue =
  | "select-profile"
  | "upload-file"
  | "upload-photo"
  | "tailor-resume"
  | "tailor-cover-letter"
  | "generate-interview-questions";

const SelectOptions = memo(
  ({
    options,
    value,
    onValueChange,
    placeholder,
    className = "",
    triggerClassName = "",
  }: {
    options: readonly ProfileOption[];
    value: ActionValue;
    onValueChange: (value: ActionValue) => void;
    placeholder: string;
    className?: string;
    triggerClassName?: string;
  }) => (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={cn("w-full", triggerClassName)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
          {options.map(({ value, label, icon }) => (
            <SelectItem
              key={value}
              value={value}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
            >
              <div className="flex items-center gap-3 w-full">
                <img src={icon} alt={value} loading="lazy" />
                {/* {icon} */}
                {/* <Icon /> */}
                <span className="text-gray-900 font-medium">{label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
);

SelectOptions.displayName = "SelectOptions";

const RecentActivityCard = memo(() => {
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
export interface OnboardingFormProps {
  onNext: () => void;
  onPrev: () => void;
  initialUser: Partial<IUser>;
  children?: React.ReactNode;
}

export const FindJob = memo(({ initialUser }: InitialUser) => {
  console.log(initialUser);

  return (
    <div className="flex flex-col font-poppins h-screen relative">
      <h1 className="font-instrument text-3xl text-center tracking-tighter mb-8">
        AI Job Document Recommendation
      </h1>
      <div className="grid">
        <JobDashboard />
      </div>
    </div>
  );
});

FindJob.displayName = "FindJob";
