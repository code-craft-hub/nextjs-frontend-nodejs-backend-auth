"use client";

import { useAuth } from "@/hooks/use-auth";
import { EditableResume } from "../(dashboard)/ai-apply/components/resume/EditableResume";
import { ProgressIndicator } from "../(dashboard)/ai-apply/progress-indicator";
import TailorCoverLetterDisplay from "../tailor-cover-letter/[coverLetterId]/TailorCoverLetterDisplay";
import { COLLECTIONS } from "@/lib/utils/constants";
import { CoverLetter, Resume } from "@/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Preview = ({
  coverLetterId,
  resumeId,
}: {
  coverLetterId: string;
  resumeId: string;
}) => {
  const [activeStep, setActiveStep] = useState(3);
  const { user, useCareerDoc } = useAuth();
  const { data: resumeData } = useCareerDoc<Resume>(
    resumeId,
    COLLECTIONS.RESUME
  );
  const { data: coverLetterData } = useCareerDoc<CoverLetter>(
    coverLetterId,
    COLLECTIONS.COVER_LETTER
  );

  const handleSubmit = () => {
    setActiveStep(4);
  };
  return (
    <div className="space-y-4 sm:space-y-8">
      <ProgressIndicator activeStep={activeStep} />
      <TailorCoverLetterDisplay user={user} data={coverLetterData} />
      <EditableResume data={resumeData!} resumeId={resumeId} />
      <Button onClick={() => handleSubmit()}>Submit</Button>
    </div>
  );
};

export default Preview;
