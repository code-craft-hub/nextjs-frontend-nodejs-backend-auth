"use client";

import { useInfiniteQuery } from '@tanstack/react-query';
import { jobsQueries } from '@/lib/queries/jobs.queries';

export default function Overview() {
  const infiniteFilters = {}; // Your filters here
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    fetchPreviousPage,
    hasPreviousPage,
    isFetchingPreviousPage,
  } = useInfiniteQuery(jobsQueries.infinite(infiniteFilters));

  console.log('Infinite Query Data:', data);

  const allJobs = data?.pages.flatMap(page => page.data) || [];

  return (
    <div className="mt-32 p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Job Listings</h1>
      
      {/* Display Jobs */}
      <div className="space-y-3">
        {allJobs.map((job, index) => (
          <div key={job.id || index} className="p-4 border rounded-lg bg-white shadow">
            <h3 className="font-semibold text-lg">{job.title}</h3>
            <p className="text-gray-600">{job.companyName}</p>
            <p className="text-sm text-gray-500">{job.location}</p>
          </div>
        ))}
      </div>

      {/* Pagination Info */}
      <div className="text-sm text-gray-600">
        Loaded {allJobs.length} jobs across {data?.pages.length || 0} pages
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => fetchPreviousPage()}
          disabled={!hasPreviousPage || isFetchingPreviousPage}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isFetchingPreviousPage ? 'Loading...' : 'Previous Page'}
        </button>

        <button
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isFetchingNextPage ? 'Loading...' : 'Next Page'}
        </button>
      </div>

      {/* Debug Info */}
      <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
        {data?.pages[0]?.totalCount} pages loaded | {data?.pages[0]?.totalPages} total pages |
        hasNextPage: {String(hasNextPage)} | hasPreviousPage: {String(hasPreviousPage)}
      </div>
    </div>
  );
}

// import React, { useEffect, useMemo, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
// import {
//   ColumnFiltersState,
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getSortedRowModel,
//   SortingState,
//   useReactTable,
//   VisibilityState,
// } from "@tanstack/react-table";

// import { cn } from "@/lib/utils";

// import { useRouter } from "next/navigation";
// import { jobsQueries } from "@/lib/queries/jobs.queries";
// import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
// import { leftMenuItems, menuItems } from "@/lib/utils/constants";
// import { v4 as uuidv4 } from "uuid";
// import { ColumnDef } from "@tanstack/react-table";
// import {
//   BookmarkIcon,
//   Calendar,
//   DollarSign,
//   MapPin,
//   ArrowRight,
//   Sparkles,
//   SearchIcon,
//   Loader2,
// } from "lucide-react";
// import {
//   getDataSource,
//   humanDate,
//   randomPercentage,
// } from "@/lib/utils/helpers";
// import { IUser, JobType } from "@/types";
// import { Toggle } from "@/components/ui/toggle";
// import { apiService } from "@/hooks/use-auth";
// import { toast } from "sonner";
// import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
// import { userQueries } from "@/lib/queries/user.queries";
// import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

// export default function Overview() {
//   const router = useRouter();
//   const [searchValue, setSearchValue] = useState("");
//   const [isAutoFetching, setIsAutoFetching] = useState(false);
//   const filters: any = {
//     page: 1,
//     limit: 20,
//   };
//   const { data: user } = useQuery(userQueries.detail());

//   const [sorting, setSorting] = React.useState<SortingState>([]);
//   const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
//     []
//   );

//   const [columnVisibility, setColumnVisibility] =
//     React.useState<VisibilityState>({});
//   const [rowSelection, setRowSelection] = React.useState({});
//   const columns = getFindJobsColumns(router, user!);
//   const { data: initialData } = useQuery({
//     ...jobsQueries.all(filters),
//     initialData: undefined, // Let it pull from cache
//   });

//   const { page, ...infiniteFilters } = filters as any;

//   // Use infinite query
//   const {
//     data,
//     fetchNextPage,
//     hasNextPage,
//     isFetchingNextPage,
//     isLoading,
//     fetchPreviousPage,
//   } = useInfiniteQuery(jobsQueries.infinite(infiniteFilters));

//   console.log(data);

//   return (
//     <div className="bg-red-500 mt-32">
//       work hard
//       <button
//         onClick={() => {
//           fetchNextPage();
//         }}
//       >
//         fetchNextPage
//       </button>
//       <button
//         onClick={() => {
//           fetchPreviousPage();
//         }}
//       >
//         fetchPreviousPage
//       </button>
//     </div>
//   );

//   // const allJobs = useMemo(() => {
//   //   return data?.pages.flatMap((page) => page.data) ?? initialData?.data ?? [];
//   // }, [data, initialData]);
//   const table = useReactTable({
//     data: allJobs,
//     columns: columns,
//     onSortingChange: setSorting,
//     onColumnFiltersChange: setColumnFilters,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     onColumnVisibilityChange: setColumnVisibility,
//     onRowSelectionChange: setRowSelection,
//     state: {
//       sorting,
//       columnFilters,
//       columnVisibility,
//       rowSelection,
//     },
//   });

//   useEffect(() => {
//     const checkAndFetchMore = async () => {
//       const currentSearchValue = table
//         .getColumn("title")
//         ?.getFilterValue() as string;

//       // Only proceed if there's a search value
//       if (!currentSearchValue || currentSearchValue.trim() === "") {
//         setIsAutoFetching(false);
//         return;
//       }

//       const filteredRows = table.getFilteredRowModel().rows;

//       // If no results found and there are more pages, fetch next page
//       if (filteredRows.length === 0 && hasNextPage && !isFetchingNextPage) {
//         setIsAutoFetching(true);
//         await fetchNextPage();
//       } else {
//         setIsAutoFetching(false);
//       }
//     };

//     // Debounce the check to avoid too many calls
//     const timeoutId = setTimeout(checkAndFetchMore, 300);

//     return () => clearTimeout(timeoutId);
//   }, [
//     table.getColumn("title")?.getFilterValue(),
//     table.getFilteredRowModel().rows.length,
//     hasNextPage,
//     isFetchingNextPage,
//     fetchNextPage,
//   ]);

//   const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const value = event.target.value;
//     setSearchValue(value);
//     table.getColumn("title")?.setFilterValue(value);
//   };

//   const visibleRows = table.getRowModel().rows;
//   const hasNoResults = visibleRows.length === 0;
//   const isSearching = isAutoFetching || isFetchingNextPage;

//   return (
//     <div className="lg:gap-6 lg:flex ">
//       <div className="bg-white p-3 h-fit rounded-md hidden lg:flex lg:flex-col gap-1">
//         {leftMenuItems.map((item) => (
//           <div
//             onClick={() => router.push(item.url)}
//             key={item.id}
//             className={cn(
//               "group flex gap-2 data-[state=active]:bg-primary  data-[state=active]:text-white  p-2 hover:bg-primary hover:text-white hover-cursor-pointer items-center justify-start rounded-md w-44  hover:shadow-sm hover:cursor-pointer",
//               item.isActive && "bg-blue-500 text-white"
//             )}
//           >
//             <div className="size-fit rounded-sm">
//               <img
//                 src={item.icon}
//                 alt={item.label}
//                 className={cn(
//                   "size-4 group-hover:brightness-0 group-hover:invert group-data-[state=active]:brightness-0 group-data-[state=active]:invert",
//                   item.isActive && "brightness-0 invert"
//                 )}
//               />
//             </div>
//             <div className="">
//               <p className="text-xs">{item.label}</p>
//             </div>
//           </div>
//         ))}
//       </div>
//       <div className="w-full flex flex-col gap-6">
//         <ScrollArea className="grid grid-cols-1">
//           <div className="flex flex-row gap-4 py-4 mx-auto w-fit">
//             {menuItems.map((item) => (
//               <div
//                 key={item.id}
//                 className={cn(
//                   item.bgColor,
//                   "flex justify-between p-4 items-center rounded-md w-64 hover:shadow-sm hover:cursor-pointer"
//                 )}
//                 onClick={() => {
//                   router.push(item.url);
//                 }}
//               >
//                 <div className="">
//                   <h1 className="font-bold mb-1">{item.count}</h1>
//                   <p className="text-xs">{item.label}</p>
//                 </div>
//                 <div className="bg-white p-3 size-fit rounded-sm">
//                   <img src={item.icon} alt={item.label} className="size-4" />
//                 </div>
//               </div>
//             ))}
//           </div>
//           <ScrollBar orientation="horizontal" />
//         </ScrollArea>
//         <div className="bg-white shadow-lg p-4 flex gap-4 justify-between rounded-lg">
//           <div className="flex items-center gap-2 w-full">
//             <SearchIcon />
//             <input
//               type="text"
//               value={searchValue}
//               onChange={handleSearchChange}
//               placeholder="Job title / Company name"
//               className={cn(
//                 "focus-visible:border-none focus-visible:outline-none w-full"
//               )}
//             />
//             {isSearching ||
//               (isLoading && (
//                 <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
//               ))}
//           </div>
//           <div>
//             <Button>Search</Button>
//           </div>
//         </div>
//         <div className="flex flex-col gap-4">
//           <div className="flex justify-between">
//             <div className="">All Jobs</div>
//             <p className="text-xs flex gap-1 text-gray-400">
//               <span className="">View all</span>
//               <ArrowRight className="size-4" />
//             </p>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 ">
//           <Table>
//             <TableBody>
//               {visibleRows.length ? (
//                 visibleRows.map((row) => (
//                   <TableRow
//                     key={row.id}
//                     data-state={row.getIsSelected() && "selected"}
//                     className="hover:bg-white border-b !rounded-3xl hover:border-primary hover:border-[2px] hover:rounded-2xl hover:cursor-pointer"
//                   >
//                     {row.getVisibleCells().map((cell) => (
//                       <TableCell key={cell.id}>
//                         {flexRender(
//                           cell.column.columnDef.cell,
//                           cell.getContext()
//                         )}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell
//                     colSpan={columns.length}
//                     className="h-24 text-center"
//                   >
//                     {isSearching ? (
//                       <div className="flex items-center justify-center gap-2">
//                         <Loader2 className="h-4 w-4 animate-spin" />
//                         <span>Searching for matching jobs...</span>
//                       </div>
//                     ) : hasNoResults && !hasNextPage ? (
//                       <span>No results found. All data has been searched.</span>
//                     ) : (
//                       <span>No results.</span>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>

//         {hasNextPage && !isAutoFetching && (
//           <div className="flex justify-center">
//             <Button
//               onClick={() => fetchNextPage()}
//               disabled={isFetchingNextPage}
//               variant="outline"
//             >
//               {isFetchingNextPage ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Loading more...
//                 </>
//               ) : (
//                 "Load More Jobs"
//               )}
//             </Button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export const getFindJobsColumns = (
//   router: AppRouterInstance,
//   user: Partial<IUser>
// ): ColumnDef<JobType>[] => [
//   {
//     accessorKey: "companyText",
//     header: "Company",
//     cell: ({ row }) => (
//       <div className="shrink-0 flex items-center justify-center size-16">
//         <img
//           src={
//             !!row.original.companyLogo
//               ? row.original.companyLogo
//               : "/placeholder.jpg"
//           }
//           alt={row.original.companyText}
//           className="size-12"
//         />
//       </div>
//     ),
//   },

//   {
//     accessorKey: "title",
//     header: "Title",
//     cell: ({ row }) => {
//       const dataSource = getDataSource(user);
//       const title = dataSource?.key || dataSource?.title;
//       const recommend =
//         title
//           ?.toLowerCase()
//           .includes(row.original.descriptionText.toLowerCase()) ||
//         title?.toLowerCase().includes(row.original.title.toLowerCase());
//       return (
//         <div className="capitalize">
//           <div className="flex gap-4 items-center">
//             <div className="font-medium text-xs max-w-sm overflow-hidden">
//               {row.getValue("title")}
//             </div>
//             <div className="bg-blue-50 rounded text-blue-600 px-2 py-1">
//               <span className="text-2xs">
//                 {!!row.original.jobType
//                   ? row.original.jobType
//                   : row.original.employmentType}
//               </span>
//             </div>
//           </div>
//           <div className="flex gap-x-4 mt-1">
//             <p className="flex gap-1 text-gray-400 items-center">
//               <MapPin className="size-3" />
//               <span className="text-2xs">{row.original.location}</span>
//             </p>
//             <p className="flex gap-1 text-gray-400 items-center">
//               <DollarSign className="size-3" />
//               <span className="text-2xs">
//                 {!!row.original?.salary
//                   ? row.original?.salary
//                   : "Not disclosed"}
//               </span>
//             </p>
//             <p className="flex gap-1 text-gray-400 items-center">
//               <Calendar className="size-3" />
//               <span className="text-2xs">
//                 {humanDate(row.original?.scrapedAt)}
//               </span>
//             </p>
//             <p className="text-2xs text-green-400">
//               {randomPercentage(recommend ? 90 : 10)}
//             </p>
//           </div>
//         </div>
//       );
//     },
//   },

//   {
//     accessorKey: "isBookmarked",
//     header: () => <div className=""></div>,
//     cell: ({ row }) => {
//       return (
//         <div
//           onClick={() => {
//             // updateJobs.mutate({
//             //   id: String(row.original.id),
//             //   data: {
//             //     isBookmarked: !row.original.isBookmarked,
//             //   },
//             // });
//           }}
//           className="flex justify-end"
//         >
//           <Toggle
//             pressed={row.original.isBookmarked}
//             aria-label="Toggle bookmark"
//             size="sm"
//             variant="outline"
//             className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-blue-500 data-[state=on]:*:[svg]:stroke-blue-500"
//           >
//             <BookmarkIcon />
//           </Toggle>
//         </div>
//       );
//     },
//   },
//   {
//     id: "actions",
//     enableHiding: false,
//     cell: ({ row }) => {
//       return (
//         <div className="flex justify-end">
//           <Button
//             className="w-full"
//             onClick={async () => {
//               if (!row.original?.emailApply) {
//                 window.open(row.original.link, "__blank");
//                 return;
//               }

//               const { isAuthorized } = await apiService.gmailOauthStatus();

//               if (!isAuthorized) {
//                 toast.error(
//                   "✨ Go to the Settings page and enable authorization for Cverai to send emails on your behalf. This option is located in the second card.",
//                   {
//                     action: {
//                       label: "Authorize now",
//                       onClick: () =>
//                         router.push(
//                           `/dashboard/settings?tab=ai-applypreference`
//                         ),
//                     },
//                     classNames: {
//                       actionButton:
//                         "!bg-blue-600 hover:!bg-blue-700 !text-white !h-8",
//                     },
//                   }
//                 );

//                 return;
//               }

//               const params = new URLSearchParams();
//               params.set(
//                 "jobDescription",
//                 JSON.stringify(row.original?.descriptionText || "")
//               );
//               params.set(
//                 "recruiterEmail",
//                 encodeURIComponent(row.original?.emailApply)
//               );
//               router.push(
//                 `/dashboard/tailor-cover-letter/${uuidv4()}?${params}&aiApply=true`
//               );
//             }}
//             variant={"button"}
//           >
//             {row.original?.emailApply ? "Auto Apply" : "Apply Now"}
//             {row.original?.emailApply && (
//               <Sparkles className="text-3 text-yellow" />
//             )}
//           </Button>
//         </div>
//       );
//     },
//   },
// ];
