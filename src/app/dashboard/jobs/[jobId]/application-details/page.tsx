"use client";

import { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Eye, Pencil, Loader2, AlertCircle } from "lucide-react";
import { jobApplicationsApi } from "@/features/analytics/api/job-applications.api";
import { queryKeys } from "@/shared/query/keys";
import { format } from "date-fns";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function humanStatus(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusColor(status: string): string {
  if (["submitted", "accepted", "offered"].includes(status))
    return "bg-green-100 text-green-700";
  if (["under_review", "interviewing"].includes(status))
    return "bg-blue-100 text-blue-700";
  if (["rejected", "withdrawn", "expired"].includes(status))
    return "bg-red-100 text-red-600";
  return "bg-gray-100 text-gray-600";
}

// ─── Expandable text ──────────────────────────────────────────────────────────

function ExpandableText({ text }: { text: string }) {
  const LIMIT = 500;
  const needsTruncation = text.length > LIMIT;
  const [expanded, setExpanded] = React.useState(false);
  const shown = expanded || !needsTruncation ? text : text.slice(0, LIMIT) + "…";

  return (
    <>
      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
        {shown}
      </p>
      {needsTruncation && (
        <button
          className="mt-1 text-sm text-blue-600 hover:underline"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Show less" : "View more"}
        </button>
      )}
    </>
  );
}

// need React import for useState inside ExpandableText
import React from "react";

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export default function ApplicationDetailsPage({ params }: PageProps) {
  const { jobId: applicationId } = use(params);
  const queryClient = useQueryClient();

  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.jobApplications.detail(applicationId),
    queryFn: () => jobApplicationsApi.getDetails(applicationId),
    enabled: !!applicationId,
  });

  const updateStatus = useMutation({
    mutationFn: (status: string) =>
      jobApplicationsApi.updateStatus(applicationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.jobApplications.detail(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.jobApplications.lists(),
      });
    },
  });

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm">Could not load application details.</p>
      </div>
    );
  }

  const app = data.data;
  const companyInitial = (app.companyName ?? "?").charAt(0).toUpperCase();
  const appliedDate = app.appliedAt
    ? format(new Date(app.appliedAt), "MMMM d, yyyy")
    : null;

  // snapshot may contain Q&A saved by the bot
  const snapshotQA: Array<{ question: string; answer: string }> =
    Array.isArray((app.snapshot as any)?.qa) ? (app.snapshot as any).qa : [];

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {app.companyLogo ? (
          <img
            src={app.companyLogo}
            alt={app.companyName ?? ""}
            className="w-14 h-14 rounded-full object-contain border border-gray-100"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-white text-xl font-bold">
            {companyInitial}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold">{app.jobTitle ?? "Job"}</h1>
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full ${statusColor(app.status)}`}
            >
              {humanStatus(app.status)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {[app.companyName, app.location, app.employmentType]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {appliedDate && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Applied {appliedDate}
            </p>
          )}
        </div>
      </div>

      {/* Resume */}
      {app.resumeId && (
        <Card className="rounded-2xl">
          <CardContent className="p-5 space-y-4">
            <h2 className="font-medium">CV / Resume</h2>
            <div className="flex items-center justify-between border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 flex items-center justify-center rounded-lg text-xs font-bold">
                  PDF
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {app.resumeFileName ?? app.resumeTitle ?? "Resume"}
                  </p>
                  {app.resumeCreatedAt && (
                    <p className="text-xs text-muted-foreground">
                      Uploaded{" "}
                      {format(new Date(app.resumeCreatedAt), "MMMM d, yyyy")}
                      {app.resumeFileSize
                        ? ` · ${formatFileSize(app.resumeFileSize)}`
                        : ""}
                    </p>
                  )}
                </div>
              </div>
              {app.resumeFileUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  asChild
                >
                  <a
                    href={app.resumeFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Eye className="w-4 h-4" /> Preview
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cover Letter */}
      {app.coverLetterContent && (
        <Card className="rounded-2xl">
          <CardContent className="p-5 space-y-4">
            <h2 className="font-medium">Cover Letter</h2>
            <ExpandableText text={app.coverLetterContent} />
          </CardContent>
        </Card>
      )}

      {/* Application Q&A from snapshot */}
      {snapshotQA.length > 0 && (
        <Card className="rounded-2xl">
          <CardContent className="p-5 space-y-6">
            <h2 className="font-medium">Application Questions & Answers</h2>
            {snapshotQA.map((qa, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium">
                    {i + 1}. {qa.question}
                  </p>
                  <Button variant="ghost" size="icon">
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {qa.answer}
                </p>
                {i < snapshotQA.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Notes (if any) */}
      {app.notes && (
        <Card className="rounded-2xl">
          <CardContent className="p-5 space-y-2">
            <h2 className="font-medium">Notes</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {app.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card className="rounded-2xl">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              disabled={
                updateStatus.isPending || app.status === "withdrawn"
              }
              onClick={() => updateStatus.mutate("withdrawn")}
            >
              Withdraw
            </Button>
            <div className="flex items-center gap-3">
              {app.applyUrl && (
                <Button variant="outline" asChild>
                  <a
                    href={app.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View posting
                  </a>
                </Button>
              )}
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                disabled={
                  updateStatus.isPending || app.status === "under_review"
                }
                onClick={() => updateStatus.mutate("under_review")}
              >
                {updateStatus.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Mark as Reviewed"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
