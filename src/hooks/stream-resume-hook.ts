import { useRef, useState, useCallback, useEffect } from "react";
import {
  RequestPayload,
  StreamData,
  StreamEvent,
  StreamStatus,
  UseResumeStreamReturn,
} from "@/types";
import { jsonrepair } from "jsonrepair";
import { API_URL } from "@/lib/api/client";

export const useResumeStream = (): UseResumeStreamReturn => {
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

  const [documentId, setDocumentId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");

  const abortControllerRef = useRef<AbortController | null>(null);
  const accumulatedContentRef = useRef<string>("");

  /**
   * Sanitize JSON content by removing markdown code blocks
   */
  const sanitizeJSON = useCallback((content: string): string => {
    let sanitized = content.trim();
    // Remove markdown code blocks
    sanitized = sanitized.replace(/^```(?:json)?\s*\n?/gm, "");
    sanitized = sanitized.replace(/\n?```\s*$/gm, "");
    sanitized = sanitized.replace(/^`+|`+$/g, "");
    return sanitized.trim();
  }, []);

  /**
   * Try to parse accumulated JSON and extract resume fields
   */
  const tryParseAndUpdateState = useCallback(
    (content: string, isComplete: boolean = false): boolean => {
      const sanitized = sanitizeJSON(content);
      if (!sanitized) return false;

      // Try to parse as JSON
      let parsed: any = null;

      try {
        parsed = JSON.parse(sanitized);
      } catch {
        // If not valid JSON yet, try to repair it (only for complete content)
        if (isComplete) {
          try {
            const repaired = jsonrepair(sanitized);
            parsed = JSON.parse(repaired);
          } catch {
            console.debug("[Stream] Could not repair JSON");
            return false;
          }
        } else {
          // For incomplete content, try to complete the JSON structure
          try {
            let completed = sanitized;
            // Count braces and brackets
            const openBraces = (completed.match(/\{/g) || []).length;
            const closeBraces = (completed.match(/\}/g) || []).length;
            const openBrackets = (completed.match(/\[/g) || []).length;
            const closeBrackets = (completed.match(/\]/g) || []).length;

            // Remove trailing commas
            completed = completed.replace(/,\s*$/, "");

            // Close open brackets
            for (let i = 0; i < openBrackets - closeBrackets; i++) {
              completed += "]";
            }
            // Close open braces
            for (let i = 0; i < openBraces - closeBraces; i++) {
              completed += "}";
            }

            parsed = JSON.parse(completed);
          } catch {
            // Still can't parse, wait for more content
            return false;
          }
        }
      }

      if (!parsed || typeof parsed !== "object") return false;

      // Extract resume fields from parsed object
      setStreamData((prev) => {
        const updates: Partial<StreamData> = {};

        // Profile - could be string or object with summary/text field
        if (parsed.profile !== undefined) {
          if (typeof parsed.profile === "string") {
            updates.profile = parsed.profile;
          } else if (typeof parsed.profile === "object" && parsed.profile) {
            updates.profile =
              parsed.profile.summary ||
              parsed.profile.text ||
              parsed.profile.content ||
              "";
          }
        }

        // Array fields
        if (Array.isArray(parsed.workExperience)) {
          updates.workExperience = parsed.workExperience;
        }
        if (Array.isArray(parsed.education)) {
          updates.education = parsed.education;
        }
        if (Array.isArray(parsed.certification)) {
          updates.certification = parsed.certification;
        }
        if (Array.isArray(parsed.project)) {
          updates.project = parsed.project;
        }
        if (Array.isArray(parsed.softSkill)) {
          updates.softSkill = parsed.softSkill;
        }
        if (Array.isArray(parsed.hardSkill)) {
          updates.hardSkill = parsed.hardSkill;
        }

        // Only update if we have changes
        if (Object.keys(updates).length === 0) return prev;

        return { ...prev, ...updates };
      });

      return true;
    },
    [sanitizeJSON],
  );

  /**
   * Handle incoming SSE event data
   */
  const handleEventData = useCallback(
    (eventData: any): void => {
      // Handle title chunk: {"type": "chunk", "title": "..."}
      if (eventData.type === "chunk" && eventData.title !== undefined) {
        setTitle(eventData.title);
        return;
      }

      // Handle streaming content chunks: {"type": "chunk", "content": "..."}
      if (eventData.type === "chunk" && eventData.content !== undefined) {
        accumulatedContentRef.current += eventData.content;

        // Try to parse the accumulated content progressively
        tryParseAndUpdateState(accumulatedContentRef.current, false);
        return;
      }

      // Handle completion with full saved resume: {"type": "generationComplete", "documentId": "...", "content": "..."}
      if (eventData.type === "generationComplete") {
        if (eventData.documentId) {
          setDocumentId(eventData.documentId);
        }

        // Parse the complete resume data from the generationComplete event
        if (eventData.content) {
          try {
            const savedResume = JSON.parse(eventData.content);

            // Map the saved resume format to StreamData format
            setStreamData({
              profile: savedResume.summary || "",
              workExperience: savedResume.workExperience || [],
              education: savedResume.education || [],
              certification: savedResume.certification || [],
              project: savedResume.project || [],
              softSkill: savedResume.softSkill || [],
              hardSkill: savedResume.hardSkill || [],
              fullName: savedResume.fullName || "",
              email: savedResume.email || "",
              phoneNumber: savedResume.phoneNumber || "",
              location: savedResume.location || "",
              linkedIn: savedResume.linkedIn || "",
              github: savedResume.github || "",
              website: savedResume.website || "",
              title: savedResume.title || "",
            } as StreamData);
          } catch (error) {
            console.error(
              "[Stream] Failed to parse generationComplete content:",
              error,
            );
          }
        }

        setStreamStatus((prev) => ({
          ...prev,
          isComplete: true,
          isConnected: false,
        }));
        return;
      }

      // Handle error events: {"type": "error", "error": "..."}
      if (eventData.type === "error" || eventData.error) {
        console.error("[Stream] Error:", eventData.error || eventData.message);
        setStreamStatus((prev) => ({
          ...prev,
          error: eventData.error || eventData.message || "Unknown error",
          isConnected: false,
        }));
        return;
      }

      // Legacy support for old event format (backward compatibility)
      const { type, section, content, fullContent, error } =
        eventData as StreamEvent;

      switch (type) {
        case "sectionStarted":
          // No action needed
          break;

        case "sectionContent":
          if (!section) break;

          if (section === "profile") {
            setStreamData((prev) => ({
              ...prev,
              profile: (prev.profile || "") + (content || ""),
            }));
          } else {
            // For array sections, try to parse
            const arrayContent = fullContent || content;
            if (arrayContent) {
              try {
                const parsed = JSON.parse(arrayContent);
                if (Array.isArray(parsed)) {
                  setStreamData((prev) => ({
                    ...prev,
                    [section]: parsed,
                  }));
                }
              } catch {
                // Wait for more content
              }
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
          } else if (content || fullContent) {
            try {
              const parsed = JSON.parse(content || fullContent || "[]");
              if (Array.isArray(parsed)) {
                setStreamData((prev) => ({
                  ...prev,
                  [section]: parsed,
                }));
              }
            } catch {
              // Keep existing data
            }
          }
          break;

        case "documentSaved":
          setDocumentId(eventData.documentId || null);
          break;

        case "sectionError":
        case "documentSaveError":
          console.error(`[Stream] Error:`, error || eventData.error);
          setStreamStatus((prev) => ({
            ...prev,
            error: error || eventData.error || "Unknown error",
          }));
          break;

        default:
          // Unknown event type - only warn if there was a type field
          if (type) {
            console.warn("[Stream] Unknown event type:", type);
          }
      }
    },
    [tryParseAndUpdateState],
  );

  /**
   * Start streaming with proper lifecycle management
   */
  const startStream = useCallback(
    async (jobDescription: string, jobId?: string): Promise<void> => {
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

        accumulatedContentRef.current = "";

        // Initiate SSE connection
        const requestPayload: RequestPayload = { jobDescription, jobId };

        const response = await fetch(API_URL + "/resumes/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestPayload),
          credentials: "include",
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error");
          console.error("[Stream] Server error body:", errorText);
          throw new Error(
            `HTTP ${response.status}: ${response.statusText || errorText}`,
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
            // Final parse attempt with accumulated content
            if (accumulatedContentRef.current) {
              tryParseAndUpdateState(accumulatedContentRef.current, true);
            }

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
                const eventData = JSON.parse(dataContent);
                handleEventData(eventData);
              } catch (parseError) {
                console.error(
                  "[Stream] Failed to parse SSE event:",
                  parseError,
                  "\nData:",
                  dataContent.substring(0, 200),
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
        accumulatedContentRef.current = "";
      }
    },
    [handleEventData, tryParseAndUpdateState],
  );

  /**
   * Stop streaming and cleanup resources
   */
  const stopStream = useCallback((): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    accumulatedContentRef.current = "";

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

  return {
    streamData,
    streamStatus,
    startStream,
    stopStream,
    documentId,
    title,
  };
};
