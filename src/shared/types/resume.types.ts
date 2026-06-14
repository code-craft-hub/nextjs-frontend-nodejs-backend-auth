export interface WorkExperienceEntry {
  id?: string;
  resumeId?: string;
  userId?: string;
  position?: string;
  jobTitle?: string;
  companyName?: string;
  employmentType?: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  isCurrent?: boolean;
  location?: string;
  description?: string;
  responsibilities?: string[];
  achievements?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface EducationEntry {
  id?: string;
  resumeId?: string;
  userId?: string;
  degree?: string;
  location?: string;
  schoolName?: string;
  degreeType?: string;
  fieldOfStudy?: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  isCurrent?: boolean;
  academicAchievements?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectEntry {
  id?: string;
  resumeId?: string;
  userId?: string;
  name?: string;
  description?: string;
  url?: string;
  githubUrl?: string;
  displayOrder?: number;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  isCurrent?: boolean;
  responsibilities?: string[];
  techStack?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CertificationEntry {
  id?: string;
  resumeId?: string;
  userId?: string;
  name?: string;
  title?: string;
  issuer?: string;
  description?: string;
  issueDate?: string | Date | null;
  expiryDate?: string | Date | null;
  doesNotExpire?: boolean;
  credentialId?: string;
  credentialUrl?: string;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SkillEntry {
  label: string;
  value: string;
}

// ─── Gap Analysis (Pipeline B) ────────────────────────────────────────────────

export interface GapSkillSuggestion {
  label: string;
  category: "hard" | "soft";
  reason: string;
  priority: "high" | "medium" | "low";
  /** true = user likely has this skill but didn't list it; false = needs to acquire it */
  actionable: boolean;
}

export interface GapCertificationSuggestion {
  name: string;
  issuer: string | null;
  reason: string;
  priority: "high" | "medium" | "low";
}

export interface GapExperienceItem {
  area: string;
  suggestion: string;
}

export interface GapAnalysisResult {
  matchScore: number;
  summary: string;
  skills: {
    toAdd: GapSkillSuggestion[];
  };
  certifications: GapCertificationSuggestion[];
  /** ATS keywords present in the JD but absent from the profile (max 10) */
  keywords: string[];
  experienceGaps: GapExperienceItem[];
}

export interface ResumeAggregate {
  id: string;
  userId: string;
  title?: string;
  type?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  location?: string;
  linkedIn?: string;
  github?: string;
  website?: string;
  summary?: string;
  fileName?: string;
  gcsPath?: string;
  originalName?: string;
  isDefault: boolean;
  jobLevel: string ;
  jobType: string ;
  remotePreference: boolean ;
  relocationWillingness: boolean ;
  salary: string ;
  availabilityToStart: string ;
  rawResumeText?: string;
  createdAt?: string;
  updatedAt?: string;
  workExperience: WorkExperienceEntry[];
  education: EducationEntry[];
  project: ProjectEntry[];
  certification: CertificationEntry[];
  hardSkill: SkillEntry[];
  softSkill: SkillEntry[];
}
