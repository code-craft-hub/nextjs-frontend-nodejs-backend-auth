export const autoApplyKeys = {
  all: ["auto-apply"] as const,
  lists: () => [...autoApplyKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...autoApplyKeys.lists(), filters] as const,
  details: () => [...autoApplyKeys.all, "detail"] as const,
  detail: (id: string) => [...autoApplyKeys.details(), id] as const,
  recent: (limit?: number) =>
    [...autoApplyKeys.all, "recent", limit] as const,
  count: () => [...autoApplyKeys.all, "count"] as const,
  byType: (type: string) =>
    [...autoApplyKeys.all, "type", type] as const,
  byResume: (resumeId: string) =>
    [...autoApplyKeys.all, "resume", resumeId] as const,
  byCoverLetter: (coverLetterId: string) =>
    [...autoApplyKeys.all, "cover-letter", coverLetterId] as const,
} as const;
