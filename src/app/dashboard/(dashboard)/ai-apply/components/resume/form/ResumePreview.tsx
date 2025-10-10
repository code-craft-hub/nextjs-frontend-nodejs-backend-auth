import { ResumeFormData } from "@/lib/schema-validations/resume.schema";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EditDialog } from "./EditDialog";
import { ProfileEditForm } from "./ProfileEditForm";
import { WorkExperienceEditForm } from "./WorkExperienceEditForm";
import { EducationEditForm } from "./EducationEditForm";
import { ProjectEditForm } from "./ProjectEditForm";
import { CertificationEditForm } from "./CertificationEditForm";
import { SkillEditForm } from "./SkillEditForm";
interface ResumePreviewProps {
  data: ResumeFormData;
  handleProfileUpdate: (profile: string) => void;
  handleWorkExperienceUpdate: (
    workExperience: ResumeFormData["workExperience"]
  ) => void;
  handleEducationUpdate: (education: ResumeFormData["education"]) => void;
  handleCertificationUpdate: (
    certification: ResumeFormData["certification"]
  ) => void;
  handleProjectUpdate: (project: ResumeFormData["project"]) => void;
  handleHardSkillUpdate: (hardSkill: ResumeFormData["hardSkill"]) => void;
  handleSoftSkillUpdate: (softSkill: ResumeFormData["softSkill"]) => void;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  data,
  handleProfileUpdate,
  handleWorkExperienceUpdate,
  handleEducationUpdate,
  handleCertificationUpdate,
  handleProjectUpdate,
  handleHardSkillUpdate,
  handleSoftSkillUpdate,
}) => {
  console.count("PREVIEW RESUME RENDER");
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
      <EditDialog
        trigger={
          <div className="space-y-4 hover:cursor-pointer ">
            <h1 className="text-3xl font-bold text-gray-900">
              Professional Resume
            </h1>
            <p className="text-gray-700 leading-relaxed">{data.profile}</p>
          </div>
        }
        title="Edit Professional Summary"
        description="Update your professional summary and career objective"
      >
        {(onClose) => (
          <ProfileEditForm
            initialData={data.profile!}
            onSave={(data) => {
              handleProfileUpdate(data);
              onClose();
            }}
            onCancel={onClose}
          />
        )}
      </EditDialog>
      {data.workExperience.length > 0 && <Separator />}
      <EditDialog
        className="w-full"
        trigger={
          <>
            {data.workExperience.length > 0 && (
              <div className="space-y-4 ">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Work Experience
                  </h2>
                </div>
                {data.workExperience.map((exp) => (
                  <div key={exp.workExperienceId} className="space-y-2 ">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {exp.jobTitle}
                        </h3>
                        <p className="text-gray-600">{exp.companyName}</p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>
                          {exp.jobStart} - {exp.jobEnd}
                        </p>
                        <p>{exp.location}</p>
                      </div>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {exp.responsibilities?.map((resp, idx) => (
                        <li key={idx}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </>
        }
        title="Edit Work Experience"
        description="Manage your professional work history"
      >
        {(onClose) => (
          <WorkExperienceEditForm
            initialData={data.workExperience}
            onSave={(data) => {
              handleWorkExperienceUpdate(data);
              onClose();
            }}
            onCancel={onClose}
          />
        )}
      </EditDialog>
      {data.education.length > 0 && <Separator />}
      <EditDialog
        trigger={
          <>
            {data.education.length > 0 && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Education
                    </h2>
                  </div>
                  {data.education.map((edu) => (
                    <div key={edu.educationId} className="space-y-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {edu.degree} in {edu.fieldOfStudy}
                          </h3>
                          <p className="text-gray-600">{edu.schoolName}</p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>
                            {edu.educationStart} - {edu.educationEnd}
                          </p>
                          <p>{edu.schoolLocation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        }
        title="Edit Education"
        description="Manage your educational background"
      >
        {(onClose) => (
          <EducationEditForm
            initialData={data.education}
            onSave={(data) => {
              handleEducationUpdate(data);
              onClose();
            }}
            onCancel={onClose}
          />
        )}
      </EditDialog>
      {data.project.length > 0 && <Separator />}
      <EditDialog
        trigger={
          <>
            {data.project.length > 0 && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Projects
                    </h2>
                  </div>
                  {data.project.map((proj) => (
                    <div key={proj.projectId} className="space-y-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {proj.name}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {proj.role}
                          </Badge>
                        </div>
                        <p className="text-gray-700 mt-1">{proj.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {proj?.techStack?.map((tech, idx) => (
                            <Badge key={idx} variant="outline">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        }
        title="Edit Projects"
        description="Showcase your notable projects and contributions"
      >
        {(onClose) => (
          <ProjectEditForm
            initialData={data.project}
            onSave={(data) => {
              handleProjectUpdate(data);
              onClose();
            }}
            onCancel={onClose}
          />
        )}
      </EditDialog>
      {data.certification.length > 0 && <Separator />}
      <EditDialog
        trigger={
          <>
            {data.certification.length > 0 && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Certifications
                    </h2>
                  </div>
                  {data.certification.map((cert) => (
                    <div key={cert.certificationId} className="space-y-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {cert.title}
                          </h3>
                          <p className="text-gray-600">{cert.issuer}</p>
                          {cert.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {cert.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>Issued: {cert.issueDate}</p>
                          {cert.expiryDate && <p>Expires: {cert.expiryDate}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        }
        title="Edit Certifications"
        description="Manage your professional certifications"
      >
        {(onClose) => (
          <CertificationEditForm
            initialData={data.certification}
            onSave={(data) => {
              handleCertificationUpdate(data);
              onClose();
            }}
            onCancel={onClose}
          />
        )}
      </EditDialog>
      {(data.hardSkill.length > 0 || data.softSkill.length > 0) && (
        <Separator />
      )}
      {(data.hardSkill.length > 0 || data.softSkill.length > 0) && (
        <>
          <div className="space-y-4">
            <EditDialog
              trigger={
                <>
                  {data.hardSkill.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h2 className="text-xl font-semibold text-gray-900">
                          Technical Skills
                        </h2>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {data.hardSkill.map((skill, idx) => (
                          <Badge key={idx} variant="default">
                            {skill.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              }
              title="Edit Technical Skills"
              description="Manage your technical and hard skills"
            >
              {(onClose) => (
                <SkillEditForm
                  initialData={data.hardSkill}
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
                <>
                  {data.softSkill.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h2 className="text-xl font-semibold text-gray-900">
                          Soft Skills
                        </h2>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {data.softSkill.map((skill, idx) => (
                          <Badge key={idx} variant="secondary">
                            {skill.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              }
              title="Edit Soft Skills"
              description="Manage your interpersonal and soft skills"
            >
              {(onClose) => (
                <SkillEditForm
                  initialData={data.softSkill}
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
        </>
      )}
    </div>
  );
};
