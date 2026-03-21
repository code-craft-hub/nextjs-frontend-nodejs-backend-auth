// ─── API ────────────────────────────────────────────────────
export { jobApplicationsApi } from "./api/job-applications.api";
export { userActivityApi } from "./api/user-activity.api";
export { userAnalyticsApi } from "./api/user-analytics.api";
export { coverLetterMetricsApi } from "./api/cover-letter-metrics.api";
export { resumeMetricsApi } from "./api/resume-metrics.api";
export { interviewQuestionMetricsApi } from "./api/interview-question-metrics.api";
export { activityStatsApi } from "./api/activity-stats.api";

export type { AnalyticsTrend, TrendDataPoint, MatchMetricPoint } from "./api/user-analytics.api";
export type { CoverLetterItem } from "./api/cover-letter-metrics.api";
export type { ResumeItem } from "./api/resume-metrics.api";
export type { InterviewQuestionItem } from "./api/interview-question-metrics.api";
export type { ActivityStats, ActivityItem } from "./api/activity-stats.api";

// ─── Query Keys ─────────────────────────────────────────────
export { jobApplicationKeys } from "./queries/job-applications.keys";

// ─── Queries ────────────────────────────────────────────────
export * from "./queries/application-history.queries";
export { userAnalyticsQueries } from "./queries/user-analytics.queries";
export { coverLetterMetricsQueries } from "./queries/cover-letter-metrics.queries";
export { resumeMetricsQueries } from "./queries/resume-metrics.queries";
export { interviewQuestionMetricsQueries } from "./queries/interview-question-metrics.queries";
export { activityStatsQueries } from "./queries/activity-stats.queries";

// ─── Mutations ──────────────────────────────────────────────
export * from "./mutations/job-applications.mutations";
