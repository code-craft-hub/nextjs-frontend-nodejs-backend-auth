import { EditDialog } from "./EditDialog";
import { ProfileEditForm } from "./ProfileEditForm";
import { WorkExperienceEditForm } from "./WorkExperienceEditForm";
import { EducationEditForm } from "./EducationEditForm";
import { ProjectEditForm } from "./ProjectEditForm";
import { CertificationEditForm } from "./CertificationEditForm";
import { SkillEditForm } from "./SkillEditForm";
import { useCallback } from "react";
import { ResumeField, ResumePreviewProps } from "@/types";
import { ContactEditForm } from "./ContactEditForm";

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  data,
  onUpdate,
  user,
}) => {
  // Create field-specific handlers dynamically
  const createFieldHandler = useCallback(
    <T,>(field: ResumeField) =>
      (value: T) => {
        onUpdate(field, value);
      },
    [onUpdate]
  );

  const contactInfo = [
    data.email || user?.email,
    data.phoneNumber || user?.phoneNumber,
    data.address,
    data.portfolio,
  ]
    .filter(Boolean)
    .join(" | ");

  const initialData = {
    firstName: user?.firstName ?? data.firstName,
    lastName: user?.lastName ?? data.lastName,
    email: user?.email ?? data.email,
    phoneNumber: user?.phoneNumber ?? data.phoneNumber,
    address: user?.address ?? data.address,
    portfolio: data.portfolio,
  };
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-6 relative">
      <EditDialog
        trigger={
          <div className="space-y-4 hover:cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors">
            <h1 className="text-3xl font-bold text-gray-900">
              {initialData.firstName} {initialData.lastName}
            </h1>
            {contactInfo && (
              <p className="text-lg text-gray-600 font-merriweather mt-2">
                {contactInfo}
              </p>
            )}
          </div>
        }
        title="Edit Contact Information"
        description="Update your contact information"
      >
        {(onClose) => (
          <ContactEditForm
            initialData={initialData}
            onSave={(value) => {
              createFieldHandler("contact")(value);
              onClose();
            }}
            onCancel={onClose}
          />
        )}
      </EditDialog>
      <EditDialog
        trigger={
          <div className="space-y-4 hover:cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors">
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
            initialData={data.profile ?? ""}
            onSave={(value) => {
              createFieldHandler("profile")(value);
              onClose();
            }}
            onCancel={onClose}
          />
        )}
      </EditDialog>

      {/* Work Experience Section */}
      {data.workExperience?.length > 0 && (
        <>
          <div className="border-t pt-6" />
          <EditDialog
            trigger={
              <div className="space-y-4 hover:cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors">
                <h2 className="text-xl font-semibold text-gray-900">
                  Work Experience
                </h2>
                {data.workExperience.map((exp: any) => (
                  <div key={exp.workExperienceId} className="space-y-2">
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
                      {exp.responsibilities?.map(
                        (resp: string, idx: number) => (
                          <li key={idx}>{resp}</li>
                        )
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            }
            title="Edit Work Experience"
            description="Manage your professional work history"
          >
            {(onClose) => (
              <WorkExperienceEditForm
                initialData={data.workExperience}
                onSave={(value) => {
                  createFieldHandler("workExperience")(value);
                  onClose();
                }}
                onCancel={onClose}
              />
            )}
          </EditDialog>
        </>
      )}

      {/* Education Section */}
      {data.education?.length > 0 && (
        <>
          <div className="border-t pt-6" />
          <EditDialog
            trigger={
              <div className="space-y-4 hover:cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors">
                <h2 className="text-xl font-semibold text-gray-900">
                  Education
                </h2>
                {data.education.map((edu: any) => (
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
            }
            title="Edit Education"
            description="Manage your educational background"
          >
            {(onClose) => (
              <EducationEditForm
                initialData={data.education}
                onSave={(value) => {
                  createFieldHandler("education")(value);
                  onClose();
                }}
                onCancel={onClose}
              />
            )}
          </EditDialog>
        </>
      )}

      {/* Projects Section */}
      {data.project?.length > 0 && (
        <>
          <div className="border-t pt-6" />
          <EditDialog
            trigger={
              <div className="space-y-4 hover:cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors">
                <h2 className="text-xl font-semibold text-gray-900">
                  Projects
                </h2>
                {data.project.map((proj: any) => (
                  <div key={proj.projectId} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {proj.name}
                      </h3>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {proj.role}
                      </span>
                    </div>
                    <p className="text-gray-700">{proj.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {proj.techStack?.map((tech: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-xs border px-2 py-1 rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            }
            title="Edit Projects"
            description="Showcase your notable projects"
          >
            {(onClose) => (
              <ProjectEditForm
                initialData={data.project}
                onSave={(value) => {
                  createFieldHandler("project")(value);
                  onClose();
                }}
                onCancel={onClose}
              />
            )}
          </EditDialog>
        </>
      )}

      {/* Certifications Section */}
      {data.certification?.length > 0 && (
        <>
          <div className="border-t pt-6" />
          <EditDialog
            trigger={
              <div className="space-y-4 hover:cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors">
                <h2 className="text-xl font-semibold text-gray-900">
                  Certifications
                </h2>
                {data.certification.map((cert: any) => (
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
            }
            title="Edit Certifications"
            description="Manage your professional certifications"
          >
            {(onClose) => (
              <CertificationEditForm
                initialData={data.certification}
                onSave={(value) => {
                  createFieldHandler("certification")(value);
                  onClose();
                }}
                onCancel={onClose}
              />
            )}
          </EditDialog>
        </>
      )}

      {/* Skills Section */}
      {(data.hardSkill?.length > 0 || data.softSkill?.length > 0) && (
        <>
          <div className="border-t pt-6" />
          <div className="space-y-4">
            {data.hardSkill?.length > 0 && (
              <EditDialog
                trigger={
                  <div className="hover:cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                      Technical Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {data.hardSkill.map((skill: any, idx: number) => (
                        <span
                          key={idx}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm"
                        >
                          {skill.label}
                        </span>
                      ))}
                    </div>
                  </div>
                }
                title="Edit Technical Skills"
                description="Manage your technical skills"
              >
                {(onClose) => (
                  <SkillEditForm
                    initialData={data.hardSkill}
                    title="Technical Skills"
                    placeholder=" Python, AWS..."
                    onSave={(value) => {
                      createFieldHandler("hardSkill")(value);
                      onClose();
                    }}
                    onCancel={onClose}
                  />
                )}
              </EditDialog>
            )}

            {data.softSkill?.length > 0 && (
              <EditDialog
                trigger={
                  <div className="hover:cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                      Soft Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {data.softSkill.map((skill: any, idx: number) => (
                        <span
                          key={idx}
                          className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm"
                        >
                          {skill.label}
                        </span>
                      ))}
                    </div>
                  </div>
                }
                title="Edit Soft Skills"
                description="Manage your interpersonal skills"
              >
                {(onClose) => (
                  <SkillEditForm
                    initialData={data.softSkill}
                    title="Soft Skills"
                    placeholder="Leadership, Communication..."
                    onSave={(value) => {
                      createFieldHandler("softSkill")(value);
                      onClose();
                    }}
                    onCancel={onClose}
                  />
                )}
              </EditDialog>
            )}
          </div>
        </>
      )}
    </div>
  );
};
