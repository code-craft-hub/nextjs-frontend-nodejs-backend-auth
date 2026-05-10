"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { jobApplicationsApi } from "@/features/analytics/api/job-applications.api";
import { queryKeys } from "@/shared/query/keys";
import { API_URL } from "@/shared/api/client";
import { format } from "date-fns";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Eye, Pencil } from "lucide-react";

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export default function ApplicationReview({ params }: PageProps) {
  const { jobId: applicationId } = use(params);
  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.jobApplications.detail(applicationId),
    queryFn: () => jobApplicationsApi.getDetails(applicationId),
    enabled: !!applicationId,
  });

  if (isPending) return null;
  if (isError || !data?.data) return null;

  const app = data.data;
  const companyInitial = (app.companyName ?? "?").charAt(0).toUpperCase();
  const appliedDate = app.appliedAt
    ? format(new Date(app.appliedAt), "MMMM d, yyyy")
    : null;

  // snapshot may contain Q&A saved by the bot
  const snapshotQA: Array<{ question: string; answer: string }> = Array.isArray(
    (app.snapshot as any)?.qa,
  )
    ? (app.snapshot as any).qa
    : [];

  // If the resume was AI-generated it won't have a stored fileUrl — fall back
  // to the on-demand PDF generation endpoint which regenerates it from DB data.
  const resumePreviewUrl =
    app.resumeFileUrl ??
    (app.resumeId ? `${API_URL}/resumes/${app.resumeId}/download` : null);

  const resumeUploadedDate = app.resumeCreatedAt
    ? format(new Date(app.resumeCreatedAt), "MMMM d, yyyy")
    : null;
  const resumeFileSizeMB = app.resumeFileSize
    ? (app.resumeFileSize / (1024 * 1024)).toFixed(1) + " MB"
    : null;

  const locationParts = [app.companyName, app.location, app.employmentType].filter(Boolean);
  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-white text-xl font-bold capitalize">
          {companyInitial}
        </div>
        <div>
          <h1 className="text-xl font-semibold capitalize">{app.jobTitle ?? "Unknown Role"}</h1>
          <p className="text-sm text-muted-foreground">
            {locationParts.join(" · ")}
          </p>
        </div>
      </div>

      {/* Resume */}
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
                <p className="text-xs text-muted-foreground">
                  {resumeUploadedDate ? `Uploaded on ${resumeUploadedDate}` : ""}
                  {resumeUploadedDate && resumeFileSizeMB ? " · " : ""}
                  {resumeFileSizeMB ?? ""}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => resumePreviewUrl && window.open(resumePreviewUrl, "_blank")}
              disabled={!resumePreviewUrl}
            >
              <Eye className="w-4 h-4" /> preview
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cover Letter */}
      <Card className="rounded-2xl">
        <CardContent className="p-5 space-y-4">
          <h2 className="font-medium">Cover Letter</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {app.coverLetterContent ?? "No cover letter provided."}
          </p>
          <button className="text-sm text-blue-600 hover:underline">
            View more
          </button>
        </CardContent>
      </Card>

      {/* Questions */}
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
              {i !== snapshotQA.length - 1 && <Separator />}
            </div>
          ))}

          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Decline
            </Button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Turn off manual review
              </span>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                Approve
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
