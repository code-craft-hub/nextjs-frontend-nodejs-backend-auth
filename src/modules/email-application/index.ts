/**
 * Email Application Module
 *
 * Provides email application management features including:
 * - Sending applications via email
 * - Deleting application records
 * - Cache management with React Query
 */

// ─── API ────────────────────────────────────────────────────
export { emailApplicationApi } from "./api/email-application.api";
export type {
  SendEmailApplicationPayload,
  SendEmailApplicationResponse,
  DeleteEmailApplicationPayload,
  DeleteEmailApplicationResponse,
  EmailApplicationError,
} from "./api/email-application.api.types";

// ─── Query Keys & Invalidation ───────────────────────────────
export { emailApplicationKeys } from "./queries/email-application.queryKeys";
export {
  invalidateEmailApplicationQueries,
  invalidateEmailApplicationDetail,
  invalidateEmailApplicationLists,
} from "./queries/email-application.invalidation";

// ─── Mutation Hooks ─────────────────────────────────────────
export { useSendEmailApplicationMutation } from "./mutations/useSendEmailApplicationMutation";
export { useDeleteEmailApplicationMutation } from "./mutations/useDeleteEmailApplicationMutation";

// ─── Components ─────────────────────────────────────────────
export { GmailCompose } from "./components/preview/GmailCompose";
