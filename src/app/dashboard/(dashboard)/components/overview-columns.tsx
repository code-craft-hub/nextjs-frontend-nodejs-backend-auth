import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Calendar, DollarSign, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaRegBookmark, FaBookmark } from "react-icons/fa";
import { JobType } from "@/types";

export const overviewColumns: ColumnDef<JobType>[] = [
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
      <div className=" flex items-center justify-center">
        <img
          src={
            !!row.original.companyLogo
              ? row.original.companyLogo
              : "/placeholder.jpg"
          }
          alt={row.original.companyText}
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
          <div className="font-medium text-xs">{row.getValue("title")}</div>
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
            <span className="text-2xs"> {row.original.salary}</span>
          </p>
          <p className="flex gap-1 text-gray-400">
            <Calendar className="size-3" />
            <span className="text-2xs">{row.original.postedTime}</span>
          </p>
          <p className="text-2xs text-green-400">
            %{row.original.matchPercentage}
          </p>
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
    cell: () => {
      return (
        <div className="flex justify-end">
          <Button variant={"button"}>Apply Now</Button>
        </div>
      );
    },
  },
];
