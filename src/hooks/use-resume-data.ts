import { defaultResumeFormData } from "@/constants/data";
import { ResumeFormData } from "@/lib/schema-validations/resume.schema";
import { IUser } from "@/types";
import { useCallback, useEffect, useState } from "react";

/**
 * Custom hook for managing resume data with optimistic updates
 * In production, this would integrate with TanStack Query
 */
export const useResumeData = (data: Partial<IUser>) => {
  const [resumeData, setResumeData] = useState<ResumeFormData>(
    () => defaultResumeFormData
  );

  useEffect(() => {
    setResumeData((prev) => ({ ...prev, ...data } as ResumeFormData));
  }, [data]);

  console.count("USE RESUME DATA RENDER HOOK");
  // Optimistic update function
  const updateResumeData = useCallback(
    (updater: (prev: ResumeFormData) => ResumeFormData) => {
      console.log("Optimistically updating resume data...", updater);
      setResumeData(updater);
    },
    []
  );

  return { resumeData, updateResumeData };
};