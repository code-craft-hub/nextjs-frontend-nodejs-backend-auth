"use client";

import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { JobBadgesProps } from "./types";

export const JobBadges = memo(function JobBadges({
  jobType,
  employmentType,
  location,
  matchScore,
}: JobBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          className={cn(
            "rounded-full font-epilogue font-semibold bg-cverai-teal/10 text-cverai-teal",
            "truncate overflow-hidden text-start",
          )}
        >
          {jobType ? jobType : employmentType}
        </Badge>
        <div className="bg-slate-500 w-px h-7" />
        <Badge
          className={cn(
            "rounded-full font-epilogue text-wrap font-semibold text-cverai-blue border-cverai-blue bg-white",
            "truncate overflow-hidden text-start max-sm:max-w-44",
          )}
        >
          {location}
        </Badge>
        {matchScore != null && matchScore > 40 && (
          <Badge
            className={cn(
              "rounded-full font-epilogue font-semibold text-cverai-orange border-cverai-orange bg-white",
              "truncate overflow-hidden text-start",
            )}
          >
            {Math.round(matchScore)}% match
          </Badge>
        )}
      </div>
    </div>
  );
});
