import { Card } from "@/components/ui/card";
import {
  coalesceString,
  isValidArray,
  monthYear,
  normalizeToString,
  parseResponsibilities,
} from "@/lib/utils/helpers";
import { PreviewResumeProps } from "@/types";
import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries/user.queries";

const StreamingSkeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

type ViewResumeProps = Omit<PreviewResumeProps, "resumeId"> & {
  handleEditClick: (value: boolean) => void;
};

export const ViewResume: React.FC<ViewResumeProps> = ({
  data,
  isStreaming,
  handleEditClick,
}) => {
  const { data: user } = useQuery(userQueries.detail());
  const contentRef = useRef<HTMLDivElement>(null);

  const firstName = coalesceString(data?.firstName, user?.firstName);
  const lastName = coalesceString(data?.lastName, user?.lastName);
  const email = coalesceString(data?.email, user?.email);
  const phoneNumber = coalesceString(data?.phoneNumber, user?.phoneNumber);
  const address = coalesceString(data?.address, user?.address);
  const portfolio = coalesceString(data?.portfolio);

  const fullName = `${firstName} ${lastName}`.trim();

  const contactInfo = [email, phoneNumber, address, portfolio]
    .filter(Boolean)
    .join(" | ");

  const profile = normalizeToString(data?.description || data?.profile);
  const hasProfile = profile && profile.trim().length > 0;

  const hasWorkExperience = isValidArray(data?.workExperience);
  const hasEducation = isValidArray(data?.education);
  const hasCertifications = isValidArray(data?.certification);
  const hasProjects = isValidArray(data?.project);
  const hasSoftSkills = isValidArray(data?.softSkill);
  const hasHardSkills = isValidArray(data?.hardSkill);

  return (
    <Card
      onClick={() => {
        handleEditClick(true);
      }}
      className="text-gray-800 font-merriweather relative rounded-xl p-4  py-16 sm:px-12 sm:py-24 animate-fadeIn"
    >
      <header className="text-center">
        <h1 className="text-4xl font-bold font-merriweather">{fullName}</h1>
        {contactInfo && (
          <p className="text-lg text-gray-600 font-merriweather mt-2">
            {contactInfo}
          </p>
        )}
      </header>
      <section className="mb-4">
        <h2 className="text-3xl font-bold border-b border-gray-300 pb-1 mb-2 font-merriweather">
          Summary
        </h2>
        {hasProfile ? (
          <p className="leading-relaxed font-merriweather whitespace-pre-wrap">
            {normalizeToString(profile)}
          </p>
        ) : isStreaming ? (
          <div className="space-y-2">
            <StreamingSkeleton className="h-4 w-full" />
            <StreamingSkeleton className="h-4 w-5/6" />
            <StreamingSkeleton className="h-4 w-4/6" />
          </div>
        ) : null}
      </section>
      {hasWorkExperience && (
        <section className="mb-4 ">
          <h2 className="text-3xl font-bold border-b border-gray-300 pb-1 mb-2 font-merriweather">
            Work Experience
          </h2>
          {hasWorkExperience ? (
            data.workExperience?.map((work, index) => {
              const responsibilities = parseResponsibilities(
                work?.responsibilities,
              );
              const achievements = parseResponsibilities(work?.achievements);

              return (
                <div
                  key={`work-${index}-${work?.companyName || ""}`}
                  className="mb-5"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold font-merriweather">
                      {work?.jobTitle || ""} -{work?.companyName || ""}
                    </h3>
                    {(work?.startDate || work?.endDate) && (
                      <span className="text-sm text-gray-500 font-merriweather">
                        {work?.startDate
                          ? monthYear(work.startDate)
                          : "Present"}
                        -{work?.endDate ? monthYear(work.endDate) : "Present"}
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
                  {achievements.length > 0 && responsibilities.length === 0 && (
                    <ul className="list-inside text-sm mt-2 space-y-1">
                      {achievements.map((point: string, idx: number) => (
                        <li
                          key={`ach-${index}-${idx}`}
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
      )}
      {hasEducation && (
        <section className="mb-4">
          <h2 className="text-3xl font-bold border-b border-gray-300 pb-1 mb-2 font-merriweather">
            Education
          </h2>
          {hasEducation ? (
            data.education?.map((edu, index) => (
              <div key={`edu-${index}-${edu?.location || ""}`} className="mb-4">
                <div className="flex justify-between">
                  <p className="font-bold font-merriweather">
                    {edu?.fieldOfStudy || ""}
                  </p>
                  {(edu?.startDate || edu?.endDate) && (
                    <span className="text-sm text-gray-500 font-merriweather">
                      {edu?.startDate ? monthYear(edu.startDate) : ""} -{" "}
                      {edu?.endDate ? monthYear(edu.endDate) : "Present"}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 font-merriweather">
                  {edu?.degree || ""} - {edu?.location || ""}
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
      )}

      {hasCertifications && (
        <section className="mb-4">
          <h2 className="text-3xl font-bold border-b border-gray-300 pb-1 mb-2 font-merriweather">
            Certifications
          </h2>
          <div className="space-y-4">
            {hasCertifications ? (
              data.certification?.map((cert, index) => (
                <div
                  key={`cert-${index}-${cert?.title || ""}`}
                  className="space-y-1"
                >
                  <div className="flex justify-between">
                    <p className="font-bold font-merriweather">
                      {cert?.title || ""}
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
      )}
      {hasProjects && (
        <section className="mb-4">
          <h2 className="text-2xl font-semibold border-b border-gray-300 pb-1 mb-2 font-merriweather">
            Projects
          </h2>
          <div className="space-y-4">
            {hasProjects ? (
              data.project?.map((project, index) => (
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
      )}
      {(hasSoftSkills || hasHardSkills) && (
        <section>
          <h2 className="text-3xl font-bold border-b border-gray-300 pb-1 mb-2 font-merriweather">
            Skills
          </h2>

          <div className="mb-4 hover:cursor-pointer">
            <h3 className="text-sm font-semibold text-gray-600 mb-2 font-merriweather">
              Soft Skills
            </h3>
            <div className="flex flex-wrap gap-2 text-sm">
              {data.softSkill?.map((skill, index) => (
                <span
                  key={`soft-${index}-${skill?.label || ""}`}
                  className="px-2 py-1 bg-gray-100 rounded font-merriweather"
                >
                  {skill.label}
                </span>
              ))}
            </div>
          </div>

          <div className="hover:cursor-pointer">
            <h3 className="text-sm font-semibold text-gray-600 mb-2 font-merriweather">
              Technical Skills
            </h3>
            <div className="flex flex-wrap gap-2 text-sm">
              {data.hardSkill?.map((skill, index) => (
                <span
                  key={`hard-${index}-${skill || ""}`}
                  className="px-2 py-1 bg-gray-100 rounded font-merriweather"
                >
                  {skill?.label}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}
      <div ref={contentRef} />
    </Card>
  );
};
