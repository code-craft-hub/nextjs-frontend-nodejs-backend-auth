"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ResumeAggregate } from "@/types/resume.types";

interface ResumeFormContextValue {
  resumeId: string | null;
  resumeData: ResumeAggregate | null;
  isEditMode: boolean;
  isLoading: boolean;
  setResumeData: (data: ResumeAggregate | null) => void;
  updateResumeField: <K extends keyof ResumeAggregate>(
    field: K,
    value: ResumeAggregate[K],
  ) => void;
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

  const isEditMode = !!resumeId && !!resumeData;

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

  const value = useMemo(
    () => ({
      resumeId: resumeId ?? resumeData?.id ?? null,
      resumeData,
      isEditMode,
      isLoading,
      setResumeData,
      updateResumeField,
    }),
    [resumeId, resumeData, isEditMode, isLoading, updateResumeField],
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
