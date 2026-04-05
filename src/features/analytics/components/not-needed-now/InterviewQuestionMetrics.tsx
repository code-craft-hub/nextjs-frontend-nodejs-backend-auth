"use client";
import { useQuery } from "@tanstack/react-query";
import { interviewQuestionMetricsQueries } from "../../queries/interview-question-metrics.queries";
import { MessageSquare, Trophy } from "lucide-react";

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DifficultyBadge({ difficulty }: { difficulty: string | null }) {
  if (!difficulty) return null;
  const colors: Record<string, string> = {
    easy: "bg-green-50 text-green-600",
    medium: "bg-yellow-50 text-yellow-600",
    hard: "bg-red-50 text-red-600",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
        colors[difficulty.toLowerCase()] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {difficulty}
    </span>
  );
}

export const InterviewQuestionMetrics = () => {
  const { data, isLoading } = useQuery(
    interviewQuestionMetricsQueries.recent(5),
  );
  const items = data?.data ?? [];
  const totalPractices = items.reduce((sum, q) => sum + (q.practiceCount ?? 0), 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Interview Questions
        </h2>
        <div className="size-8 bg-orange-50 rounded-lg flex items-center justify-center">
          <MessageSquare className="size-4 text-orange-600" />
        </div>
      </div>

      {totalPractices > 0 && (
        <div className="flex items-center gap-2 mb-4 p-2 bg-amber-50 rounded-lg">
          <Trophy className="size-4 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-700 font-medium">
            {totalPractices} practice session{totalPractices !== 1 ? "s" : ""} completed
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">
          No interview questions yet. Generate some for a job role.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((q) => (
            <li
              key={q.id}
              className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {q.title || q.category || "Interview Question Set"}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-gray-400">{formatDate(q.createdAt)}</p>
                  {(q.practiceCount ?? 0) > 0 && (
                    <span className="text-xs text-indigo-500 font-medium">
                      ×{q.practiceCount} practiced
                    </span>
                  )}
                </div>
              </div>
              <div className="ml-3 shrink-0">
                <DifficultyBadge difficulty={q.difficulty} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
