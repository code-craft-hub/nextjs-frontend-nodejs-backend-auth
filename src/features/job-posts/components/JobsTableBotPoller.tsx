"use client";

import { useBotStatus, type BotSession } from "@/features/browser-automation";

interface Props {
  applicationId: string;
  jobId: string;
  onUpdate: (jobId: string, patch: Partial<BotSession>) => void;
}

/** Invisible SSE poller — mounts one per active bot session. */
export function JobsTableBotPoller({ applicationId, jobId, onUpdate }: Props) {
  useBotStatus(applicationId, jobId, onUpdate);
  return null;
}
