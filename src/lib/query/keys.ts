import { PaginationParams } from "../types";
import { JobFilters } from "../types/jobs";

export const queryKeys = {
  // User keys
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: () => [...queryKeys.users.details(), "user"] as const,
    infinite: (params: Omit<PaginationParams, "page">) =>
      [...queryKeys.users.all, "infinite", params] as const,
  },

  // Auth keys
  auth: {
    all: ["auth"] as const,
    session: () => [...queryKeys.auth.all, "session"] as const,
    profile: () => [...queryKeys.auth.all, "profile"] as const,
  },

  // Cover Letter keys
  coverLetters: {
    all: ["cover-letters"] as const,
    lists: () => [...queryKeys.coverLetters.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.coverLetters.lists(), filters] as const,
    details: () => [...queryKeys.coverLetters.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.coverLetters.details(), id] as const,
  },

  // Interview Questions keys
  interviewQuestions: {
    all: ["interview-questions"] as const,
    lists: () => [...queryKeys.interviewQuestions.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.interviewQuestions.lists(), filters] as const,
    details: () => [...queryKeys.interviewQuestions.all, "detail"] as const,
    detail: (id: string) =>
      [...queryKeys.interviewQuestions.details(), id] as const,
  },

  // Resume keys
  resumes: {
    all: ["resumes"] as const,
    lists: () => [...queryKeys.resumes.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.resumes.lists(), filters] as const,
    uploaded: (filters: Record<string, any>) =>
      [...queryKeys.resumes.all, "uploaded", filters] as const,
    details: () => [...queryKeys.resumes.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.resumes.details(), id] as const,
  },

  // AI Apply keys
  aiApply: {
    all: ["ai-apply"] as const,
    lists: () => [...queryKeys.aiApply.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.aiApply.lists(), filters] as const,
    details: () => [...queryKeys.aiApply.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.aiApply.details(), id] as const,
  },

  // Blog keys
  blogs: {
    all: ["blogs"] as const,
    lists: () => [...queryKeys.blogs.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.blogs.lists(), filters] as const,
    details: () => [...queryKeys.blogs.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.blogs.details(), id] as const,
    published: () => [...queryKeys.blogs.all, "published"] as const,
  },
  jobs: {
    all: ["jobs"] as const,
    lists: () => [...queryKeys.jobs.all, "list"] as const,
    autos: () => [...queryKeys.jobs.all, "auto"] as const,

    list: (filters: JobFilters) => {
      // Create a clean object without undefined values
      const cleanFilters: Record<string, any> = {};

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          cleanFilters[key] = value;
        }
      });

      return [...queryKeys.jobs.lists(), cleanFilters] as const;
    },

    autoApply: () => {
      return [...queryKeys.jobs.autos(), "auto-apply"] as const;
    },

    auto: (filters: JobFilters) => {
      // Create a clean object without undefined values
      const cleanFilters: Record<string, any> = {};

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          cleanFilters[key] = value;
        }
      });

      return [...queryKeys.jobs.autos(), cleanFilters] as const;
    },
    // list: (filters: Record<string, any>) =>
    //   [...queryKeys.jobs.lists(), filters] as const,
    details: () => [...queryKeys.jobs.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.jobs.details(), id] as const,
    stats: () => [...queryKeys.jobs.all, "stats"] as const,
    search: (query: string) =>
      [...queryKeys.jobs.all, "search", query] as const,
    similar: (id: string) => [...queryKeys.jobs.all, "similar", id] as const,
    filters: () => [...queryKeys.jobs.all, "filters"] as const,
  },
  jobPosts: {
    all: ["job-posts"] as const,
    lists: () => [...queryKeys.jobPosts.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.jobPosts.lists(), filters] as const,
    details: () => [...queryKeys.jobPosts.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.jobPosts.details(), id] as const,
    stats: () => [...queryKeys.jobPosts.all, "stats"] as const,
    search: (q: string) => [...queryKeys.jobPosts.all, "search", q] as const,
    fts: (q: string) => [...queryKeys.jobPosts.all, "fts", q] as const,
    active: () => [...queryKeys.jobPosts.all, "active"] as const,
    unprocessed: () => [...queryKeys.jobPosts.all, "unprocessed"] as const,
    company: (companyName: string, params?: Record<string, any>) =>
      [...queryKeys.jobPosts.all, "company", companyName, params] as const,
    location: (location: string, params?: Record<string, any>) =>
      [...queryKeys.jobPosts.all, "location", location, params] as const,
  },
  jobApplications: {
    all: ["job-applications"] as const,
    lists: () => [...queryKeys.jobApplications.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.jobApplications.lists(), filters] as const,
    details: () => [...queryKeys.jobApplications.all, "detail"] as const,
    detail: (id: string) =>
      [...queryKeys.jobApplications.details(), id] as const,
    user: (userId: string) =>
      [...queryKeys.jobApplications.all, "user", userId] as const,
    check: (userId: string, jobId: string) =>
      [...queryKeys.jobApplications.all, "check", userId, jobId] as const,
    status: (status: string, params?: Record<string, any>) =>
      [...queryKeys.jobApplications.all, "status", status, params] as const,
    job: (jobId: string) =>
      [...queryKeys.jobApplications.all, "job", jobId] as const,
    adminList: (params?: Record<string, any>) =>
      [...queryKeys.jobApplications.all, "admin", "list", params] as const,
  },
  recommendations: {
    all: ["recommendations"] as const,
    lists: () => [...queryKeys.recommendations.all, "list"] as const,
    user: () => [...queryKeys.recommendations.all, "user"] as const,
    trigger: () => [...queryKeys.recommendations.all, "trigger"] as const,
    generate: (params: Record<string, any>) =>
      [...queryKeys.recommendations.all, "generate", params] as const,
    quickSearch: (q: string) =>
      [...queryKeys.recommendations.all, "quick-search", q] as const,
    similar: (jobId: string) =>
      [...queryKeys.recommendations.all, "similar", jobId] as const,
    byTitle: (title: string) =>
      [...queryKeys.recommendations.all, "by-title", title] as const,
    bySkills: (skills: string) =>
      [...queryKeys.recommendations.all, "by-skills", skills] as const,
  },
} as const;
