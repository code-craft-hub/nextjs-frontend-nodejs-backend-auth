"use client";

import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { jobApplicationsApi } from "@/features/analytics/api/job-applications.api";
import { queryKeys } from "@/shared/query/keys";
import { formatDistanceToNow } from "date-fns";
import type { JobApplication } from "@/shared/types";
import { BackButton } from "@/components/shared/BackButton";
import { decodeHtml } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(date: string | Date | null): string {
  if (!date) return "—";
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "—";
  }
}

// ─── Status badge ─────────────────────────────────────────────────────────────

type ApplicationStatus = "completed" | "in-progress" | "queued" | "failed";

function toDisplayStatus(status: string): ApplicationStatus {
  if (["submitted", "accepted", "offered"].includes(status)) return "completed";
  if (["under_review", "interviewing", "awaiting_human"].includes(status)) return "in-progress";
  if (["rejected", "withdrawn", "expired"].includes(status)) return "failed";
  return "queued";
}

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  completed: "Completed",
  "in-progress": "In progress",
  queued: "Queued",
  failed: "Failed",
};

const STATUS_CLASSES: Record<ApplicationStatus, string> = {
  completed:    "border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  "in-progress": "border-transparent bg-amber-100 text-amber-700 hover:bg-amber-100",
  queued:       "border-transparent bg-slate-200 text-slate-600 hover:bg-slate-200",
  failed:       "border-transparent bg-rose-100 text-rose-600 hover:bg-rose-100",
};

function StatusBadge({ status }: { status: string }) {
  const display = toDisplayStatus(status);
  return (
    <Badge
      variant="outline"
      className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASSES[display]}`}
    >
      {STATUS_LABEL[display]}
    </Badge>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────

interface RowProps {
  app: JobApplication & { jobId?: string };
  checked: boolean;
  onToggle: (id: string, checked: boolean) => void;
}

function ApprovalRow({ app, checked, onToggle }: RowProps) {
  const title = (app as any).title ?? (app as any).jobTitle ?? "Job";
  const company = (app as any).companyName ?? "—";
  const employmentType = (app as any).employmentType ?? "";
  const location = (app as any).location ?? "";
  const applicationType = (app as any).applicationType ?? null;

  const subtitle = [employmentType, location]
    .filter(Boolean)
    .map((s) => s.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()))
    .join(" • ");

  const dest =
    applicationType === "email"
      ? `/dashboard/jobs/${app.id}/email-preview`
      : `/dashboard/jobs/${app.id}/application-details`;

  return (
    <TableRow
      className="h-20 cursor-pointer hover:bg-slate-50 transition-colors"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("[data-checkbox]")) return;
        window.location.href = dest;
      }}
    >
      <TableCell className="pl-6">
        <div
          data-checkbox
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={checked}
            onCheckedChange={(v) => onToggle(app.id, Boolean(v))}
            aria-label={`Select ${title}`}
          />
        </div>
      </TableCell>

      <TableCell>
        <Link
          href={dest}
          className="font-semibold text-slate-900 hover:underline capitalize w-64 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          
          {decodeHtml(title)}
        </Link>
        {subtitle && (
          <div className="mt-0.5 truncate w-64 text-sm text-slate-500">{subtitle}</div>
        )}
      </TableCell>

      <TableCell className="text-slate-700">{company}</TableCell>

      <TableCell className="text-slate-700">
        {relativeTime(app.appliedAt ?? null)}
      </TableCell>

      <TableCell>
        <StatusBadge status={app.status} />
      </TableCell>
    </TableRow>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApprovalQueue() {
  const [selected, setSelected] = useState<string[]>([]);

  const {
    data,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: queryKeys.jobApplications.lists(),
    queryFn: ({ pageParam }) =>
      jobApplicationsApi.list(
        pageParam as { appliedAt: string | null; id: string } | undefined,
      ),
    initialPageParam: undefined as
      | { appliedAt: string | null; id: string }
      | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
  });

  const applications = data?.pages.flatMap((p) => p.data) ?? [];

  const allChecked = applications.length > 0 && selected.length === applications.length;
  const someChecked = selected.length > 0 && !allChecked;

  function toggleAll(checked: boolean) {
    setSelected(checked ? applications.map((a) => a.id) : []);
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id),
    );
  }

  return (
    <div className="w-full min-h-screen bg-white px-4 sm:px-6 lg:px-10 py-8">
      {/* Header */}
      <BackButton href="/dashboard/home" className="mb-6" />

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div>
          <h1 className="text-[32px] sm:text-[40px] lg:text-[48px] font-normal text-black leading-none">
            Approval Queue
          </h1>
          <p className="mt-3 text-[15px] sm:text-[18px] text-[#6b7280]">
            Review and approve AI-generated applications before they are sent.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button className="h-10 px-5 sm:px-8 rounded-md bg-[#3b82f6] hover:bg-[#3b82f6]/90 text-white text-[14px] sm:text-[16px] font-medium shadow-none">
            Approve all
          </Button>
          <Button
            variant="outline"
            className="h-10 px-5 sm:px-8 rounded-md border border-[#ef4444] text-[#ef4444] hover:bg-transparent hover:text-[#ef4444] text-[14px] sm:text-[16px] font-medium shadow-none"
          >
            Decline selected
          </Button>
        </div>
      </div>

      {/* States */}
      {isPending && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
          <AlertCircle className="w-8 h-8" />
          <p className="text-sm">Failed to load applications.</p>
        </div>
      )}

      {!isPending && !isError && (
        <>
          <div className="mt-8 border border-[#e5e7eb] rounded-lg grid grid-cols-1">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="hover:bg-slate-50 border-b border-[#e5e7eb]">
                  <TableHead className="w-12 pl-6">
                    <Checkbox
                      checked={allChecked ? true : someChecked ? "indeterminate" : false}
                      onCheckedChange={(v) => toggleAll(Boolean(v))}
                      aria-label="Select all rows"
                    />
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Job Title
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Company
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Submitted
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {applications.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-16 text-center text-[#6b7280] text-sm"
                    >
                      No applications yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((app) => (
                    <ApprovalRow
                      key={app.id}
                      app={app as any}
                      checked={selected.includes(app.id)}
                      onToggle={toggleOne}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Load more */}
          {hasNextPage && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-8"
              >
                {isFetchingNextPage ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Load more"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
