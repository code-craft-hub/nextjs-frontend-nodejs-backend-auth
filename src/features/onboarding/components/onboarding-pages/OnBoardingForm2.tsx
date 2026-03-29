"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { OnboardingFormProps } from "@/shared/types";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import Progress from "./Progress";
import OnboardingTabs from "./OnBoardingTabs";
import { FileUploadZone, useDocumentExtraction } from "./AnyFormatToText";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userQueries } from "@features/user";
import { useResumeUploadWithProgress } from "@/features/resume/hooks/useResumeUploadWithProgress";
import { queryKeys } from "@/shared/query/keys";
import CreateUserResume from "./create-resume-form/CreateUserResume";
import { Edit3, Loader2, Mic } from "lucide-react";
import { SpeechToTextInput } from "./speech-to-text";
import { resumeApi } from "@/features/resume/api/resume.api";

export const OnBoardingForm2 = ({ onNext, children }: OnboardingFormProps) => {
  const queryClient = useQueryClient();
  const [editResume, setEditResume] = useState(false);
  const [speechText, setSpeechText] = useState("");
  const [isSpeechSubmitting, setIsSpeechSubmitting] = useState(false);

  const handleSpeechSubmit = async () => {
    if (!speechText.trim()) return;
    setIsSpeechSubmitting(true);
    try {
      onNext();
      await resumeApi.autoNewResume(speechText.trim());
      toast.success("Your resume is being generated!");
    } catch {
      toast.error("Failed to generate resume. Please try again.");
    } finally {
      setIsSpeechSubmitting(false);
    }
  };
  const handleEditClick = (value: boolean) => {
    setEditResume(value);
  };
  const { data: user } = useQuery(userQueries.detail());
  const {
    uploadResume,
    progress,
    isUploading,
    error: uploadError,
  } = useResumeUploadWithProgress();

  const { error, currentFile, clearError, clearFile } = useDocumentExtraction();

  const handleFileSelect = useCallback(
    async (file: File) => {
      clearError();
      onNext();

      const result = await uploadResume(file);

      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
        queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        toast.success(`${user?.firstName}, your resume is saved!`);
      }
    },
    [uploadResume, clearError, user?.firstName, onNext],
  );

  const isMobile = useIsMobile();

  // Calculate overall progress percentage
  const progressPercentage = progress?.progress || 0;

  return (
    <motion.div
      // @ts-ignore
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="min-h-screen items-center justify-center flex flex-col font-poppins"
    >
      <div className="absolute right-4 top-2 z-50">{children}</div>

      <div className="onboarding-container">
        <div
          className={cn(
            "flex justify-between mb-9 w-full max-w-5xl ",
            isMobile && "fixed top-0 left-0 width-full px-4 pt-5",
          )}
        >
          <img src="/cverai-logo.png" className="w-28 h-8" alt="" />
          <Progress min={2} max={7} progress={20} />
        </div>
        {editResume ? (
          <CreateUserResume handleEditClick={handleEditClick} onNext={onNext} />
        ) : (
          <div className="onboarding-card">
            <OnboardingTabs activeTab={"cv-handling"} />
            <div className="space-y-6">
              <div className="">
                <h1 className="onboarding-h1">Do you have CV?</h1>
                <p className="text-gray-400 text-xs">Upload your existing CV or create a new one or Dictate your experience to generate a resume.</p>
              </div>
            </div>

            <FileUploadZone
              onFileSelect={handleFileSelect}
              disabled={isUploading}
              currentFile={currentFile}
              onClearFile={() => {
                clearFile();
              }}
            />

            {/* Progress indicator */}
            {isUploading && progress && (
              <div className="w-full space-y-3 mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">
                    {progress.message}
                  </span>
                  <span className="text-gray-500">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4 w-full">
              <div className=" border bg-green-50 border-green-100 w-full p-2 sm:p-4 rounded-md">
                <label
                  htmlFor="create-resume-checkbox"
                  className="flex w-full justify-between items-center "
                  onClick={() => handleEditClick(true)}
                >
                  <div className="flex gap-2 items-center">
                    <Edit3 className="size-4" />
                    <p className="max-sm:text-xs">Create from crash</p>
                  </div>
                </label>
              </div>
             
             <div className="border bg-blue-50 border-blue-100 w-full p-2 sm:p-4 rounded-md flex flex-col gap-3">
               <div className="flex gap-2 items-center text-blue-700">
                 <Mic className="size-4" />
                 <p className="max-sm:text-xs font-medium">Dictate your CV</p>
               </div>
               <SpeechToTextInput
                 value={speechText}
                 onChange={setSpeechText}
                 placeholder="Start speaking to describe your experience..."
               />
               {speechText.trim() && (
                 <button
                   type="button"
                   onClick={handleSpeechSubmit}
                   disabled={isSpeechSubmitting}
                   className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                 >
                   {isSpeechSubmitting ? (
                     <>
                       <Loader2 className="size-4 animate-spin" />
                       Generating…
                     </>
                   ) : (
                     "Generate My Resume"
                   )}
                 </button>
               )}
             </div>
            </div>
            <div className="space-y-6 w-full">
              {(error || uploadError) && (
                <div className="text-red-500 w-full p-3 bg-red-50 rounded-md">
                  {typeof error === "string"
                    ? error
                    : uploadError ||
                      "Failed to process document. Please try again."}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
