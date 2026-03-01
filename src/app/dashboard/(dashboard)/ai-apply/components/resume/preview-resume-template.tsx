import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { userQueries } from "@module/user";
import { cn } from "@/lib/utils";
import { monthYear, normalizeToString } from "@/lib/utils/helpers";
import { ResumeFormData } from "@/lib/schema-validations/resume.schema";
import { useQuery } from "@tanstack/react-query";
import { memo } from "react";

type PreviewResumeData = Partial<ResumeFormData> & {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  portfolio?: string;
};

interface PreviewResumeProps {
  data: PreviewResumeData;
  isStreaming?: boolean;
  pause?: boolean;
  cancelTimeout?: () => void;
}

/**
 * Memoized section wrapper for performance during streaming
 */
const SectionWrapper = memo(
  ({ children, show }: { children: React.ReactNode; show: boolean }) => {
    if (!show) return null;
    return <div className="bg-white p-4">{children}</div>;
  }
);

SectionWrapper.displayName = "SectionWrapper";

/**
 * Streaming skeleton for loading states
 */
const StreamingSkeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

/**
 * Safe array checker that handles streaming data
 */
const isValidArray = (arr: any): arr is any[] => {
  return Array.isArray(arr) && arr.length > 0;
};

/**
 * Parse responsibilities into array format
 */
const parseResponsibilities = (responsibilities: any): string[] => {
  if (!responsibilities) return [];

  if (Array.isArray(responsibilities)) {
    return responsibilities;
  }

  if (typeof responsibilities === "string") {
    return responsibilities.includes(",")
      ? responsibilities
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean)
      : [responsibilities];
  }

  return [];
};

/**
 * Enterprise-grade resume preview with incremental streaming support
 * Renders content as it becomes available without waiting for complete data
 */
export const PreviewResume = ({
  data,
  isStreaming = false,
  pause,
  cancelTimeout,
}: PreviewResumeProps) => {
  const { data: user } = useQuery(userQueries.detail());

  // Compute all derived values at the top level (no conditional hooks)
  const firstName = data?.firstName || user?.firstName || "";
  const lastName = data?.lastName || user?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();

  const contactInfo = [
    data?.email || user?.email,
    data?.phoneNumber || user?.phoneNumber,
    data?.address,
    data?.portfolio,
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

  return (
    <Card className={cn("max-w-5xl p-4 sm:px-5 text-gray-800 font-merriweather py-16 relative", pause && "bg-gray-300")}>
      <Button
        variant={"outline"}
        onClick={() => {
          if (cancelTimeout) cancelTimeout();
        }}
        className="absolute top-3 right-3 text-3xs"
      >
        Pause and Edit.
      </Button>
      {/* Header - Always visible */}
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

      {/* Summary Section - Streams character by character */}
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

      {/* Work Experience - Renders items incrementally */}
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
                    {(work?.startDate || work?.endDate) && (
                      <span className="text-sm text-gray-500 font-merriweather">
                        {work?.startDate ? monthYear(work.startDate) : "Present"}{" "}
                        - {work?.endDate ? monthYear(work.endDate) : "Present"}
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
                      {responsibilities.map((point: string, idx: number) => (
                        <li
                          key={`resp-${index}-${idx}`}
                          className="list-disc font-merriweather ml-4"
                        >
                          {point}
                        </li>
                      ))}
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

      {/* Education - Renders items incrementally */}
      <SectionWrapper show={hasEducation || isStreaming}>
        <section className="mb-4">
          <h2 className="text-3xl font-bold border-b border-gray-300 pb-1 mb-2 font-merriweather">
            Education
          </h2>
          {hasEducation ? (
            data.education!.map((edu, index) => (
              <div
                key={`edu-${index}-${edu?.location || ""}`}
                className="mb-4"
              >
                <div className="flex justify-between">
                  <p className="font-bold font-merriweather">
                    {edu?.fieldOfStudy || "Field of Study"}
                  </p>
                  {(edu?.startDate || edu?.endDate) && (
                    <span className="text-sm text-gray-500 font-merriweather">
                      {edu?.startDate ? monthYear(edu.startDate) : ""}{" "}
                      -{" "}
                      {edu?.endDate
                        ? monthYear(edu.endDate)
                        : "Present"}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 font-merriweather">
                  {edu?.degree || "Degree"} -{" "}
                  {edu?.location || "Location"}
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

      {/* Certifications - Renders items incrementally */}
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

      {/* Projects - Renders items incrementally */}
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
                  {project?.techStack && isValidArray(project.techStack) && (
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

      {/* Skills - Renders incrementally */}
      <SectionWrapper show={hasSkills || isStreaming}>
        <section>
          <h2 className="text-3xl font-bold border-b border-gray-300 pb-1 mb-2 font-merriweather">
            Skills
          </h2>

          {/* Soft Skills */}
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

          {/* Streaming placeholder */}
          {isStreaming && !hasSkills && (
            <div className="space-y-2">
              <StreamingSkeleton className="h-8 w-full" />
              <StreamingSkeleton className="h-8 w-5/6" />
            </div>
          )}
        </section>
      </SectionWrapper>
    </Card>
  );
};
