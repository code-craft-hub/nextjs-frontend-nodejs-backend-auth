import { JobType } from "@/types";
import { api } from "./client";
import type { PaginatedResponse } from "@/lib/types";

const JOB_RECOMMENDATION_API = `/recommendations`;

export interface RecommendationMetrics {
  experimentId: string | null;
  geminiReasoning: string | null;
  matchingFeatures: {
    matchedSkills: string[];
    scoreBreakdown: Record<string, unknown>;
    searchCriteria: Record<string, unknown>;
  } | null;
  modelVersion: string | null;
}

export interface JobRecommendation {
  id: string;
  confidenceScore: number | null;
  matchScore: number | null;
  status: string | null;
  viewedAt: string | null;
  rankPosition: number | null;
  createdAt: string;
  metrics: RecommendationMetrics;
  job: Partial<JobType> | null;
}

export type RecommendationStatus =
  | "ready"
  | "processing"
  | "queued"
  | "incomplete_profile";

export interface RecommendationsResponse {
  recommendations: JobRecommendation[];
  /** Number of recommendations on the current page */
  count: number;
  /** Total number of saved recommendations for this user */
  total: number;
  /** Whether more pages are available */
  hasMore: boolean;
  /** Current page number (1-indexed) */
  page: number;
  /** Page size */
  limit: number;
  /** Current status of the recommendation pipeline */
  status: RecommendationStatus;
  /** True while a background generation job is in progress (even if recs already exist) */
  isGenerating: boolean;
  message?: string;
  missingFields?: string[];
}

export const recommendationsApi = {
  /**
   * GET /recommendations
   * Returns saved recommendations (sorted by match score DESC) with pagination.
   * When no recommendations exist, queues background generation and returns status.
   */
  getUserRecommendations: (
    params?: { page?: number; limit?: number },
    token?: string,
  ) =>
    api.get<{ data: RecommendationsResponse }>(JOB_RECOMMENDATION_API, {
      params: {
        page: params?.page,
        limit: params?.limit,
      },
      token,
    }),

  /**
   * POST /recommendations/more
   * Queues additional recommendation generation using the user's stored profile.
   * Existing recommendations are preserved; new ones are appended.
   */
  generateMore: () =>
    api.post<{ data: { status: string; message: string } }>(
      `${JOB_RECOMMENDATION_API}/more`,
    ),

  /**
   * POST /recommendations
   * Get recommendations based on explicit request body (optionally save to DB).
   */
  getRecommendations: (payload: Record<string, unknown>, token?: string) =>
    api.post<PaginatedResponse<JobType>>(`${JOB_RECOMMENDATION_API}`, payload, { token }),

  /**
   * GET /recommendations/quick-search
   */
  quickSearch: (params: { jobTitle: string; skills?: string; limit?: number }) =>
    api.get(`${JOB_RECOMMENDATION_API}/quick-search`, { params }),

  /**
   * GET /recommendations/similar/:jobId
   */
  getSimilarJobs: (jobId: string, params?: { limit?: number }) =>
    api.get(
      `${JOB_RECOMMENDATION_API}/similar/${encodeURIComponent(jobId)}`,
      { params },
    ),

  /**
   * GET /recommendations/by-title
   */
  getJobsByTitle: (params: { title: string; limit?: number }) =>
    api.get(`${JOB_RECOMMENDATION_API}/by-title`, { params }),

  /**
   * GET /recommendations/by-skills
   */
  getJobsBySkills: (params: { skills: string; limit?: number }) =>
    api.get(`${JOB_RECOMMENDATION_API}/by-skills`, { params }),
};

export default recommendationsApi;
