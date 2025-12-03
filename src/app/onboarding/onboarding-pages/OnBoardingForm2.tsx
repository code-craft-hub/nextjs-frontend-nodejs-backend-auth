"use client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { OnboardingFormProps } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import Progress from "./Progress";
import OnboardingTabs from "./OnBoardingTabs";
import { FileUploadZone, useDocumentExtraction } from "./AnyFormatToText";
import { useCallback } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries/user.queries";
import { useResumeUploadWithProgress } from "@/hooks/useResumeUploadWithProgress";
import { queryKeys } from "@/lib/query/keys";

export const OnBoardingForm2 = ({ onNext, onPrev, children }: OnboardingFormProps) => {
  const queryClient = useQueryClient();

  const { isUpdatingUserLoading } = useAuth();
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

      const result = await uploadResume(file);

      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
        queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        toast.success(`${user?.firstName}, your resume is saved!`);
        onNext();
      } else {
        toast.error(result.error || "Failed to upload resume");
        toast("Skip this process", {
          action: {
            label: "Skip",
            onClick: () => {
              onNext();
            },
          },
        });
      }
    },
    [uploadResume, clearError, user?.firstName, onNext]
  );

  const isMobile = useIsMobile();

  // Calculate overall progress percentage
  const progressPercentage = progress?.progress || 0;

  return (
    <motion.div
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
            "flex justify-between mb-9 w-full max-w-screen-lg ",
            isMobile && "fixed top-0 left-0 width-full px-4 pt-5"
          )}
        >
          <img src="/cverai-logo.png" className="w-28 h-8" alt="" />
          <Progress min={2} max={7} progress={20} />
        </div>
        <div className="onboarding-card">
          <OnboardingTabs activeTab={"cv-handling"} />
          <div className="space-y-6">
            <div>
              <h1 className="onboarding-h1">Do you have CV?</h1>
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

          <form className="space-y-6 w-full">
            {(error || uploadError) && (
              <div className="text-red-500 w-full p-3 bg-red-50 rounded-md">
                {typeof error === "string"
                  ? error
                  : uploadError ||
                    "Failed to process document. Please try again."}
              </div>
            )}
            <div className="flex gap-4">
              <Button
                type="button"
                variant={"outline"}
                onClick={() => onPrev()}
                className="onboarding-btn"
                disabled={isUpdatingUserLoading || isUploading}
              >
                Previous
              </Button>
              <Button
                type="submit"
                disabled={isUpdatingUserLoading || isUploading}
                className="onboarding-btn overflow-hidden"
              >
                {isUploading ? "Processing..." : "Save and Continue"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};
