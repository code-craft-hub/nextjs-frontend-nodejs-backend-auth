// ============================================================================
// VALIDATION SCHEMAS (Following Zod Best Practices)
// ============================================================================

import z from "zod";

export const profileSchema = z.object({
  profile: z
    .string()
    .min(10, "Profile must be at least 10 characters")
    .max(1000),
});
export const educationSchema = z.object({
  educationId: z.string().uuid().optional(),
  degree: z.string().min(1, "Degree is required").max(100),
  fieldOfStudy: z.string().min(1, "Field of study is required").max(100),
  schoolName: z.string().min(1, "School name is required").max(150),
  educationStart: z.string().min(1, "Start date is required"),
  educationEnd: z.string().min(1, "End date is required"),
  schoolLocation: z.string().min(1, "Location is required").max(150),
});

export const workExperienceSchema = z.object({
  workExperienceId: z.string().uuid().optional(),
  jobTitle: z.string().min(1, "Job title is required").max(100),
  companyName: z.string().min(1, "Company name is required").max(150),
  location: z.string().min(1, "Location is required").max(150),
  jobStart: z.string().min(1, "Start date is required"),
  jobEnd: z.string().min(1, "End date is required"),
  responsibilities: z
    .array(z.string().min(1))
    .min(1, "At least one responsibility required"),
});

export const certificationSchema = z.object({
  certificationId: z.string().uuid().optional(),
  title: z.string().min(1, "Title is required").max(150),
  issuer: z.string().min(1, "Issuer is required").max(150),
  issueDate: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().optional(),
  description: z.string().max(500).optional(),
});

export const projectSchema = z.object({
  projectId: z.string().uuid().optional(),
  name: z.string().min(1, "Project name is required").max(150),
  description: z.string().min(1, "Description is required").max(500),
  techStack: z
    .array(z.string().min(1))
    .min(1, "At least one technology required"),
  role: z.string().min(1, "Role is required").max(100),
});

export const skillSchema = z.object({
  label: z.string().min(1, "Label is required"),
  value: z.string().min(1, "Value is required"),
});

export const resumeSchema = z.object({
  profile: z
    .string()
    .min(10, "Profile must be at least 10 characters")
    .max(1000),
  education: z.array(educationSchema),
  workExperience: z.array(workExperienceSchema),
  certification: z.array(certificationSchema),
  project: z.array(projectSchema),
  softSkill: z.array(skillSchema),
  hardSkill: z.array(skillSchema),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type ResumeFormData = z.infer<typeof resumeSchema>;
export type EducationFormData = z.infer<typeof educationSchema>;
export type WorkExperienceFormData = z.infer<typeof workExperienceSchema>;
export type CertificationFormData = z.infer<typeof certificationSchema>;
export type ProjectFormData = z.infer<typeof projectSchema>;
export type SkillFormData = z.infer<typeof skillSchema>;
