// src/services/api/cover-letter.service.ts

import { IUser } from "@/types";

export interface CoverLetterRequest {
  coverLetterId: string;
  user?: Partial<IUser>;
  jobDescription: string;
  aiModel?: 'gemini' | 'gpt';
}

export interface StreamChunk {
  content?: string;
  done?: boolean;
  documentId?: string;
  error?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:3000';

/**
 * Generates a cover letter with streaming response
 */
export const generateCoverLetterStream = async (
  request: CoverLetterRequest,
  onChunk: (chunk: string) => void,
  onError: (error: string) => void,
  onComplete: (documentId: string) => void,
  signal?: AbortSignal
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/generate-cover-letter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request),
      signal
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data: StreamChunk = JSON.parse(line.slice(6));

            if (data.error) {
              onError(data.error);
              return;
            }

            if (data.done) {
              onComplete(data.documentId || '');
              return;
            }

            if (data.content) {
              onChunk(data.content);
            }
          } catch (parseError) {
            console.error('Failed to parse SSE data:', parseError);
          }
        }
      }
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      onError('Request cancelled');
    } else {
      onError(error.message || 'Failed to generate cover letter');
    }
  }
};