export type SearchForm = {
  query: string;
};

export interface JobPost {
  id: string;
  title: string;
  link?: string | null;
  companyName?: string | null;
  companyLogo?: string | null;
  companyIcon?: string | null;
  companyText?: string | null;
  location?: string | null;
  salary?: string | null;
  jobType?: string | null;
  company?: string;
  salaryInfo?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: string;
  } | null;
  postedAt: string;
  descriptionHtml?: string | null;
  descriptionText?: string | null;
  applyUrl?: string | null;
  jobFunction?: string | null;
  employmentType?: string | null;
  expireAt?: string | null;
  emailApply?: string | null;
  source?: string | null;
  payload?: Record<string, any> | null;
  isProcessed?: boolean;
  qualityScore?: number | null;
  createdAt: string;
  updatedAt: string;
  /** Populated by the backend when the request is authenticated. */
  isBookmarked?: boolean;
}

export interface InfiniteJobsResponse {
  items: JobPost[];
  nextCursor: string | null;
}
