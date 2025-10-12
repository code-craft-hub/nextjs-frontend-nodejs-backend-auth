"use client";
import { HelpCircle, CheckCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { jsonrepair } from "jsonrepair";
import { toast } from "sonner";
import { useConfettiStore } from "@/hooks/useConfetti-store";
import { useAuth } from "@/hooks/use-auth";
import { COLLECTIONS } from "@/lib/utils/constants";

interface QAItem {
  question: string;
  answer: string;
}

export const TailorInterviewQuestion = ({
  jobDescription,
  interviewQuestionId
}: {
  jobDescription: string;
  interviewQuestionId: string;
}) => {
  // const [jobDescription, setJobDescription] = useState<string>("");
  const [qaData, setQaData] = useState<QAItem[]>([]);
  const { user, useCareerDoc } = useAuth();
  const { data } = useCareerDoc<{ coverLetter: string }>(
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

  const prompt = `Based on the following job description, generate relevant interview questions with comprehensive answers. Remember to output ONLY JSON objects in the specified format, one per line.

Job Description:
{jobDescription}

Generate the interview questions and answers now:`;

  const systemMessage = `You are an expert interview coach and hiring manager with deep knowledge of technical and behavioral interview practices. Your task is to generate relevant interview questions and provide exemplary answers based on job descriptions.

CRITICAL FORMATTING INSTRUCTIONS:
- You MUST output content in a strict JSON format
- Each question-answer pair must be a separate JSON object on its own line
- Use this exact structure for each Q&A pair:
{"type":"qa","question":"[question text here]","answer":"[detailed answer text here]"}

RULES:
1. Generate 5-8 relevant interview questions based on the job description
2. Each question should be specific to the role and requirements
3. Answers should be comprehensive, professional, and demonstrate expertise
4. Include a mix of: technical questions, behavioral questions, and situational questions
5. Answers should be 3-5 sentences long
6. Do NOT include any text outside the JSON objects
7. Each JSON object must be on a single line
8. Do NOT wrap the output in markdown code blocks or any other formatting

Example output format:
{"type":"qa","question":"What experience do you have with React and modern JavaScript frameworks?","answer":"I have over 4 years of hands-on experience with React, building everything from small components to large-scale applications. I'm proficient in React hooks, context API, and state management libraries like Redux and Zustand. In my recent project, I architected a React application serving 100k+ users with optimized performance and accessibility. I stay current with React best practices and have experience with Next.js for server-side rendering."}
{"type":"qa","question":"Describe a challenging bug you encountered and how you resolved it.","answer":"In a recent project, we had a memory leak causing the application to slow down after extended use. I used Chrome DevTools to profile the memory usage and identified that event listeners weren't being cleaned up properly. I implemented proper cleanup in useEffect hooks and added a custom hook to manage subscriptions. This reduced memory usage by 60% and eliminated the performance degradation. The experience taught me the importance of proper resource cleanup in React applications."}`;

  const extractCompleteJsonObjects = (
    text: string
  ): {
    complete: QAItem[];
    remainder: string;
  } => {
    const complete: QAItem[] = [];
    let remainder = text;

    // Try to find complete JSON objects by looking for newlines or complete braces
    const lines = text.split("\n");
    const incompleteLine: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed || trimmed === "[DONE]") continue;

      // Remove markdown code blocks if present
      const cleaned = trimmed
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "");

      if (!cleaned) continue;

      // Check if line looks like it could be complete JSON (has opening and closing braces)
      const openBraces = (cleaned.match(/{/g) || []).length;
      const closeBraces = (cleaned.match(/}/g) || []).length;

      if (openBraces > 0 && openBraces === closeBraces) {
        // Looks complete, try to parse
        try {
          const parsed = JSON.parse(cleaned);
          if (parsed.type === "qa" && parsed.question && parsed.answer) {
            complete.push({
              question: parsed.question,
              answer: parsed.answer,
            });
          }
        } catch (e) {
          // Try to repair the JSON
          try {
            const repaired = jsonrepair(cleaned);
            const parsed = JSON.parse(repaired);
            if (parsed.type === "qa" && parsed.question && parsed.answer) {
              complete.push({
                question: parsed.question,
                answer: parsed.answer,
              });
            }
          } catch (repairError) {
            // Still incomplete, save for next iteration
            incompleteLine.push(line);
          }
        }
      } else {
        // Definitely incomplete
        incompleteLine.push(line);
      }
    }

    remainder = incompleteLine.join("\n");
    return { complete, remainder };
  };

  useEffect(() => {
    if (jobDescription?.trim()) {
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
            jobDescription,
            prompt: prompt.replace("{jobDescription}", jobDescription),
            systemMessage,
            user
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

                // Try to extract complete JSON objects from buffer
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



  return (
    <div className="min-h-screen h-full p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            Job Interview Questions & Answers
          </h1>
        </div>
        {(qaData ?? data).length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
                {(qaData ?? data).length} {(qaData ?? data).length === 1 ? "Question" : "Questions"}
              </span>
            </div>

            {(qaData ?? data).map((item, index) => (
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
                        {item.question}
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
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div ref={resultsEndRef} />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className=" mt-4">
              <div className="size-44">
                <img src="/assets/undraw/empty.svg" alt="" />
              </div>
            <h1 className="my-4 text-gray-300 text-center text-[11px] leading-3 max-w-64 mx-auto">
              Your tailored interview questions & answers will appear here.
            </h1>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
