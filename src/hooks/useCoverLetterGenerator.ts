"use client";

import { useCallback, useRef, useState } from "react";
import { baseURL } from "@/lib/api/client";
import { BACKEND_API_VERSION } from "@/lib/api/profile.api";

const API_URL = `${baseURL}/${BACKEND_API_VERSION}/cover-letters/generate`;

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
    async (params: { jobDescription: string; aiModel?: string }) => {
      const { jobDescription, aiModel = "gemini" } = params;

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
          body: JSON.stringify({ jobDescription, aiModel }),
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
                    ? payload.documentId ?? prev.documentId
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
    []
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



// // src/hooks/useCoverLetterGenerator.ts
// import { useState, useRef, useCallback } from 'react';
// import { generateCoverLetterStream, CoverLetterRequest } from '../services/api/cover-letter.service';

// interface UseCoverLetterGeneratorReturn {
//   generatedContent: string;
//   isGenerating: boolean;
//   error: string;
//   generateCoverLetter: (request: CoverLetterRequest) => Promise<void>;
//   cancelGeneration: () => void;
//   resetContent: () => void;
// }

// /**
//  * Custom hook for managing cover letter generation
//  */
// export const useCoverLetterGenerator = (): UseCoverLetterGeneratorReturn => {
//   const [generatedContent, setGeneratedContent] = useState('');
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [error, setError] = useState('');
//   const abortControllerRef = useRef<AbortController | null>(null);

//   const generateCoverLetter = useCallback(async (request: CoverLetterRequest) => {
//     setIsGenerating(true);
//     setError('');
//     setGeneratedContent('');

//     // Create new abort controller
//     abortControllerRef.current = new AbortController();

//     await generateCoverLetterStream(
//       request,
//       // onChunk
//       (chunk: string) => {
//         setGeneratedContent((prev) => prev + chunk);
//       },
//       // onError
//       (errorMessage: string) => {
//         setError(errorMessage);
//         setIsGenerating(false);
//       },
//       // onComplete
//       () => {
//         setIsGenerating(false);
//       },
//       // signal
//       abortControllerRef.current.signal
//     );
//   }, []);

//   const cancelGeneration = useCallback(() => {
//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//       setIsGenerating(false);
//     }
//   }, []);

//   const resetContent = useCallback(() => {
//     setGeneratedContent('');
//     setError('');
//   }, []);

//   return {
//     generatedContent,
//     isGenerating,
//     error,
//     generateCoverLetter,
//     cancelGeneration,
//     resetContent
//   };
// };