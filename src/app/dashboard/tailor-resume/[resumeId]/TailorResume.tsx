"use client";
import { useEffect, useRef } from "react";
import { useResumeStream } from "@/hooks/stream-resume-hook";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { COLLECTIONS } from "@/lib/utils/constants";
import { EditableResume } from "../../(dashboard)/ai-apply/components/resume/EditableResume";
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
  buildPreviewUrl,
  isPlaceholderId,
} from "@/lib/utils/ai-apply-navigation";

const API_URL = `${BASEURL}/${BACKEND_API_VERSION}/resumes/generate`;

export const TailorResume = () => {
  const { data: user } = useQuery(userQueries.detail());
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const router = useRouter();
  const resultsEndRef = useRef<HTMLDivElement>(null);
  const hasGeneratedRef = useRef(false);

  // Extract IDs and parameters from URL search params
  const coverLetterDocId = searchParams.get("coverLetterDocId");
  const resumeDocId = searchParams.get("resumeDocId");
  const jobDescription = searchParams.get("jobDescription") || "";
  const recruiterEmail = searchParams.get("recruiterEmail") || "";
  const aiApply = searchParams.get("aiApply") === "true";

  const isGeneratorStep = isPlaceholderId(resumeDocId);

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

  const { streamData, streamStatus, startStream, documentId } = useResumeStream(
    API_URL,
    resumeDocId || "pending", // Use the resumeDocId if available, else "pending"
  );

  useEffect(() => {
    if (!streamStatus.isComplete) {
      resultsEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [streamData]);

  // Start generation on first visit if no resumeDocId yet
  useEffect(() => {
    if (isGeneratorStep && user && jobDescription && !hasGeneratedRef.current) {
      hasGeneratedRef.current = true;
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
  }, [isGeneratorStep, user, jobDescription, startStream]);

  // Update URL with actual resumeDocId after generation completes
  useEffect(() => {
    if (
      documentId &&
      !streamStatus.isComplete &&
      isGeneratorStep &&
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
    isGeneratorStep,
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

    if (!isGeneratorStep) {
      // Already have resumeDocId, navigate to preview
      const previewUrl = buildPreviewUrl(
        coverLetterDocId || "",
        resumeDocId || documentId,
        jobDescription,
        recruiterEmail,
      );
      router.push(previewUrl);
    }
  }, [
    aiApply,
    streamStatus.isComplete,
    isGeneratorStep,
    documentId,
    coverLetterDocId,
    resumeDocId,
    jobDescription,
    recruiterEmail,
    router,
  ]);

  const shouldUseDbData =
    streamData.profile === "" && resumeStatus === "success";
  const isLoading =
    shouldUseDbData && !streamStatus.isComplete && resumeStatus !== "success";

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
    await queryClient.invalidateQueries(
      resumeQueries.detail(idToDelete),
    );
  };

  const displayResumeData = existingResume || streamData;

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
