"use client";
import React, { useState, useCallback, useEffect } from "react";
import { ProgressIndicator } from "./progress-indicator";
import { useRouter } from "next/navigation";
import { TemporaryEmailCompose } from "./components/email/TemporaryEmailCompose";
import { toast } from "sonner";
import { ResumeGenerator } from "./components/resume/ResumeGenerator";
import { authAPI } from "@/lib/axios/auth-api";
import { useAuth } from "@/hooks/use-auth";

export const AIApplyClient = ({
  jobDescription,
  documentId,
  coverletterId,
  destinationEmail,
}: {
  jobDescription: string;
  documentId: string;
  coverletterId: string;
  destinationEmail: string;
}) => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(1); // Start at 1 directly
  const [generatedData, setGeneratedData] = useState({
    resume: {},
    emailContent: "",
  });
  const [email] = useState(destinationEmail);
  const router = useRouter();

  console.count("AI APPLY CLIENT RENDERED");

  const handleStepChange = useCallback(
    (step: number, key: "resume" | "emailContent", value: any) => {
      setActiveStep(step);
      setGeneratedData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // useEffect(() => {
  //   if (activeStep === 3) {
  //     console.log("GENERATED DATA : ", generatedData);
  //     toast.success("Hurry! We've sent your application. Good luck!");
  //     try {
  //       authAPI.post("/send-email-with-resume", {
  //         emailContent: generatedData.emailContent,
  //         resume: generatedData.resume,
  //         destinationEmail: destinationEmail ?? email,
  //         user,
  //       });
  //     } catch (error) {
  //       toast.error("Failed to send application email.");
  //       console.error("Error sending application email:", error);
  //     }
  //   }
  // }, [activeStep, generatedData, router]);
  //
  return (
    <div className="">
      {/* <ProgressIndicator
        activeStep={activeStep}
        setActiveStep={setActiveStep}
      /> */}
      Preview  here
      <div className="py-4">
        {/* {activeStep === 1 && (
          <TemporaryEmailCompose
            handleStepChange={handleStepChange}
            jobDescription={jobDescription}
            coverletterId={coverletterId}
          />
        )}
        {activeStep >= 2 && ( */}
          {/* <ResumeGenerator
            handleStepChange={handleStepChange}
            jobDescription={jobDescription}
            documentId={documentId}
          /> */}
        {/* )} */}
      </div>
    </div>
  );
};
