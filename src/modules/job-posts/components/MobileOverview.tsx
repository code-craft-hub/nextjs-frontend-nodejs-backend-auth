import { Toggle } from "@/components/ui/toggle";
import { formatAppliedDate } from "@/lib/utils/helpers";
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
import {
  ApplyHandler,
  JobUpdateMutation,
} from "../../../app/dashboard/jobs/components/OverviewColumn";
import { JobApplication } from "@/types";

interface MobileOverviewProps {
  allJobs?: JobApplication[];
  updateJobs?: JobUpdateMutation;
  handleApply?: ApplyHandler;
  /**
   * Used to build the back-navigation URL on the job detail page.
   * Must match one of the referrer values expected by JobIdClient.
   * Defaults to "jobs" (the main job listing page).
   */
  referrer?: string;
}

/**
 * Mobile-only job card list (hidden on lg+).
 * Pair with JobsTable for the desktop view.
 */
const MobileOverview = memo(function MobileOverview({
  allJobs,
  updateJobs,
  handleApply,
  referrer = "jobs",
}: MobileOverviewProps) {
  const router = useRouter();

  return (
    <div className="space-y-4 lg:hidden">
      {allJobs?.map((job) => {
        const isBookmarked = job?.isBookmarked ?? false;

        return (
          <div
            key={job?.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() =>
              router.push(
                `/dashboard/jobs/${job?.id}?referrer=${referrer}&title=${encodeURIComponent(job?.title ?? "")}`,
              )
            }
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 flex items-center justify-center">
                <img
                  src={job?.companyLogo || "/placeholder.jpg"}
                  alt={job?.company ?? ""}
                  className="w-10 h-10 object-contain"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <h2 className="text-sm font-semibold text-gray-900 capitalize truncate">
                      {job?.title}
                    </h2>
                  </div>

                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateJobs?.mutate({
                        id: String(job?.id),
                        data: { isBookmarked: !isBookmarked },
                      });
                    }}
                    className="shrink-0 -mt-2 -mr-2"
                  >
                    <Toggle
                      pressed={isBookmarked}
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
                    <span className="text-xs">{job?.location}</span>
                  </div>
                  {job?.salary && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="size-3" />
                      <span className="text-xs">{job?.salary}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    <span className="text-xs whitespace-nowrap">
                      {formatAppliedDate(
                        job?.postedAt || job?.updatedAt,
                      )}
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-2xs whitespace-nowrap rounded-full">
                    {job?.employmentType || job?.jobType}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                 
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApply?.(job, e);
                    }}
                    className="ml-auto bg-blue-50 text-blue-600 px-2 py-2 text-2xs rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 font-medium"
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
});

export default MobileOverview;
