import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { AutoApplyRecord } from "@/lib/api/auto-apply.api";

import { cn } from "@/lib/utils";

import { formatFirestoreDate } from "@/lib/utils/helpers";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/dist/client/components/navigation";
import z from "zod";

export const schema = z.object({
  id: z.string(),
  title: z.string(),
  generatedAt: z.string(),
  type: z.string(),
  action: z.string(),
  status: z.string(),
  recruiterEmail: z.string(),
  jobDescription: z.string(),
  coverLetterId: z.string(),
  resumeId: z.string(),
});

export const AIApplyColumn = (
  router: ReturnType<typeof useRouter>
): ColumnDef<AutoApplyRecord>[] => [
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
      return <div className="font-inter max-w-3xs overflow-hidden truncate">{row.original.title}</div>;
    },
    enableHiding: false,
  },
  {
    accessorKey: "generatedAt",
    header: "Application Date",
    cell: ({ row }) => (
      <div className="">
        <Badge variant="outline" className={cn("border-0 px-1.5 font-inter")}>
          {formatFirestoreDate(row.original?.generatedAt)}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Application Method",
    cell: ({ row }) => (
      <div className="">
        <div>
          <Badge
            variant="outline"
            className={cn(
              "text-muted-foreground px-1.5 rounded-2xl font-jakarta capitalize",
              row.original.type !== "email"
                ? "bg-primary/10 border-primary/40 text-primary"
                : "bg-cverai-green/10 border-cverai-green/40 text-cverai-green"
            )}
          >
            {row.original.type}
          </Badge>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="">
        <div>
          <Badge
            variant="outline"
            className={cn(
              "text-muted-foreground px-1.5 rounded-2xl font-jakarta capitalize",
              row.original.status === "sent"
                ? "bg-cverai-green/10 border-cverai-green/40 text-cverai-green"
                : "bg-primary/10 border-primary/40 text-primary"
            )}
          >
            {row.original.status}
          </Badge>
        </div>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Button
          variant={"ghost"}
          className="text-blue-500 font-jakarta"
          onClick={() => {
            router.push(
              `/dashboard/preview?aiApplyId=${row.original.id}&resumeId=${row.original.resumeId}&coverLetterId=${row.original.coverLetterId}&recruiterEmail=${row.original.recruiterEmail}`
            );
          }}
        >
          Show Details
        </Button>
      );
    },
  },
];

export function AIApplySkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4 px-4">
      <Skeleton className="h-10 w-full rounded-2xl" />
      <Skeleton className="h-10 w-full rounded-2xl" />
      <Skeleton className="h-10 w-full rounded-2xl" />
    </div>
  );
}
