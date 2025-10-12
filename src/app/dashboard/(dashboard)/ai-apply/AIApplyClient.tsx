"use client";
import React, { useState, useCallback, useEffect } from "react";
import { ProgressIndicator } from "./progress-indicator";
import { useRouter } from "next/navigation";
import { TemporaryEmailCompose } from "./components/email/TemporaryEmailCompose";
import { toast } from "sonner";
import { ResumeGenerator } from "./components/resume/resume-generator";

export const AIApplyClient = ({
  jobDescription,
  documentId,
  coverletterId,
}: {
  jobDescription: string;
  documentId: string;
  coverletterId: string;
}) => {
  const [activeStep, setActiveStep] = useState(1); // Start at 1 directly
  const [generatedData, setGeneratedData] = useState({
    resume: {},
    emailContent: "",
  });

  const router = useRouter();

  console.count("AI APPLY CLIENT RENDERED");

  // ✅ Memoize handleStepChange to prevent child re-renders
  const handleStepChange = useCallback(
    (step: number, key: "resume" | "emailContent", value: any) => {
      setActiveStep(step);
      setGeneratedData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // ✅ Move activeStep === 3 logic to useEffect
  useEffect(() => {
    if (activeStep === 3) {
      console.log("GENERATED DATA : ", generatedData);
      toast.success("Hurry! We've sent your application. Good luck!");
      
      // const timer = setTimeout(() => {
      //   router.push("/dashboard/home");
      // }, 5000);

      // return () => clearTimeout(timer); // Cleanup
    }
  }, [activeStep, generatedData, router]);

  return (
    <div className="">
      <ProgressIndicator
        activeStep={activeStep}
        setActiveStep={setActiveStep}
      />
      <div className="py-4">
        {activeStep === 1 && (
          <TemporaryEmailCompose
            handleStepChange={handleStepChange}
            jobDescription={jobDescription}
            coverletterId={coverletterId}
          />
        )}
        {activeStep >= 2 && (
          <ResumeGenerator
            handleStepChange={handleStepChange}
            jobDescription={jobDescription}
            documentId={documentId}
          />
        )}
      </div>
    </div>
  );
};