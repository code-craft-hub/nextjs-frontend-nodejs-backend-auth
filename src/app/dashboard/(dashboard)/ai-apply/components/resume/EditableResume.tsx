import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  isValidArray,
  monthYear,
  normalizeToString,
  parseResponsibilities,
} from "@/lib/utils/helpers";
import { PreviewResumeProps, ResumeField } from "@/types";
import { memo, useCallback } from "react";
import { ProfileEditForm } from "./form/ProfileEditForm";
import { EditDialog } from "./form/EditDialog";
import { WorkExperienceEditForm } from "./form/WorkExperienceEditForm";
import { EducationEditForm } from "./form/EducationEditForm";
import { ProjectEditForm } from "./form/ProjectEditForm";
import { SkillEditForm } from "./form/SkillEditForm";
import { Badge } from "lucide-react";
import { CertificationEditForm } from "./form/CertificationEditForm";

const SectionWrapper = memo(
  ({ children, show }: { children: React.ReactNode; show: boolean }) => {
    if (!show) return null;
    return <div className="bg-white p-4">{children}</div>;
  }
);

SectionWrapper.displayName = "SectionWrapper";

const StreamingSkeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const EditableResume: React.FC<PreviewResumeProps> = ({
  data,
  isStreaming = false,
  pause,
  cancelTimeout,
  onUpdate,
}) => {
  const { user } = useAuth();

  const firstName =  user?.firstName || "";//data?.firstName ||
  const lastName =  user?.lastName || "";//data?.lastName ||
  const fullName = `${firstName} ${lastName}`.trim();

  const contactInfo = [
     user?.email,//data?.email ||
     user?.phoneNumber,//data?.phoneNumber ||
    // data?.address,
    // data?.portfolio,
  ]
    .filter(Boolean)
    .join(" | ");

  const profile = normalizeToString(data?.profile);
  const hasProfile = profile && profile.trim().length > 0;

  const hasWorkExperience = isValidArray(data?.workExperience);
  const hasEducation = isValidArray(data?.education);
  const hasCertifications = isValidArray(data?.certification);
  const hasProjects = isValidArray(data?.project);
  const hasSoftSkills = isValidArray(data?.softSkill);
  const hasHardSkills = isValidArray(data?.hardSkill);
  const hasSkills = hasSoftSkills || hasHardSkills;

  const createFieldHandler = useCallback(
    <T,>(field: ResumeField) =>
      (value: T) => {
        onUpdate(field, value);
      },
    [onUpdate]
  );

  return (
    <Card
      className={cn(
        "max-w-screen-lg p-4 sm:px-5 text-gray-800 font-merriweather py-16 relative",
        pause && "bg-gray-300"
      )}
    >
      <Button
        variant={"outline"}
        onClick={() => {
          if (cancelTimeout) cancelTimeout();
        }}
        className="absolute top-3 right-3 text-3xs"
      >
        Pause and Edit.
      </Button>{" "}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-merriweather">
          {fullName ||
            (isStreaming && (
              <StreamingSkeleton className="h-10 w-64 mx-auto" />
            ))}
        </h1>
        {contactInfo && (
          <p className="text-lg text-gray-600 font-merriweather mt-2">
            {contactInfo}
          </p>
        )}
      </header>
      <EditDialog
        trigger={
          <SectionWrapper show={hasProfile || isStreaming}>
            <section className="mb-4">
              <h2 className="text-3xl font-bold border-b border-gray-300 pb-1 mb-2 font-merriweather">
                Summary
              </h2>
              {hasProfile ? (
                <p className="leading-relaxed font-merriweather whitespace-pre-wrap">
                  {profile}
                </p>
              ) : isStreaming ? (
                <div className="space-y-2">
                  <StreamingSkeleton className="h-4 w-full" />
                  <StreamingSkeleton className="h-4 w-5/6" />
                  <StreamingSkeleton className="h-4 w-4/6" />
                </div>
              ) : null}
            </section>
          </SectionWrapper>
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
      <EditDialog
        className="w-full"
        trigger={
          <SectionWrapper show={hasWorkExperience || isStreaming}>
            <section className="mb-4">
              <h2 className="text-3xl font-bold border-b border-gray-300 pb-1 mb-2 font-merriweather">
                Work Experience
              </h2>
              {hasWorkExperience ? (
                data.workExperience!.map((work, index) => {
                  const responsibilities = parseResponsibilities(
                    work?.responsibilities
                  );

                  return (
                    <div
                      key={`work-${index}-${work?.companyName || ""}`}
                      className="mb-5"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold font-merriweather">
                          {work?.jobTitle || "Position"} -{" "}
                          {work?.companyName || "Company"}
                        </h3>
                        {(work?.jobStart || work?.jobEnd) && (
                          <span className="text-sm text-gray-500 font-merriweather">
                            {work?.jobStart
                              ? monthYear(work.jobStart)
                              : "Present"}{" "}
                            -{" "}
                            {work?.jobEnd ? monthYear(work.jobEnd) : "Present"}
                          </span>
                        )}
                      </div>
                      {work?.location && (
                        <p className="text-gray-600 font-merriweather">
                          {work.location}
                        </p>
                      )}
                      {responsibilities.length > 0 && (
                        <ul className="list-inside text-sm mt-2 space-y-1">
                          {responsibilities.map(
                            (point: string, idx: number) => (
                              <li
                                key={`resp-${index}-${idx}`}
                                className="list-disc font-merriweather ml-4"
                              >
                                {point}
                              </li>
                            )
                          )}
                        </ul>
                      )}
                    </div>
                  );
                })
              ) : isStreaming ? (
                <div className="space-y-4">
                  <StreamingSkeleton className="h-16 w-full" />
                  <StreamingSkeleton className="h-16 w-full" />
                </div>
              ) : null}
            </section>
          </SectionWrapper>
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
      <EditDialog
        trigger={
          <SectionWrapper show={hasEducation || isStreaming}>
            <section className="mb-4">
              <h2 className="text-3xl font-bold border-b border-gray-300 pb-1 mb-2 font-merriweather">
                Education
              </h2>
              {hasEducation ? (
                data.education!.map((edu, index) => (
                  <div
                    key={`edu-${index}-${edu?.schoolLocation || ""}`}
                    className="mb-4"
                  >
                    <div className="flex justify-between">
                      <p className="font-bold font-merriweather">
                        {edu?.fieldOfStudy || "Field of Study"}
                      </p>
                      {(edu?.educationStart || edu?.educationEnd) && (
                        <span className="text-sm text-gray-500 font-merriweather">
                          {edu?.educationStart
                            ? monthYear(edu.educationStart)
                            : ""}{" "}
                          -{" "}
                          {edu?.educationEnd
                            ? monthYear(edu.educationEnd)
                            : "Present"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 font-merriweather">
                      {edu?.degree || "Degree"} -{" "}
                      {edu?.schoolLocation || "Location"}
                    </p>
                    {edu?.academicAchievements && (
                      <p className="text-sm text-gray-600 font-merriweather mt-1">
                        {edu.academicAchievements}
                      </p>
                    )}
                  </div>
                ))
              ) : isStreaming ? (
                <div className="space-y-4">
                  <StreamingSkeleton className="h-20 w-full" />
                </div>
              ) : null}
            </section>
          </SectionWrapper>
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
      </EditDialog>{" "}
      <EditDialog
        trigger={
          <SectionWrapper show={hasCertifications || isStreaming}>
            <section className="mb-4">
              <h2 className="text-3xl font-bold border-b border-gray-300 pb-1 mb-2 font-merriweather">
                Certifications
              </h2>
              <div className="space-y-4">
                {hasCertifications ? (
                  data.certification!.map((cert, index) => (
                    <div
                      key={`cert-${index}-${cert?.title || ""}`}
                      className="space-y-1"
                    >
                      <div className="flex justify-between">
                        <p className="font-bold font-merriweather">
                          {cert?.title || "Certification"}
                        </p>
                        {cert?.issueDate && (
                          <p className="text-sm text-gray-500 font-merriweather">
                            {cert.issueDate}
                          </p>
                        )}
                      </div>
                      {cert?.issuer && (
                        <div className="font-light font-merriweather text-sm">
                          {cert.issuer}
                        </div>
                      )}
                      {cert?.description && (
                        <div className="text-sm font-merriweather text-gray-700">
                          {cert.description}
                        </div>
                      )}
                    </div>
                  ))
                ) : isStreaming ? (
                  <StreamingSkeleton className="h-16 w-full" />
                ) : null}
              </div>
            </section>
          </SectionWrapper>
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
      <EditDialog
        trigger={
          <SectionWrapper show={hasProjects || isStreaming}>
            <section className="mb-4">
              <h2 className="text-2xl font-semibold border-b border-gray-300 pb-1 mb-2 font-merriweather">
                Projects
              </h2>
              <div className="space-y-4">
                {hasProjects ? (
                  data.project!.map((project, index) => (
                    <div
                      key={`project-${index}-${project?.name || ""}`}
                      className="space-y-1"
                    >
                      {project?.name && (
                        <p className="font-bold font-merriweather">
                          {project.name}
                        </p>
                      )}
                      {project?.description && (
                        <p className="text-sm font-merriweather text-gray-700">
                          {project.description}
                        </p>
                      )}
                      {project?.role && (
                        <div className="text-sm font-merriweather">
                          <span className="font-semibold">Role:</span>{" "}
                          {project.role}
                        </div>
                      )}
                      {project?.techStack &&
                        isValidArray(project.techStack) && (
                          <div className="text-sm font-merriweather text-gray-600">
                            <span className="font-semibold">Tech Stack:</span>{" "}
                            {project.techStack.join(", ")}
                          </div>
                        )}
                    </div>
                  ))
                ) : isStreaming ? (
                  <StreamingSkeleton className="h-20 w-full" />
                ) : null}
              </div>
            </section>
          </SectionWrapper>
        }
        title="Edit Projects"
        description="Showcase your notable projects and contributions"
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
      <EditDialog
        trigger={
          <SectionWrapper show={hasSkills || isStreaming}>
            <section>
              <h2 className="text-3xl font-bold border-b border-gray-300 pb-1 mb-2 font-merriweather">
                Skills
              </h2>
              {hasSoftSkills && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2 font-merriweather">
                    Soft Skills
                  </h3>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {data.softSkill!.map((skill, index) => (
                      <span
                        key={`soft-${index}-${skill?.label || ""}`}
                        className="px-2 py-1 bg-gray-100 rounded font-merriweather"
                      >
                        {skill?.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Hard Skills */}
              {hasHardSkills && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2 font-merriweather">
                    Technical Skills
                  </h3>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {data.hardSkill!.map((skill, index) => (
                      <span
                        key={`hard-${index}-${skill?.label || ""}`}
                        className="px-2 py-1 bg-gray-100 rounded font-merriweather"
                      >
                        {skill?.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {isStreaming && !hasSkills && (
                <div className="space-y-2">
                  <StreamingSkeleton className="h-8 w-full" />
                  <StreamingSkeleton className="h-8 w-5/6" />
                </div>
              )}
            </section>
          </SectionWrapper>
        }
        title="Edit Technical Skills"
        description="Manage your technical and hard skills"
      >
        {(onClose) => (
          <SkillEditForm
            initialData={data.hardSkill}
            title="Technical Skills"
            placeholder="React, Python, AWS..."
            onSave={(value) => {
              createFieldHandler("hardSkill")(value);
              onClose();
            }}
            onCancel={onClose}
          />
        )}
      </EditDialog>
      <EditDialog
        trigger={
          <>
            {data.softSkill!.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Soft Skills
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.softSkill?.map((skill, idx) => (
                    <Badge key={idx}>{skill.label}</Badge>
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
            onSave={(value) => {
              createFieldHandler("softSkill")(value);
              onClose();
            }}
            onCancel={onClose}
          />
        )}
      </EditDialog>
    </Card>
  );
};
