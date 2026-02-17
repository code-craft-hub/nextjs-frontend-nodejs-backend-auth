import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { aiSettingsKeys } from "./ai-settings.keys";
import { autoApplyKeys } from "./auto-apply.keys";
import { invalidateUserQueries } from "../queries/user.queries";

/**
 * Centralized query invalidation utilities
 *
 * Usage in mutations:
 * ```ts
 * import { invalidateResumeQueries } from "@/lib/query/query-invalidation";
 *
 * export function useCreateResumeMutation() {
 *   const queryClient = useQueryClient();
 *   return useMutation({
 *     mutationFn: (data) => api.createResume(data),
 *     onSettled: () => {
 *       invalidateResumeQueries(queryClient); // or invalidateResumeLists(), etc.
 *     },
 *   });
 * }
 * ```
 *
 * Usage in components/actions after async operations:
 * ```ts
 * import { invalidateDocumentGenerationQueries } from "@/lib/query/query-invalidation";
 *
 * const queryClient = useQueryClient();
 * await generateDocuments();
 * invalidateDocumentGenerationQueries(queryClient);
 * ```
 */



// ─── Resume Queries ─────────────────────────────────────────

export const invalidateResumeQueries = (queryClient: QueryClient) => {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: queryKeys.resumes.details(),
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.resumes.lists(),
    }),
  ]);
};

export const invalidateResumeDetail = (
  queryClient: QueryClient,
  resumeId: string,
) => {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.resumes.detail(resumeId),
  });
};

export const invalidateResumeLists = (queryClient: QueryClient) => {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.resumes.lists(),
  });
};

// ─── Cover Letter Queries ───────────────────────────────────

export const invalidateCoverLetterQueries = (queryClient: QueryClient) => {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: queryKeys.coverLetters.details(),
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.coverLetters.lists(),
    }),
  ]);
};

export const invalidateCoverLetterDetail = (
  queryClient: QueryClient,
  coverLetterId: string,
) => {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.coverLetters.detail(coverLetterId),
  });
};

export const invalidateCoverLetterLists = (queryClient: QueryClient) => {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.coverLetters.lists(),
  });
};

// ─── AI Apply Queries ───────────────────────────────────────

export const invalidateAIApplyQueries = (queryClient: QueryClient) => {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: queryKeys.aiApply.details(),
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.aiApply.lists(),
    }),
  ]);
};

export const invalidateAIApplyDetail = (
  queryClient: QueryClient,
  aiApplyId: string,
) => {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.aiApply.detail(aiApplyId),
  });
};

export const invalidateAIApplyLists = (queryClient: QueryClient) => {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.aiApply.lists(),
  });
};

// ─── AI Settings Queries ────────────────────────────────────

export const invalidateAISettingsQueries = (queryClient: QueryClient) => {
  return queryClient.invalidateQueries({
    queryKey: aiSettingsKeys.all,
  });
};

// ─── Auto Apply Queries ─────────────────────────────────────

export const invalidateAutoApplyQueries = (queryClient: QueryClient) => {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: autoApplyKeys.all,
    }),
  ]);
};

export const invalidateAutoApplyLists = (queryClient: QueryClient) => {
  return queryClient.invalidateQueries({
    queryKey: autoApplyKeys.lists(),
  });
};

export const invalidateAutoApplyDetail = (
  queryClient: QueryClient,
  autoApplyId: string,
) => {
  return queryClient.invalidateQueries({
    queryKey: autoApplyKeys.detail(autoApplyId),
  });
};

export const invalidateAutoApplyCount = (queryClient: QueryClient) => {
  return queryClient.invalidateQueries({
    queryKey: autoApplyKeys.count(),
  });
};

// ─── Interview Questions Queries ────────────────────────────

export const invalidateInterviewQueriesQueries = (queryClient: QueryClient) => {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: queryKeys.interviewQuestions.details(),
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.interviewQuestions.lists(),
    }),
  ]);
};

export const invalidateInterviewQuestionsDetail = (
  queryClient: QueryClient,
  questionId: string,
) => {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.interviewQuestions.detail(questionId),
  });
};

// ─── Auth Queries ───────────────────────────────────────────

export const invalidateAuthQueries = (queryClient: QueryClient) => {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: queryKeys.auth.session(),
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.auth.profile(),
    }),
  ]);
};

// ─── Jobs Queries ───────────────────────────────────────────

export const invalidateJobsQueries = (queryClient: QueryClient) => {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: queryKeys.jobs.lists(),
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.jobs.details(),
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.jobs.stats(),
    }),
  ]);
};

export const invalidateJobsLists = (queryClient: QueryClient) => {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.jobs.lists(),
  });
};

// ─── Blog Queries ───────────────────────────────────────────

export const invalidateBlogQueries = (queryClient: QueryClient) => {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: queryKeys.blogs.lists(),
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.blogs.details(),
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.blogs.published(),
    }),
  ]);
};

// ─── Batch Invalidations ────────────────────────────────────

/**
 * Invalidate multiple related queries at once
 * Useful for operations that affect multiple entities
 */
export const invalidateDocumentGenerationQueries = (
  queryClient: QueryClient,
) => {
  return Promise.all([
    invalidateResumeQueries(queryClient),
    invalidateCoverLetterQueries(queryClient),
  ]);
};

/**
 * Invalidate all AI-related queries
 * Useful after AI operations that might affect user's AI settings and auto-apply
 */
export const invalidateAllAIQueries = (queryClient: QueryClient) => {
  return Promise.all([
    invalidateAISettingsQueries(queryClient),
    invalidateAutoApplyQueries(queryClient),
    invalidateAIApplyQueries(queryClient),
  ]);
};

/**
 * Invalidate all user-related queries
 * Useful after profile updates that might cascade to other features
 */
export const invalidateAllUserQueries = (queryClient: QueryClient) => {
  return Promise.all([
    invalidateUserQueries(),
    invalidateAllAIQueries(queryClient),
  ]);
};
