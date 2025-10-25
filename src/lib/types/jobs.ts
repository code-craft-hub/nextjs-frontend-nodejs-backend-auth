export interface Job {
  id: string;
  userId: string;
  title: string;
  company: string;
  location: string;
  locationType: 'remote' | 'hybrid' | 'onsite';
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  benefits?: string[];
  status: 'draft' | 'active' | 'closed' | 'archived';
  applicationUrl?: string;
  applicationDeadline?: string;
  tags: string[];
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  department?: string;
  postedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobFilters extends PaginationParams {
  status?: Job['status'];
  locationType?: Job['locationType'];
  employmentType?: Job['employmentType'];
  experienceLevel?: Job['experienceLevel'];
  search?: string;
  company?: string;
  location?: string;
  tags?: string[];
  salaryMin?: number;
  salaryMax?: number;
  department?: string;
  jobRole?: string;
}

export interface CreateJobData {
  title: string;
  company: string;
  location: string;
  locationType: Job['locationType'];
  employmentType: Job['employmentType'];
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary?: Job['salary'];
  benefits?: string[];
  status?: Job['status'];
  applicationUrl?: string;
  applicationDeadline?: string;
  tags: string[];
  experienceLevel: Job['experienceLevel'];
  department?: string;
}

export interface UpdateJobData extends Partial<CreateJobData> {}

export interface JobStats {
  total: number;
  active: number;
  draft: number;
  closed: number;
  byEmploymentType: Record<string, number>;
  byExperienceLevel: Record<string, number>;
  byLocation: Record<string, number>;
}

import type { PaginationParams } from './index';