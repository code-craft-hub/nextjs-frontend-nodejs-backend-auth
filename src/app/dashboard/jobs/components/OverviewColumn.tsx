
"use client";
import { Button } from "@/components/ui/button";

import { ColumnDef } from "@tanstack/react-table";
import {
  BookmarkIcon,
  Calendar,
  DollarSign,
  MapPin,
  Sparkles,
} from "lucide-react";
import { formatAppliedDate } from "@/lib/utils/helpers";
import { JobType } from "@/types";
import { Toggle } from "@/components/ui/toggle";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { PiOfficeChairFill } from "react-icons/pi";
import { Skeleton } from "@/components/ui/skeleton";

export const OverviewColumn = ({
  updateJobs,
  handleApply,
}: {
  router: AppRouterInstance;
  updateJobs?: any;
  handleApply?: any;
}): ColumnDef<JobType>[] => [
  {
    accessorKey: "companyText",
    header: "Company",
    cell: ({ row }) => (
      <div className="shrink-0 flex items-center justify-center size-16">
        <img
          src={
            !!row.original.companyLogo
              ? row.original.companyLogo
              : "/placeholder.jpg"
          }
          alt={row.original.companyText}
          className="size-12"
        />
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const matchPercentage = Number(row.original.matchPercentage) || 0;
      return (
        <div className="capitalize ">
          <div className="flex gap-4 items-center">
            <div className="font-medium text-xs max-w-sm overflow-hidden">
              {row.getValue("title")}
            </div>
            <div className="bg-blue-50 rounded text-blue-600 px-2 py-1">
              <span className="text-2xs">
                {!!row.original.jobType
                  ? row.original.jobType
                  : row.original.employmentType}
              </span>
            </div>
            <div className="">
              {matchPercentage > 40 && (
                <Sparkles className="text-yellow-500 size-4" />
              )}
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
            {!!row.original?.salary && (
              <p className="flex gap-1 text-gray-400 items-center">
                <DollarSign className="size-3" />
                <span className="text-2xs">{row.original?.salary}</span>
              </p>
            )}
            <p className="flex gap-1 text-gray-400 items-center">
              <Calendar className="size-3" />
              <span className="text-2xs">
                {formatAppliedDate(
                  row.original?.scrapedAt ||
                    row.original?.postedAt ||
                    row.original?.updatedAt
                )}
              </span>
            </p>
            {matchPercentage > 40 && (
              <p className="text-2xs text-green-400">{matchPercentage}%</p>
            )}
          </div>
        </div>
      );
    },
  },
  { accessorKey: "location", cell: () => <div></div> },
  { accessorKey: "jobType", cell: () => <div></div> },
  { accessorKey: "employmentType", cell: () => <div></div> },
  {
    accessorKey: "isBookmarked",
    cell: ({ row }) => {
      const isBookmarked = row.original.isBookmarked || false;

      return (
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            updateJobs.mutate({
              id: String(row.original.id),
              data: {
                isBookmarked: !isBookmarked,
              },
            });
          }}
          className="flex justify-end"
        >
          <Toggle
            pressed={isBookmarked || false}
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
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <Button
            disabled={row.original.isApplied}
            className="w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400"
            onClick={(event) => handleApply({ event, row })}
            variant={"button"}
          >
            {row.original?.emailApply ? "Auto Apply" : "Apply Now"}
            {row.original?.emailApply && (
              <Sparkles className="text-3 text-yellow" />
            )}
          </Button>
        </div>
      );
    },
  },
];



export function OverviewSkeleton() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="size-16 rounded-sm bg-white" />
      <div className="space-y-2 w-full">
        <Skeleton className="h-6 w-full bg-white" />
        <Skeleton className="h-6 w-full bg-white" />
      </div>
    </div>
  )
}
