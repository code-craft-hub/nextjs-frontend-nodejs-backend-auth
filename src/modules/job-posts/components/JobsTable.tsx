"use client";
import MobileOverview from "@/modules/job-posts/components/MobileOverview";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  BookmarkIcon,
  Calendar,
  DollarSign,
  MapPin,
  Sparkles,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PiOfficeChairFill } from "react-icons/pi";
import { formatAppliedDate } from "@/lib/utils/helpers";
import { useUpdateJobMutation } from "@/lib/mutations/jobs.mutations";
import { useApplyJob } from "@/hooks/useApplyJob";
import type { ApplyHandler } from "@/app/dashboard/jobs/components/OverviewColumn";
import { useToggleBookmarkByJobMutation } from "@/lib/mutations/bookmarks.mutations";
import { JobPost } from "../types";

// ─── Row ──────────────────────────────────────────────────────────────────────

function JobRow({
  job,
  handleApply,
  handleBookmark,
  onRowClick,
}: {
  job: JobPost;
  handleApply?: ApplyHandler;
  handleBookmark?: () => void;
  onRowClick: () => void;
}) {
  const isBookmarked = job?.isBookmarked ?? false;

  return (
    <TableRow
      onClick={onRowClick}
      className="hover:bg-white border-b rounded-3xl! hover:border-primary hover:border-2 hover:rounded-2xl hover:cursor-pointer"
    >
      {/* Company logo — fixed 64px column */}
      <TableCell className="w-16 shrink-0">
        <div className="flex items-center justify-center size-16">
          <img
            src={job?.companyLogo || "/placeholder.jpg"}
            alt={job?.companyText ?? ""}
            className="size-12 object-contain"
          />
        </div>
      </TableCell>

      {/* Title + meta — takes all remaining space; min-w-0 enables truncation */}
      <TableCell className="min-w-0">
        <div className="capitalize min-w-0">
          <div className="flex gap-3 items-center min-w-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  className="inline-flex cursor-help"
                  type="button"
                >
                  <div className="capitalize font-medium text-xs truncate min-w-0 max-w-xs">
                    {job?.title}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="capitalize">
                  {job?.title}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="bg-blue-50 rounded text-blue-600 px-2 py-1 shrink-0">
              <span className="text-2xs whitespace-nowrap">
                {job?.jobType || job?.employmentType}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
            <p className="flex gap-1 text-gray-400 items-center min-w-0">
              <MapPin className="size-3 shrink-0" />
              <span className="text-2xs truncate">{job?.location}</span>
            </p>
            <p className="flex gap-1 text-gray-400 items-center min-w-0">
              <PiOfficeChairFill className="size-3 shrink-0" />
              <span className="text-2xs truncate">{job?.companyName}</span>
            </p>
            {job?.salary && (
              <p className="hidden lg:flex gap-1 text-gray-400 items-center">
                <DollarSign className="size-3 shrink-0" />
                <span className="text-2xs">{job?.salary}</span>
              </p>
            )}
            <p className="hidden lg:flex gap-1 text-gray-400 items-center">
              <Calendar className="size-3 shrink-0" />
              <span className="text-2xs whitespace-nowrap">
                {formatAppliedDate(job?.postedAt || job?.updatedAt)}
              </span>
            </p>
          </div>
        </div>
      </TableCell>

      {/* Bookmark — fixed narrow column */}
      <TableCell className="w-12">
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleBookmark?.();
          }}
          className="flex justify-end"
        >
          <Toggle
            pressed={isBookmarked}
            aria-label="Toggle bookmark"
            size="sm"
            variant="outline"
            className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-black data-[state=on]:*:[svg]:stroke-black"
          >
            <BookmarkIcon />
          </Toggle>
        </div>
      </TableCell>

      {/* Apply — fixed width, no w-full on button */}
      <TableCell className="w-32">
        <div className="flex justify-end">
          <Button
            className="whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400"
            onClick={(e) => {
              e.stopPropagation();
              handleApply?.(job, e);
            }}
            variant="button"
          >
            {job?.emailApply ? "Auto Apply" : "Apply Now"}
            {job?.emailApply && <Sparkles className="size-3 text-yellow-400" />}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

export default function JobsTable({
  allJobs,
  referrer,
}: {
  allJobs: JobPost[];
  referrer: string;
}) {
  const router = useRouter();
  const updateJobs = useUpdateJobMutation();
  const toggleBookmark = useToggleBookmarkByJobMutation();
  const { applyToJob: handleApply } = useApplyJob();

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableBody>
            {allJobs.map((job) => (
              <JobRow
                key={job?.id}
                job={job}
                handleApply={handleApply}
                handleBookmark={() =>
                  toggleBookmark.mutate({
                    jobId: job?.id,
                    isBookmarked: job?.isBookmarked ?? false,
                  })
                }
                onRowClick={() =>
                  router.push(
                    `/dashboard/jobs/${job?.id}?referrer=${referrer ?? "jobs"}&title=${encodeURIComponent(job?.title ?? "")}`,
                  )
                }
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile (MobileOverview has lg:hidden internally; this wrapper cuts it at md) */}
      <div className="lg:hidden mt-4">
        <MobileOverview
          allJobs={allJobs}
          updateJobs={updateJobs}
          handleApply={handleApply}
        />
      </div>
    </div>
  );
}
