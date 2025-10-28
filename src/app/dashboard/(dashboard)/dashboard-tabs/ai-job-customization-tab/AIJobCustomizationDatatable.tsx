import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { z } from "zod";

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
import { Loader2 } from "lucide-react";

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
          {(row.original?.generatedAt)?.split(".")[0]}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Application Method",
    cell: ({ row }) => (
      <div className="flex gap-2 items-center justify-center">
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
            router.push(`/dashboard/tailor-resume/${row.original.id}`);
          } else if (row.original.type === "cover-letter") {
            router.push(`/dashboard/tailor-cover-letter/${row.original.id}`);
          } else if (row.original.type === "interview-question") {
            router.push(
              `/dashboard/tailor-interview-question/${row.original.id}`
            );
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
  const router = useRouter();

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

  const [isLoadingMore, setIsLoadingMore] = React.useState(false);

  const columns = React.useMemo(() => getColumns(router), [router]);

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

  const totalRows = data.length;
  const currentRows = (pagination.pageIndex + 1) * pagination.pageSize;
  const canLoadMore = currentRows < totalRows;

  const handleLoadMore = async () => {
    if (!canLoadMore) return;
    setIsLoadingMore(true);

    table.setPageSize(pagination.pageSize + 10);
    setIsLoadingMore(false);
  };

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
      {canLoadMore ? (
        <div className="flex justify-center border-t py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="text-blue-600 hover:text-blue-700"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
