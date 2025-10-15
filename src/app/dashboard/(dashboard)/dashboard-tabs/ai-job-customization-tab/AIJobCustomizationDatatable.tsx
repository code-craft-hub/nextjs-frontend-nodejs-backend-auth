import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export const schema = z.object({
  id: z.number(),
  title: z.string(),
  generatedAt: z.string(),
  applicationMethod: z.array(
    z.object({ value: z.string(), title: z.string() })
  ),
  type: z.string(),
});

const getColumns = (
  router: ReturnType<typeof useRouter>
): ColumnDef<z.infer<typeof schema>>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Job Title",
    cell: ({ row }) => {
      return <div className="font-inter">{row.original.title}</div>;
    },
    enableHiding: false,
  },
  {
    accessorKey: "generatedAt",
    header: "Application Date",
    cell: ({ row }) => (
      <div className="">
        <Badge variant="outline" className={cn("border-0 px-1.5 font-inter")}>
          {row.original?.generatedAt?.split(".")[0]}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Application Method",
    cell: ({ row }) => (
      <div className="flex gap-2">
        {/* {row.original.applicationMethod.map((method) => ( */}
        <div>
          <Badge
            variant="outline"
            className={cn(
              "text-muted-foreground px-1.5 rounded-2xl font-jakarta",
              row.getValue("type") === "resume"
                ? "bg-primary/10 border-primary/40 text-primary "
                : row.getValue("type") === "cover-letter"
                ? "bg-cverai-green/10 border-cverai-green/40 text-cverai-green"
                : "bg-orange-500/10 border-orange-500/40 text-orange-500"
            )}
          >
            {row.getValue("type")}
          </Badge>
        </div>
        {/* ))} */}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button
        variant={"ghost"}
        className="text-blue-500 font-jakarta"
        onClick={() => {
          if (row.original.type === "resume") {
            router.push(
              `/dashboard/tailor-resume?documentId=${row.original.id}`
            );
            toast.success("Resume Generated. Check your email!");
          } else if (row.original.type === "cover-letter") {
            router.push(
              `/dashboard/tailor-cover-letter?coverLetterId=${row.original.id}`
            );
            toast.success("Cover Letter Generated. Check your email!");
          } else if (row.original.type === "interview-question") {
            router.push(
              `/dashboard/tailor-interview-question?interviewQuestionId=${row.original.id}`
            );
            toast.success("Interview Questions Generated. Check your email!");
          }
        }}
      >
        Show Details
      </Button>
    ),
  },
];

export function AIJobCustomizationDatatable({
  data,
}: {
  data: z.infer<typeof schema>[];
}) {
  const router = useRouter(); // Add this line

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns = React.useMemo(() => getColumns(router), [router]); // Generate columns with router

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    // getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <Card>
      <div className="">
        <h1 className="font-bold text-xl px-6">Recent Activity</h1>
      </div>
      <div className="overflow-hidden grid">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      className="px-6"
                      key={header.id}
                      colSpan={header.colSpan}
                    >
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
          </TableHeader>
          <TableBody className="**:data-[slot=table-cell]:first:w-8">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-6">
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
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="text-blue-500 text-center border-t -mt-4 pt-4">
        View more
      </div>
    </Card>
  );
}
