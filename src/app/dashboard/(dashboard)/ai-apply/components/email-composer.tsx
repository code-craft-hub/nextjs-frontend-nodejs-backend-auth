"use client";
import { useStreamingContent } from "@/hooks/useStreamingContent";
import { getReadingMetrics } from "@/lib/utils/helpers";
import React, { useEffect } from "react";
// import { StreamingControls } from "./email-compose-streaming-control";
import { StreamingMetrics } from "./email-compose-streaming-metrics";
import { StreamingDisplay } from "./email-compose-streaming-display";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export const EmailComposer: React.FC<{
  handleStepChange: (
    step: number,
    key: "resume" | "emailContent",
    value: any
  ) => void;
}> = ({ handleStepChange }) => {
  const {user} = useAuth();
   const prompt =
    `please compose an email for me to send to a job with email usecver@gmail.com, that's the recruiter, it is for a software engineering role. here is user information: ${user?.firstName} ${user?.lastName}, email: ${user?.email}, phone number: ${user?.phoneNumber}, address: ${user?.address}, portfolio: ${user?.portfolio}, ${user} make it professional and enthusiastic. keep it concise and to the point. use a professional tone. make sure to highlight my skills and experiences that are relevant to the job. make sure to proofread it for any grammatical errors or typos. make sure to include a call to action at the end of the email., I don't need markdown, and only provide the email content. I don't need any symbols or markdown. just the email content.`;
  const systemMessage =
    "You're a helpful assistant that helps people write professional job application emails.";
  const aiModel = "gemini";

  console.log("PROMPT : ", prompt);
  const {
    content,
    isStreaming,
    error,
    isComplete,
    startStreaming,
    // stopStreaming,
    // clearContent,
  } = useStreamingContent();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    await startStreaming({
      prompt,
      systemMessage: systemMessage || undefined,
      aiModel,
    });
  };

  // const handleClear = () => {
  //   clearContent();
  //   setPrompt("");
  //   setSystemMessage("");
  // };

  const metrics = content ? getReadingMetrics(content) : null;

  useEffect(() => {
    if (isComplete) {
      toast.success(
        "Resume generation complete! Proceeding to next step in the next 5 seconds..."
      );
      setTimeout(() => {
        handleStepChange(2, "emailContent", content);
      }, 5000);
    } else {
      // toast.success("There are some generations pending. Please wait...");
    }
  }, [isComplete, handleStepChange]);

  useEffect(() => {
    handleGenerate();
    
  }, []);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto space-y-6">
     

        {/* Controls */}
        {/* <StreamingControls
          prompt={prompt}
          systemMessage={systemMessage}
          aiModel={aiModel}
          isStreaming={isStreaming}
          onPromptChange={setPrompt}
          onSystemMessageChange={setSystemMessage}
          onAiModelChange={setAiModel}
          onGenerate={handleGenerate}
          onStop={stopStreaming}
          onClear={handleClear}
        /> */}

        {/* Metrics */}
        {metrics && (
          <StreamingMetrics
            metrics={metrics}
            isStreaming={isStreaming}
            isComplete={isComplete}
          />
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-500 mt-0.5 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <StreamingDisplay
          content={content}
          isStreaming={isStreaming}
          isComplete={isComplete}
        />
      </div>
    </div>
  );
};
