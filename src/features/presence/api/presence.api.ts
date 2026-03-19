import { api } from "@/shared/api/client";
import type { IActiveUser, IPresenceStats } from "./presence.api.types";

export const presenceApi = {
  /**
   * Sends a heartbeat for the currently authenticated user.
   * Called every 30 s by `useHeartbeat` — fire and forget.
   */
  heartbeat: (pagePath?: string) =>
    api.post<{ success: boolean }>("/presence/heartbeat", {
      pagePath: pagePath ?? null,
    }),

  /**
   * Fetches a cursor-paginated page of currently active users.
   * Admin only — enforced server-side.
   */
  getActiveUsers: async (params?: {
    cursor?: string;
    limit?: number;
    token?: string;
  }) => {
    const { cursor, limit, token } = params ?? {};
    const qs = new URLSearchParams();
    if (cursor) qs.set("cursor", cursor);
    if (limit) qs.set("limit", String(limit));
    const query = qs.toString();

    const data = await api.get<{
      success: boolean;
      data: IActiveUser[];
      nextCursor: string | null;
    }>(`/presence/admin/active${query ? `?${query}` : ""}`, { token });

    if (data?.success) return { data: data.data, nextCursor: data.nextCursor };
    throw new Error("Failed to fetch active users");
  },

  /**
   * Fetches aggregate presence stats for the admin summary card.
   * Admin only — enforced server-side.
   */
  getStats: async (token?: string) => {
    const data = await api.get<{ success: boolean; data: IPresenceStats }>(
      "/presence/admin/stats",
      { token },
    );
    if (data?.success) return data.data;
    throw new Error("Failed to fetch presence stats");
  },
};
