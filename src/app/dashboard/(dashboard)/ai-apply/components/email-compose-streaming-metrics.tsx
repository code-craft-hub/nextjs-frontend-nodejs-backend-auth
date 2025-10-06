import React from 'react';

interface Metrics {
  words: number;
  chars: number;
  readingTime: number;
}

interface StreamingMetricsProps {
  metrics: Metrics;
  isStreaming: boolean;
  isComplete: boolean;
}

/**
 * Presentation component for displaying content metrics
 * Shows word count, character count, and reading time
 */
export const StreamingMetrics: React.FC<StreamingMetricsProps> = ({
  metrics,
  isStreaming,
  isComplete
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">
        Content Metrics
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Word Count */}
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-900">
              {metrics.words.toLocaleString()}
            </p>
            <p className="text-sm text-blue-700">Words</p>
          </div>
        </div>

        {/* Character Count */}
        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
          <div className="p-2 bg-purple-100 rounded-lg">
            <svg
              className="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-900">
              {metrics.chars.toLocaleString()}
            </p>
            <p className="text-sm text-purple-700">Characters</p>
          </div>
        </div>

        {/* Reading Time */}
        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
          <div className="p-2 bg-green-100 rounded-lg">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-900">
              {metrics.readingTime}
            </p>
            <p className="text-sm text-green-700">
              Min{metrics.readingTime !== 1 ? 's' : ''} Read
            </p>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {isStreaming && (
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
          <span>Metrics updating in real-time...</span>
        </div>
      )}
      
      {isComplete && (
        <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Generation complete</span>
        </div>
      )}
    </div>
  );
};