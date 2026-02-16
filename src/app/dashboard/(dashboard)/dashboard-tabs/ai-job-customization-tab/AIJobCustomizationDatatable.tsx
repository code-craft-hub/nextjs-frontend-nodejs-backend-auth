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
import { useQueryClient } from "@tanstack/react-query";

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
import { Loader2, Trash2 } from "lucide-react";
import { formatFirestoreDate } from "@/lib/utils/helpers";
import { useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { resumeApi } from "@/lib/api/resume.api";
import { coverLetterApi } from "@/lib/api/cover-letter.api";
import { interviewQuestionApi } from "@/lib/api/interview.api";
import { queryKeys } from "@/lib/query/keys";

export const schema = z.object({
  id: z.number(),
  title: z.string(),
  generatedAt: z.string(),
  applicationMethod: z.array(
    z.object({ value: z.string(), title: z.string() }),
  ),
  type: z.string(),
  createdAt: z.string(),
  contentType: z.string(),
});

const CONTENT_TYPE_ROUTES: Record<string, string> = {
  resume: "/dashboard/tailor-resume",
  "cover-letter": "/dashboard/tailor-cover-letter",
  "interview-question": "/dashboard/tailor-interview-question",
};

const CONTENT_TYPE_ID: Record<string, string> = {
  resume: "resumeId",
  "cover-letter": "coverLetterId",
  "interview-question": "interviewQuestionId",
};

const getColumns = (
  router: ReturnType<typeof useRouter>,
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
      return <div className="font-inter max-w-xl">{row.original.title}</div>;
    },
    enableHiding: false,
  },
  {
    accessorKey: "generatedAt",
    header: () => <div className=" w-full ">Application Date</div>,
    cell: ({ row }) => (
      <div className="">
        <Badge variant="outline" className={cn("border-0 px-1.5 font-inter")}>
          {formatFirestoreDate(
            !!row.original?.generatedAt
              ? row.original?.generatedAt
              : row.original?.createdAt,
          )}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "contentType",
    header: () => <div className=" w-full ">Document Type</div>,
    cell: ({ row }) => (
      <div className="flex gap-2 items-center justify-">
        <div>
          <Badge
            variant="outline"
            className={cn(
              "text-muted-foreground px-1.5 rounded-2xl  font-jakarta",
              row.getValue("contentType") === "resume"
                ? "bg-primary/10 border-primary/40 text-primary "
                : row.getValue("contentType") === "cover-letter"
                  ? "bg-cverai-green/10 border-cverai-green/40 text-cverai-green"
                  : "bg-orange-500/10 border-orange-500/40 text-orange-500",
            )}
          >
            {row.getValue("contentType")}
          </Badge>
        </div>
      </div>
    ),
  },

  {
    id: "actions",
    cell: ({ row }) => (
      <>
        <Button
          variant={"ghost"}
          className="text-blue-500 font-jakarta"
          onClick={() => {
            const basePath = CONTENT_TYPE_ROUTES[row.original.contentType];
            const idKey = CONTENT_TYPE_ID[row.original.contentType];
            if (basePath && idKey) {
              router.push(`${basePath}?${idKey}=${row.original.id}`);
            }
          }}
        >
          Show Details
        </Button>
      </>
    ),
  },
];

export function AIJobCustomizationDatatable({
  data,
  onBulkDelete,
}: {
  data: any[];
  onBulkDelete?: (ids: number[]) => Promise<void>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns = useMemo(() => getColumns(router), [router]);

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

    table.setPageSize(pagination.pageSize + 5);
    setIsLoadingMore(false);
  };

  const getSelectedIds = (): Array<{ id: number; contentType: string }> => {
    return Object.keys(rowSelection)
      .map((index) => {
        const item = data[parseInt(index)];
        return item ? { id: item.id, contentType: item.contentType } : null;
      })
      .filter((item) => item !== null) as Array<{
      id: number;
      contentType: string;
    }>;
  };

  const selectedCount = Object.keys(rowSelection).length;

  const handleBulkDelete = async () => {
    try {
      setIsDeleting(true);
      const selectedItems = getSelectedIds();

      // Group items by content type
      const resumeIds: number[] = [];
      const coverLetterIds: number[] = [];
      const interviewQuestionIds: number[] = [];

      selectedItems.forEach((item) => {
        switch (item.contentType) {
          case "resume":
            resumeIds.push(item.id);
            break;
          case "cover-letter":
            coverLetterIds.push(item.id);
            break;
          case "interview-question":
            interviewQuestionIds.push(item.id);
            break;
        }
      });

      // Delete from each API based on content type
      const deletePromises: Promise<any>[] = [];

      if (resumeIds.length > 0) {
        deletePromises.push(
          ...resumeIds.map((id) => resumeApi.hardDeleteResume(id.toString())),
        );
      }

      if (coverLetterIds.length > 0) {
        deletePromises.push(
          ...coverLetterIds.map((id) =>
            coverLetterApi.hardDeleteCoverLetter(id.toString()),
          ),
        );
      }

      if (interviewQuestionIds.length > 0) {
        deletePromises.push(
          ...interviewQuestionIds.map((id) =>
            interviewQuestionApi.hardDeleteInterviewQuestion(id.toString()),
          ),
        );
      }

      // Wait for all deletions to complete
      await Promise.all(deletePromises);

      // Invalidate relevant queries to refresh the data
      if (resumeIds.length > 0) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.resumes.lists(),
        });
      }

      if (coverLetterIds.length > 0) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.coverLetters.lists(),
        });
      }

      if (interviewQuestionIds.length > 0) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.interviewQuestions.lists(),
        });
      }

      setRowSelection({});
      setIsDeleteDialogOpen(false);

      // Call parent onBulkDelete if provided (for cache invalidation, etc.)
      if (onBulkDelete) {
        await onBulkDelete(selectedItems.map((item) => item.id));
      }
    } catch (error) {
      console.error("Failed to delete items:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-xl px-6 py-4">Recent Activity</h1>
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
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Items</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} selected item
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
  );
}
