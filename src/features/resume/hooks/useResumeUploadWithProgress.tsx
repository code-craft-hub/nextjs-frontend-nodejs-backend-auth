import { API_URL } from "@/shared/api/client";
import { resumeApi } from "../api/resume.api";
import { useState, useCallback, useRef } from "react";

export interface UploadProgress {
  step: string;
  progress: number;
  message: string;
  timestamp: string;
  data?: any;
  error?: boolean;
}

export interface UploadResult {
  success: boolean;
  data?: { resumeId?: string; ingestionId?: string; [k: string]: any };
  error?: string;
}

// Friendly copy per pipeline step (async status → UI message).
const STEP_MESSAGE: Record<string, string> = {
  pending: "Queued — starting shortly…",
  loading: "Reading your resume…",
  parsing: "Understanding your experience…",
  saving: "Saving your profile…",
  processing: "Processing your resume…",
  complete: "Resume uploaded successfully!",
};

// Backoff schedule (ms); holds at the last value. Deliberately few requests —
// a ~10–40s job resolves in a handful of polls, keeping proxy cost negligible.
const POLL_BACKOFF = [1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000];
const MAX_POLL_MS = 4 * 60 * 1000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const now = () => new Date().toISOString();

export const useResumeUploadWithProgress = () => {
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  /** Poll the ingestion status to completion. Always resolves (never throws). */
  const poll = useCallback(async (ingestionId: string): Promise<UploadResult> => {
    const start = Date.now();
    let i = 0;

    while (true) {
      try {
        const res = await resumeApi.getIngestionStatus(ingestionId);
        const d = res.data;

        setProgress({
          step: d.step ?? d.status,
          progress: d.progress ?? 0,
          message: STEP_MESSAGE[d.step ?? d.status] ?? "Processing…",
          timestamp: now(),
        });

        if (d.status === "ready") {
          setProgress({ step: "complete", progress: 100, message: STEP_MESSAGE.complete, timestamp: now() });
          setIsUploading(false);
          return { success: true, data: { resumeId: d.resumeId ?? undefined, ingestionId } };
        }
        if (d.status === "failed") {
          const msg = d.error ?? "We couldn't process this resume. Please try again.";
          setError(msg);
          setIsUploading(false);
          return { success: false, error: msg, data: { ingestionId } };
        }
      } catch {
        // Transient read error — keep polling within the time budget.
      }

      if (Date.now() - start > MAX_POLL_MS) {
        const msg = "This is taking longer than usual — we'll keep processing it in the background. Check back shortly.";
        setError(msg);
        setIsUploading(false);
        return { success: false, error: msg, data: { ingestionId } };
      }
      await sleep(POLL_BACKOFF[Math.min(i++, POLL_BACKOFF.length - 1)]);
    }
  }, []);

  const uploadResume = useCallback(
    async (file: File): Promise<UploadResult> => {
      setIsUploading(true);
      setError(null);
      setProgress(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_URL}/resumes/upload`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        const contentType = response.headers.get("content-type") || "";

        // ── Async path: server returned JSON (202 pending, or 200 reuse) ──
        if (contentType.includes("application/json")) {
          const body = await response.json().catch(() => ({} as any));

          if (!response.ok) {
            const msg = body?.error || "Upload failed";
            setError(msg);
            setIsUploading(false);
            return { success: false, error: msg };
          }

          const data = body?.data ?? {};

          // Identical re-upload that was already parsed → done immediately.
          if (data.status === "ready" && data.resumeId) {
            setProgress({ step: "complete", progress: 100, message: STEP_MESSAGE.complete, timestamp: now() });
            setIsUploading(false);
            return { success: true, data: { resumeId: data.resumeId, ingestionId: data.ingestionId } };
          }

          if (!data.ingestionId) {
            setError("Upload failed");
            setIsUploading(false);
            return { success: false, error: "Upload failed" };
          }

          setProgress({ step: "pending", progress: 5, message: STEP_MESSAGE.pending, timestamp: now() });
          return await poll(data.ingestionId);
        }

        // ── Legacy SSE path (flag off): stream progress until "complete" ──
        if (!response.ok) throw new Error("Upload failed");

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error("Stream not supported");

        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() || "";

          for (const event of events) {
            const line = event.trim();
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                setProgress(data);

                if (data.error) {
                  setError(data.message);
                  setIsUploading(false);
                  return { success: false, error: data.message };
                }
                if (data.step === "complete") {
                  setIsUploading(false);
                  return { success: true, data: data.data };
                }
              } catch (e) {
                console.error("Failed to parse SSE data:", e);
              }
            }
          }
        }

        setIsUploading(false);
        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Upload failed";
        setError(errorMessage);
        setIsUploading(false);
        return { success: false, error: errorMessage };
      }
    },
    [poll],
  );

  /** Re-run a failed ingestion, then resume polling. Always resolves. */
  const retry = useCallback(
    async (ingestionId: string): Promise<UploadResult> => {
      setError(null);
      setIsUploading(true);
      setProgress({ step: "pending", progress: 5, message: STEP_MESSAGE.pending, timestamp: now() });
      try {
        await resumeApi.retryIngestion(ingestionId);
        return await poll(ingestionId);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Retry failed";
        setError(msg);
        setIsUploading(false);
        return { success: false, error: msg };
      }
    },
    [poll],
  );

  const reset = useCallback(() => {
    setProgress(null);
    setError(null);
    setIsUploading(false);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  return { uploadResume, retry, progress, isUploading, error, reset };
};
