import { useState, useCallback, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "@/lib/axios/auth-api";
import { ApiError, ResumeField, UpdatePayload, UseResumeDataOptions } from "@/types";

const createApiError = (message: string, status?: number): ApiError => {
  const error = new Error(message) as ApiError;
  error.status = status;
  return error;
};

const updateResumeField = async <T>(
  payload: UpdatePayload<T>,
  baseUrl: string = process.env.NEXT_PUBLIC_AUTH_API_URL || ""
): Promise<any> => {
  try {
    const { data } = await authAPI.patch(
      `${baseUrl}/career-doc/${payload.documentId}`,
      {
        documentId: payload.documentId,
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
  const { documentId, apiUrl, onSuccess, onError } = options;
  const queryClient = useQueryClient();

  // Use ref to track if we're in the middle of an optimistic update
  const isOptimisticUpdate = useRef(false);

  // Local optimistic state
  const [resumeData, setResumeData] = useState(() => ({
    ...initialData,
  }));

  // Sync with external data changes - but only when NOT doing optimistic updates
  useEffect(() => {
    if (!isOptimisticUpdate.current) {
      setResumeData((prev) => {
        // Only update if data actually changed to prevent unnecessary re-renders
        const hasChanged = Object.keys(initialData).some(
          (key) =>
            JSON.stringify(prev[key]) !== JSON.stringify(initialData[key])
        );
        return hasChanged ? { ...prev, ...initialData } : prev;
      });
    }
  }, [initialData]);

  // TanStack Query mutation with optimistic updates
  const mutation = useMutation<
    any,
    Error,
    UpdatePayload<any>,
    { previousData: any }
  >({
    mutationFn: async <T>(payload: UpdatePayload<T>) => {
      return updateResumeField(payload, apiUrl);
    },

    onMutate: async (payload) => {
      isOptimisticUpdate.current = true;

      // Cancel outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({
        queryKey: resumeQueryKeys.doc(documentId),
      });

      // Snapshot previous value for rollback
      const previousData = queryClient.getQueryData(
        resumeQueryKeys.doc(documentId)
      );

      // Optimistically update cache
      queryClient.setQueryData(resumeQueryKeys.doc(documentId), (old: any) => ({
        ...old,
        [payload.field]: payload.value,
      }));

      // Return context for rollback
      return { previousData };
    },

    onError: (error: Error, payload, context) => {
      isOptimisticUpdate.current = false;

      // Rollback optimistic update on error
      if (context?.previousData) {
        queryClient.setQueryData(
          resumeQueryKeys.doc(documentId),
          context.previousData
        );
        setResumeData(context.previousData as any);
      }

      // Call error callback
      onError?.(error, payload.field);
    },

    onSuccess: (data, payload) => {
      console.log("Server confirmed update:", data);
      // Call success callback
      onSuccess?.(payload.field);
    },

    onSettled: () => {
      isOptimisticUpdate.current = false;

      // Invalidate queries without refetching immediately
      // This marks the data as stale but doesn't trigger a refetch
      queryClient.invalidateQueries({
        queryKey: resumeQueryKeys.doc(documentId),
        refetchType: "none", // Don't refetch immediately
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
        documentId,
      });
    },
    [documentId, mutation.mutate]
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
          documentId,
        });
      });
    },
    [documentId, mutation.mutate]
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
