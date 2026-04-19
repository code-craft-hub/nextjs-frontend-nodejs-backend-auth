export { browserAutomationApi } from "./api/browser-automation.api";
export {
  useSubmitBrowserApplicationMutation,
  useResumeBrowserApplicationMutation,
} from "./mutations/browser-automation.mutations";
export { useBotStatus } from "./hooks/useBotStatus";
export type { BotSession } from "./hooks/useBotStatus";
export type {
  SubmitApplicationPayload,
  SubmitApplicationData,
  SubmitApplicationResponse,
  ResumeApplicationPayload,
  BotStatusEvent,
  AutoApplyStatus,
} from "./types/browser-automation.types";
