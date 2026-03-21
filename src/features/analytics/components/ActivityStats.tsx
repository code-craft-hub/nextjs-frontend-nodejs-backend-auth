"use client";
import { useQuery } from "@tanstack/react-query";
import { activityStatsQueries } from "../queries/activity-stats.queries";
import { Activity, Clock, Layers, MousePointerClick } from "lucide-react";

function formatAction(action: string): string {
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export const ActivityStats = () => {
  const { data: stats, isLoading: statsLoading } = useQuery(
    activityStatsQueries.stats(30),
  );
  const { data: recent, isLoading: recentLoading } = useQuery(
    activityStatsQueries.recent(8),
  );

  const topActions = stats
    ? Object.entries(stats.actionBreakdown)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
    : [];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Activity (30d)</h2>
        <div className="size-8 bg-indigo-50 rounded-lg flex items-center justify-center">
          <Activity className="size-4 text-indigo-600" />
        </div>
      </div>

      {statsLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Summary row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <MousePointerClick className="size-4 text-indigo-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">
                {stats?.totalActivities ?? 0}
              </p>
              <p className="text-xs text-gray-400">Actions</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <Layers className="size-4 text-blue-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">
                {stats?.uniquePages ?? 0}
              </p>
              <p className="text-xs text-gray-400">Pages</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <Clock className="size-4 text-green-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">
                {stats?.uniqueActions ?? 0}
              </p>
              <p className="text-xs text-gray-400">Types</p>
            </div>
          </div>

          {/* Top actions */}
          {topActions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Top Actions
              </p>
              {topActions.map(([action, count]) => (
                <div key={action} className="flex items-center justify-between">
                  <p className="text-xs text-gray-600 truncate flex-1">
                    {formatAction(action)}
                  </p>
                  <span className="ml-2 text-xs font-semibold text-indigo-600 shrink-0">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Recent activity */}
          {!recentLoading && (recent ?? []).length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-50">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Recent
              </p>
              <ul className="space-y-1.5">
                {(recent ?? []).slice(0, 5).map((item) => (
                  <li key={item.id} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-indigo-300 shrink-0" />
                    <p className="text-xs text-gray-600 truncate flex-1">
                      {formatAction(item.action)}
                    </p>
                    <span className="text-xs text-gray-400 shrink-0">
                      {formatDate(item.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};
