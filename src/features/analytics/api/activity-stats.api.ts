import { api } from "@/shared/api/client";

export interface ActivityStats {
  totalActivities: number;
  uniquePages: number;
  uniqueActions: number;
  firstActivityAt?: string | Date | null;
  lastActivityAt?: string | Date | null;
  actionBreakdown: Record<string, number>;
}

export interface ActivityItem {
  id: string;
  action: string;
  page: string | null;
  route: string | null;
  description: string | null;
  createdAt: string | Date;
}

export const activityStatsApi = {
  getStats: async (daysBack = 30): Promise<ActivityStats> => {
    const data = await api.get<{ success: boolean; data: ActivityStats }>(
      `/user-activity/stats`,
      { params: { daysBack } },
    );
    if (data?.success) return data.data;
    throw new Error("Failed to fetch activity stats");
  },

  getRecent: async (limit = 10): Promise<ActivityItem[]> => {
    const data = await api.get<{ success: boolean; data: ActivityItem[] }>(
      `/user-activity/recent`,
      { params: { limit } },
    );
    if (data?.success) return data.data;
    throw new Error("Failed to fetch recent activity");
  },
};
