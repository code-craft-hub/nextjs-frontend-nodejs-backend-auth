import { api } from "@/shared/api/client";

export interface TrendDataPoint {
  month: string;
  applications: number;
  autoApplications: number;
  resumes: number;
  coverLetters: number;
  interviewQuestions: number;
}

export interface MatchMetricPoint {
  month: string;
  value: number;
}

export interface AnalyticsTrend {
  trend: TrendDataPoint[];
  matchMetrics: MatchMetricPoint[];
}

export const userAnalyticsApi = {
  getTrend: async (): Promise<AnalyticsTrend> => {
    const data = await api.get<{ success: boolean; data: AnalyticsTrend }>(
      `/users/analytics/trend`,
    );
    if (data?.success) return data.data;
    throw new Error("Failed to fetch analytics trend");
  },
};
