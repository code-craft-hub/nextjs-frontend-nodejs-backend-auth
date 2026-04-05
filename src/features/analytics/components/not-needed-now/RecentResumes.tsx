"use client";
import { useQuery } from "@tanstack/react-query";
import { resumeMetricsQueries } from "../../queries/resume-metrics.queries";
import { FileText, Sparkles, Upload } from "lucide-react";

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ResumeTypeBadge({ source }: { source: string | null }) {
  const isUploaded = source === "uploaded";
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
        isUploaded
          ? "bg-blue-50 text-blue-600"
          : "bg-purple-50 text-purple-600"
      }`}
    >
      {isUploaded ? (
        <Upload className="size-3" />
      ) : (
        <Sparkles className="size-3" />
      )}
      {isUploaded ? "Uploaded" : "AI Generated"}
    </span>
  );
}

export const RecentResumes = () => {
  const { data, isLoading } = useQuery(resumeMetricsQueries.recent(5));
  const items = data?.data ?? [];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Resumes</h2>
        <div className="size-8 bg-blue-50 rounded-lg flex items-center justify-center">
          <FileText className="size-4 text-blue-600" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">
          No resumes yet. Generate or upload your first resume.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((resume) => (
            <li
              key={resume.id}
              className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {resume.title || "Untitled Resume"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatDate(resume.createdAt)}
                </p>
              </div>
              <div className="ml-3 shrink-0">
                <ResumeTypeBadge source={resume.documentSource} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
