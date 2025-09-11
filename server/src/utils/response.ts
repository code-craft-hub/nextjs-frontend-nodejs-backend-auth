
import { ApiResponse } from "../types";

export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: {
    code: string;
    message: string;
    details?: any;
  }
): ApiResponse<T> {
  return {
    success,
    data,
    error,
    timestamp: new Date().toISOString(),
    requestId: generateRequestId(),
  };
}

function generateRequestId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}
