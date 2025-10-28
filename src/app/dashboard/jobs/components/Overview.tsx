"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import { ArrowRight } from "lucide-react";
import {
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";


import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation";
import { jobsData, overviewColumns } from "./AIRecommendations";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { useQuery } from "@tanstack/react-query";
import JobDashboard from "../../(dashboard)/dashboard-tabs/find-job-tab/FindJobClient";
import { getFindJobsColumns } from "../../(dashboard)/dashboard-tabs/find-job-tab/FindJob";
import { menuItems } from "@/lib/utils/constants";

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

export default function Overview() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  useReactTable({
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



  const leftMenuItems = [
    {
      id: "overview",
      label: "Overview",
      icon: "/overview.svg",
      url: `/dashboard/jobs`,
      isActive: true,
    },
    {
      id: "ai-recommendations",
      label: "AI Recommendations",
      icon: "/ai-recommendation.svg",
      url: `/dashboard/jobs/category?tab=ai-recommendations`,
    },
    {
      id: "saved-jobs",
      label: "Saved Jobs",
      icon: "/saved-job.svg",
      url: `/dashboard/jobs/category?tab=saved-jobs`,
    },
    {
      id: "application-history",
      label: "Application history",
      icon: "/application-history.svg",
      url: `/dashboard/jobs/category?tab=application-history`,
    },
  ];
  const router = useRouter();
  const filters: any = {
    page: 1,
    limit: 20,
  };
  

  const { data: initialData } = useQuery({
    ...jobsQueries.all(filters),
    initialData: undefined, // Let it pull from cache
  });
  return (
    <div className="lg:gap-6 lg:flex ">
      <div className="bg-white p-3 h-fit rounded-md hidden lg:flex lg:flex-col gap-1">
        {leftMenuItems.map((item) => (
          <div
            onClick={() => router.push(item.url)}
            key={item.id}
            className={cn(
              "group flex gap-2 data-[state=active]:bg-primary  data-[state=active]:text-white  p-2 hover:bg-primary hover:text-white hover-cursor-pointer items-center justify-start rounded-md w-44  hover:shadow-sm hover:cursor-pointer",
              item.isActive && "bg-blue-500 text-white"
            )}
          >
            <div className="size-fit rounded-sm">
              <img
                src={item.icon}
                alt={item.label}
                className={cn(
                  "size-4 group-hover:brightness-0 group-hover:invert group-data-[state=active]:brightness-0 group-data-[state=active]:invert",
                  item.isActive && "brightness-0 invert"
                )}
              />
            </div>
            <div className="">
              <p className="text-xs">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="font-inter flex-col grid grid-cols-1 w-full  gap-4 xl:gap-8">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex flex-row gap-4 pb-4">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  item.bgColor,
                  "flex justify-between p-4 items-center rounded-md min-w-64 w-full hover:shadow-sm hover:cursor-pointer"
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
        <div className="flex justify-between bg-[#E05151] p-4 sm:px-8 gap-x-4 my-6 items-center">
          <div className="flex gap-4 items-center ">
            <div className="">
              <img src="/man.png" alt="" />
            </div>
            <div className="text-white font-inter">
              <h1 className="font-medium">
                Your profile editing is not completed.
              </h1>
              <p className="text-xs mt-1">
                Complete your profile editing & build your custom Resume
              </p>
            </div>
          </div>
          <div className="">
            <Button
              variant={"destructive"}
              className="bg-white text-[#E05151] hover:text-[#E05151] hover:bg-white rounded-[2px]"
            >
              Edit Profile <ArrowRight />{" "}
            </Button>
          </div>
        </div>

        <div className="grid pb-16 bg">
          <JobDashboard
            initialJobs={initialData?.data ?? []}
            fingJobsColumns={getFindJobsColumns(router)}
            filters={filters}
            hideToMenus={true}
          />
        </div>

        {/* <div className="space-y-4 w-full">
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
                    (table.getColumn("company")?.getFilterValue() as string) ??
                    ""
                  }
                  onChange={(event) =>
                    table
                      .getColumn("company")
                      ?.setFilterValue(event.target.value)
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
            <div className="overflow-hidden border-none grid grid-cols-1">
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
        </div> */}
      </div>
    </div>
  );
}
