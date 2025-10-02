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

export const schema = z.object({
  id: z.number(),
  jobTitle: z.string(),
  applicationDate: z.string(),
  applicationMethod: z.array(
    z.object({ value: z.string(), title: z.string() })
  ),
  action: z.string(),
});

const columns: ColumnDef<z.infer<typeof schema>>[] = [
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
    accessorKey: "jobTitle",
    header: "Job Title",
    cell: ({ row }) => {
      return <div className="font-inter">{row.original.jobTitle}</div>;
    },
    enableHiding: false,
  },
  {
    accessorKey: "applicationDate",
    header: "Application Date",
    cell: ({ row }) => (
      <div className="">
        <Badge variant="outline" className={cn("border-0 px-1.5 font-inter")}>
          {row.original.applicationDate}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "applicationMethod",
    header: "Application Method",
    cell: ({ row }) => (
      <div className="flex gap-2">
        {row.original.applicationMethod.map((method) => (
          <div key={method.title}>
            <Badge
              variant="outline"
              key={method.title}
              className={cn(
                "text-muted-foreground px-1.5 rounded-2xl font-jakarta",
                method.value === "resume"
                  ? "bg-primary/10 border-primary/40 text-primary "
                  : method.value === "cover-letter"
                  ? "bg-cverai-green/10 border-cverai-green/40 text-cverai-green"
                  : "bg-orange-500/10 border-orange-500/40 text-orange-500"
              )}
            >
              {method.title}
            </Badge>
          </div>
        ))}
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
          toast.success(JSON.stringify(row.original, null, 2));
        }}
      >
        Show Details
      </Button>
    ),
  },
];

export function TailorResumeDatatable({
  data,
}: {
  data: z.infer<typeof schema>[];
}) {
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
