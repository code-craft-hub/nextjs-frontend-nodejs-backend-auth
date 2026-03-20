// ─── API ────────────────────────────────────────────────────
export { jobApplicationsApi } from "./api/job-applications.api";
export { userActivityApi } from "./api/user-activity.api";
export { userAnalyticsApi } from "./api/user-analytics.api";
export type { AnalyticsTrend, TrendDataPoint, MatchMetricPoint } from "./api/user-analytics.api";

// ─── Query Keys ─────────────────────────────────────────────
export { jobApplicationKeys } from "./queries/job-applications.keys";

// ─── Queries ────────────────────────────────────────────────
export * from "./queries/application-history.queries";
export { userAnalyticsQueries } from "./queries/user-analytics.queries";

// ─── Mutations ──────────────────────────────────────────────
export * from "./mutations/job-applications.mutations";
