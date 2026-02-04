import { JobType } from "@/types";

export interface RecommendationMetrics {
  experimentId: string | null;
  geminiReasoning: string;
  matchingFeatures: {
    matchedSkills: string[];
    scoreBreakdown: Record<string, unknown>;
    searchCriteria: Record<string, unknown>;
  };
  modelVersion: string;
}

export interface JobRecommendation {
  id: string;
  confidenceScore: number;
  matchScore: number;
  status: string;
  viewedAt: string | null;
  rankPosition: number;
  createdAt: string;
  metrics: RecommendationMetrics;
  job: JobType;
}

export interface RecommendationsResponse {
  recommendations: JobRecommendation[];
  count: number;
  status: string;
}

export interface JobCardProps {
  recommendation: JobRecommendation;
  onJobClick: (job: JobType) => void;
  onPreview: (job: JobType) => void;
}

export interface JobBadgesProps {
  jobType?: string;
  employmentType?: string;
  location: string;
  matchScore?: number;
}

export interface JobCardDropdownProps {
  onAutoApply: () => void;
  onPreview: () => void;
}
