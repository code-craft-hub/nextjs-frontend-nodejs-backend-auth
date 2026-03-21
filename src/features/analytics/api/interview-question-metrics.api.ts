import { api } from "@/shared/api/client";

export interface InterviewQuestionItem {
  id: string;
  title: string | null;
  category: string | null;
  difficulty: string | null;
  practiceCount: number | null;
  aiGenerated: boolean;
  createdAt: string | Date;
  jobId: string | null;
}

export interface InterviewQuestionMetricsResponse {
  data: InterviewQuestionItem[];
  pagination: { page: number; limit: number };
}

export const interviewQuestionMetricsApi = {
  getRecent: async (limit = 5): Promise<InterviewQuestionMetricsResponse> => {
    const data = await api.get<{ success: boolean } & InterviewQuestionMetricsResponse>(
      `/interview-questions/me`,
      { params: { page: 1, limit } },
    );
    if (data?.success) return { data: data.data, pagination: data.pagination };
    throw new Error("Failed to fetch interview questions");
  },
};
