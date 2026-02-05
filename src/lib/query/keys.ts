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
} as const;
