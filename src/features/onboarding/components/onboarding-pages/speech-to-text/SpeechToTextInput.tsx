"use client";

import { cn } from "@/lib/utils";
import { Mic, MicOff, RotateCcw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSpeechToText } from "./useSpeechToText";

type SpeechToTextInputProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  lang?: string;
  disabled?: boolean;
};

export function SpeechToTextInput({
  value,
  onChange,
  placeholder = "Start speaking or type here...",
  label,
  className,
  lang = "en-US",
  disabled = false,
}: SpeechToTextInputProps) {
  const [internalValue, setInternalValue] = useState(value ?? "");
  const isControlled = value !== undefined;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentValue = isControlled ? value : internalValue;

  const handleChange = (text: string) => {
    if (!isControlled) setInternalValue(text);
    onChange?.(text);
  };

  const { isListening, isSupported, interimTranscript, error, startListening, stopListening, resetTranscript } =
    useSpeechToText({
      lang,
      continuous: true,
      interimResults: true,
      onResult: (text) => {
        handleChange(text);
      },
    });

  // Sync controlled value changes from outside
  useEffect(() => {
    if (isControlled) setInternalValue(value ?? "");
  }, [value, isControlled]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [currentValue, interimTranscript]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleClear = () => {
    resetTranscript();
    handleChange("");
  };

  const displayValue = isListening
    ? currentValue + (interimTranscript ? interimTranscript : "")
    : currentValue;

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {label && (
        <label className="text-xs font-medium text-muted-foreground font-poppins">
          {label}
        </label>
      )}

      <div
        className={cn(
          "relative flex items-start rounded-md border bg-background transition-all duration-200",
          isListening
            ? "border-blue-500 ring-2 ring-blue-500/20 shadow-sm"
            : "border-input hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <textarea
          ref={textareaRef}
          value={displayValue}
          onChange={(e) => {
            if (isListening) return;
            handleChange(e.target.value);
          }}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className={cn(
            "flex-1 resize-none bg-transparent px-3 py-2.5 text-sm font-poppins placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-0 border-none",
            "min-h-8 max-h-48 overflow-y-auto",
            isListening && "text-foreground",
            interimTranscript && "text-muted-foreground"
          )}
        />

        <div className="flex flex-col items-center gap-1 p-2 pt-2.5 shrink-0">
          {/* Mic toggle button */}
          {isSupported ? (
            <button
              type="button"
              onClick={toggleListening}
              disabled={disabled}
              title={isListening ? "Stop recording" : "Start recording"}
              className={cn(
                "flex items-center justify-center size-8 rounded-full transition-all duration-200",
                isListening
                  ? "bg-red-500 text-white hover:bg-red-600 animate-pulse"
                  : "bg-muted text-muted-foreground hover:bg-blue-100 hover:text-blue-600"
              )}
            >
              {isListening ? (
                <MicOff className="size-4" />
              ) : (
                <Mic className="size-4" />
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled
              title="Speech recognition not supported in this browser"
              className="flex items-center justify-center size-8 rounded-full bg-muted text-muted-foreground opacity-40 cursor-not-allowed"
            >
              <MicOff className="size-4" />
            </button>
          )}

          {/* Clear button */}
          {currentValue && !isListening && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear text"
              className="flex items-center justify-center size-6 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="size-3" />
            </button>
          )}

          {/* Reset transcript button (while listening) */}
          {isListening && currentValue && (
            <button
              type="button"
              onClick={() => {
                resetTranscript();
                handleChange("");
              }}
              title="Clear and restart"
              className="flex items-center justify-center size-6 rounded-full text-muted-foreground hover:text-red-500 hover:bg-muted transition-colors"
            >
              <RotateCcw className="size-3" />
            </button>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-2 min-h-4.5">
        {isListening && (
          <div className="flex items-center gap-1.5 text-xs text-blue-600 font-poppins">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-blue-500" />
            </span>
            Listening…
          </div>
        )}
        {error && !isListening && (
          <p className="text-xs text-destructive font-poppins">{error}</p>
        )}
        {!isSupported && (
          <p className="text-xs text-muted-foreground font-poppins">
            Speech recognition is not supported in this browser.
          </p>
        )}
      </div>
    </div>
  );
}
