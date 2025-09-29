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

import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

import { overviewColumns } from "./overview-columns";
import { cn } from "@/lib/utils";

export default function JobDashboard() {

  

  // Job listings data
  const jobsData = [
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
    },
  ];

  return (
    <div className="font-inter flex flex-col w-full overflow-hidden gap-y-4">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex flex-row gap-4 py-4">
          {menuItems.map((item) => (
            <div
              className={cn(
                item.bgColor,
                //   item.iconColor,
                //   item.labelColor,
                "flex justify-between p-4 items-center rounded-md w-64 hover:shadow-sm hover:cursor-pointer"
              )}
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
            {/* <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader> */}
            <TableBody className="">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-white border-b !rounded-3xl hover:border-primary hover:border-[2px] hover:rounded-2xl hover:cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} >
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
  );


}
