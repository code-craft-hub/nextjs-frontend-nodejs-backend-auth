"use client";

import { memo, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { JobCardProps } from "./types";
import { JobCardDropdown } from "./JobCardDropdown";
import { JobBadges } from "./JobBadges";

export const JobCard = memo(function JobCard({
  recommendation,
  onJobClick,
  onPreview,
}: JobCardProps) {
  const { job, matchScore } = recommendation;

  const handleAutoApply = useCallback(() => {
    onJobClick(job);
  }, [job, onJobClick]);

  const handlePreview = useCallback(() => {
    onPreview(job);
  }, [job, onPreview]);

  const salaryDisplay =
    Array.isArray(job.salaryInfo) && job.salaryInfo.length > 0
      ? job.salaryInfo.join(" - ")
      : "";

  return (
    <div className="flex bg-slate-50 p-4 sm:p-6 rounded-xl gap-4 sm:gap-6 border border-[#cbd5e1] relative">
      {job?.emailApply && (
        <Sparkles className="absolute bottom-4 left-4 text-gray-200 w-5 h-5" />
      )}
      <div className="shrink-0">
        <img
          src={job.companyLogo ? job.companyLogo : "/placeholder.jpg"}
          alt={`${job.companyName} logo`}
          loading="lazy"
          className="size-12"
        />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-inter line-clamp-1 capitalize">{job.title}</h1>
        <JobCardDropdown onAutoApply={handleAutoApply} onPreview={handlePreview} />
        <p className="font-poppins text-cverai-brown text-xs">
          <span className="max-w-sm overflow-hidden capitalize">
            {job.companyName}
          </span>{" "}
          ·{" "}
          <span className="font-inter text-gray-400">{salaryDisplay}</span>
        </p>
        <JobBadges
          employmentType={job.employmentType}
          location={job.location}
          matchScore={matchScore}
        />
      </div>
    </div>
  );
});
