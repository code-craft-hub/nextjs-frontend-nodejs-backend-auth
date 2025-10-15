"use client";
import { HelpCircle, CheckCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { jsonrepair } from "jsonrepair";
import { toast } from "sonner";
import { useConfettiStore } from "@/hooks/useConfetti-store";
import { useAuth } from "@/hooks/use-auth";
import { COLLECTIONS } from "@/lib/utils/constants";
import { isEmpty } from "lodash";
import { InterviewQuestion, QAItem } from "@/types";
import { extractCompleteJsonObjects } from "@/lib/utils/helpers";
import TailorInterviewQuestionEmptyState from "./TailorInterviewQuestionEmptyState";

export const TailorInterviewQuestion = ({
  jobDescription,
  interviewQuestionId,
}: {
  jobDescription: string;
  interviewQuestionId: string;
}) => {
  const hasGeneratedRef = useRef(false);

  const [qaData, setQaData] = useState<QAItem[]>([]);
  const { user, useCareerDoc } = useAuth();
  const { data, isFetched, status } = useCareerDoc<InterviewQuestion>(
    interviewQuestionId,
    COLLECTIONS.INTERVIEW_QUESTION
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const resultsEndRef = useRef<HTMLDivElement>(null);
  const confetti = useConfettiStore();

  // Auto-scroll effect when new Q&A pairs are added
  useEffect(() => {
    if (isGenerating && qaData.length > 0) {
      resultsEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [qaData.length, isGenerating]);

  console.count("Render TailorInterviewQuestion");
  useEffect(() => {
    if (isFetched && status === "success") {
      if (jobDescription?.trim() && !hasGeneratedRef.current && !data) {
        hasGeneratedRef.current = true;

        console.count("API CALLED TailorInterviewQuestion");
        toast.promise(handleSubmit(), {
          loading: "I'm generating your tailored interview questions...",
          success: () => {
            return {
              message: `Hurray! Interview question generation complete!`,
              description: "Hopefully you nailed it!",
            };
          },
          error: "Error",
        });
      }
      confetti.onOpen();
    }
  }, []);

  const handleSubmit = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description");
      return;
    }

    setIsGenerating(true);
    setQaData([]);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_API_URL}/v1/generate-interview-question`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            interviewQuestionId,
            jobDescription,
            user,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No reader available");
      }

      let buffer = ""; // Buffer for incomplete JSON
      const allQA: QAItem[] = [];

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Try to parse any remaining buffer content
          if (buffer.trim()) {
            try {
              const repaired = jsonrepair(buffer.trim());
              const parsed = JSON.parse(repaired);
              if (parsed.type === "qa" && parsed.question && parsed.answer) {
                allQA.push({
                  question: parsed.question,
                  answer: parsed.answer,
                });
                setQaData([...allQA]);
              }
            } catch (e) {
              console.warn("Could not parse final buffer:", buffer);
            }
          }
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                // Add to buffer
                buffer += parsed.content;

                const { complete, remainder } =
                  extractCompleteJsonObjects(buffer);

                if (complete.length > 0) {
                  // Add new complete Q&A pairs
                  allQA.push(...complete);
                  setQaData([...allQA]);

                  // Keep only the incomplete part in buffer
                  buffer = remainder;
                }
              } else if (parsed.error) {
                toast.error(parsed.error);
              }
            } catch (e) {
              // Skip invalid JSON in SSE data
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching interview questions:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate questions. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const generatedEmpty = isEmpty(qaData);
  const dataEmpty = isEmpty(data);
  const allEmpty = generatedEmpty && dataEmpty;

  return (
    <div className="min-h-screen h-full p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            Job Interview Questions & Answers
          </h1>
        </div>
        {!allEmpty ? (
          <div className="space-y-6">
            {!generatedEmpty && (
              <div className="flex items-center justify-between mb-4">
                <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
                  {qaData?.length}{" "}
                  {qaData?.length === 1 ? "Question" : "Questions"}
                </span>
              </div>
            )}

            {generatedEmpty &&
              data?.fullContent?.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="p-8">
                    {/* Question Section */}
                    <div className="flex gap-4 mb-6">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <HelpCircle className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">
                          Question {index + 1}
                        </div>
                        <h3 className="text-xl font-semibold text-slate-800 leading-relaxed">
                          {item?.question}
                        </h3>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-200 my-6"></div>

                    {/* Answer Section */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-emerald-600 mb-2 uppercase tracking-wide">
                          Answer {index + 1}
                        </div>
                        <p className="text-slate-700 leading-relaxed text-lg">
                          {item?.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            {!generatedEmpty &&
              qaData?.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="p-8">
                    {/* Question Section */}
                    <div className="flex gap-4 mb-6">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <HelpCircle className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">
                          Question {index + 1}
                        </div>
                        <h3 className="text-xl font-semibold text-slate-800 leading-relaxed">
                          {item?.question}
                        </h3>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-200 my-6"></div>

                    {/* Answer Section */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-emerald-600 mb-2 uppercase tracking-wide">
                          Answer {index + 1}
                        </div>
                        <p className="text-slate-700 leading-relaxed text-lg">
                          {item?.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            <div ref={resultsEndRef} />
          </div>
        ) : (
          <div className="gap-4 sm:gap-8 grid grid-cols-1">
            {Array.from({ length: 3 }).map((_, index) => (
              <TailorInterviewQuestionEmptyState key={index} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
