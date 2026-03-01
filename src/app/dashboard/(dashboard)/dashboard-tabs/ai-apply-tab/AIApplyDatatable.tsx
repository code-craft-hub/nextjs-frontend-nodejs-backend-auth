import {
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

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AIApplyColumn } from "./AIApplyColumn";
import { AutoApplyRecord, autoApplyApi } from "@/lib/api/auto-apply.api";
import { queryKeys } from "@/lib/query/keys";
import { autoApplyKeys } from "@/lib/query/auto-apply.keys";

export function AIApplyDatatable({ data }: { data: AutoApplyRecord[] }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns = useMemo(() => AIApplyColumn(router), [router]);

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

  const getSelectedIds = (): string[] => {
    return Object.keys(rowSelection)
      .map((index) => {
        const item = data[parseInt(index)];
        return item?.id ?? null;
      })
      .filter((id): id is string => id !== null);
  };

  const selectedCount = Object.keys(rowSelection).length;

  const handleBulkDelete = async () => {
    try {
      setIsDeleting(true);
      const ids = getSelectedIds();

      console.log("Deleting records with IDs:", ids);

      await autoApplyApi.bulkDelete(ids);

      await queryClient.invalidateQueries({
        queryKey: queryKeys.aiApply.lists(),
      });

      await queryClient.invalidateQueries({
        queryKey: autoApplyKeys.lists(),
      });

      setRowSelection({});
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete auto apply records:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    table.getRowModel().rows?.length !== 0 && (
      <Card className="">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-xl px-6 mb-6">Recent Activity</h1>
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 px-6">
              <span className="text-sm text-muted-foreground">
                {selectedCount} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isDeleting}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
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
                              header.getContext(),
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
                          cell.getContext(),
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
                <Button>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </Button>
              ) : (
                "Load more"
              )}
            </Button>
          </div>
        ) : null}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Auto Apply Records</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedCount} selected record
                {selectedCount !== 1 ? "s" : ""}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-end gap-2">
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    )
  );
}
