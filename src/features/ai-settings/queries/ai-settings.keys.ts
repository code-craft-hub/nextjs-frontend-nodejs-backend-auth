export const aiSettingsKeys = {
  all: ["ai-settings"] as const,
  lists: () => [...aiSettingsKeys.all, "list"] as const,
  detail: () => [...aiSettingsKeys.all, "detail"] as const,
  toggleAutoApply: () => [...aiSettingsKeys.all, "toggle-auto-apply"] as const,
} as const;

