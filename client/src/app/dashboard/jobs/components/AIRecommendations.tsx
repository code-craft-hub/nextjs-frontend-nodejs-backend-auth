import React from "react";
import { Button } from "@/components/ui/button";

import { ArrowRight, SearchIcon } from "lucide-react";
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

import { cn } from "@/lib/utils";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Calendar, MapPin } from "lucide-react";
import { FaRegBookmark, FaBookmark } from "react-icons/fa";

export type IJobType = {
  id: number;
  title: string;
  company: string;
  companyLogo: string;
  companyIcon: string;
  companyText: string;
  location: string;
  salary: string;
  postedTime: string;
  matchPercentage: string;
  jobType: string;
  isBookmarked: boolean;
  isFilled: boolean;
};
export const overviewColumns: ColumnDef<IJobType>[] = [
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
        <img src={row.original.companyText} alt={row.original.companyText} />
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
            {/* <DollarSign className="size-3" /> */}
            <span className="text-2xs"> {row.original.salary}</span>
          </p>
          <p className="flex gap-1 text-gray-400">
            <Calendar className="size-3" />
            <span className="text-2xs">{row.original.postedTime}</span>
          </p>
          <p className="text-2xs text-green-500">
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
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <Button variant={"button"} onClick={() => console.log(row)}>
            Apply Now
          </Button>
        </div>
      );
    },
  },
];
export const jobsData = [
  {
    id: 1,
    title: "Technical Support Specialist",
    company: "Google",
    companyLogo: "bg-white border-2 border-gray-200",
    companyIcon: "text-blue-500 font-bold text-lg",
    companyText: "/yt-company.svg",
    location: "Lagos",
    salary: "$15K-$20K",
    postedTime: "2 days ago",
    matchPercentage: "100 match",
    jobType: "Full Time",
    isBookmarked: false,
    isFilled: false,
  },
  {
    id: 2,
    title: "Technical Support Specialist",
    company: "YouTube",
    companyLogo: "bg-red-600",
    companyIcon: "text-white",
    companyText: "/g-company.svg",
    location: "Lagos",
    salary: "$15K-$20K",
    postedTime: "2 days ago",
    matchPercentage: "100 match",
    jobType: "Full Time",
    isBookmarked: false,
    isFilled: false,
  },
  {
    id: 3,
    title: "Technical Support Specialist",
    company: "Reddit",
    companyLogo: "bg-orange-500",
    companyIcon: "text-white",
    companyText: "/r-company.svg",
    location: "Lagos",
    salary: "$15K-$20K",
    postedTime: "2 days ago",
    matchPercentage: "100 match",
    jobType: "Full Time",
    isBookmarked: true,
    isFilled: false,
  },
  {
    id: 4,
    title: "Technical Support Specialist",
    company: "Discord",
    companyLogo: "bg-blue-600",
    companyIcon: "text-white",
    companyText: "/n-company.svg",
    location: "Lagos",
    salary: "$15K-$20K",
    postedTime: "2 days ago",
    matchPercentage: "100 match",
    jobType: "Full Time",
    isBookmarked: false,
    isFilled: false,
  },
  {
    id: 5,
    title: "Technical Support Specialist",
    company: "Instagram",
    companyLogo: "bg-gradient-to-br from-purple-600 to-pink-500",
    companyIcon: "text-white",
    companyText: "/ig-company.svg",
    location: "Lagos",
    salary: "$15K-$20K",
    postedTime: "2 days ago",
    matchPercentage: "100 match",
    jobType: "Full Time",
    isBookmarked: true,
    isFilled: false,
  },
  {
    id: 6,
    title: "Technical Support Specialist",
    company: "Slack",
    companyLogo: "bg-white border-2 border-gray-200",
    companyIcon: "text-red-500",
    companyText: "/sl-company.svg",
    location: "Lagos",
    salary: "$15K-$20K",
    postedTime: "2 days ago",
    matchPercentage: "100 match",
    jobType: "Full Time",
    isBookmarked: false,
    isFilled: true,
  },
];

export const AIRecommendations = () => {

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const table = useReactTable({
    data: jobsData,
    columns: overviewColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="font-inter flex flex-col xl:flex-row  w-full overflow-hidden gap-4 xl:gap-8">
      <div className="space-y-4 w-full">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <div className="">All Jobs</div>
            <p className="text-xs flex gap-1 text-gray-400">
              <span className="">View all</span>
              <ArrowRight className="size-4" />
            </p>
          </div>
        </div>

        <div className="w-full flex flex-col gap-6">
          <div className="bg-white shadow-lg p-4 flex gap-4 justify-between  rounded-lg">
            <div className="flex items-center gap-2 w-full">
              <SearchIcon />
              <input
                type="text"
                value={
                  (table.getColumn("company")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("company")?.setFilterValue(event.target.value)
                }
                placeholder="Job title / Company name"
                className={cn(
                  "focus-visible:border-none focus-visible:outline-none w-full"
                )}
              />
            </div>
            <div className="">
              <Button>Search</Button>
            </div>
          </div>
          <div className="overflow-hidden border-none">
            <Table>
              <TableBody className="">
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-white border-b !rounded-3xl hover:border-primary hover:border-[2px] hover:rounded-2xl hover:cursor-pointer"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={overviewColumns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};
