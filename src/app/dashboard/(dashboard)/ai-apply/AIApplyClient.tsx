"use client";
import React, { useState } from "react";
import { ProgressIndicator } from "./progress-indicator";
import { ResumeGenerator } from "./components/resume/resume-generator";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { TemporaryEmailCompose } from "./components/email/TemporaryEmailCompose";
import { toast } from "sonner";

export const AIApplyClient = ({
  jobDescription,
  documentId,
  coverletterId,
}: {
  jobDescription: string;
  documentId: string;
  coverletterId: string;
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const { user } = useAuth();
  const handleStepChange = (
    step: number,
    key: "resume" | "emailContent",
    value: any
  ) => {
    setActiveStep(step);
    setGeneratedData((prev) => ({ ...prev, [key]: value }));
  };
  const [generatedData, setGeneratedData] = useState({
    resume: {},
    emailContent: "",
  });

  const router = useRouter();

  if (activeStep === 3) {

    console.log("GENERATED DATA : ", generatedData);
    toast.success("Hurry! We've sent your application. Good luck!");
    setTimeout(() => {
      router.push("/dashboard/home");
    }, 5000);
  }

  if (activeStep === 0) {
    setActiveStep(1);
  }
  console.log(activeStep)
  return (
    <div className="">
      <ProgressIndicator
        activeStep={activeStep}
        setActiveStep={setActiveStep}
      />
      <div className="py-4 ">
        {activeStep === 1 && (
          <TemporaryEmailCompose
            handleStepChange={handleStepChange}
            userProfile={user?.baseResume ?? ""}
            jobDescription={jobDescription}
            coverletterId={coverletterId}
          />
        )}
        {activeStep >= 2 && (
          <ResumeGenerator
            handleStepChange={handleStepChange}
            userProfile={user?.baseResume ?? ""}
            jobDescription={jobDescription}
            documentId={documentId}
          />
        )}

        
        {/* {activeStep === 3 && (
          <DisplayResumeEmailContent generatedData={generatedData} />
        )} */}
      </div>
    </div>
  );
};
