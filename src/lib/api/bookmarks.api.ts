import { api } from "./client";

// ─── Entity Types ─────────────────────────────────────────────────────────────

export interface Bookmark {
  id: string;
  userId: string;
  jobId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// ─── Response Envelopes ───────────────────────────────────────────────────────

export interface BookmarkResponse {
  success: boolean;
  message: string;
  data: { action: "created" | "removed"; bookmark: Bookmark };
}

export interface BookmarkListResponse {
  success: boolean;
  data: Bookmark[];
  pagination: {
    page: number;
    limit: number;
    count: number;
  };
}

export interface BookmarkDetailResponse {
  success: boolean;
  data: Bookmark;
}

export interface BookmarkCheckResponse {
  success: boolean;
  data: {
    bookmarked: boolean;
  };
}

export interface BookmarkDeleteResponse {
  success: boolean;
  message: string;
}

// ─── API Client ───────────────────────────────────────────────────────────────

export const bookmarksApi = {
  /**
   * POST /users/bookmarks
   * Create a bookmark for the authenticated user.
   */
  create: (jobId: string) =>
    api.post<BookmarkResponse>("/users/bookmarks", { jobId }),

  /**
   * GET /users/bookmarks
   * Retrieve the authenticated user's bookmarks with pagination.
   */
  list: (page = 1, limit = 20) =>
    api.get<BookmarkListResponse>("/users/bookmarks", {
      params: { page, limit },
    }),

  /**
   * GET /users/bookmarks/:bookmarkId
   * Retrieve a single bookmark by ID.
   */
  getById: (bookmarkId: string) =>
    api.get<BookmarkDetailResponse>(`/users/bookmarks/${bookmarkId}`),

  /**
   * GET /users/bookmarks/check?jobId=
   * Check whether the authenticated user has bookmarked a specific job.
   */
  check: (jobId: string) =>
    api.get<BookmarkCheckResponse>("/users/bookmarks/check", {
      params: { jobId },
    }),

  /**
   * DELETE /users/bookmarks/:bookmarkId
   * Remove a bookmark by its ID (ownership verified server-side).
   */
  removeById: (bookmarkId: string) =>
    api.delete<BookmarkDeleteResponse>(`/users/bookmarks/${bookmarkId}`),

  /**
   * DELETE /users/bookmarks/job/:jobId
   * Remove the authenticated user's bookmark for a specific job.
   */
  removeByJob: (jobId: string) =>
    api.delete<BookmarkDeleteResponse>(`/users/bookmarks/job/${jobId}`),
} as const;
