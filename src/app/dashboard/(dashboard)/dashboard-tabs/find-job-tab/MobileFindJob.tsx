"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookmarkIcon,
  Calendar,
  DollarSign,
  MapPin,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { formatAppliedDate } from "@/lib/utils/helpers";
import type { JobPost } from "@/types";
import { useJobActions } from "./hooks/useJobActions";

const MobileFindJob = memo(({ allJobs }: { allJobs: JobPost[] }) => {
  const router = useRouter();
  const { handleBookmark, handleApply } = useJobActions();

  return (
    <div className="space-y-4 lg:hidden">
      {allJobs.map((job) => (
        <div
          key={job.id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          onClick={() =>
            router.push(
              `/dashboard/jobs/${job.id}?referrer=jobs&title=${job.title}`
            )
          }
        >
          <div className="flex items-start gap-4">
            <div className="shrink-0 flex items-center justify-center">
              <img
                src={job.companyLogo || "/placeholder.jpg"}
                alt={job.companyName ?? ""}
                className="w-10 h-10 object-contain"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-semibold text-gray-900 capitalize wrap-break-word">
                    {job.title}
                  </h2>
                  {job.employmentType && (
                    <span className="px-3 hidden sm:flex py-1 bg-blue-50 text-blue-600 text-2xs text-nowrap sm:text-xs rounded-full">
                      {job.employmentType}
                    </span>
                  )}
                </div>

                <div
                  className="flex justify-end -mt-2 -mr-2"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleBookmark(job);
                  }}
                >
                  <Toggle
                    pressed={!!job.isBookmarked}
                    aria-label="Toggle bookmark"
                    size="sm"
                    className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-black data-[state=on]:*:[svg]:stroke-black"
                  >
                    <BookmarkIcon />
                  </Toggle>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="size-3 shrink-0" />
                  <span className="text-xs">{job.location}</span>
                </div>
                {job.salaryInfo && (job.salaryInfo.min || job.salaryInfo.max) && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="size-3" />
                    <span className="text-xs">
                      {job.salaryInfo.currency}
                      {job.salaryInfo.min?.toLocaleString()}
                      {job.salaryInfo.max
                        ? `-${job.salaryInfo.max.toLocaleString()}`
                        : ""}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  <span className="text-xs text-nowrap">
                    {formatAppliedDate(job.postedAt || job.updatedAt)}
                  </span>
                </div>
                {job.employmentType && (
                  <span className="px-3 sm:hidden py-1 bg-blue-50 text-blue-600 text-2xs text-nowrap sm:text-xs rounded-full">
                    {job.employmentType}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end">
                <button
                  className="bg-blue-50 text-blue-600 px-2 py-2 text-2xs rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 font-medium"
                  onClick={(e) => handleApply(job, e)}
                >
                  {job.emailApply ? "Auto Apply" : "Apply Now"}
                  <ArrowRight className="size-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

MobileFindJob.displayName = "MobileFindJob";

export default MobileFindJob;
