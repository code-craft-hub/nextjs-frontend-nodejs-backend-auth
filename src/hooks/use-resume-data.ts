import { useState, useCallback, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ResumeField, UpdatePayload, UseResumeDataOptions } from "@/types";
import {
  ContactFormData,
  ResumeFormData,
} from "@/lib/schema-validations/resume.schema";
import { createApiError } from "@/lib/utils/helpers";
import { resumeQueries } from "@/lib/queries/resume.queries";
import { resumeApi } from "@/lib/api/resume.api";

const updateResumeField = async <T>(
  payload: UpdatePayload<T>,
): Promise<any> => {
  try {
    const updates =
      payload.field === "contact"
        ? payload.value
        : { [payload.field]: payload.value };

    return await resumeApi.updateResume(payload.resumeId, updates as any);
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
  options: UseResumeDataOptions,
) => {
  const { resumeId, onSuccess, onError } = options;
  const queryClient = useQueryClient();

  // Track pending updates to prevent premature syncing
  const pendingUpdatesRef = useRef<Set<ResumeField>>(new Set());

  // Track which fields are currently loading
  const [loadingFields, setLoadingFields] = useState<Set<ResumeField>>(
    new Set(),
  );

  // Local optimistic state
  const [resumeData, setResumeData] = useState<
    ResumeFormData & ContactFormData
  >(() => ({
    // Contact fields (flattened at top level, matching API response)
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    portfolio: "",
    // Resume fields
    profile: "",
    education: [],
    workExperience: [],
    certification: [],
    project: [],
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
      return updateResumeField(payload);
    },

    onMutate: async (payload) => {
      // Mark this field as being updated
      pendingUpdatesRef.current.add(payload.field);
      setLoadingFields((prev) => new Set(prev).add(payload.field));

      // Cancel outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({
        queryKey: resumeQueryKeys.doc(resumeId),
      });

      // Snapshot previous value for rollback
      const previousData = queryClient.getQueryData(
        resumeQueryKeys.doc(resumeId),
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
      // Remove from pending updates and loading fields
      if (context?.field) {
        pendingUpdatesRef.current.delete(context.field);
        setLoadingFields((prev) => {
          const updated = new Set(prev);
          updated.delete(context.field);
          return updated;
        });
      }

      // Rollback optimistic update on error
      if (context?.previousData) {
        queryClient.setQueryData(
          resumeQueryKeys.doc(resumeId),
          context.previousData,
        );

        // Handle contact field specially when rolling back
        if (payload.field === "contact") {
          setResumeData((prev) => ({
            ...prev,
            firstName: context.previousData.firstName ?? prev.firstName,
            lastName: context.previousData.lastName ?? prev.lastName,
            email: context.previousData.email ?? prev.email,
            phoneNumber: context.previousData.phoneNumber ?? prev.phoneNumber,
            address: context.previousData.address ?? prev.address,
            portfolio: context.previousData.portfolio ?? prev.portfolio,
          }));
        } else {
          setResumeData(context.previousData as any);
        }
      }

      // Call error callback
      onError?.(error, payload.field);
    },

    onSuccess: (data, payload, context) => {
      if (context?.field) {
        pendingUpdatesRef.current.delete(context.field);
        setLoadingFields((prev) => {
          const updated = new Set(prev);
          updated.delete(context.field);
          return updated;
        });
      }

      // Update local state with confirmed data if available
      if (data?.data) {
        // Handle contact field specially - flatten contact object to root level
        if (payload.field === "contact") {
          setResumeData((prev) => ({
            ...prev,
            firstName: data.data.firstName ?? prev.firstName,
            lastName: data.data.lastName ?? prev.lastName,
            email: data.data.email ?? prev.email,
            phoneNumber: data.data.phoneNumber ?? prev.phoneNumber,
            address: data.data.address ?? prev.address,
            portfolio: data.data.portfolio ?? prev.portfolio,
          }));
        } else {
          setResumeData((prev) => ({ ...prev, ...data.data }));
        }
      }

      // Call success callback
      onSuccess?.(payload.field);
    },

    onSettled: (_data, _error, payload) => {
      // Ensure field is removed from pending updates and loading fields
      pendingUpdatesRef.current.delete(payload.field);
      setLoadingFields((prev) => {
        const updated = new Set(prev);
        updated.delete(payload.field);
        return updated;
      });

      queryClient.invalidateQueries(resumeQueries.detail(resumeId));

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
    [resumeId, mutation],
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
    [resumeId, mutation],
  );

  return {
    resumeData,
    updateField,
    updateFields,
    isUpdating: mutation.isPending,
    loadingFields,
    isFieldLoading: (field: ResumeField) => loadingFields.has(field),
    error: mutation.error,
    isError: mutation.isError,
    reset: mutation.reset,
  };
};
