import { useEffect, useRef, useState } from "react";

// Types and interfaces
interface StreamData {
  profile?: string;
  education: any[];
  workExperience: any[];
  certifications: any[];
  projects: any[];
  skills: any[];
}

interface StreamStatus {
  isConnected: boolean;
  isComplete: boolean;
  error: string | null;
  completedSections: Set<string>;
}

interface StreamEvent {
  type: 'sectionStarted' | 'sectionContent' | 'sectionCompleted' | 'generationComplete' | 'sectionError' | 'error';
  section?: string;
  content?: string;
  fullContent?: string;
  error?: string;
}

interface RequestPayload {
  userProfile: StreamData;
  jobDescription: string;
}



// Hook return type
interface UseResumeStreamReturn {
  streamData: StreamData;
  streamStatus: StreamStatus;
  startStream: (userProfile: StreamData, jobDescription: string) => Promise<void>;
  stopStream: () => void;
}

export const useResumeStream = (endpoint: string): UseResumeStreamReturn => {
  const [streamData, setStreamData] = useState<StreamData>({
    profile: '',
    education: [],
    workExperience: [],
    certifications: [],
    projects: [],
    skills: [],
  });

  const [streamStatus, setStreamStatus] = useState<StreamStatus>({
    isConnected: false,
    isComplete: false,
    error: null,
    completedSections: new Set<string>(),
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startStream = async (userProfile: StreamData, jobDescription: string): Promise<void> => {
    try {
      // Clean up any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      
      setStreamStatus(prev => ({
        ...prev,
        isConnected: false,
        isComplete: false,
        error: null,
        completedSections: new Set<string>(),
      }));

      // Send POST request to initiate streaming
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          userProfile,
          jobDescription,
        } as RequestPayload),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Ensure response.body exists
      if (!response.body) {
        throw new Error('Response body is null');
      }

      // Create EventSource-like reader for the response stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      setStreamStatus(prev => ({ ...prev, isConnected: true }));

      let buffer = '';
      
      const processStream = async (): Promise<void> => {
        try {
          while (true) {
            const { value, done } = await reader.read();
            
            if (done) {
              console.log('Stream complete');
              setStreamStatus(prev => ({ ...prev, isComplete: true, isConnected: false }));
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const eventData: StreamEvent = JSON.parse(line.slice(6));
                  handleStreamEvent(eventData);
                } catch (parseError) {
                  console.error('Error parsing SSE data:', parseError);
                }
              }
            }
          }
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error('Stream processing error:', error);
            setStreamStatus(prev => ({ ...prev, error: error.message, isConnected: false }));
          }
        }
      };

      await processStream();

    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Stream initiation error:', error);
        setStreamStatus(prev => ({ ...prev, error: error.message, isConnected: false }));
      }
    }
  };

  const handleStreamEvent = (eventData: StreamEvent): void => {
    console.log('Received event:', eventData);
    
    switch (eventData.type) {
      case 'sectionStarted':
        console.log(`Section started: ${eventData.section}`);
        break;
        
      case 'sectionContent':
        setStreamData(prev => {
          const updated = { ...prev };
          const section = eventData.section as keyof StreamData;
          
          if (section === 'profile') {
            // For profile, append streaming content
            updated[section] = (prev[section] || '') + (eventData.content || '');
          } else {
            // For other sections, use fullContent when available
            try {
              const parsedContent = JSON.parse(eventData.fullContent || eventData.content || '[]');
              (updated[section] as any[]) = parsedContent;
            } catch (e) {
              // If not JSON, treat as string - though this shouldn't happen for array sections
              console.warn(`Failed to parse JSON for section ${section}:`, e);
            }
          }
          
          return updated;
        });
        break;
        
      case 'sectionCompleted':
        setStreamStatus(prev => ({
          ...prev,
          completedSections: new Set([...prev.completedSections, eventData.section || ''])
        }));
        
        setStreamData(prev => {
          const updated = { ...prev };
          const section = eventData.section as keyof StreamData;
          
          if (section === 'profile') {
            updated[section] = eventData.content || '';
          } else {
            try {
              // Try to parse as JSON first
              const parsedContent = JSON.parse(eventData.content || '[]');
              (updated[section] as any[]) = parsedContent;
            } catch (e) {
              console.warn(`Failed to parse JSON for completed section ${section}:`, e);
              // Fallback to empty array for non-profile sections
              (updated[section] as any[]) = [];
            }
          }
          
          return updated;
        });
        break;
        
      case 'generationComplete':
        setStreamStatus(prev => ({ ...prev, isComplete: true, isConnected: false }));
        console.log('Generation complete!');
        break;
        
      case 'sectionError':
        console.error(`Section error for ${eventData.section}:`, eventData.error);
        setStreamStatus(prev => ({
          ...prev,
          error: `Error in ${eventData.section}: ${eventData.error}`
        }));
        break;
        
      case 'error':
        console.error('Stream error:', eventData.error);
        setStreamStatus(prev => ({ ...prev, error: eventData.error || 'Unknown error', isConnected: false }));
        break;
        
      default:
        console.warn('Unknown event type:', (eventData as any).type);
    }
  };

  const stopStream = (): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setStreamStatus(prev => ({ ...prev, isConnected: false }));
  };

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  return { streamData, streamStatus, startStream, stopStream };
};