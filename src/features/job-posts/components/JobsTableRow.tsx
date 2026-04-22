"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Toggle } from "@/components/ui/toggle";
import { BookmarkIcon, Calendar, DollarSign, MapPin } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PiOfficeChairFill } from "react-icons/pi";
import { formatAppliedDate, stripUrlProtocol } from "@/lib/utils/helpers";
import type { JobPost } from "@/features/job-posts";
import type { BotSession } from "@/features/browser-automation";
import type { ExtensionState, ExtJobUpdate } from "@/features/job-posts/hooks/useExtension";
import { JobsTableApplyButton } from "./JobsTableApplyButton";

interface Props {
  job: JobPost;
  session: BotSession | undefined;
  extState: ExtensionState;
  extJobStatus: ExtJobUpdate | undefined;
  onApply: (job: JobPost, e?: React.MouseEvent) => void;
  onResume: (applicationId: string) => void;
  onViewQA: (jobId: string) => void;
  onEmailApply: (recruiterEmail: string) => void;
  onExtApply: (job: JobPost) => void;
  onFocusExtTab: (jobId: string) => void;
  onBookmark: () => void;
  onRowClick: () => void;
}

export function JobsTableRow({
  job,
  session,
  extState,
  extJobStatus,
  onApply,
  onResume,
  onViewQA,
  onEmailApply,
  onExtApply,
  onFocusExtTab,
  onBookmark,
  onRowClick,
}: Props) {
  const link = job?.link || job?.applyUrl || job?.emailApply;

  return (
    <TableRow
      onClick={onRowClick}
      className="hover:bg-white border-b rounded-3xl! hover:border-primary hover:border-2 hover:rounded-2xl hover:cursor-pointer"
    >
      {/* Company logo */}
      <TableCell className="w-16 shrink-0">
        <div className="flex items-center justify-center size-16">
          <img
            src={job?.companyLogo || "/placeholder.jpg"}
            alt={job?.companyText ?? ""}
            className="size-12 object-contain"
          />
        </div>
      </TableCell>

      {/* Job info */}
      <TableCell className="min-w-0">
        <div className="capitalize min-w-0">
          <div className="flex gap-3 items-center min-w-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="inline-flex cursor-help" type="button">
                  <div className="capitalize font-medium text-xs truncate min-w-0 max-w-xs">
                    {job?.title}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="capitalize">{job?.title}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="bg-blue-50 rounded text-blue-600 px-2 py-1 shrink-0">
              <span className="text-2xs whitespace-nowrap">
                {job?.jobType || job?.employmentType || job?.classification || job?.localizedTo}
              </span>
            </div>
            <div className="bg-blue-50 rounded text-blue-600 px-2 py-1 shrink-0">
              <span className="text-2xs whitespace-nowrap">
                {stripUrlProtocol(link ?? "")?.split("/")[0]}
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
                <span className="text-2xs">{job.salary}</span>
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

      {/* Bookmark */}
      <TableCell className="w-12">
        <div
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onBookmark(); }}
          className="flex justify-end"
        >
          <Toggle
            pressed={job?.isBookmarked ?? false}
            aria-label="Toggle bookmark"
            size="sm"
            variant="outline"
            className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-black data-[state=on]:*:[svg]:stroke-black"
          >
            <BookmarkIcon />
          </Toggle>
        </div>
      </TableCell>

      {/* Apply button */}
      <TableCell className="w-40">
        <div className="flex justify-end">
          <JobsTableApplyButton
            job={job}
            session={session}
            extState={extState}
            extJobStatus={extJobStatus}
            onApply={onApply}
            onResume={onResume}
            onViewQA={onViewQA}
            onEmailApply={onEmailApply}
            onExtApply={onExtApply}
            onFocusExtTab={onFocusExtTab}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
