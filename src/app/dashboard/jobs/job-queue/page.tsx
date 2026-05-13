"use client";

import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function humanStatus(status: string): string {
  const map: Record<string, string> = {
    submitted: "Submitted",
    under_review: "Under Review",
    interviewing: "Interviewing",
    offered: "Offered",
    accepted: "Accepted",
    rejected: "Rejected",
    withdrawn: "Withdrawn",
    expired: "Expired",
    draft: "Draft",
    awaiting_human: "Needs Attention",
  };
  return (
    map[status] ??
    status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function applicationTypeLabel(type: string | null | undefined): string {
  if (type === "email") return "Email";
  if (type === "company_website" || type === "form") return "External";
  if (type === "in_person") return "In Person";
  return "External";
}

function applicationTypeBadgeClass(type: string | null | undefined): string {
  if (type === "email") return "bg-blue-100 text-blue-700";
  return "bg-violet-100 text-violet-700";
}

function statusBadgeClass(status: string): string {
  if (["submitted", "accepted", "offered"].includes(status))
    return "bg-[#dcfce7] text-[#15803d]";
  if (["under_review", "interviewing"].includes(status))
    return "bg-blue-100 text-blue-700";
  if (["rejected", "withdrawn", "expired"].includes(status))
    return "bg-red-100 text-red-600";
  if (status === "awaiting_human") return "bg-amber-100 text-amber-700";
  return "bg-gray-100 text-gray-600";
}

function relativeTime(date: string | Date | null): string {
  if (!date) return "—";
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "—";
  }
}

// ─── Row ─────────────────────────────────────────────────────────────────────

interface RowProps {
  app: JobApplication & { jobId?: string };
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
}

function ApprovalRow({ app, selected, onSelect }: RowProps) {
  const title = (app as any).title ?? (app as any).jobTitle ?? "Job";
  const company = (app as any).companyName ?? "—";
  const employmentType = (app as any).employmentType ?? "";
  const classification = (app as any).classification ?? "";
  const applicationType = (app as any).applicationType ?? null;

  const subtitle = [employmentType, classification]
    .filter(Boolean)
    .map((s) =>
      s.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
    )
    .join(" · ");

  return (
    <TableRow
      className="cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("[data-checkbox]")) return;
        const dest =
          applicationType === "email"
            ? `/dashboard/jobs/${app.id}/email-preview`
            : `/dashboard/jobs/${app.id}/application-details`;
        window.location.href = dest;
      }}
    >
      {/* Checkbox */}
      <TableCell className="w-[52px]">
        <div
          className="flex items-center justify-center"
          data-checkbox
          onClick={(e) => {
            e.stopPropagation();
            onSelect(app.id, !selected);
          }}
        >
          <Checkbox
            checked={selected}
            className="h-[18px] w-[18px] rounded-[4px] border-[#c7c7c7]"
            onCheckedChange={(v) => onSelect(app.id, !!v)}
          />
        </div>
      </TableCell>

      {/* Job title */}
      <TableCell>
        <div className="flex flex-col gap-0.5 min-w-0">
          <Link
            href={
              applicationType === "email"
                ? `/dashboard/jobs/${app.id}/email-preview`
                : `/dashboard/jobs/${app.id}/application-details`
            }
            className="text-[15px] font-semibold text-black truncate capitalize hover:underline max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            {title}
          </Link>
          {subtitle && (
            <span className="text-[13px] text-[#6b7280]">{subtitle}</span>
          )}
        </div>
      </TableCell>

      {/* Company — hidden on small screens */}
      <TableCell className="text-[15px] text-black font-normal truncate max-w-[160px]">
        {company}
      </TableCell>

      {/* Type — hidden on xs screens */}
      <TableCell className="">
        <span
          className={`inline-flex items-center justify-center px-3 py-[5px] rounded-full text-[12px] font-medium whitespace-nowrap ${applicationTypeBadgeClass(applicationType)}`}
        >
          {applicationTypeLabel(applicationType)}
        </span>
      </TableCell>

      {/* Submitted — hidden on small screens */}
      <TableCell className=" text-[15px] text-[#6b7280] font-normal whitespace-nowrap">
        {relativeTime(app.appliedAt ?? null)}
      </TableCell>

      {/* Status */}
      <TableCell>
        <span
          className={`inline-flex items-center justify-center px-3 py-[5px] rounded-full text-[12px] font-medium whitespace-nowrap ${statusBadgeClass(app.status)}`}
        >
          {humanStatus(app.status)}
        </span>
      </TableCell>
    </TableRow>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApprovalQueue() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

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

  const allSelected =
    applications.length > 0 && applications.every((a) => selected.has(a.id));

  function toggleAll(checked: boolean) {
    if (checked) {
      setSelected(new Set(applications.map((a) => a.id)));
    } else {
      setSelected(new Set());
    }
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  }

  return (
    <div className="w-full min-h-screen bg-white px-4 sm:px-6 lg:px-10 py-8">
      {/* Header */}
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
          <Button className="h-[40px] sm:h-[44px] px-5 sm:px-8 rounded-md bg-[#3b82f6] hover:bg-[#3b82f6]/90 text-white text-[14px] sm:text-[16px] font-medium shadow-none">
            Approve all
          </Button>
          <Button
            variant="outline"
            className="h-[40px] sm:h-[44px] px-5 sm:px-8 rounded-md border border-[#ef4444] text-[#ef4444] hover:bg-transparent hover:text-[#ef4444] text-[14px] sm:text-[16px] font-medium shadow-none"
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
          <Card className="mt-8 border border-[#e5e7eb] rounded-lg shadow-none overflow-hidden">
            <div className="grid grid-cols-1">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white hover:bg-white border-b border-[#e5e7eb]">
                    <TableHead className="w-[52px]">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          className="h-[18px] w-[18px] rounded-[4px] border-[#c7c7c7]"
                          checked={allSelected}
                          onCheckedChange={(v) => toggleAll(!!v)}
                        />
                      </div>
                    </TableHead>
                    <TableHead className="text-[13px] font-medium tracking-widest text-[#374151] uppercase">
                      Job Title
                    </TableHead>
                    <TableHead className=" text-[13px] font-medium tracking-widest text-[#374151] uppercase">
                      Company
                    </TableHead>
                    <TableHead className=" text-[13px] font-medium tracking-widest text-[#374151] uppercase">
                      Type
                    </TableHead>
                    <TableHead className="text-[13px] font-medium tracking-widest text-[#374151] uppercase">
                      Submitted
                    </TableHead>
                    <TableHead className="text-[13px] font-medium tracking-widest text-[#374151] uppercase">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {applications.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
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
                        selected={selected.has(app.id)}
                        onSelect={toggleOne}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>

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
