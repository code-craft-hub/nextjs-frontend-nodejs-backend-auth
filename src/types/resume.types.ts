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
  description?: string;
  fileName?: string;
  originalName?: string;
  isDefault: boolean;
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
