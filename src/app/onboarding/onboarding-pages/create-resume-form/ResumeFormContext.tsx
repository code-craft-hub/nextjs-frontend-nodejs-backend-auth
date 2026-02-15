"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ResumeAggregate } from "@/types/resume.types";
import { useCreateResumeMutation } from "@/lib/mutations/resume.mutations";

interface ResumeFormContextValue {
  resumeId: string | null;
  resumeData: ResumeAggregate | null;
  isEditMode: boolean;
  isLoading: boolean;
  isCreating: boolean;
  setResumeData: (data: ResumeAggregate | null) => void;
  updateResumeField: <K extends keyof ResumeAggregate>(
    field: K,
    value: ResumeAggregate[K],
  ) => void;
  createNewResume: (title: string) => Promise<string | null>;
}

const ResumeFormContext = createContext<ResumeFormContextValue | null>(null);

interface ResumeFormProviderProps {
  children: React.ReactNode;
  initialData?: ResumeAggregate | null;
  resumeId?: string | null;
}

export function ResumeFormProvider({
  children,
  initialData = null,
  resumeId = null,
}: ResumeFormProviderProps) {
  const [resumeData, setResumeData] = useState<ResumeAggregate | null>(
    initialData,
  );
  const [isLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(resumeId || null);
  const createResumeMutation = useCreateResumeMutation();

  const isEditMode = !!currentResumeId && !!resumeData;

  const updateResumeField = useCallback(
    <K extends keyof ResumeAggregate>(
      field: K,
      value: ResumeAggregate[K],
    ) => {
      setResumeData((prev) => {
        if (!prev) return prev;
        return { ...prev, [field]: value };
      });
    },
    [],
  );

  const createNewResume = useCallback(
    async (title: string): Promise<string | null> => {
      return new Promise((resolve) => {
        setIsCreating(true);
        createResumeMutation.mutate(
          { title },
          {
            onSuccess: (response: any) => {
              const newResumeId = response?.data?.id;
              if (newResumeId && response?.data) {
                setResumeData(response.data);
                setCurrentResumeId(newResumeId);
                setIsCreating(false);
                resolve(newResumeId);
              } else {
                setIsCreating(false);
                resolve(null);
              }
            },
            onError: (error) => {
              console.error("Error creating resume:", error);
              setIsCreating(false);
              resolve(null);
            },
          },
        );
      });
    },
    [createResumeMutation],
  );

  const value = useMemo(
    () => ({
      resumeId: currentResumeId,
      resumeData,
      isEditMode,
      isLoading,
      isCreating,
      setResumeData,
      updateResumeField,
      createNewResume,
    }),
    [currentResumeId, resumeData, isEditMode, isLoading, isCreating, updateResumeField, createNewResume],
  );

  return (
    <ResumeFormContext.Provider value={value}>
      {children}
    </ResumeFormContext.Provider>
  );
}

export function useResumeForm(): ResumeFormContextValue {
  const context = useContext(ResumeFormContext);
  if (!context) {
    throw new Error("useResumeForm must be used within a ResumeFormProvider");
  }
  return context;
}
