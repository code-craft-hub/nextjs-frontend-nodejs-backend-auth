import type { ColumnDef } from "@tanstack/react-table";
import {
  BookmarkIcon,
  Calendar,
  DollarSign,
  MapPin,
} from "lucide-react";
import { PiOfficeChairFill } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { formatAppliedDate } from "@/lib/utils/helpers";
import type { JobPost } from "@/types";

interface JobColumnCallbacks {
  onBookmark: (job: JobPost) => void;
  onApply: (job: JobPost, e: React.MouseEvent) => void;
}

/** Formats a salaryInfo object into a human-readable string, or null if absent. */
function formatSalary(salaryInfo: JobPost["salaryInfo"]): string | null {
  if (!salaryInfo?.min && !salaryInfo?.max) return null;
  const { currency = "", min, max, period } = salaryInfo;
  const range = max
    ? `${min?.toLocaleString()}-${max.toLocaleString()}`
    : min?.toLocaleString() ?? "";
  return `${currency}${range}${period ? `/${period}` : ""}`.trim() || null;
}

/**
 * Pure column definition factory — no hooks, no side-effects.
 * Memoize the result at the call site with useMemo.
 */
export function getJobColumns({
  onBookmark,
  onApply,
}: JobColumnCallbacks): ColumnDef<JobPost>[] {
  return [
    {
      accessorKey: "companyText",
      header: "Company",
      cell: ({ row }) => (
        <div className="shrink-0 flex items-center justify-center size-16">
          <img
            src={row.original.companyLogo || "/placeholder.jpg"}
            alt={row.original.companyName ?? ""}
            className="size-12 object-contain"
          />
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const job = row.original;
        const salary = formatSalary(job.salaryInfo);
        const dateStr = job.postedAt || job.createdAt || job.updatedAt;

        return (
          <div className="capitalize">
            <div className="flex gap-4 items-center">
              <span className="font-medium text-xs overflow-hidden truncate max-w-44">
                {row.getValue("title")}
              </span>
              {job.employmentType && (
                <span className="bg-blue-50 rounded text-blue-600 px-2 py-1 text-2xs">
                  {job.employmentType}
                </span>
              )}
            </div>
            <div className="flex gap-x-4 mt-1">
              <p className="flex gap-1 text-gray-400 items-center">
                <MapPin className="size-3" />
                <span className="text-2xs w-20 overflow-hidden truncate">
                  {job.location}
                </span>
              </p>
              <p className="flex gap-1 text-gray-400 items-center">
                <PiOfficeChairFill className="size-3" />
                <span className="text-2xs">{job.companyName}</span>
              </p>
              {salary && (
                <p className="flex gap-1 text-gray-400 items-center">
                  <DollarSign className="size-3" />
                  <span className="text-2xs">{salary}</span>
                </p>
              )}
              <p className="flex gap-1 text-gray-400 items-center">
                <Calendar className="size-3" />
                <span className="text-2xs">{formatAppliedDate(dateStr)}</span>
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "isBookmarked",
      header: () => null,
      cell: ({ row }) => (
        <div
          className="flex justify-end"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onBookmark(row.original);
          }}
        >
          <Toggle
            pressed={!!row.original.isBookmarked}
            aria-label="Toggle bookmark"
            size="sm"
            variant="outline"
            className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-blue-500 data-[state=on]:*:[svg]:stroke-blue-500"
          >
            <BookmarkIcon />
          </Toggle>
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div className="flex justify-end">
            <Button
              className="w-full"
              onClick={(e) => onApply(job, e)}
              variant={"button"}
            >
              {job.emailApply ? "Auto Apply" : "Apply Now"}
            </Button>
          </div>
        );
      },
    },
  ];
}
