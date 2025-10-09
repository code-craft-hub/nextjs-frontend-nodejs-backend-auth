"use client";

import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Edit,
  Briefcase,
  GraduationCap,
  Award,
  FolderKanban,
  Brain,
  Code,
} from "lucide-react";
import {
  EducationFormData,
  WorkExperienceFormData,
  CertificationFormData,
  ProjectFormData,
  SkillFormData,
} from "@/lib/schema-validations/resume.schema";
import { useResumeData } from "@/hooks/use-resume-data";
import { ProfileEditForm } from "./form/ProfileEditForm";
import { EducationEditForm } from "./form/EducationEditForm";
import { WorkExperienceEditForm } from "./form/WorkExperienceEditForm";
import { CertificationEditForm } from "./form/CertificationEditForm";
import { ProjectEditForm } from "./form/ProjectEditForm";
import { SkillEditForm } from "./form/SkillEditForm";
import { ResumePreview } from "./form/ResumePreview";
import { EditDialog } from "./form/EditDialog";
import { useAuth } from "@/hooks/use-auth";

const EditResumeTemplate: React.FC<{ documentId: string }> = ({documentId}) => {
  const { useCareerDoc } = useAuth();
  const { data } = useCareerDoc(documentId);
  const { resumeData, updateResumeData } = useResumeData(data!);

  console.count("EDIT RESUME RENDER : PARENT");
  console.log("Fetched Career Doc Data: ", data);
  // Section update handlers with optimistic updates
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
        {/* Header Section */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Resume Editor</h1>
          <p className="text-gray-600">
            Edit your resume sections below. Changes are reflected in real-time
            in the preview.
          </p>
        </div>

        {/* Edit Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Click on any section below to edit your resume information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <EditDialog
                trigger={
                  <Button
                    variant="outline"
                    className="w-full h-auto py-6 flex flex-col items-center gap-2"
                  >
                    <Edit className="w-5 h-5" />
                    <span className="text-sm">Edit Profile</span>
                  </Button>
                }
                title="Edit Professional Summary"
                description="Update your professional summary and career objective"
              >
                {(onClose) => (
                  <ProfileEditForm
                    initialData={resumeData.profile}
                    onSave={(data) => {
                      handleProfileUpdate(data);
                      onClose();
                    }}
                    onCancel={onClose}
                  />
                )}
              </EditDialog>

              <EditDialog
                trigger={
                  <Button
                    variant="outline"
                    className="w-full h-auto py-6 flex flex-col items-center gap-2"
                  >
                    <Briefcase className="w-5 h-5" />
                    <span className="text-sm">Edit Experience</span>
                  </Button>
                }
                title="Edit Work Experience"
                description="Manage your professional work history"
              >
                {(onClose) => (
                  <WorkExperienceEditForm
                    initialData={resumeData.workExperience}
                    onSave={(data) => {
                      handleWorkExperienceUpdate(data);
                      onClose();
                    }}
                    onCancel={onClose}
                  />
                )}
              </EditDialog>

              <EditDialog
                trigger={
                  <Button
                    variant="outline"
                    className="w-full h-auto py-6 flex flex-col items-center gap-2"
                  >
                    <GraduationCap className="w-5 h-5" />
                    <span className="text-sm">Edit Education</span>
                  </Button>
                }
                title="Edit Education"
                description="Manage your educational background"
              >
                {(onClose) => (
                  <EducationEditForm
                    initialData={resumeData.education}
                    onSave={(data) => {
                      handleEducationUpdate(data);
                      onClose();
                    }}
                    onCancel={onClose}
                  />
                )}
              </EditDialog>

              <EditDialog
                trigger={
                  <Button
                    variant="outline"
                    className="w-full h-auto py-6 flex flex-col items-center gap-2"
                  >
                    <FolderKanban className="w-5 h-5" />
                    <span className="text-sm">Edit Projects</span>
                  </Button>
                }
                title="Edit Projects"
                description="Showcase your notable projects and contributions"
              >
                {(onClose) => (
                  <ProjectEditForm
                    initialData={resumeData.project}
                    onSave={(data) => {
                      handleProjectUpdate(data);
                      onClose();
                    }}
                    onCancel={onClose}
                  />
                )}
              </EditDialog>

              <EditDialog
                trigger={
                  <Button
                    variant="outline"
                    className="w-full h-auto py-6 flex flex-col items-center gap-2"
                  >
                    <Award className="w-5 h-5" />
                    <span className="text-sm">Edit Certifications</span>
                  </Button>
                }
                title="Edit Certifications"
                description="Manage your professional certifications"
              >
                {(onClose) => (
                  <CertificationEditForm
                    initialData={resumeData.certification}
                    onSave={(data) => {
                      handleCertificationUpdate(data);
                      onClose();
                    }}
                    onCancel={onClose}
                  />
                )}
              </EditDialog>

              <EditDialog
                trigger={
                  <Button
                    variant="outline"
                    className="w-full h-auto py-6 flex flex-col items-center gap-2"
                  >
                    <Code className="w-5 h-5" />
                    <span className="text-sm">Edit Hard Skills</span>
                  </Button>
                }
                title="Edit Technical Skills"
                description="Manage your technical and hard skills"
              >
                {(onClose) => (
                  <SkillEditForm
                    initialData={resumeData.hardSkill}
                    title="Technical Skills"
                    placeholder="React, Python, AWS..."
                    onSave={(data) => {
                      handleHardSkillUpdate(data);
                      onClose();
                    }}
                    onCancel={onClose}
                  />
                )}
              </EditDialog>

              <EditDialog
                trigger={
                  <Button
                    variant="outline"
                    className="w-full h-auto py-6 flex flex-col items-center gap-2"
                  >
                    <Brain className="w-5 h-5" />
                    <span className="text-sm">Edit Soft Skills</span>
                  </Button>
                }
                title="Edit Soft Skills"
                description="Manage your interpersonal and soft skills"
              >
                {(onClose) => (
                  <SkillEditForm
                    initialData={resumeData.softSkill}
                    title="Soft Skills"
                    placeholder="Leadership, Communication..."
                    onSave={(data) => {
                      handleSoftSkillUpdate(data);
                      onClose();
                    }}
                    onCancel={onClose}
                  />
                )}
              </EditDialog>
            </div>
          </CardContent>
        </Card>

        {/* Live Preview */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Live Preview
          </h2>
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
