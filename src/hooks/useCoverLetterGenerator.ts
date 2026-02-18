"use client";

import { useCallback, useRef, useState } from "react";
import { BASEURL } from "@/lib/api/client";
import { BACKEND_API_VERSION } from "@/lib/api/profile.api";

const API_URL = `${BASEURL}/${BACKEND_API_VERSION}/cover-letters/stream`;

export interface StreamState {
  title: string;
  content: string;
  documentId: string;
  error: string;
  isStreaming: boolean;
}

const INITIAL_STATE: StreamState = {
  title: "",
  content: "",
  documentId: "",
  error: "",
  isStreaming: false,
};

export function useCoverLetterStream() {
  const [state, setState] = useState<StreamState>(INITIAL_STATE);
  const abortRef = useRef<AbortController | null>(null);

  const start = useCallback(
    async (params: { jobDescription: string; jobId?: string }) => {
      const { jobDescription, jobId } = params;

      // reset + mark streaming
      setState({ ...INITIAL_STATE, isStreaming: true });

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          signal: abortRef.current.signal,
          body: JSON.stringify({ jobDescription, jobId }),
        });

        if (!response.ok || !response.body) {
          setState((prev) => ({
            ...prev,
            error: `HTTP ${response.status}`,
            isStreaming: false,
          }));
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // SSE chunks: "data: {...}\n\n"
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() ?? "";

          for (const chunk of chunks) {
            const line = chunk.trim();
            if (!line.startsWith("data: ")) continue;

            try {
              const payload = JSON.parse(line.slice(6));

              setState((prev) => {
                if (payload.error) {
                  return {
                    ...prev,
                    error: payload.error,
                    isStreaming: false,
                  };
                }

                return {
                  ...prev,
                  title: payload.title ?? prev.title,
                  content: payload.content
                    ? prev.content + payload.content
                    : prev.content,
                  documentId: payload.done
                    ? (payload.documentId ?? prev.documentId)
                    : prev.documentId,
                  isStreaming: payload.done ? false : prev.isStreaming,
                };
              });
            } catch {
              // ignore malformed SSE payloads
            }
          }
        }

        // stream closed without explicit `done`
        setState((prev) => ({ ...prev, isStreaming: false }));
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;

        setState((prev) => ({
          ...prev,
          error: String(err),
          isStreaming: false,
        }));
      }
    },
    [],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setState((prev) => ({ ...prev, isStreaming: false }));
  }, []);

  return {
    state,
    start,
    stop,
  };
}