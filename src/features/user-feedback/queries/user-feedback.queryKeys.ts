export const userFeedbackQueryKeys = {
  all: ["user-feedback"] as const,
  mine: () => [...userFeedbackQueryKeys.all, "me"] as const,
  lists: () => [...userFeedbackQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...userFeedbackQueryKeys.lists(), filters] as const,
  details: () => [...userFeedbackQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...userFeedbackQueryKeys.details(), id] as const,
  resource: (resourceType: string, resourceId: string) =>
    [...userFeedbackQueryKeys.all, "resource", resourceType, resourceId] as const,
};
