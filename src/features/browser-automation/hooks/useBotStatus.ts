"use client";

import { useEffect, useRef } from "react";
import { API_URL } from "@/shared/api/client";
import type { BotStatusEvent } from "../types/browser-automation.types";

export interface BotSession {
  /** job_applications.id — needed to call the resume endpoint */
  applicationId: string;
  liveUrl: string;
  status: "starting" | "running" | "awaiting_human" | "resuming" | "completed" | "failed" | "recruiter_email_found";
  stuckReason?: string;
  lastStepSummary?: string;
  applicationQA?: Array<{ question: string; answer: string }>;
  recruiterEmail?: string;
}

const TERMINAL = new Set<BotSession["status"]>(["completed", "failed", "recruiter_email_found"]);

/** Map server status → display status. */
function mapStatus(s: string): BotSession["status"] {
  if (s === "awaiting_human")       return "awaiting_human";
  if (s === "resuming")             return "resuming";
  if (s === "completed")            return "completed";
  if (s === "recruiter_email_found") return "recruiter_email_found";
  if (s === "failed" || s === "not_found") return "failed";
  if (s === "initializing")         return "starting";
  return "running";
}

/**
 * Invisible SSE subscriber for one bot session.
 *
 * Uses a ref-based callback pattern to avoid stale closures — safe to call
 * from inside the effect without listing it as a dependency.
 */
export function useBotStatus(
  applicationId: string | null,
  jobId: string,
  onUpdate: (jobId: string, patch: Partial<BotSession>) => void,
): void {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!applicationId) return;

    const es = new EventSource(
      `${API_URL}/browser-automation/status/${applicationId}`,
      { withCredentials: true },
    );

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as BotStatusEvent;
        const status = mapStatus(data.status);
        onUpdateRef.current(jobId, {
          status,
          liveUrl:         data.liveUrl         ?? undefined,
          stuckReason:     data.stuckReason      ?? undefined,
          lastStepSummary: data.lastStepSummary  ?? undefined,
          applicationQA:   data.applicationQA    ?? undefined,
          recruiterEmail:  data.recruiterEmail   ?? undefined,
        });
        if (TERMINAL.has(status)) es.close();
      } catch {
        // ignore malformed events
      }
    };

    es.onerror = () => es.close();

    return () => es.close();
  }, [applicationId, jobId]);
}
