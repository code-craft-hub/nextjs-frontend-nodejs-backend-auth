import { formatStreamContent } from "@/lib/utils/helpers";
import { useEffect, useRef } from "react";

interface StreamingDisplayProps {
  content: string;
  isStreaming: boolean;
  isComplete: boolean;
}

/**
 * Presentation component for displaying streaming content
 * Shows content with live updates and formatting
 */
export const StreamingDisplay: React.FC<StreamingDisplayProps> = ({
  content,
  isStreaming,
  isComplete,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  // Auto-scroll to bottom during streaming
  useEffect(() => {
    if (isStreaming && shouldAutoScroll.current && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [content, isStreaming]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isAtBottom =
      element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    shouldAutoScroll.current = isAtBottom;
  };

  // if (!content && !isStreaming) {
  //   return (
  //     <div className="bg-white rounded-xl shadow-lg p-12 text-center">
  //       <svg
  //         className="w-16 h-16 mx-auto text-slate-300 mb-4"
  //         fill="none"
  //         stroke="currentColor"
  //         viewBox="0 0 24 24"
  //       >
  //         <path
  //           strokeLinecap="round"
  //           strokeLinejoin="round"
  //           strokeWidth={2}
  //           d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
  //         />
  //       </svg>
  //       <p className="text-slate-500 text-lg">
  //         Enter a prompt and click generate to start streaming content
  //       </p>
  //     </div>
  //   );
  // }

  const formattedContent = formatStreamContent(content);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <span className="text-sm font-medium text-slate-600">
            Generated Content
          </span>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {isStreaming && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Streaming...</span>
            </div>
          )}
          {isComplete && (
            <div className="flex items-center gap-2 text-green-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium">Complete</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        onScroll={handleScroll}
        className="p-6 max-h-[600px] overflow-y-auto"
      >
        <div className="prose prose-slate max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed">
            {formattedContent}
          </pre>

          {/* Typing cursor during streaming */}
          {isStreaming && (
            <span className="inline-block w-0.5 h-5 bg-blue-600 animate-pulse ml-0.5"></span>
          )}
        </div>
      </div>

      {/* Copy Button */}
      {content && (
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end">
          <button
            onClick={() => navigator.clipboard.writeText(content)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
};
