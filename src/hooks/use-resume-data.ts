import { ResumeFormData } from "@/lib/schema-validations/resume.schema";
import { IUser } from "@/types";
import { useCallback, useState } from "react";

/**
 * Custom hook for managing resume data with optimistic updates
 * In production, this would integrate with TanStack Query
 */
export const useResumeData = (data: Partial<IUser>) => {
  console.log("Initializing useResumeData with data:", data);
  const [resumeData, setResumeData] = useState<ResumeFormData>(() => {
    if (data) return data;
    return {
      profile:
        "Experienced software engineer with a passion for building scalable applications.",
      education: [
        {
          educationId: crypto.randomUUID(),
          degree: "Bachelor of Science",
          fieldOfStudy: "Computer Science",
          schoolName: "Stanford University",
          educationStart: "2015-09",
          educationEnd: "2019-06",
          schoolLocation: "Stanford, CA",
        },
      ],
      workExperience: [
        {
          workExperienceId: crypto.randomUUID(),
          jobTitle: "Senior Software Engineer",
          companyName: "Tech Corp",
          location: "San Francisco, CA",
          jobStart: "2019-07",
          jobEnd: "2024-01",
          responsibilities: [
            "Developed responsive UI using React",
            "Collaborated with backend team to integrate APIs",
          ],
        },
      ],
      certification: [
        {
          certificationId: crypto.randomUUID(),
          title: "AWS Solutions Architect",
          issuer: "Amazon Web Services",
          issueDate: "2022-03",
          expiryDate: "2025-03",
          description: "Professional certification in cloud architecture",
        },
      ],
      project: [
        {
          projectId: crypto.randomUUID(),
          name: "E-Commerce Platform",
          description: "Built a scalable e-commerce platform serving 1M+ users",
          techStack: ["Next.js", "Node.js", "PostgreSQL"],
          role: "Lead Developer",
        },
      ],
      softSkill: [
        { label: "Communication", value: "communication" },
        { label: "Leadership", value: "leadership" },
      ],
      hardSkill: [
        { label: "React", value: "react" },
        { label: "TypeScript", value: "typescript" },
      ],
    };
  });

  console.count("USE RESUME DATA RENDER HOOK");
  // Optimistic update function
  const updateResumeData = useCallback(
    (updater: (prev: ResumeFormData) => ResumeFormData) => {
      console.log("Optimistically updating resume data...", updater);
      setResumeData(updater);
    },
    []
  );

  return { resumeData, updateResumeData };
};
