"use client";

import { apiService, useAuth } from "@/hooks/use-auth";
import { EditableResume } from "../(dashboard)/ai-apply/components/resume/EditableResume";
import { ProgressIndicator } from "../(dashboard)/ai-apply/progress-indicator";
import TailorCoverLetterDisplay from "../tailor-cover-letter/[coverLetterId]/TailorCoverLetterDisplay";
import { COLLECTIONS } from "@/lib/utils/constants";
import { CoverLetter, Resume } from "@/types";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Preview = ({
  coverLetterId,
  resumeId,
  destinationEmail,
}: {
  coverLetterId: string;
  resumeId: string;
  destinationEmail: string;
}) => {
  const [activeStep, setActiveStep] = useState(3);
  const [fetched, setFetchedData] = useState({
    coverLetterData: undefined as CoverLetter | undefined,
    resumeData: undefined as Resume | undefined,
  });
  const { user, useCareerDoc } = useAuth();
  const { data: resumeData } = useCareerDoc<Resume>(
    resumeId,
    COLLECTIONS.RESUME
  );
  const { data: coverLetterData } = useCareerDoc<CoverLetter>(
    coverLetterId,
    COLLECTIONS.COVER_LETTER
  );

  useEffect(() => {
    if (coverLetterData && resumeData) {
      setFetchedData({ coverLetterData, resumeData });
    }
  }, [coverLetterData, resumeData]);

  const handleSubmit = () => {
    setActiveStep(4);
    toast.success("Application Submitted Successfully!");
    if (!user || !fetched?.coverLetterData || !fetched.resumeData) return;
    apiService.sendApplication(
      user,
      fetched.coverLetterData,
      fetched.resumeData,
      destinationEmail
    );
  };
  return (
    <div className="space-y-4 sm:space-y-8">
      <ProgressIndicator activeStep={activeStep} />
      <TailorCoverLetterDisplay user={user} data={fetched.coverLetterData!} />
      <EditableResume data={fetched.resumeData!} resumeId={resumeId} />
      <Button onClick={() => handleSubmit()}>Submit</Button>
    </div>
  );
};

export default Preview;
