import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  resumeApi,
  type CreateResumeData,
  type UpdateResumeData,
} from "@/lib/api/resume.api";
import { queryKeys } from "@/lib/query/keys";
import {
  invalidateResumeDetail,
  invalidateResumeLists,
  invalidateResumeQueries,
} from "@/lib/query/query-invalidation";
import type { PaginatedResponse } from "@/lib/types";
import type {
  WorkExperienceEntry,
  EducationEntry,
  ProjectEntry,
  CertificationEntry,
} from "@/types/resume.types";

// ─── Resume Mutations ─────────────────────────────────────────────

export function useCreateResumeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateResumeData) => resumeApi.createResume(data),
    onMutate: async (newResume) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.resumes.lists(),
      });

      const previousResumes = queryClient.getQueryData(
        queryKeys.resumes.lists(),
      );

      queryClient.setQueriesData<PaginatedResponse<any>>(
        { queryKey: queryKeys.resumes.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: [
              {
                id: "temp-" + Date.now(),
                userId: "temp",
                ...newResume,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as any,
              ...old.data,
            ],
            total: old.total + 1,
          };
        },
      );

      return { previousResumes };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousResumes) {
        queryClient.setQueriesData(
          { queryKey: queryKeys.resumes.lists() },
          context.previousResumes,
        );
      }
    },
    onSettled: () => {
      invalidateResumeLists(queryClient);
    },
  });
}

export function useUpdateResumeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResumeData }) =>
      resumeApi.updateResume(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.resumes.detail(id),
      });

      const previousResume = queryClient.getQueryData(
        queryKeys.resumes.detail(id),
      );

      queryClient.setQueryData<any>(
        queryKeys.resumes.detail(id),
        (old: any) => {
          if (!old) return old;
          return { ...old, ...data, updatedAt: new Date().toISOString() };
        },
      );

      queryClient.setQueriesData<PaginatedResponse<any>>(
        { queryKey: queryKeys.resumes.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((r) =>
              r.id === id
                ? { ...r, ...data, updatedAt: new Date().toISOString() }
                : r,
            ),
          };
        },
      );

      return { previousResume };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousResume) {
        queryClient.setQueryData(
          queryKeys.resumes.detail(id),
          context.previousResume,
        );
      }
    },
    onSettled: (_data, _error, { id }) => {
      invalidateResumeDetail(queryClient, id);
      invalidateResumeLists(queryClient);
    },
  });
}

export function useDeleteResumeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resumeApi.deleteResume(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.resumes.lists(),
      });

      const previousResumes = queryClient.getQueryData(
        queryKeys.resumes.lists(),
      );

      queryClient.setQueriesData<PaginatedResponse<any>>(
        { queryKey: queryKeys.resumes.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((r) => r.id !== id),
            total: old.total - 1,
          };
        },
      );

      return { previousResumes };
    },
    onError: (_err, _id, context) => {
      if (context?.previousResumes) {
        queryClient.setQueriesData(
          { queryKey: queryKeys.resumes.lists() },
          context.previousResumes,
        );
      }
    },
    onSettled: () => {
      invalidateResumeLists(queryClient);
    },
  });
}

// ─── New Resume Mutation ────────────────────────────────────

export function useCreateNewResumeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateResumeData) => resumeApi.createNewResume(data),
    onSettled: () => {
      invalidateResumeLists(queryClient);
    },
  });
}
// ─── Work Experience Mutations ────────────────────────────────────

export function useCreateWorkExperienceMutation(resumeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<WorkExperienceEntry>) =>
      resumeApi.createWorkExperience(resumeId, data),
    onSettled: () => {
      invalidateResumeDetail(queryClient, resumeId);
    },
  });
}

export function useUpdateWorkExperienceMutation(resumeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<WorkExperienceEntry>;
    }) => resumeApi.updateWorkExperience(resumeId, id, data),
    onSettled: () => {
      invalidateResumeDetail(queryClient, resumeId);
    },
  });
}

export function useDeleteWorkExperienceMutation(resumeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resumeApi.deleteWorkExperience(resumeId, id),
    onSettled: () => {
      invalidateResumeDetail(queryClient, resumeId);
    },
  });
}

// ─── Education Mutations ────────────────────────────────────────── ---500

export function useCreateEducationMutation(resumeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<EducationEntry>) =>
      resumeApi.createEducation(resumeId, data),
    onSettled: () => {
      invalidateResumeDetail(queryClient, resumeId);
    },
  });
}

export function useUpdateEducationMutation(resumeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EducationEntry> }) =>
      resumeApi.updateEducation(resumeId, id, data),
    onSettled: () => {
      invalidateResumeDetail(queryClient, resumeId);
    },
  });
}

export function useDeleteEducationMutation(resumeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resumeApi.deleteEducation(resumeId, id),
    onSettled: () => {
      invalidateResumeDetail(queryClient, resumeId);
    },
  });
}

// ─── Project Mutations ────────────────────────────────────────────

export function useCreateProjectMutation(resumeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<ProjectEntry>) =>
      resumeApi.createProject(resumeId, data),
    onSettled: () => {
      invalidateResumeDetail(queryClient, resumeId);
    },
  });
}

export function useUpdateProjectMutation(resumeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProjectEntry> }) =>
      resumeApi.updateProject(resumeId, id, data),
    onSettled: () => {
      invalidateResumeDetail(queryClient, resumeId);
    },
  });
}

export function useDeleteProjectMutation(resumeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resumeApi.deleteProject(resumeId, id),
    onSettled: () => {
      invalidateResumeDetail(queryClient, resumeId);
    },
  });
}

// ─── Certification Mutations ──────────────────────────────────────

export function useCreateCertificationMutation(resumeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CertificationEntry>) =>
      resumeApi.createCertification(resumeId, data),
    onSettled: () => {
      invalidateResumeDetail(queryClient, resumeId);
    },
  });
}

export function useUpdateCertificationMutation(resumeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CertificationEntry>;
    }) => resumeApi.updateCertification(resumeId, id, data),
    onSettled: () => {
      invalidateResumeDetail(queryClient, resumeId);
    },
  });
}

export function useDeleteCertificationMutation(resumeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resumeApi.deleteCertification(resumeId, id),
    onSettled: () => {
      invalidateResumeDetail(queryClient, resumeId);
    },
  });
}

// ─── Skills Mutation ──────────────────────────────────────────────

export function useAddSkillsMutation(resumeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { hardSkill?: string[]; softSkill?: string[] }) =>
      resumeApi.addSkills(resumeId, data),
    onSettled: () => {
      invalidateResumeDetail(queryClient, resumeId);
    },
  });
}
