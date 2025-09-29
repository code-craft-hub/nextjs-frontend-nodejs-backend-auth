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
import { jobsData, overviewColumns } from "./AIRecommendations";

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


export const SavedJobs = ()=> {


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
}
