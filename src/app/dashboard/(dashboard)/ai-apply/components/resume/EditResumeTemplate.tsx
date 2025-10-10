"use client";

import React, { useCallback } from "react";
import {
  EducationFormData,
  WorkExperienceFormData,
  CertificationFormData,
  ProjectFormData,
  SkillFormData,
} from "@/lib/schema-validations/resume.schema";
import { useResumeData } from "@/hooks/use-resume-data";
import { ResumePreview } from "./form/ResumePreview";
import { useAuth } from "@/hooks/use-auth";

const EditResumeTemplate: React.FC<{ documentId: string }> = ({
  documentId,
}) => {
  const { useCareerDoc } = useAuth();
  const { data } = useCareerDoc(documentId);
  const { resumeData, updateResumeData } = useResumeData(data!);

  const handleProfileUpdate = useCallback(
    (profile: string) => {
      updateResumeData((prev) => ({ ...prev, profile }));
      // In production: mutate with TanStack Query here
    },
    [updateResumeData]
  );

  const handleEducationUpdate = useCallback(
    (education: EducationFormData[]) => {
      updateResumeData((prev) => ({ ...prev, education }));
      // In production: mutate with TanStack Query here
    },
    [updateResumeData]
  );

  const handleWorkExperienceUpdate = useCallback(
    (workExperience: WorkExperienceFormData[]) => {
      updateResumeData((prev) => ({ ...prev, workExperience }));
      // In production: mutate with TanStack Query here
    },
    [updateResumeData]
  );

  const handleCertificationUpdate = useCallback(
    (certification: CertificationFormData[]) => {
      updateResumeData((prev) => ({ ...prev, certification }));
      // In production: mutate with TanStack Query here
    },
    [updateResumeData]
  );

  const handleProjectUpdate = useCallback(
    (project: ProjectFormData[]) => {
      updateResumeData((prev) => ({ ...prev, project }));
      // In production: mutate with TanStack Query here
    },
    [updateResumeData]
  );

  const handleSoftSkillUpdate = useCallback(
    (softSkill: SkillFormData[]) => {
      updateResumeData((prev) => ({ ...prev, softSkill }));
      // In production: mutate with TanStack Query here
    },
    [updateResumeData]
  );

  const handleHardSkillUpdate = useCallback(
    (hardSkill: SkillFormData[]) => {
      updateResumeData((prev) => ({ ...prev, hardSkill }));
      // In production: mutate with TanStack Query here
    },
    [updateResumeData]
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <ResumePreview
            data={resumeData}
            handleProfileUpdate={handleProfileUpdate}
            handleWorkExperienceUpdate={handleWorkExperienceUpdate}
            handleEducationUpdate={handleEducationUpdate}
            handleCertificationUpdate={handleCertificationUpdate}
            handleProjectUpdate={handleProjectUpdate}
            handleHardSkillUpdate={handleHardSkillUpdate}
            handleSoftSkillUpdate={handleSoftSkillUpdate}
          />
        </div>
      </div>
    </div>
  );
};
export default EditResumeTemplate;