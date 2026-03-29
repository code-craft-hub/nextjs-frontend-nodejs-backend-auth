import { useCallback, useEffect, useRef, useState } from "react";

// Web Speech API types (not yet in TypeScript's standard DOM lib)
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

type SpeechToTextOptions = {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (text: string) => void;
  onError?: (error: string) => void;
};

type SpeechToTextState = {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
};

export function useSpeechToText(options: SpeechToTextOptions = {}) {
  const {
    lang = "en-US",
    continuous = true,
    interimResults = true,
    onResult,
    onError,
  } = options;

  const [state, setState] = useState<SpeechToTextState>({
    isListening: false,
    isSupported: false,
    transcript: "",
    interimTranscript: "",
    error: null,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef<string>("");

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setState((prev) => ({ ...prev, isSupported: false }));
      return;
    }

    setState((prev) => ({ ...prev, isSupported: true }));

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }

      finalTranscriptRef.current = final;

      setState((prev) => ({
        ...prev,
        transcript: final,
        interimTranscript: interim,
        error: null,
      }));

      onResult?.(final + interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMessages: Record<string, string> = {
        "no-speech": "No speech detected. Please try again.",
        "audio-capture": "Microphone not found or not accessible.",
        "not-allowed": "Microphone access denied. Please allow microphone access.",
        "network": "Network error occurred.",
        aborted: "Recording was stopped.",
      };
      const message = errorMessages[event.error] ?? `Speech error: ${event.error}`;
      setState((prev) => ({ ...prev, error: message, isListening: false }));
      onError?.(message);
    };

    recognition.onend = () => {
      setState((prev) => {
        if (prev.isListening) {
          // Auto-restart if still supposed to be listening (e.g. browser cut it off)
          try {
            recognition.start();
          } catch {
            return { ...prev, isListening: false };
          }
        }
        return prev;
      });
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [lang, continuous, interimResults, onResult, onError]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    finalTranscriptRef.current = "";
    setState((prev) => ({
      ...prev,
      isListening: true,
      transcript: "",
      interimTranscript: "",
      error: null,
    }));
    try {
      recognitionRef.current.start();
    } catch {
      // Already started
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setState((prev) => ({ ...prev, isListening: false, interimTranscript: "" }));
    recognitionRef.current.stop();
  }, []);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = "";
    setState((prev) => ({
      ...prev,
      transcript: "",
      interimTranscript: "",
      error: null,
    }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
  };
}
