// src/hooks/useCoverLetterGenerator.ts
import { useState, useRef, useCallback } from 'react';
import { generateCoverLetterStream, CoverLetterRequest } from '../services/api/cover-letter.service';

interface UseCoverLetterGeneratorReturn {
  generatedContent: string;
  isGenerating: boolean;
  error: string;
  generateCoverLetter: (request: CoverLetterRequest) => Promise<void>;
  cancelGeneration: () => void;
  resetContent: () => void;
}

/**
 * Custom hook for managing cover letter generation
 */
export const useCoverLetterGenerator = (): UseCoverLetterGeneratorReturn => {
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const generateCoverLetter = useCallback(async (request: CoverLetterRequest) => {
    setIsGenerating(true);
    setError('');
    setGeneratedContent('');

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    await generateCoverLetterStream(
      request,
      // onChunk
      (chunk: string) => {
        setGeneratedContent((prev) => prev + chunk);
      },
      // onError
      (errorMessage: string) => {
        setError(errorMessage);
        setIsGenerating(false);
      },
      // onComplete
      () => {
        setIsGenerating(false);
      },
      // signal
      abortControllerRef.current.signal
    );
  }, []);

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  }, []);

  const resetContent = useCallback(() => {
    setGeneratedContent('');
    setError('');
  }, []);

  return {
    generatedContent,
    isGenerating,
    error,
    generateCoverLetter,
    cancelGeneration,
    resetContent
  };
};