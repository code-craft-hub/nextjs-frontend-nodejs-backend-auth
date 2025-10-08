import { useState, useCallback, useRef } from "react";

interface StreamingConfig {
  userProfile: string;
  jobDescription: string;
}

interface StreamingState {
  content: string;
  isStreaming: boolean;
  error: string | null;
  isComplete: boolean;
}

export const useStreamingContent = () => {
  const [state, setState] = useState<StreamingState>({
    content: "",
    isStreaming: false,
    error: null,
    isComplete: false,
  });

  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(
    null
  );
  const abortControllerRef = useRef<AbortController | null>(null);

  const endpoint =
    process.env.NEXT_PUBLIC_AUTH_API_URL + "/stream-any-content" ||
    "http://localhost:8080/api/stream-any-content";
  /**
   * Start streaming content from the API
   */
  const startStreaming = useCallback(async (config: StreamingConfig) => {
    // Reset state
    setState({
      content: "",
      isStreaming: true,
      error: null,
      isComplete: false,
    });

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    console.log("ENDPOINT : ", endpoint);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      readerRef.current = reader;
      const decoder = new TextDecoder();

      // Read stream chunks
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));

            if (data.error) {
              setState((prev) => ({
                ...prev,
                error: data.error,
                isStreaming: false,
              }));
              return;
            }

            if (data.done) {
              setState((prev) => ({
                ...prev,
                isStreaming: false,
                isComplete: true,
              }));
              return;
            }

            if (data.content) {
              setState((prev) => ({
                ...prev,
                content: prev.content + data.content,
              }));
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setState((prev) => ({
          ...prev,
          isStreaming: false,
          error: "Streaming cancelled",
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isStreaming: false,
          error: error instanceof Error ? error.message : "An error occurred",
        }));
      }
    }
  }, []);

  /**
   * Stop/cancel the streaming
   */
  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (readerRef.current) {
      readerRef.current.cancel();
    }
    setState((prev) => ({
      ...prev,
      isStreaming: false,
    }));
  }, []);

  /**
   * Clear the content and reset state
   */
  const clearContent = useCallback(() => {
    setState({
      content: "",
      isStreaming: false,
      error: null,
      isComplete: false,
    });
  }, []);

  return {
    ...state,
    startStreaming,
    stopStreaming,
    clearContent,
  };
};
