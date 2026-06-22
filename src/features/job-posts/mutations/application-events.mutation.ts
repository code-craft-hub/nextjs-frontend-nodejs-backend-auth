import { useMutation } from "@tanstack/react-query";
import {
  applicationEventsApi,
  type LogApplicationEventPayload,
} from "../api/application-events.api";

/**
 * Fire-and-forget audit logging — no query cache depends on this data, so
 * there is nothing to invalidate. Callers should not await this on the
 * critical path (e.g. before opening the apply tab); let it resolve in the
 * background and swallow failures, the same way `recordApplication` calls
 * elsewhere in the apply flow are fired without blocking navigation.
 */
export function useLogApplicationEventMutation() {
  return useMutation({
    mutationFn: (data: LogApplicationEventPayload) =>
      applicationEventsApi.logEvent(data),
  });
}
