import React from "react";
import { Button } from "@/components/ui/button";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
import { JobType } from "@/types";
import { useRouter } from "next/navigation";
const menuItems = [
  {
    id: "ai-recommendations",
    count: "574",
    label: "AI Recommendations",
    icon: "/bell.svg",
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
    countColor: "text-green-800",
    labelColor: "text-green-700",
    url: "/dashboard/jobs/category?tab=ai-recommendations",
  },
  {
    id: "saved-jobs",
    count: "238",
    label: "Saved Jobs",
    icon: "/save.svg",
    bgColor: "bg-yellow-100",
    iconColor: "text-yellow-600",
    countColor: "text-yellow-800",
    labelColor: "text-yellow-700",
    url: "/dashboard/jobs/category?tab=saved-jobs",
  },
  {
    id: "application-history",
    count: "589",
    label: "Application history",
    icon: "/briefcase-dasboard.svg",
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
    countColor: "text-blue-800",
    labelColor: "text-blue-700",
    url: "/dashboard/jobs/category?tab=application-history",
  },
];

export default function JobDashboard({
  jobs,
  fingJobsColumns,
}: {
  jobs: JobType[];
  fingJobsColumns: any;
}) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const table = useReactTable({
    data: jobs,
    columns: fingJobsColumns,
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
    <div className="font-inter flex flex-col w-full overflow-hidden gap-y-4">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex flex-row gap-4 py-4">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                item.bgColor,
                "flex justify-between p-4 items-center rounded-md w-64 hover:shadow-sm hover:cursor-pointer"
              )}
              onClick={() => {
                router.push(item.url);
              }}
            >
              <div className="">
                <h1 className="font-bold mb-1">{item.count}</h1>
                <p className="text-xs">{item.label}</p>
              </div>
              <div className="bg-white p-3 size-fit rounded-sm">
                <img src={item.icon} alt={item.label} className="size-4" />
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

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
                    colSpan={fingJobsColumns.length}
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
  );
}
