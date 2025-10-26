"use client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { OnboardingFormProps } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import Progress from "./Progress";
import OnboardingTabs from "./OnBoardingTabs";

import { FileUploadZone, useDocumentExtraction } from "./AnyFormatToText";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";

const dataSource: {
  description: string;
  ProfileID: string;
  title: string;
}[] = [];

export const OnBoardingForm2 = ({
  onNext,
  onPrev,
  fromDataSourceStep,
}: OnboardingFormProps) => {
  const { updateUser, isUpdatingUserLoading, user } = useAuth();

  useEffect(() => {
    if (user?.dataSource && Array.isArray(user.dataSource)) {
      fromDataSourceStep && fromDataSourceStep();
    }
  }, [user]);

  const {
    processDocument,
    isProcessing,
    error,
    currentFile,
    clearError,
    clearFile,
  } = useDocumentExtraction();

  const handleFileSelect = useCallback(
    async (file: File) => {
      clearError();
      const result = await processDocument(file);
      dataSource.push({
        description: result?.text || "",
        ProfileID: crypto.randomUUID(),
        title: file.name,
      });
      await updateUser({ dataSource: dataSource });
      toast.success(`${user?.firstName}, your base resume is saved!`);
      onNext();
    },
    [processDocument, clearError]
  );

  const isMobile = useIsMobile();
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="min-h-screen items-center justify-center flex flex-col font-poppins"
    >
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
            disabled={isProcessing}
            currentFile={currentFile}
            onClearFile={() => {
              clearFile();
            }}
          />
          <form className="space-y-6 w-full">
            <div className="flex flex-row items-center border p-3 gap-2 rounded-sm ">
              <Checkbox
                id="create-from-scratch"
                // checked={field.value}
                onCheckedChange={async () => {
                  // await updateUser({
                  //   baseResume: "",
                  // });
                  onNext();
                }}
              />
              <label htmlFor="create-from-scratch" className="h1">
                Create from scratch
              </label>
            </div>
            {error && (
              <div className="text-red-500 w-full p-3">
                {typeof error === "string"
                  ? error
                  : "Failed to process document. Please try again."}
              </div>
            )}
            <div className="flex gap-4">
              <Button
                type="button"
                variant={"outline"}
                onClick={() => onPrev()}
                className="onboarding-btn"
              >
                Previous
              </Button>
              <Button
                type="submit"
                disabled={isUpdatingUserLoading}
                className="onboarding-btn"
              >
                {isUpdatingUserLoading ? "Saving..." : "Save and Continue"}{" "}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};
