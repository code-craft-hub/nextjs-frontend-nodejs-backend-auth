import { useState, useCallback } from "react";
import { resumeApi } from "@/features/resume/api/resume.api";
import type { GapAnalysisResult } from "@/shared/types/resume.types";

export interface UseGapAnalysisReturn {
  result: GapAnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  analyze: (jobDescription: string) => Promise<void>;
  reset: () => void;
}

export function useGapAnalysis(): UseGapAnalysisReturn {
  const [result, setResult] = useState<GapAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (jobDescription: string) => {
    if (!jobDescription?.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await resumeApi.analyzeGap({ jobDescription: jobDescription.trim() });
      if (response?.success && response.data) {
        setResult(response.data);
      } else {
        setError("Gap analysis returned no data.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gap analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { result, isLoading, error, analyze, reset };
}
