import { baseURL } from "@/lib/api/client";
import { useState, useEffect, useRef, useCallback } from "react";

export type JobStatus = "waiting" | "active" | "completed" | "failed";

export interface Job {
  id: string;
  name: string;
  status: JobStatus;
  progress: number;
  result?: { message: string };
  error?: string;
  createdAt: number;
  userId: string;
  isPublic: boolean;
}

export const SSEEventType = {
  JOB_CREATED: "job:created",
  JOB_ACTIVE: "job:active",
  JOB_PROGRESS: "job:progress",
  JOB_COMPLETED: "job:completed",
  JOB_FAILED: "job:failed",
  HEARTBEAT: "heartbeat",
  CONNECTION_OPENED: "connection:opened",
} as const;

export type SSEEventType = (typeof SSEEventType)[keyof typeof SSEEventType];

export const SSE_URL = `${baseURL}/resume-jobs/stream`;

export function useSSE() {
  const [connected, setConnected] = useState(false);
  const [jobs, setJobs] = useState<Map<string, Job>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManualDisconnectRef = useRef(false);

  // Reconnection configuration
  const MAX_RECONNECT_ATTEMPTS = 10;
  const BASE_RETRY_DELAY = 1000; // 1 second
  const MAX_RETRY_DELAY = 30000; // 30 seconds
  const HEARTBEAT_TIMEOUT = 30000; // 45 seconds (3x server heartbeat)

  const calculateRetryDelay = useCallback((attempts: number) => {
    // Exponential backoff with jitter
    const delay = Math.min(
      BASE_RETRY_DELAY * Math.pow(2, attempts),
      MAX_RETRY_DELAY,
    );
    const jitter = Math.random() * 1000; // Add up to 1 second jitter
    return delay + jitter;
  }, []);

  const resetHeartbeatTimeout = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }

    heartbeatTimeoutRef.current = setTimeout(() => {
      console.warn("⚠️ Heartbeat timeout - connection may be stale");
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    }, HEARTBEAT_TIMEOUT);
  }, []);

  const handleEvent = useCallback(
    (type: SSEEventType) => (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        // Handle heartbeat
        if (type === SSEEventType.HEARTBEAT) {
          // console.log("💓 Heartbeat received:", data);
          resetHeartbeatTimeout();
          return;
        }

        // Handle connection opened
        if (type === SSEEventType.CONNECTION_OPENED) {
          console.log("🔌 Connection opened:", data);
          resetHeartbeatTimeout();
          return;
        }

        // Handle job events
        const job = data as Job;
        setJobs((prev) => {
          const updated = new Map(prev);
          updated.set(job.id, job);
          return updated;
        });

        console.log(`📊 Job event [${type}]:`, job);
      } catch (error) {
        console.error(`Error parsing ${type}:`, error);
      }
    },
    [resetHeartbeatTimeout],
  );

  const connect = useCallback(() => {
    // Prevent multiple simultaneous connections
    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      console.log("Already connected");
      return;
    }

    console.log(`🔄 Connecting to SSE (attempt ${reconnectAttempts + 1})...`);

    const eventSource = new EventSource(SSE_URL, {
      withCredentials: true,
    });

    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setConnected(true);
      setError(null);
      setReconnectAttempts(0);
      console.log("✅ SSE connected");
      resetHeartbeatTimeout();
    };

    eventSource.onerror = (err) => {
      console.error("❌ SSE error:", err);
      setConnected(false);

      // Clear heartbeat timeout
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
      }

      // Don't reconnect if manually disconnected
      if (isManualDisconnectRef.current) {
        return;
      }

      // Handle different error states
      if (eventSource.readyState === EventSource.CLOSED) {
        setError("Connection closed. Attempting to reconnect...");

        // Attempt reconnection
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          const delay = calculateRetryDelay(reconnectAttempts);
          console.log(`🔄 Reconnecting in ${Math.round(delay / 1000)}s...`);

          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts((prev) => prev + 1);
            connect();
          }, delay);
        } else {
          setError(
            "Max reconnection attempts reached. Please refresh the page.",
          );
          console.error("Max reconnection attempts reached");
        }
      } else if (eventSource.readyState === EventSource.CONNECTING) {
        setError("Connecting...");
      }
    };

    // Register event listeners
    Object.values(SSEEventType).forEach((type) => {
      eventSource.addEventListener(type, handleEvent(type));
    });
  }, [
    reconnectAttempts,
    handleEvent,
    calculateRetryDelay,
    resetHeartbeatTimeout,
  ]);

  const disconnect = useCallback(() => {
    console.log("🛑 Manually disconnecting SSE");
    isManualDisconnectRef.current = true;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setConnected(false);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    isManualDisconnectRef.current = false;
    setReconnectAttempts(0);
    connect();
  }, [disconnect, connect]);

  useEffect(() => {
    isManualDisconnectRef.current = false;
    connect();

    return () => {
      disconnect();
    };
  }, []);

  return {
    connected,
    jobs,
    error,
    reconnectAttempts,
    reconnect,
    disconnect,
  };
}
