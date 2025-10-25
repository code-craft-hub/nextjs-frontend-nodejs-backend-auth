"use client";
import { memo } from "react";
import JobDashboard from "./FindJobClient";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { useQuery } from "@tanstack/react-query";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Calendar, DollarSign, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaRegBookmark, FaBookmark } from "react-icons/fa";
import { humanDate, randomPercentage } from "@/lib/utils/helpers";
import { JobType } from "@/types";
import { JobFilters } from "@/lib/types/jobs";

const fingJobsColumns: ColumnDef<JobType>[] = [
  {
    accessorKey: "company",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          company
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className=" flex items-center justify-center ">
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
          <div className="bg-blue-50 rounde text-blue-600">
            <span className="text-2xs">{row.original.jobType}</span>
          </div>
        </div>
        <div className="flex gap-x-4 mt-1">
          <p className="flex gap-1 text-gray-400">
            <MapPin className="size-3" />
            <span className="text-2xs"> {row.original.location}</span>
          </p>
          <p className="flex gap-1 text-gray-400">
            <DollarSign className="size-3" />
            <span className="text-2xs">
              {" "}
              {row.original?.salary ?? "Not disclosed"}
            </span>
          </p>
          <p className="flex gap-1 text-gray-400">
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
        <div className="flex justify-end">
          {row.original.isBookmarked ? (
            <div>
              <FaBookmark className="size-4" />
            </div>
          ) : (
            <FaRegBookmark className="size-4 text-gray-400" />
          )}
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
  const { data: jobs } = useQuery(jobsQueries.all(filters));

  return (
    <div className="flex flex-col font-poppins h-screen relative">
      <h1 className="font-instrument text-3xl text-center tracking-tighter mb-8">
        AI Job Document Recommendation
      </h1>
      <div className="grid pb-16 bg">
        <JobDashboard jobs={jobs?.data!} fingJobsColumns={fingJobsColumns} />
      </div>
    </div>
  );
});

FindJob.displayName = "FindJob";
