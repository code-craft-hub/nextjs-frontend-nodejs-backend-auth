"use client";

import { apiService, useAuth } from "@/hooks/use-auth";
import { EditableResume } from "../(dashboard)/ai-apply/components/resume/EditableResume";
import { ProgressIndicator } from "../(dashboard)/ai-apply/progress-indicator";
import TailorCoverLetterDisplay from "../tailor-cover-letter/[coverLetterId]/TailorCoverLetterDisplay";
import { COLLECTIONS } from "@/lib/utils/constants";
import { CoverLetter, Resume } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useRouter } from "next/navigation";

const Preview = ({
  coverLetterId,
  resumeId,
  recruiterEmail,
  jobDescription,
}: {
  coverLetterId: string;
  resumeId: string;
  jobDescription: string;
  recruiterEmail: string;
}) => {
  const [activeStep, setActiveStep] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, useCareerDoc } = useAuth();
  const router = useRouter();

  const {
    data: resumeData,
    isLoading: isResumeLoading,
    // error: resumeError,
  } = useCareerDoc<Resume>(resumeId, COLLECTIONS.RESUME);

  const {
    data: coverLetterData,
    isLoading: isCoverLetterLoading,
    // error: coverLetterError,
  } = useCareerDoc<CoverLetter>(coverLetterId, COLLECTIONS.COVER_LETTER);

  const isLoading = isResumeLoading || isCoverLetterLoading;
  // const hasError = resumeError || coverLetterError;

  const handleSubmit = async () => {
    if (!user || !coverLetterData || !resumeData) {
      toast.error("Missing required data");
      return;
    }

    try {
      setIsSubmitting(true);
      await apiService.sendApplication(
        user,
        coverLetterData,
        resumeData,
        recruiterEmail,
        jobDescription
      );
      setActiveStep(4);
      toast.success("Application Submitted Successfully!");
    } catch (error: any) {
      toast.error(
        error?.response?.data || "Auto apply failed. Please try again.",
        {
          action: {
            label: "Authenticate",
            onClick: () => router.push("/dashboard/settings"),
          },
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCoverLetterDelete = async () => {
    Promise.all([
      apiService.deleteCareerDoc(coverLetterId, COLLECTIONS.COVER_LETTER),
      apiService.deleteCareerDoc(resumeId, COLLECTIONS.RESUME),
    ]);
    toast.success("Resume and Cover Letter deleted successfully");
    router.push("/dashboard/home");
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-8">
        <ProgressIndicator activeStep={activeStep} />
        <EmptySkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      <ProgressIndicator activeStep={activeStep} />
      <div className="flex w-full gap-3 items-center  p-4 bg-white justify-between">
        <p className="text-md font-medium font-inter">
          Preview Resume and Cover Letter
        </p>
        <Button
          disabled={isSubmitting}
          className="text-2xs"
          onClick={() => {
            handleCoverLetterDelete();
          }}
        >
          Delete
        </Button>
      </div>
      <TailorCoverLetterDisplay
        user={user}
        data={coverLetterData}
        recruiterEmail={recruiterEmail}
      />
      <EditableResume data={resumeData!} resumeId={resumeId} />
      <div className="flex items-center justify-center">
        <Button disabled={isSubmitting} onClick={handleSubmit} className="w-64">
          Submit
        </Button>
      </div>
    </div>
  );
};

export default Preview;

const EmptySkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6">
      <div className="bg-white border-b w-full border-slate-200 shadow-md rounded-md flex flex-col">
        <div className="p-4 sm:p-8 overflow-y-auto w-full">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-outfit text-md flex flex-col gap-4 sm:gap-8">
            <div className="flex gap-4 flex-col">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="w-[50%] h-8" />
              ))}
            </div>
            <div className="flex gap-4 flex-col">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="w-full h-8" />
              ))}
            </div>
            <div className="flex gap-8 flex-col">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="w-full h-44" />
              ))}
            </div>
            <div className="flex gap-4 flex-col">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="w-[50%] h-8" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
