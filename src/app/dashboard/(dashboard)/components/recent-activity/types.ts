import { JobType } from "@/types";

export interface JobWithRecommendation extends JobType {
  isRecommended: boolean;
}

export interface JobCardProps {
  job: JobWithRecommendation;
  onJobClick: (job: JobType) => void;
  onPreview: (job: JobType) => void;
}

export interface JobBadgesProps {
  jobType?: string;
  employmentType?: string;
  location: string;
  relevanceScore?: number;
}

export interface JobCardDropdownProps {
  onAutoApply: () => void;
  onPreview: () => void;
}
