"use client";

import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ColumnDef } from "@tanstack/react-table";
import {
  BookmarkIcon,
  Calendar,
  DollarSign,
  FolderOpen,
  MapPin,
  Sparkles,
} from "lucide-react";
import { PiOfficeChairFill } from "react-icons/pi";
import { formatAppliedDate } from "@/lib/utils/helpers";
import { JobApplication } from "@/types";

// ─── Shared types ─────────────────────────────────────────────────────────────

export type ApplyHandler = (job: JobApplication, e?: React.MouseEvent) => void;

/** Minimum interface required for the bookmark-toggle mutation. */
export interface JobUpdateMutation {
  mutate: (variables: {
    id: string;
    data: Partial<Pick<JobApplication, "isBookmarked" | "isApplied">>;
  }) => void;
}

// ─── Overview columns (Overview, AIRecommendations, SavedJobs) ────────────────

export const OverviewColumn = ({
  updateJobs,
  handleApply,
}: {
  /** Unused – kept so existing callers compile without changes. */
  router?: unknown;
  updateJobs?: JobUpdateMutation;
  handleApply?: ApplyHandler;
}): ColumnDef<JobApplication>[] => [
  {
    accessorKey: "companyText",
    header: "Company",
    cell: ({ row }) => (
      <div className="shrink-0 flex items-center justify-center size-16">
        <img
          src={row.original.companyLogo || "/placeholder.jpg"}
          alt={row.original.companyText}
          className="size-12 object-contain"
        />
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      return (
        <div className="capitalize">
          <div className="flex gap-4 items-center">
            <div className="font-medium text-xs max-w-sm overflow-hidden">
              {row.getValue("title")}
            </div>
            <div className="bg-blue-50 rounded text-blue-600 px-2 py-1">
              <span className="text-2xs">
                {row.original.jobType || row.original.employmentType}
              </span>
            </div>
          </div>
          <div className="flex gap-x-4 mt-1">
            <p className="flex gap-1 text-gray-400 items-center">
              <MapPin className="size-3" />
              <span className="text-2xs">{row.original.location}</span>
            </p>
            <p className="flex gap-1 text-gray-400 items-center">
              <PiOfficeChairFill className="size-3" />
              <span className="text-2xs">{row.original.companyName}</span>
            </p>
            {row.original.salary && (
              <p className="flex gap-1 text-gray-400 items-center">
                <DollarSign className="size-3" />
                <span className="text-2xs">{row.original.salary}</span>
              </p>
            )}
            <p className="flex gap-1 text-gray-400 items-center">
              <Calendar className="size-3" />
              <span className="text-2xs">
                {formatAppliedDate(
                  !!row.original.postedAt
                    ? row.original.postedAt
                    : row.original.updatedAt,
                )}
              </span>
            </p>
          </div>
        </div>
      );
    },
  },
  // Hidden accessor columns — present only so TanStack Table can filter them.
  { accessorKey: "location", cell: () => <div /> },
  { accessorKey: "jobType", cell: () => <div /> },
  { accessorKey: "employmentType", cell: () => <div /> },
  {
    accessorKey: "isBookmarked",
    cell: ({ row }) => {
      const isBookmarked = row.original.isBookmarked ?? false;

      return (
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            updateJobs?.mutate({
              id: String(row.original.id),
              data: { isBookmarked: !isBookmarked },
            });
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
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Button
          disabled={row.original.isApplied}
          className="w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400"
          onClick={(e) => handleApply?.(row.original, e)}
          variant="button"
        >
          {row.original.emailApply ? "Auto Apply" : "Apply Now"}
          {row.original.emailApply && (
            <Sparkles className="size-3 text-yellow-400" />
          )}
        </Button>
      </div>
    ),
  },
];


// ─── Application History columns ──────────────────────────────────────────────

/**
 * Column definition for the Application History view.
 * Shows the applied date and a "View Details" CTA instead of Apply/Bookmark.
 */
export const ApplicationHistoryColumn = ({
  prefetchJob,
  onViewDetails,
}: {
  prefetchJob?: (jobId: string) => void;
  onViewDetails?: (jobId: string) => void;
}): ColumnDef<JobApplication>[] => [
  {
    accessorKey: "companyText",
    header: "Company",
    cell: ({ row }) => (
      <div className="shrink-0 flex items-center justify-center size-16">
        <img
          src={row.original.companyLogo || "/placeholder.jpg"}
          alt={row.original.companyText}
          className="size-12 object-contain"
        />
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="capitalize">
        <div className="flex gap-4 items-center">
          <div className="font-medium text-xs max-w-44 truncate">
            {row.getValue("title")}
          </div>
          <div className="bg-blue-50 rounded-2xl text-blue-600 px-2 py-1">
            <span className="text-2xs">
              {row.original.jobType || row.original.employmentType}
            </span>
          </div>
        </div>
        <div className="flex gap-x-4 mt-1">
          <p className="flex gap-1 text-gray-400 items-center">
            <MapPin className="size-3" />
            <span className="text-2xs">{row.original.location}</span>
          </p>
          <p className="flex gap-1 text-gray-400 items-center">
            <PiOfficeChairFill className="size-3" />
            <span className="text-2xs">{row.original.companyName}</span>
          </p>
          {row.original.salary && (
            <p className="flex gap-1 text-gray-400 items-center">
              <DollarSign className="size-3" />
              <span className="text-2xs">{row.original.salary}</span>
            </p>
          )}
        </div>
      </div>
    ),
  },
  { accessorKey: "location", cell: () => <div /> },
  { accessorKey: "jobType", cell: () => <div /> },
  { accessorKey: "employmentType", cell: () => <div /> },
  {
    accessorKey: "appliedDate",
    header: "Applied Date",
    cell: ({ row }) => (
      <div className="font-medium text-xs">
        {formatAppliedDate(
          !!row.original.appliedDate
            ? row.original.appliedDate
            : !!row.original.postedAt
              ? row.original.postedAt
              : row.original.updatedAt,
        )}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Button
          className="w-full bg-[#F1F2F4] hover:bg-[#E2E4E8] text-primary border-0"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.(row.original.jobId);
          }}
          variant="outline"
          onMouseEnter={() => prefetchJob?.(row.original.jobId)}
          onFocus={() => prefetchJob?.(row.original.jobId)}
        >
          View Details
        </Button>
      </div>
    ),
  },
];

// ─── Skeleton & empty state ───────────────────────────────────────────────────

export function OverviewSkeleton() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="size-16 rounded-sm bg-white" />
      <div className="space-y-2 w-full">
        <Skeleton className="h-6 w-full bg-white" />
        <Skeleton className="h-6 w-full bg-white" />
      </div>
    </div>
  );
}

export function OverviewEmpty({
  searchValue,
  resetSearchToDefault,
}: {
  searchValue?: string;
  resetSearchToDefault?: () => void;
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderOpen />
        </EmptyMedia>
        <EmptyTitle>
          No jobs found{searchValue ? ` for '${searchValue}'` : ""}
        </EmptyTitle>
        <EmptyDescription>
          Try a different keyword or broaden your search.
        </EmptyDescription>
      </EmptyHeader>
      {resetSearchToDefault && (
        <EmptyContent>
          <div className="flex">
            <Button onClick={resetSearchToDefault} variant="outline">
              Reset Search
            </Button>
          </div>
        </EmptyContent>
      )}
    </Empty>
  );
}
