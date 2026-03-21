import { api } from "@/shared/api/client";

export interface ResumeItem {
  id: string;
  title: string | null;
  type: string | null;
  contentType: string | null;
  isDefault: boolean;
  createdAt: string | Date;
  documentSource: string | null;
}

export interface ResumeMetricsResponse {
  data: ResumeItem[];
  pagination: { page: number; limit: number };
}

export const resumeMetricsApi = {
  getRecent: async (limit = 5): Promise<ResumeMetricsResponse> => {
    const data = await api.get<{ success: boolean } & ResumeMetricsResponse>(
      `/resumes`,
      { params: { page: 1, limit } },
    );
    if (data?.success) return { data: data.data, pagination: data.pagination };
    throw new Error("Failed to fetch resumes");
  },
};
