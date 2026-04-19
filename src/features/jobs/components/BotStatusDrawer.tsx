"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface QAItem {
  question: string;
  answer: string;
}

interface Props {
  jobTitle: string;
  qa: QAItem[];
  onClose: () => void;
}

export function BotStatusDrawer({ jobTitle, qa, onClose }: Props) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-gray-950 rounded-t-3xl w-full max-h-[80dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-700" />
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-3 flex items-start justify-between shrink-0">
          <div className="min-w-0 pr-2">
            <h2 className="font-semibold text-white text-base truncate">{jobTitle}</h2>
            <p className="text-xs text-green-400 mt-0.5">Application submitted ✓</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-200 active:bg-gray-800 shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0">
          Questions &amp; Answers
        </p>

        {/* Scrollable Q&A list */}
        <div className="overflow-y-auto px-5 pt-3 pb-8 flex flex-col gap-0 mt-1">
          {qa.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No Q&amp;A recorded.</p>
          ) : (
            qa.map((item, i) => (
              <div
                key={i}
                className={`py-3 ${i > 0 ? "border-t border-gray-800" : ""}`}
              >
                <p className="text-xs text-gray-400 leading-relaxed">{item.question}</p>
                <p className="text-sm text-white mt-1 leading-relaxed">{item.answer}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
