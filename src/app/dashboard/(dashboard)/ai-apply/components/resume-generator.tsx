"use client";
import { monthYear, normalizeToString } from "@/lib/utils/helpers";
import React, { useEffect } from "react";
import { sampleJobDescription, sampleUserProfile } from "@/types";
import { useResumeStream } from "@/hooks/stream-resume-hook";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const ResumeGenerator = ({
  handleStepChange,
}: {
  handleStepChange: (
    step: number,
    key: "resume" | "emailContent",
    value: any
  ) => void;
}) => {
  const { user } = useAuth();
  console.log("Authenticated user in ResumeTemplate:", user);
  const userProfile = sampleUserProfile;
  const jobDescription = sampleJobDescription;
  const endpoint =
    process.env.NEXT_PUBLIC_AUTH_API_URL + "/generate-resume-stream";
  const {
    streamData,
    streamStatus,

    startStream
  } = useResumeStream(endpoint);

  useEffect(() => {
    if (userProfile && jobDescription) {
      startStream(userProfile, jobDescription as any);
    }
  }, [userProfile, jobDescription]);

  useEffect(() => {
    if (streamStatus.completedSections.size === 6) {
      toast.success(
        "Resume generation complete! Proceeding to next step in the next 5 seconds..."
      );
      const streamedData = {
        profile: streamData.profile,
        educations,
        allSkills,
        certifications,
        projects,
        workExperiences,
      };
      setTimeout(() => {
        handleStepChange(1, "resume", streamedData);
      }, 5000);
    } else {
      // toast.success("There are some generations pending. Please wait...");
    }
  }, [streamStatus.completedSections.size]);
  // Handle different data structures for work experience
  const processWorkExperience = (workExp: any) => {
    if (!workExp) return [];

    // Handle different possible structures
    if (Array.isArray(workExp)) {
      return workExp;
    }

    if (typeof workExp === "object" && workExp.experiences) {
      return workExp.experiences;
    }

    // If it's a single object, wrap in array
    if (typeof workExp === "object") {
      return [workExp];
    }

    return [];
  };

  const processEducation = (education: any) => {
    if (!education) return [];

    if (Array.isArray(education)) {
      return education;
    }

    if (typeof education === "object" && education.degrees) {
      return education.degrees;
    }

    if (typeof education === "object") {
      return [education];
    }

    return [];
  };

  const processSkills = (skills: any) => {
    if (!skills) return [];

    if (Array.isArray(skills)) {
      return skills;
    }

    if (typeof skills === "object") {
      // Handle different skill structures
      if (skills.hardSkills || skills.softSkills) {
        return [...(skills.hardSkills || []), ...(skills.softSkills || [])];
      }
      if (skills.technical || skills.soft) {
        return [...(skills.technical || []), ...(skills.soft || [])];
      }
    }

    return [];
  };

  const processCertifications = (certifications: any) => {
    if (!certifications) return [];

    if (Array.isArray(certifications)) {
      return certifications;
    }

    if (typeof certifications === "object" && certifications.certifications) {
      return certifications.certifications;
    }

    if (typeof certifications === "object") {
      return [certifications];
    }

    return [];
  };

  const processProjects = (projects: any) => {
    if (!projects) return [];

    if (Array.isArray(projects)) {
      return projects;
    }

    if (typeof projects === "object" && projects.projects) {
      return projects.projects;
    }

    if (typeof projects === "object") {
      return [projects];
    }

    return [];
  };

  const workExperiences = processWorkExperience(streamData.workExperience);
  const educations = processEducation(streamData.education);
  const allSkills = processSkills(streamData.skills);
  const certifications = processCertifications(streamData.certifications);
  const projects = processProjects(streamData.projects);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Stream Status Indicator */}
      <div className="mb-4 p-3 rounded-lg border">
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`w-2 h-2 rounded-full ${
              streamStatus.isConnected
                ? "bg-green-500"
                : streamStatus.isComplete
                ? "bg-blue-500"
                : "bg-gray-400"
            }`}
          ></span>
          <span>
            {streamStatus.isConnected
              ? "Generating resume..."
              : streamStatus.isComplete
              ? "Resume generated!"
              : "Ready to generate"}
          </span>
          {streamStatus.completedSections.size > 0 && (
            <span className="">
              ({streamStatus.completedSections.size}/6 sections complete)
            </span>
          )}
        </div>
        {streamStatus.error && (
          <div className="mt-2 text-red-600 text-sm">
            Error: {streamStatus.error}
          </div>
        )}
      </div>

      {/* Profile/Summary Section */}
      <section className="mb-8">
        <h2 className="text-3xl font-bold border-b border-gray-300 pb-1 mb-2 font-serif">
          Summary
        </h2>
        <div className="leading-relaxed font-serif min-h-[2rem]">
          {streamData.profile ? (
            <p>{normalizeToString(streamData.profile)}</p>
          ) : (
            <div className="text-gray-400 italic">Generating summary...</div>
          )}
        </div>
      </section>

      {/* Work Experience Section */}
      <section className="mb-8">
        <h2 className="text-3xl font-bold border-b border-gray-300 pb-1 mb-2 font-serif">
          Work Experience
        </h2>
        {workExperiences.length > 0 ? (
          workExperiences.map((work: any, index: number) => {
            const responsibilities =
              work?.responsibilities || work?.description || [];
            let respArray = responsibilities;

            if (typeof responsibilities === "string") {
              respArray = responsibilities.includes(",")
                ? responsibilities.split(",").map((r: string) => r.trim())
                : [responsibilities];
            }

            return (
              <div key={index} className="mb-5">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold">
                    {work?.jobTitle || work?.title || "Job Title"} -{" "}
                    {work?.companyName || work?.company || "Company"}
                  </h3>
                  <span className="text-sm font-serif">
                    {monthYear(work?.jobStart || work?.startDate)} -{" "}
                    {monthYear(work?.jobEnd || work?.endDate)}
                  </span>
                </div>
                <p className="font-serif">{work?.location || ""}</p>
                <ul className="list-inside text-sm mt-2 space-y-1">
                  {Array.isArray(respArray) ? (
                    respArray.map((point: string, idx: number) => (
                      <li className="list-disc font-serif" key={idx}>
                        {point}
                      </li>
                    ))
                  ) : (
                    <li className="list-disc font-serif">{respArray}</li>
                  )}
                </ul>
              </div>
            );
          })
        ) : (
          <div className="text-gray-400 italic">
            Generating work experience...
          </div>
        )}
      </section>

      {/* Projects Section */}
      <section className="mb-8">
        <h2 className="text-3xl font-bold border-b border-gray-300 pb-1 mb-2 font-serif">
          Projects
        </h2>
        {projects.length > 0 ? (
          projects.map((project: any, index: number) => (
            <div key={index} className="mb-5">
              <div className="flex justify-between items-start">
                <h3 className="font-bold">{project?.name || "Project Name"}</h3>
                {project?.role && (
                  <span className="text-sm font-serif">{project.role}</span>
                )}
              </div>
              <p className="font-serif mt-1 mb-2">
                {project?.description || ""}
              </p>
              {project?.techStack && project.techStack.length > 0 && (
                <div className="mt-2">
                  <span className="text-sm font-semibold">Tech Stack: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.techStack.map((tech: string, techIdx: number) => (
                      <span
                        key={techIdx}
                        className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs font-serif"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-gray-400 italic">Generating projects...</div>
        )}
      </section>

      {/* Education Section */}
      <section className="mb-8">
        <h2 className="text-3xl font-bold border-b border-gray-300 pb-1 mb-2 font-serif">
          Education
        </h2>
        {educations.length > 0 ? (
          educations.map((edu: any, index: number) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between">
                <p className="font-bold font-serif">
                  {edu?.fieldOfStudy ||
                    edu?.field ||
                    edu?.major ||
                    "Field of Study"}
                </p>
                <span className="text-sm font-serif">
                  {monthYear(edu?.educationStart || edu?.startDate)} -{" "}
                  {monthYear(edu?.educationEnd || edu?.endDate)}
                </span>
              </div>
              <p className="text-sm font-serif">
                {edu?.degree || "Degree"} -{" "}
                {edu?.schoolLocation ||
                  edu?.institution ||
                  edu?.school ||
                  "School"}
              </p>
            </div>
          ))
        ) : (
          <div className="text-gray-400 italic">Generating education...</div>
        )}
      </section>

      {/* Certifications Section */}
      <section className="mb-8">
        <h2 className="text-3xl font-bold border-b border-gray-300 pb-1 mb-2 font-serif">
          Certifications
        </h2>
        {certifications.length > 0 ? (
          certifications.map((cert: any, index: number) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold font-serif">
                  {cert?.title || "Certification Title"}
                </h3>
                <div className="text-sm font-serif text-right">
                  {cert?.issueDate && <div>Issued: {cert.issueDate}</div>}
                  {cert?.expiryDate && <div>Expires: {cert.expiryDate}</div>}
                </div>
              </div>
              <p className="text-sm font-serif mb-1">
                {cert?.issuer || "Issuer"}
              </p>
              {cert?.description && (
                <p className="text-sm font-serif text-gray-600 mt-1">
                  {cert.description}
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="text-gray-400 italic">
            Generating certifications...
          </div>
        )}
      </section>

      {/* Skills Section */}
      <section>
        <h2 className="text-3xl font-bold border-b border-gray-300 pb-1 mb-2 font-serif">
          Skills
        </h2>
        {allSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2 text-sm">
            {allSkills.map((skill: any, index: number) => (
              <span key={index} className="px-2 py-1 rounded font-serif">
                {typeof skill === "object"
                  ? skill?.label || skill?.name
                  : skill}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 italic">Generating skills...</div>
        )}
      </section>

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === "development" && (
        <details className="mt-8 p-4 rounded">
          <summary className="cursor-pointer font-bold">Debug Info</summary>
          <pre className="mt-2 text-xs overflow-auto">
            {JSON.stringify({ streamData, streamStatus }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};
