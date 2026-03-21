import { api } from "@/shared/api/client";

export interface CoverLetterItem {
  id: string;
  title: string | null;
  createdAt: string | Date;
  aiGenerated: boolean;
  jobId: string | null;
  recruiterEmail: string | null;
}

export interface CoverLetterMetricsResponse {
  data: CoverLetterItem[];
  pagination: { page: number; limit: number };
}

export const coverLetterMetricsApi = {
  getRecent: async (limit = 5): Promise<CoverLetterMetricsResponse> => {
    const data = await api.get<{ success: boolean } & CoverLetterMetricsResponse>(
      `/cover-letters/me`,
      { params: { page: 1, limit } },
    );
    if (data?.success) return { data: data.data, pagination: data.pagination };
    throw new Error("Failed to fetch cover letters");
  },
};
