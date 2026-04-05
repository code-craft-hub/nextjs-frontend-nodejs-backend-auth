"use client";
import { useQuery } from "@tanstack/react-query";
import { coverLetterMetricsQueries } from "../../queries/cover-letter-metrics.queries";
import { Mail, Sparkles } from "lucide-react";

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const RecentCoverLetters = () => {
  const { data, isLoading } = useQuery(coverLetterMetricsQueries.recent(5));
  const items = data?.data ?? [];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent Cover Letters
        </h2>
        <div className="size-8 bg-green-50 rounded-lg flex items-center justify-center">
          <Mail className="size-4 text-green-600" />
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
          No cover letters yet. Generate one for a job application.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((cl) => (
            <li
              key={cl.id}
              className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {cl.title || "Untitled Cover Letter"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {cl.recruiterEmail ? `To: ${cl.recruiterEmail}` : formatDate(cl.createdAt)}
                </p>
              </div>
              {cl.aiGenerated && (
                <span className="ml-3 shrink-0 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-purple-50 text-purple-600">
                  <Sparkles className="size-3" />
                  AI
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
