import { useState, useCallback, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { authAPI } from "@/lib/axios/auth-api";
import { ResumeField, UpdatePayload, UseResumeDataOptions } from "@/types";
import { ResumeFormData } from "@/lib/schema-validations/resume.schema";
import { createApiError } from "@/lib/utils/helpers";
import { COLLECTIONS } from "@/lib/utils/constants";
import authClient from "@/lib/axios/auth-api";

const updateResumeField = async <T>(
  payload: UpdatePayload<T>,
  baseUrl: string = process.env.NEXT_PUBLIC_AUTH_API_URL || ""
): Promise<any> => {
  try {
    const { data } = await authClient.patch(
      `${baseUrl}/career-doc/${payload.resumeId}?collection=${COLLECTIONS.RESUME}`,
      {
        resumeId: payload.resumeId,
        updates: {
          [payload.field]: payload.value,
        },
      }
    );

    console.log("Update response:", data);
    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw createApiError("Request timeout - please try again");
      }
      throw error;
    }

    throw createApiError("An unexpected error occurred");
  }
};

const resumeQueryKeys = {
  all: ["career-docs"] as const,
  doc: (id: string) => [...resumeQueryKeys.all, id] as const,
  field: (id: string, field: ResumeField) =>
    [...resumeQueryKeys.doc(id), field] as const,
};

export const useResumeData = (
  initialData: Partial<any>,
  options: UseResumeDataOptions
) => {
  const { resumeId, apiUrl, onSuccess, onError } = options;
  const queryClient = useQueryClient();

  // Track pending updates to prevent premature syncing
  const pendingUpdatesRef = useRef<Set<ResumeField>>(new Set());

  // Local optimistic state
  const [resumeData, setResumeData] = useState<ResumeFormData>(() => ({
    summary: "",
    personalDetails: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      linkedIn: "",
      github: "",
      website: "",
    },
    workExperience: [],
    education: [],
    certification: [],
    project: [],
    skills: [],
    softSkill: [],
    hardSkill: [],
    ...initialData,
  }));

  // Sync with external data changes - but only for fields not being updated
  useEffect(() => {
    setResumeData((prev) => {
      const updates: Record<string, any> = {};
      let hasChanges = false;

      Object.keys(initialData).forEach((key) => {
        // Skip fields that are currently being updated
        if (!pendingUpdatesRef.current.has(key as ResumeField)) {
          const prevValue = (prev as Record<string, unknown>)[key];
          const newValue = (initialData as Record<string, unknown>)[key];
          
          if (JSON.stringify(prevValue) !== JSON.stringify(newValue)) {
            updates[key] = newValue;
            hasChanges = true;
          }
        }
      });

      return hasChanges ? { ...prev, ...updates } : prev;
    });
  }, [initialData]);

  // TanStack Query mutation with optimistic updates
  const mutation = useMutation<
    any,
    Error,
    UpdatePayload<any>,
    { previousData: any; field: ResumeField }
  >({
    mutationFn: async <T>(payload: UpdatePayload<T>) => {
      return updateResumeField(payload, apiUrl);
    },

    onMutate: async (payload) => {
      // Mark this field as being updated
      pendingUpdatesRef.current.add(payload.field);

      // Cancel outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({
        queryKey: resumeQueryKeys.doc(resumeId),
      });

      // Snapshot previous value for rollback
      const previousData = queryClient.getQueryData(
        resumeQueryKeys.doc(resumeId)
      );

      // Optimistically update cache
      queryClient.setQueryData(resumeQueryKeys.doc(resumeId), (old: any) => ({
        ...old,
        [payload.field]: payload.value,
      }));

      // Return context for rollback
      return { previousData, field: payload.field };
    },

    onError: (error: Error, payload, context) => {
      // Remove from pending updates
      if (context?.field) {
        pendingUpdatesRef.current.delete(context.field);
      }

      // Rollback optimistic update on error
      if (context?.previousData) {
        queryClient.setQueryData(
          resumeQueryKeys.doc(resumeId),
          context.previousData
        );
        setResumeData(context.previousData as any);
      }

      // Call error callback
      onError?.(error, payload.field);
    },

    onSuccess: (data, payload, context) => {
      console.log("Server confirmed update:", data);
      
      // Remove from pending updates after successful update
      if (context?.field) {
        pendingUpdatesRef.current.delete(context.field);
      }

      // Update local state with confirmed data if available
      if (data?.data) {
        setResumeData((prev) => ({ ...prev, ...data.data }));
      }

      // Call success callback
      onSuccess?.(payload.field);
    },

    onSettled: (_data, _error, payload) => {
      // Ensure field is removed from pending updates
      pendingUpdatesRef.current.delete(payload.field);

      // Invalidate queries without refetching immediately
      queryClient.invalidateQueries({
        queryKey: resumeQueryKeys.doc(resumeId),
        refetchType: "none",
      });
    },
  });

  // Generic update handler - memoized with stable dependencies
  const updateField = useCallback(
    <T>(field: ResumeField, value: T) => {
      // Optimistic UI update
      setResumeData((prev) => ({ ...prev, [field]: value }));

      // Persist to backend
      mutation.mutate({
        field,
        value,
        resumeId,
      });
    },
    [resumeId, mutation]
  );

  // Batch update for multiple fields
  const updateFields = useCallback(
    (updates: Partial<Record<ResumeField, any>>) => {
      setResumeData((prev) => ({ ...prev, ...updates }));

      // Queue multiple mutations
      Object.entries(updates).forEach(([field, value]) => {
        mutation.mutate({
          field: field as ResumeField,
          value,
          resumeId,
        });
      });
    },
    [resumeId, mutation]
  );

  return {
    resumeData,
    updateField,
    updateFields,
    isUpdating: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
    reset: mutation.reset,
  };
};