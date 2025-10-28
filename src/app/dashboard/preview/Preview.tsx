"use client";

import { apiService } from "@/hooks/use-auth";
import { EditableResume } from "../(dashboard)/ai-apply/components/resume/EditableResume";
import { ProgressIndicator } from "../(dashboard)/ai-apply/progress-indicator";
import TailorCoverLetterDisplay from "../tailor-cover-letter/[coverLetterId]/TailorCoverLetterDisplay";
import { COLLECTIONS } from "@/lib/utils/constants";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries/user.queries";
import { resumeQueries } from "@/lib/queries/resume.queries";
import { coverLetterQueries } from "@/lib/queries/cover-letter.queries";

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
  const router = useRouter();

  const { data: user } = useQuery(userQueries.detail());

  const { data: resumeData } = useQuery(resumeQueries.detail(resumeId));
  const { data: coverLetterData } = useQuery(
    coverLetterQueries.detail(coverLetterId)
  );



  const handleSubmit = async () => {
    if (!user?.aiApplyPreferences) {
      toast.error(
        "Visit the Settings to configure your AI Apply Preferences. Enable Auto Apply in the third card section to get started.",
        {
          action: {
            label: "Enable",
            onClick: () =>
              router.push(`/dashboard/settings?tab=ai-applypreference`),
          },
          classNames: {
            // toast: "!bg-yellow-50 !border-yellow-200",
            actionButton: "!bg-blue-600 hover:!bg-blue-700 !text-white !h-8",
          },
        }
      );

      return;
    }



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
        jobDescription,
        user?.aiApplyPreferences.autoSendApplications
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
          classNames: {
            actionButton: "!bg-blue-600 hover:!bg-blue-700 !text-white !h-8",
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
