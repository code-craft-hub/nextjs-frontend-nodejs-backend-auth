import { baseURL } from '@/lib/api/client';
import { BACKEND_API_VERSION } from '@/lib/api/profile.api';
import { useState, useCallback, useRef } from 'react';

export interface UploadProgress {
  step: string;
  progress: number;
  message: string;
  timestamp: string;
  data?: any;
  error?: boolean;
}

export const useResumeUploadWithProgress = () => {
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const uploadResume = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    setProgress(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Create the upload request
      // const response = await fetch(baseURL+'/onboarding-user/upload', {
      const response = await fetch(baseURL+`/${BACKEND_API_VERSION}/resume/upload`, {
        method: 'POST',
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      // Set up EventSource to listen for progress updates
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Stream not supported');
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              setProgress(data);

              // If error occurred
              if (data.error) {
                setError(data.message);
                setIsUploading(false);
                return { success: false, error: data.message };
              }

              // If complete
              if (data.step === 'complete' && data.data) {
                setIsUploading(false);
                return { success: true, data: data.data };
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      setIsUploading(false);
      return { success: false, error: errorMessage };
    }
  }, []);

  const reset = useCallback(() => {
    setProgress(null);
    setError(null);
    setIsUploading(false);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  return {
    uploadResume,
    progress,
    isUploading,
    error,
    reset,
  };
};