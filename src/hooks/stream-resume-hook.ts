import { useEffect, useRef, useState, useCallback } from "react";
import { IUser, RequestPayload, StreamData, StreamEvent, StreamStatus, UseResumeStreamReturn } from "@/types";
import { parseJSONSafely } from "@/lib/utils/helpers";


export const useResumeStream = (endpoint: string, resumeId: string): UseResumeStreamReturn => {
  const [streamData, setStreamData] = useState<StreamData>(() => ({
    profile: "",
    workExperience: [],
    education: [],
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
  }));

  const abortControllerRef = useRef<AbortController | null>(null);
  const sectionContentBufferRef = useRef<Map<string, string>>(new Map());


  /**
   * Handle streaming content with progressive JSON parsing
   */
  const handleStreamEvent = useCallback(
    (eventData: StreamEvent): void => {
      const { type, section, content, fullContent, error } = eventData;
      switch (type) {
        case "sectionStarted":
          if (section) {
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
          workExperience: [],
          education: [],
          certification: [],
          project: [],
          softSkill: [],
          hardSkill: [],
        });

        setStreamStatus({
          isConnected: false,
          isComplete: false,
          error: null,
          completedSections: new Set<string>(),
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
            resumeId,
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
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return { streamData, streamStatus, startStream, stopStream };
};
