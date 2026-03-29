"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, BookOpen } from "lucide-react";
import {
  extractSummary,
  type InterviewQuestion,
  type ParsedInterviewData,
  formatInterviewData,
} from "@/lib/utils/interview-formatter";

interface InterviewQuestionsDisplayProps {
  rawText: string;
  defaultExpandAll?: boolean;
}

/**
 * InterviewQuestionsDisplay Component
 *
 * Production-grade React component for displaying structured interview questions.
 * Features:
 * - Expandable/collapsible question cards
 * - Responsive design with Tailwind CSS
 * - Full TypeScript type safety
 * - Accessibility support (ARIA labels, keyboard navigation)
 * - Dark mode support via CSS variables
 * - Error handling and graceful degradation
 */
export const InterviewQuestionsDisplay: React.FC<
  InterviewQuestionsDisplayProps
> = ({ rawText, defaultExpandAll = false }) => {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(
    new Set(
      defaultExpandAll ? Array.from({ length: 10 }, (_, i) => i + 1) : [],
    ),
  );

  // Parse and memoize interview data
  const interviewData = useMemo<ParsedInterviewData | null>(() => {
    try {
      return formatInterviewData(rawText);
    } catch (error) {
      return null;
    }
  }, [rawText]);

  // Toggle question expansion
  const toggleQuestion = (questionNumber: number): void => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionNumber)) {
      newExpanded.delete(questionNumber);
    } else {
      newExpanded.add(questionNumber);
    }
    setExpandedQuestions(newExpanded);
  };

  // Error state
  if (!interviewData) {
    return null;
  }

  const { questions, company, role } = interviewData;

  return (
    <div className="w-full space-y-6 mt-4">
      {/* Header */}
      <div className="space-y-2 border-b border-gray-200 pb-6 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
              {company} Interview Questions
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">{role}</p>
          </div>
        </div>
        <div className="flex gap-4 pt-2 text-sm text-gray-600 dark:text-gray-400">
          <span>{questions.length} questions</span>
          <button
            onClick={() =>
              setExpandedQuestions(
                expandedQuestions.size === questions.length
                  ? new Set()
                  : new Set(questions.map((q) => q.number)),
              )
            }
            className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            aria-label={
              expandedQuestions.size === questions.length
                ? "Collapse all"
                : "Expand all"
            }
          >
            {expandedQuestions.size === questions.length
              ? "Collapse all"
              : "Expand all"}
          </button>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="space-y-3">
        {questions.map((question: InterviewQuestion) => (
          <QuestionCard
            key={question.number}
            question={question}
            isExpanded={expandedQuestions.has(question.number)}
            onToggle={() => toggleQuestion(question.number)}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Individual question card component
 */
interface QuestionCardProps {
  question: InterviewQuestion;
  isExpanded: boolean;
  onToggle: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  isExpanded,
  onToggle,
}) => {
  const summary = useMemo(
    () => extractSummary(question.question),
    [question.question],
  );

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-200 dark:border-gray-800 dark:bg-gray-950">
      {/* Question Header */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
        aria-expanded={isExpanded}
        aria-controls={`answer-${question.number}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <span className="shrink-0 rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                Q{question.number}
              </span>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
                {question.question}
              </h3>
            </div>
            {!isExpanded && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {summary}
              </p>
            )}
          </div>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-gray-500 transition-transform dark:text-gray-400 ${
              isExpanded ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </div>
      </button>

      {/* Answer Section */}
      {isExpanded && (
        <div
          id={`answer-${question.number}`}
          className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-50">
              Exemplary Answer
            </h4>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {question.exemplaryAnswer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewQuestionsDisplay;
