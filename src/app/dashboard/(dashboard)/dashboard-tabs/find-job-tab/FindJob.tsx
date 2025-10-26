"use client";
import { memo } from "react";
import JobDashboard from "./FindJobClient";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { useQuery } from "@tanstack/react-query";

import { ColumnDef } from "@tanstack/react-table";
import { BookmarkIcon, Calendar, DollarSign, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { humanDate, randomPercentage } from "@/lib/utils/helpers";
import { JobType } from "@/types";
import { JobFilters } from "@/lib/types/jobs";
import { Toggle } from "@/components/ui/toggle";
// import { useUpdateJobMutation } from "@/lib/mutations/jobs.mutations";

// Move column definition outside component and make it a function
export const getFindJobsColumns = (
  // updateJobs: ReturnType<typeof useUpdateJobMutation>
): ColumnDef<JobType>[] => [
  {
    accessorKey: "companyText",
    header: "Company",
    cell: ({ row }) => (
      <div className="shrink-0 flex items-center justify-center size-16">
        <img
          src={row.original.companyLogo ?? "/company.svg"}
          alt={row.original.companyText}
          className="size-12"
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
          <div className="font-medium text-xs max-w-sm overflow-hidden">
            {row.getValue("title")}
          </div>
          <div className="bg-blue-50 rounded text-blue-600 px-2 py-1">
            <span className="text-2xs">{row.original.jobType}</span>
          </div>
        </div>
        <div className="flex gap-x-4 mt-1">
          <p className="flex gap-1 text-gray-400 items-center">
            <MapPin className="size-3" />
            <span className="text-2xs">{row.original.location}</span>
          </p>
          <p className="flex gap-1 text-gray-400 items-center">
            <DollarSign className="size-3" />
            <span className="text-2xs">
              {row.original?.salary ?? "Not disclosed"}
            </span>
          </p>
          <p className="flex gap-1 text-gray-400 items-center">
            <Calendar className="size-3" />
            <span className="text-2xs">
              {humanDate(row.original?.scrapedDate)}
            </span>
          </p>
          <p className="text-2xs text-green-400">{randomPercentage()}</p>
        </div>
      </div>
    ),
  },

  {
    accessorKey: "isBookmarked",
    header: () => <div className=""></div>,
    cell: ({ row }) => {
      return (
        <div
          onClick={() => {
            console.log(row.original.id);
            // updateJobs.mutate({
            //   id: String(row.original.id),
            //   data: {
            //     isBookmarked: !row.original.isBookmarked,
            //   },
            // });
          }}
          className="flex justify-end"
        >
          <Toggle
            pressed={row.original.isBookmarked}
            aria-label="Toggle bookmark"
            size="sm"
            variant="outline"
            className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-blue-500 data-[state=on]:*:[svg]:stroke-blue-500"
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
            onClick={() => {
              window.open(row.original.link, "_blank");
            }}
            variant={"button"}
          >
            Apply Now
          </Button>
        </div>
      );
    },
  },
];

export const FindJob = memo(({ filters }: { filters: JobFilters }) => {
  const { data: initialData } = useQuery({
    ...jobsQueries.all(filters),
    initialData: undefined, // Let it pull from cache
  });

  // const updateJobs = useUpdateJobMutation();

  // Generate columns with the mutation
  const columns = getFindJobsColumns(
    // updateJobs
  );

  return (
    <div className="flex flex-col font-poppins h-screen relative">
      <h1 className="font-instrument text-3xl text-center tracking-tighter mb-8">
        AI Job Document Recommendation
      </h1>
      <div className="grid pb-16 bg">
        <JobDashboard
          initialJobs={initialData?.data ?? []}
          fingJobsColumns={columns}
          filters={filters}
        />
      </div>
    </div>
  );
});

FindJob.displayName = "FindJob";
