import { Toggle } from "@/components/ui/toggle";
import { formatAppliedDate } from "@/lib/utils/helpers";
import { JobType } from "@/types";
import {
  ArrowRight,
  BookmarkIcon,
  Calendar,
  DollarSign,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { memo } from "react";
import { ApplyHandler } from "./OverviewColumn";

const MobileOverview = memo(
  ({
    allJobs,
    updateJobs,
    handleApply,
  }: {
    allJobs: JobType[];
    updateJobs?: any;
    handleApply?: ApplyHandler;
  }) => {
    const router = useRouter();
    return (
      <div className="space-y-4 lg:hidden">
        {allJobs.map((job) => {
          const isBookmarked = job.isBookmarked || false;
          return (
            <div
              key={job.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              onClick={() => {
                router.push(
                  `/dashboard/jobs/${job?.id}?referrer=jobs&title=${job?.title}`
                );
              }}
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 h-full  flex items-center justify-center">
                  <img
                    src={
                      !!job.companyLogo ? job.companyLogo : "/placeholder.jpg"
                    }
                    alt={job.company}
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start overflow-hidden justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h2 className="text-sm font-semibold text-gray-900 capitalize wrap-break-word  ">
                        {job.title}
                      </h2>
                      <span className="px-3 hidden sm:flex py-1 bg-blue-50 text-blue-600 text-2xs text-nowrap sm:text-xs rounded-full">
                        {job.employmentType || job.jobType}
                      </span>
                    </div>
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        updateJobs.mutate({
                          id: String(job.id),
                          data: {
                            isBookmarked: !isBookmarked,
                          },
                        });
                      }}
                      className="flex shrink-0 justify-end -mt-2 -mr-2"
                    >
                      <Toggle
                        pressed={isBookmarked || false}
                        aria-label="Toggle bookmark"
                        size="sm"
                        // variant="outline"
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
                    {!!job?.salary && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="size-3" />
                        <span className="text-xs">{job.salary}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      <span className="text-xs text-nowrap">
                        {formatAppliedDate(
                          job?.scrapedAt || job?.postedAt || job?.updatedAt
                        )}
                      </span>
                    </div>
                    <span className="px-3 sm:hidden py-1 bg-blue-50 text-blue-600 text-2xs text-nowrap sm:text-xs rounded-full">
                      {job.employmentType || job.jobType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    {Number(job?.matchPercentage || 0) > 40 && (
                      <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                        <span>%</span>
                        <span>{job.matchPercentage} match</span>
                      </div>
                    )}
                    <button
                      onClick={(event) => handleApply?.(job, event)}
                      className=" bg-blue-50 text-blue-600 px-2 py-2 text-2xs rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 font-medium"
                    >
                      {job?.emailApply ? (
                        <>
                          Auto Apply
                          <Sparkles className="size-3 text-blue-500" />
                        </>
                      ) : (
                        <>
                          Apply Now
                          <ArrowRight className="size-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

MobileOverview.displayName = "MobileOverview";

export default MobileOverview;
