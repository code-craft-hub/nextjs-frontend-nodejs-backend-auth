import type {
  ResumeAggregate,
  WorkExperienceEntry,
  EducationEntry,
  ProjectEntry,
  CertificationEntry,
} from "@/types/resume.types";
import { api } from "./client";
import type { PaginatedResponse, PaginationParams } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────

export interface CreateResumeData {
  title: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  location?: string;
  linkedIn?: string;
  website?: string;
  description?: string;
  type?: string;
}

export interface UpdateResumeData {
  title?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  location?: string;
  linkedIn?: string;
  github?: string;
  website?: string;
  summary?: string;
  description?: string;
  jobLevelPreference?: string;
  jobTypePreference?: string;
  remoteWorkPreference?: string;
  relocationWillingness?: string;
  salaryExpectation?: string;
  availabilityToStart?: string;
}

export interface ResumeFilters extends PaginationParams {
  template?: string;
  search?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ─── API Client ───────────────────────────────────────────────────

export const RESUME_BASE = `/resumes`;

export const resumeApi = {
  // ─── Resume CRUD ──────────────────────────────────────────────

  createResume: (data: CreateResumeData, token?: string) =>
    api.post<ApiResponse<ResumeAggregate>>(RESUME_BASE, data, { token }),

  createNewResume: (data: CreateResumeData, token?: string) =>
    api.post<ApiResponse<ResumeAggregate>>(RESUME_BASE + "/new", data, {
      token,
    }),

  autoNewResume: (title: string, token?: string) =>
    api.post<ApiResponse<ResumeAggregate>>(
      RESUME_BASE + "/generate",
      { title },
      {
        token,
      },
    ),

  getResumes: (params?: ResumeFilters, token?: string) =>
    api.get<PaginatedResponse<ResumeAggregate>>(
      `${RESUME_BASE}?` +
        new URLSearchParams(params as Record<string, string>).toString(),
      { token },
    ),

  listUploaded: async (params?: ResumeFilters, token?: string) => {
    const data = await api.get<ApiResponse<ResumeAggregate[]>>(
      `${RESUME_BASE}/uploaded?` +
        new URLSearchParams(params as Record<string, string>).toString(),
      { token },
    );

    if (data?.success) return data.data;
    throw new Error("Failed to fetch user data");
  },

  getResume: async (id: string, token?: string) => {
    const response = await api.get<ApiResponse<ResumeAggregate>>(
      `${RESUME_BASE}/${id}`,
      { token },
    );
    return response.data;
  },

  updateResume: (id: string, data: UpdateResumeData, token?: string) =>
    api.patch<ApiResponse<ResumeAggregate>>(`${RESUME_BASE}/${id}`, data, {
      token,
    }),

  deleteResume: (id: string, token?: string) =>
    api.delete<void>(`${RESUME_BASE}/${id}`, { token }),

  hardDeleteResume: (id: string, token?: string) =>
    api.delete<void>(`${RESUME_BASE}/${id}/hard-delete`, { token }),

  // ─── Work Experience CRUD ─────────────────────────────────────

  createWorkExperience: (
    resumeId: string,
    data: Partial<WorkExperienceEntry>,
    token?: string,
  ) =>
    api.post<ApiResponse<WorkExperienceEntry>>(
      `${RESUME_BASE}/${resumeId}/work-experiences`,
      data,
      { token },
    ),

  getWorkExperiences: (resumeId: string, token?: string) =>
    api.get<ApiResponse<WorkExperienceEntry[]>>(
      `${RESUME_BASE}/${resumeId}/work-experiences`,
      { token },
    ),

  updateWorkExperience: (
    resumeId: string,
    id: string,
    data: Partial<WorkExperienceEntry>,
    token?: string,
  ) =>
    api.patch<ApiResponse<WorkExperienceEntry>>(
      `${RESUME_BASE}/${resumeId}/work-experiences/${id}`,
      data,
      { token },
    ),

  deleteWorkExperience: (resumeId: string, id: string, token?: string) =>
    api.delete<ApiResponse<WorkExperienceEntry>>(
      `${RESUME_BASE}/${resumeId}/work-experiences/${id}`,
      { token },
    ),

  // ─── Education CRUD ───────────────────────────────────────────

  createEducation: (
    resumeId: string,
    data: Partial<EducationEntry>,
    token?: string,
  ) =>
    api.post<ApiResponse<EducationEntry>>(
      `${RESUME_BASE}/${resumeId}/educations`,
      data,
      { token },
    ),

  getEducations: (resumeId: string, token?: string) =>
    api.get<ApiResponse<EducationEntry[]>>(
      `${RESUME_BASE}/${resumeId}/educations`,
      { token },
    ),

  updateEducation: (
    resumeId: string,
    id: string,
    data: Partial<EducationEntry>,
    token?: string,
  ) =>
    api.patch<ApiResponse<EducationEntry>>(
      `${RESUME_BASE}/${resumeId}/educations/${id}`,
      data,
      { token },
    ),

  deleteEducation: (resumeId: string, id: string, token?: string) =>
    api.delete<ApiResponse<EducationEntry>>(
      `${RESUME_BASE}/${resumeId}/educations/${id}`,
      { token },
    ),

  // ─── Project CRUD ─────────────────────────────────────────────

  createProject: (
    resumeId: string,
    data: Partial<ProjectEntry>,
    token?: string,
  ) =>
    api.post<ApiResponse<ProjectEntry>>(
      `${RESUME_BASE}/${resumeId}/projects`,
      data,
      { token },
    ),

  getProjects: (resumeId: string, token?: string) =>
    api.get<ApiResponse<ProjectEntry[]>>(
      `${RESUME_BASE}/${resumeId}/projects`,
      { token },
    ),

  updateProject: (
    resumeId: string,
    id: string,
    data: Partial<ProjectEntry>,
    token?: string,
  ) =>
    api.patch<ApiResponse<ProjectEntry>>(
      `${RESUME_BASE}/${resumeId}/projects/${id}`,
      data,
      { token },
    ),

  deleteProject: (resumeId: string, id: string, token?: string) =>
    api.delete<ApiResponse<ProjectEntry>>(
      `${RESUME_BASE}/${resumeId}/projects/${id}`,
      { token },
    ),

  // ─── Certification CRUD ───────────────────────────────────────

  createCertification: (
    resumeId: string,
    data: Partial<CertificationEntry>,
    token?: string,
  ) =>
    api.post<ApiResponse<CertificationEntry>>(
      `${RESUME_BASE}/${resumeId}/certifications`,
      data,
      { token },
    ),

  getCertifications: (resumeId: string, token?: string) =>
    api.get<ApiResponse<CertificationEntry[]>>(
      `${RESUME_BASE}/${resumeId}/certifications`,
      { token },
    ),

  updateCertification: (
    resumeId: string,
    id: string,
    data: Partial<CertificationEntry>,
    token?: string,
  ) =>
    api.patch<ApiResponse<CertificationEntry>>(
      `${RESUME_BASE}/${resumeId}/certifications/${id}`,
      data,
      { token },
    ),

  deleteCertification: (resumeId: string, id: string, token?: string) =>
    api.delete<ApiResponse<CertificationEntry>>(
      `${RESUME_BASE}/${resumeId}/certifications/${id}`,
      { token },
    ),

  // ─── Skills ───────────────────────────────────────────────────

  addSkills: (
    resumeId: string,
    data: { hardSkill?: string[]; softSkill?: string[] },
    token?: string,
  ) =>
    api.post<ApiResponse<{ inserted: number; updated: number }>>(
      `${RESUME_BASE}/${resumeId}/skills`,
      data,
      { token },
    ),

  getSkills: (resumeId: string, token?: string) =>
    api.get<ApiResponse<unknown[]>>(`${RESUME_BASE}/${resumeId}/skills`, {
      token,
    }),

  deleteSkill: (resumeId: string, id: string, token?: string) =>
    api.delete<ApiResponse<unknown>>(
      `${RESUME_BASE}/${resumeId}/skills/${id}`,
      { token },
    ),
};
