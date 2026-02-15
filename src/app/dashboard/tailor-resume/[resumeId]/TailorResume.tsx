"use client";
import { useEffect, useRef } from "react";
import { useResumeStream } from "@/hooks/stream-resume-hook";
import { useSearchParams, useParams } from "next/navigation";
import { toast } from "sonner";
import { COLLECTIONS } from "@/lib/utils/constants";
import { ProgressIndicator } from "../../(dashboard)/ai-apply/progress-indicator";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { resumeQueries } from "@/lib/queries/resume.queries";
import { userQueries } from "@/lib/queries/user.queries";
import { ResumeDownloadButton } from "./ResumeDownloadButton";
import { TrashIcon } from "lucide-react";
import { api, BASEURL } from "@/lib/api/client";
import { sendGTMEvent } from "@next/third-parties/google";
import { BACKEND_API_VERSION } from "@/lib/api/profile.api";
import { ResumeLoadingSkeleton } from "../components/resume-loading-skeleton";
import {
  buildResumeUpdateUrl,
} from "@/lib/utils/ai-apply-navigation";
import { EditableResume } from "../../(dashboard)/ai-apply/components/resume/EditableResume";

const API_URL = `${BASEURL}/${BACKEND_API_VERSION}/resumes/generate`;

/**
 * Normalize API response data to match the expected UI schema
 * Maps API fields (e.g., "summary") to schema fields (e.g., "profile")
 */
const normalizeResumeData = (data: any) => {
  if (!data) return data;

  return {
    ...data,
    // Map API's "summary" field to schema's "profile" field
    profile: data.summary || data.profile || "",
    // Ensure arrays exist
    education: data.education || [],
    workExperience: data.workExperience || [],
    certification: data.certification || [],
    project: data.project || [],
    softSkill: data.softSkill || [],
    hardSkill: data.hardSkill || [],
  };
};

export const TailorResume = () => {
  const { data: user } = useQuery(userQueries.detail());
  const searchParams = useSearchParams();
  const params = useParams();
  const queryClient = useQueryClient();
  const router = useRouter();
  const resultsEndRef = useRef<HTMLDivElement>(null);
  const hasGeneratedRef = useRef(false);

  // Extract IDs and parameters from URL search params and route params
  const coverLetterDocId = searchParams.get("coverLetterDocId");
  const resumeDocIdFromSearchParams = searchParams.get("resumeDocId");
  const resumeDocIdFromRoute = (params.resumeId as string) || null;
  // Use resumeDocId from route first (server-side prefetch), then from search params
  const resumeDocId = resumeDocIdFromRoute || resumeDocIdFromSearchParams;
  const jobDescription = searchParams.get("jobDescription") || "";
  const recruiterEmail = searchParams.get("recruiterEmail") || "";
  const aiApply = searchParams.get("aiApply") === "true";


  useEffect(() => {
    if (user?.firstName)
      sendGTMEvent({
        event: `Tailor Resume Page`,
        value: `${user?.firstName} viewed Tailor Resume Page`,
      });
  }, [user?.firstName]);

  // If resumeDocId exists, fetch the generated resume; otherwise use streaming data
  const { data: existingResume, status: resumeStatus } = useQuery(
    resumeQueries.detail(resumeDocId ?? ""),
  );

  console.log("resumeDocId : ", resumeDocId, existingResume, resumeStatus);

  const { streamData, streamStatus, startStream, documentId } = useResumeStream(
    API_URL,
    resumeDocId || "pending", // Use the resumeDocId if available, else "pending"
  );

  useEffect(() => {
    if (!streamStatus.isComplete && !existingResume) {
      resultsEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [streamData]);

  // Start generation on first visit if no resumeDocId yet, OR if resumeDocId exists but data doesn't
  useEffect(() => {
    const isRegenerationNeeded =
      resumeDocId &&
      (resumeStatus === "error" || (resumeStatus === "success" && !existingResume)); // No data exists

    if (
      (isRegenerationNeeded) &&
      user &&
      jobDescription &&
      !hasGeneratedRef.current
    ) {
      hasGeneratedRef.current = true;
      const isRegenerating = isRegenerationNeeded;
      toast.promise(startStream(user, jobDescription), {
        loading: isRegenerating
          ? "Regenerating your tailored resume..."
          : "Generating your tailored resume...",
        success: () => {
          return {
            message: isRegenerating
              ? `Resume regeneration complete!`
              : `Resume generation complete!`,
          };
        },
        error: "Error generating resume",
      });
    }
  }, [
    resumeDocId,
    resumeStatus,
    existingResume,
    user,
    jobDescription,
    startStream,
  ]);

  // Update URL with actual resumeDocId after generation completes
  useEffect(() => {
    if (
      documentId &&
      !streamStatus.isComplete &&
      coverLetterDocId
    ) {
      const newUrl = buildResumeUpdateUrl(
        coverLetterDocId,
        documentId,
        jobDescription,
        recruiterEmail,
      );
      router.replace(newUrl);
    }
  }, [
    documentId,
    streamStatus.isComplete,
    coverLetterDocId,
    jobDescription,
    recruiterEmail,
    router,
  ]);

  // Navigate to preview after resume generation completes in aiApply flow
  useEffect(() => {
    if (!aiApply || streamStatus.isComplete !== true || !documentId) {
      return;
    }
  }, [
    aiApply,
    streamStatus.isComplete,
    documentId,
    coverLetterDocId,
    resumeDocId,
    jobDescription,
    recruiterEmail,
    router,
  ]);

  
  const isLoading =
    resumeStatus === "pending" ||
    resumeStatus === "error" ||
    (resumeStatus === "success" && !existingResume && !streamStatus.isComplete);

  const handleResumeDelete = async () => {
    const idToDelete = resumeDocId || documentId;
    if (!idToDelete) {
      toast.error("Cannot delete resume: No ID found");
      return;
    }

    await api.delete(
      `/delete-document/${idToDelete}?docType=${COLLECTIONS.RESUME}`,
    );
    toast.success("Resume deleted successfully");
    router.push("/dashboard/home");
    await queryClient.invalidateQueries(resumeQueries.detail(idToDelete));
  };

  // Normalize the API data and use it as the source of truth
  const normalizedExistingResume = existingResume
    ? normalizeResumeData(existingResume)
    : null;
  const displayResumeData = normalizedExistingResume || streamData;

  return (
    <div className="space-y-4 sm:space-y-8">
      {aiApply && <ProgressIndicator activeStep={2} />}

      {isLoading ? (
        <ResumeLoadingSkeleton />
      ) : (
        <>
          <div className="flex w-full gap-3 items-center  p-4  bg-white justify-between">
            <p className="text-xl font-medium font-inter">Tailored Resume</p>
            <div className="flex gap-2">
              <ResumeDownloadButton resumeData={displayResumeData} />
              <Button
                className=""
                variant={"destructive"}
                onClick={() => {
                  handleResumeDelete();
                }}
              >
                <TrashIcon className="w-5 h-5 " />
              </Button>
            </div>
          </div>

          <EditableResume
            data={displayResumeData}
            resumeId={resumeDocId || documentId || "pending"}
            isStreaming={!streamStatus.isComplete}
          />
          <div ref={resultsEndRef} className="" />
        </>
      )}
    </div>
  );
};
