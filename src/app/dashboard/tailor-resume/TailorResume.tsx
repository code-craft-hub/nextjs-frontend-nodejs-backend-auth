"use client";
import React, { useEffect, useRef, useState } from "react";
import { useResumeStream } from "@/hooks/stream-resume-hook";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useResumeData } from "@/hooks/use-resume-data";
import { Resume } from "@/types";
import { createResumeOrderedParams } from "@/lib/utils/helpers";
import { COLLECTIONS } from "@/lib/utils/constants";
import { EditableResume } from "../(dashboard)/ai-apply/components/resume/EditableResume";

export const TailorResume = ({
  jobDescription,
  documentId,
}: {
  jobDescription: string;
  documentId: string;
}) => {
  const { user, useCareerDoc } = useAuth();
  const { data } = useCareerDoc<Resume>(documentId, COLLECTIONS.RESUME);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { resumeData, updateField } = useResumeData(data || {}, {
    documentId,
    onSuccess: (field) => {
      console.log(`✓ Successfully updated ${field}`);
    },
    onError: (error, field) => {
      console.error(`✗ Failed to update ${field}:`, error);
    },
  });

  const [pause, setPause] = useState(true);

  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_AUTH_API_URL;
  const frontendUrl = process.env.NEXT_PUBLIC_APP_URL;

  const { streamData, streamStatus, startStream } = useResumeStream(
    backendUrl + "/new-resume-generation"
  );
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const oldDescription = params.get("jobDescription");

  useEffect(() => {
    if (user && jobDescription && !documentId) {
      toast.promise(startStream(user, jobDescription), {
        loading: "Generating your tailored resume...",
        success: () => {
          return {
            message: `Resume generation complete!`,
          };
        },
        error: "Error",
      });
    }
  }, [user, jobDescription]);

  useEffect(() => {
    console.log(streamStatus);
    if (streamStatus.savedDocumentToDatabase) {
      const orderedParams = createResumeOrderedParams(
        streamData.documentId,
        oldDescription!
      );
      router.push(
        `${frontendUrl}/dashboard/tailor-resume?${orderedParams.toString()}`
      );
      toast.success("Resume generation complete! Click any section to edit.", {
        duration: 8000,
      });
    }
  }, [streamStatus.savedDocumentToDatabase]);

  const cancelTimeout = () => {
    if (timeoutRef.current) {
      setPause(true);
      clearTimeout(timeoutRef.current);
    }
  };

  const shouldUseDbData = streamData.profile === "";
  return (
    <div className="">
      <EditableResume
        data={shouldUseDbData ? resumeData : streamData}
        cancelTimeout={cancelTimeout}
        pause={pause}
        onUpdate={updateField}
      />
    </div>
  );
};
