import z from "zod";

export const profileSchema = z.object({
  profile: z
    .string()
    .min(10, "Profile must be at least 10 characters")
    .optional(),
});

export const educationSchema = z.object({
  educationId: z.uuid().optional(),
  degree: z.string().min(1, "Degree is required").optional(),
  fieldOfStudy: z.string().min(1, "Field of study is required").optional(),
  schoolName: z.string().min(1, "School name is required").optional(),
  educationStart: z.string().min(1, "Start date is required").optional(),
  educationEnd: z.string().min(1, "End date is required").optional(),
  schoolLocation: z.string().min(1, "Location is required").optional(),
});

export const workExperienceSchema = z.object({
  workExperienceId: z.uuid().optional(),
  jobTitle: z.string("Job title is required").optional(),
  companyName: z.string("Company name is required").optional(),
  location: z.string("Location is required").optional(),
  jobStart: z.string("Start date is required").optional(),
  jobEnd: z.string("End date is required").optional(),
  responsibilities: z
    .array(z.string().min(1))
    .min(1, "At least one responsibility required")
    .optional(),
});

export const certificationSchema = z.object({
  certificationId: z.uuid().optional(),
  title: z.string().min(1, "Title is required").optional(),
  issuer: z.string().min(1, "Issuer is required").optional(),
  issueDate: z.string().min(1, "Issue date is required").optional(),
  expiryDate: z.string().optional(),
  description: z.string().optional(),
});

export const projectSchema = z.object({
  projectId: z.uuid().optional(),
  name: z.string().min(1, "Project name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  techStack: z
    .array(z.string().min(1))
    .min(1, "At least one technology required")
    .optional(),
  role: z.string().min(1, "Role is required").optional(),
});

export const skillSchema = z.object({
  label: z.string().min(1, "Label is required").optional(),
  value: z.string().min(1, "Value is required").optional(),
});

export const resumeSchema = z.object({
  profile: profileSchema.shape.profile,
  education: z.array(educationSchema).optional().default([]),
  workExperience: z.array(workExperienceSchema).optional().default([]),
  certification: z.array(certificationSchema).optional().default([]),
  project: z.array(projectSchema).optional().default([]),
  softSkill: z.array(skillSchema).optional().default([]),
  hardSkill: z.array(skillSchema).optional().default([]),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type ResumeFormData = z.infer<typeof resumeSchema>;
export type EducationFormData = z.infer<typeof educationSchema>;
export type WorkExperienceFormData = z.infer<typeof workExperienceSchema>;
export type CertificationFormData = z.infer<typeof certificationSchema>;
export type ProjectFormData = z.infer<typeof projectSchema>;
export type SkillFormData = z.infer<typeof skillSchema>;
