import { useEffect, useRef, useState, useCallback } from "react";
import { jsonrepair } from "jsonrepair";
import { IUser, StreamStatus } from "@/types";
import { ResumeFormData } from "@/lib/schema-validations/resume.schema";

type StreamData = {
  documentId: string;
} & ResumeFormData;

interface StreamEvent {
  type:
    | "sectionStarted"
    | "sectionContent"
    | "sectionCompleted"
    | "generationComplete"
    | "documentSaved"
    | "documentSaveError"
    | "sectionError"
    | "error";
  documentId: string;
  section?: string;
  content?: string;
  fullContent?: string;
  error?: string;
}

interface RequestPayload {
  user: Partial<IUser>;
  jobDescription: string;
}

interface UseResumeStreamReturn {
  streamData: StreamData;
  streamStatus: StreamStatus;
  startStream: (user: Partial<IUser>, jobDescription: string) => Promise<void>;
  stopStream: () => void;
}

/**
 * Sanitize content by removing markdown code blocks and other artifacts
 */
const sanitizeJSONContent = (content: string): string => {
  let sanitized = content.trim();

  // Remove markdown code blocks (```json ... ``` or ``` ... ```)
  sanitized = sanitized.replace(/^```(?:json)?\s*\n?/gm, "");
  sanitized = sanitized.replace(/\n?```\s*$/gm, "");

  // Remove leading/trailing backticks
  sanitized = sanitized.replace(/^`+|`+$/g, "");

  // Remove any BOM characters
  sanitized = sanitized.replace(/^\uFEFF/, "");

  return sanitized.trim();
};

/**
 * Check if content looks like it might be incomplete JSON
 */
const isLikelyIncompleteJSON = (content: string): boolean => {
  const trimmed = content.trim();

  if (!trimmed) return true;
  if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) return true;

  // Count brackets/braces
  const openBrackets = (trimmed.match(/\[/g) || []).length;
  const closeBrackets = (trimmed.match(/\]/g) || []).length;
  const openBraces = (trimmed.match(/\{/g) || []).length;
  const closeBraces = (trimmed.match(/\}/g) || []).length;

  return openBrackets !== closeBrackets || openBraces !== closeBraces;
};

/**
 * Attempt to complete incomplete JSON arrays
 */
const attemptJSONCompletion = (content: string): string => {
  let completed = content.trim();

  // If it starts with [ but doesn't end with ], try to close it
  if (completed.startsWith("[") && !completed.endsWith("]")) {
    // Remove trailing commas
    completed = completed.replace(/,\s*$/, "");

    // Count open braces in incomplete objects
    const openBraces = (completed.match(/\{/g) || []).length;
    const closeBraces = (completed.match(/\}/g) || []).length;

    // Close any open objects
    for (let i = 0; i < openBraces - closeBraces; i++) {
      completed += "}";
    }

    // Close the array
    completed += "]";
  }

  return completed;
};

/**
 * Enterprise-grade SSE stream parser with robust JSON handling
 * Uses jsonrepair for malformed JSON recovery
 */
export const useResumeStream = (endpoint: string): UseResumeStreamReturn => {
  const [streamData, setStreamData] = useState<StreamData>(() => ({
    documentId: "",
    profile: "",
    education: [],
    workExperience: [],
    certification: [],
    project: [],
    softSkill: [],
    hardSkill: [],
  }));

  const [streamStatus, setStreamStatus] = useState<StreamStatus>(() => ({
    isConnected: false,
    isComplete: false,
    error: null,
    completedSections: new Set<string>(),
    savedDocumentToDatabase: false,
  }));

  const abortControllerRef = useRef<AbortController | null>(null);
  const sectionContentBufferRef = useRef<Map<string, string>>(new Map());

  /**
   * Parse JSON with multiple fallback strategies
   */
  const parseJSONSafely = useCallback(
    (
      rawContent: string,
      section: string,
      isComplete: boolean = false
    ): { success: boolean; data: any[]; shouldUpdate: boolean } => {
      // Sanitize first
      const content = sanitizeJSONContent(rawContent);

      if (!content || content === "[]") {
        return { success: true, data: [], shouldUpdate: false };
      }

      // Strategy 1: Native parse for valid JSON
      try {
        const parsed = JSON.parse(content);
        const data = Array.isArray(parsed) ? parsed : [];
        return { success: true, data, shouldUpdate: true };
      } catch (nativeError) {
        // Only log for completed sections
        if (isComplete) {
          console.debug(`[${section}] Native parse failed, attempting repair`);
        }
      }

      // Strategy 2: For incomplete JSON during streaming, try to complete it
      if (!isComplete && isLikelyIncompleteJSON(content)) {
        try {
          const completed = attemptJSONCompletion(content);
          const parsed = JSON.parse(completed);
          const data = Array.isArray(parsed) ? parsed : [];
          return { success: true, data, shouldUpdate: data.length > 0 };
        } catch (completionError) {
          // Expected for very incomplete data, skip silently
          return { success: false, data: [], shouldUpdate: false };
        }
      }

      // Strategy 3: Use jsonrepair for malformed but mostly complete JSON
      if (isComplete) {
        try {
          const repaired = jsonrepair(content);
          const parsed = JSON.parse(repaired);
          const data = Array.isArray(parsed) ? parsed : [];
          console.log(`[${section}] Successfully repaired JSON`);
          return { success: true, data, shouldUpdate: true };
        } catch (repairError) {
          console.error(
            `[${section}] JSON repair failed:`,
            repairError,
            "\nContent:",
            content.substring(0, 200)
          );
          return { success: false, data: [], shouldUpdate: false };
        }
      }

      // For streaming content that can't be parsed yet
      return { success: false, data: [], shouldUpdate: false };
    },
    []
  );

  /**
   * Handle streaming content with progressive JSON parsing
   */
  const handleStreamEvent = useCallback(
    (eventData: StreamEvent): void => {
      const { type, section, content, fullContent, error } = eventData;
      console.log({ type, section, content, fullContent, error });
      switch (type) {
        case "sectionStarted":
          if (section) {
            console.log(`[Stream] Section started: ${section}`);
            sectionContentBufferRef.current.set(section, "");
          }
          break;

        case "sectionContent":
          if (!section) break;

          if (section === "profile") {
            // String concatenation for profile
            setStreamData((prev) => ({
              ...prev,
              profile: (prev.profile || "") + (content || ""),
            }));
          } else {
            // Accumulate content for array sections
            const currentBuffer =
              sectionContentBufferRef.current.get(section) || "";
            const newContent = fullContent || content || "";
            const accumulatedContent = fullContent
              ? newContent
              : currentBuffer + newContent;

            sectionContentBufferRef.current.set(section, accumulatedContent);

            // Attempt to parse accumulated content
            const parseResult = parseJSONSafely(
              accumulatedContent,
              section,
              false
            );

            if (parseResult.shouldUpdate) {
              setStreamData((prev) => ({
                ...prev,
                [section]: parseResult.data,
              }));
            }
          }
          break;

        case "sectionCompleted":
          if (!section) break;

          console.log(`[Stream] Section completed: ${section}`);

          setStreamStatus((prev) => ({
            ...prev,
            completedSections: new Set([...prev.completedSections, section]),
          }));

          if (section === "profile") {
            setStreamData((prev) => ({
              ...prev,
              profile: content || prev.profile || "",
            }));
          } else {
            // Use provided content or fall back to accumulated buffer
            const finalContent =
              content ||
              fullContent ||
              sectionContentBufferRef.current.get(section) ||
              "[]";

            const parseResult = parseJSONSafely(finalContent, section, true);

            setStreamData((prev) => ({
              ...prev,
              [section]: parseResult.data,
            }));

            // Cleanup buffer
            sectionContentBufferRef.current.delete(section);
          }
          break;

        case "generationComplete":
          setStreamStatus((prev) => ({
            ...prev,
            isComplete: true,
            isConnected: false,
          }));
          console.log("[Stream] Generation complete");
          sectionContentBufferRef.current.clear();
          break;

        case "sectionError":
          console.error(`[Stream] Section error (${section}):`, error);
          setStreamStatus((prev) => ({
            ...prev,
            error: `Error in ${section}: ${error}`,
          }));
          break;

        case "documentSaved":
          setStreamData((prev) => ({
            ...prev,
            documentId: eventData.documentId,
          }));
          setStreamStatus((prev) => ({
            ...prev,
            savedDocumentToDatabase: true,
          }));
          console.log("[Stream] Document saved with ID:", eventData.documentId);
          break;

        case "documentSaveError":
          console.error("[Stream] Document save error:", eventData.error);
          setStreamStatus((prev) => ({
            ...prev,
            error: `Document save failed: ${eventData.error}`,
          }));
          break;

        case "error":
          console.error("[Stream] Stream error:", error);
          setStreamStatus((prev) => ({
            ...prev,
            error: error || "Unknown error",
            isConnected: false,
          }));
          break;

        default:
          console.warn("[Stream] Unknown event type:", (eventData as any).type);
      }
    },
    [parseJSONSafely]
  );

  /**
   * Start streaming with proper lifecycle management
   */
  const startStream = useCallback(
    async (user: Partial<IUser>, jobDescription: string): Promise<void> => {
      try {
        // Cleanup existing connections
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        // Reset state
        setStreamData({
          profile: "",
          education: [],
          workExperience: [],
          certification: [],
          documentId: "",
          project: [],
          softSkill: [],
          hardSkill: [],
        });

        setStreamStatus({
          isConnected: false,
          isComplete: false,
          error: null,
          completedSections: new Set<string>(),
          savedDocumentToDatabase: false,
        });

        sectionContentBufferRef.current.clear();

        // Initiate SSE connection
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
            "Cache-Control": "no-cache",
          },
          body: JSON.stringify({
            user,
            jobDescription,
          } as RequestPayload),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error");
          throw new Error(
            `HTTP ${response.status}: ${response.statusText || errorText}`
          );
        }

        if (!response.body) {
          throw new Error("Response body is null");
        }

        setStreamStatus((prev) => ({ ...prev, isConnected: true }));

        // Process SSE stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();

          if (done) {
            console.log("[Stream] Stream ended");
            setStreamStatus((prev) => ({
              ...prev,
              isComplete: true,
              isConnected: false,
            }));
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // Process complete lines
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmedLine = line.trim();

            if (trimmedLine.startsWith("data: ")) {
              const dataContent = trimmedLine.slice(6);

              // Skip empty data or keep-alive pings
              if (!dataContent || dataContent === "{}") continue;

              try {
                const eventData: StreamEvent = JSON.parse(dataContent);
                handleStreamEvent(eventData);
              } catch (parseError) {
                console.error(
                  "[Stream] Failed to parse SSE event:",
                  parseError,
                  "\nData:",
                  dataContent.substring(0, 200)
                );
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("[Stream] Initialization error:", error);
          setStreamStatus((prev) => ({
            ...prev,
            error: error.message,
            isConnected: false,
            isComplete: false,
          }));
        }
      } finally {
        sectionContentBufferRef.current.clear();
      }
    },
    [endpoint, handleStreamEvent]
  );

  /**
   * Stop streaming and cleanup resources
   */
  const stopStream = useCallback((): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    sectionContentBufferRef.current.clear();

    setStreamStatus((prev) => ({
      ...prev,
      isConnected: false,
    }));

    console.log("[Stream] Stopped manually");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return { streamData, streamStatus, startStream, stopStream };
};
