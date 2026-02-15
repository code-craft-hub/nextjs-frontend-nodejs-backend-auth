"use client";
import { useEffect, useRef, useState } from "react";
import { useResumeStream } from "@/hooks/stream-resume-hook";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { COLLECTIONS } from "@/lib/utils/constants";
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
import { ResumeLoadingSkeleton } from "./components/resume-loading-skeleton";
import { buildResumeUpdateUrl } from "@/lib/utils/ai-apply-navigation";
import CreateUserResume from "@/app/onboarding/onboarding-pages/create-resume-form/CreateUserResume";
import { useFireworksConfetti } from "@/components/ui/confetti";
import { ViewResume } from "./ViewResume";

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
  const queryClient = useQueryClient();
  const router = useRouter();
  const resultsEndRef = useRef<HTMLDivElement>(null);
  const hasGeneratedRef = useRef(false);
  const [editResume, setEditResume] = useState(false);
  const [resumeId, setResumeId] = useState(searchParams.get("resumeId"));
  const { start: startConfetti } = useFireworksConfetti();

  const jobDescription = searchParams.get("jobDescription") || "";

  useEffect(() => {
    if (user?.firstName)
      sendGTMEvent({
        event: `Tailor Resume Page`,
        value: `${user?.firstName} viewed Tailor Resume Page`,
      });
  }, [user?.firstName]);

  // If resumeId exists, fetch the generated resume; otherwise use streaming data
  const { data: existingResume, status: resumeStatus } = useQuery(
    resumeQueries.detail(resumeId ?? ""),
  );

  console.log(
    "Existing resume data from query:",
    existingResume,
    "Status:",
    resumeStatus,
  );

  const { streamData, streamStatus, startStream, documentId } =
    useResumeStream(API_URL);

  // Update resumeId when documentId is generated
  useEffect(() => {
    if (documentId && !resumeId) {
      setResumeId(documentId);
    }
  }, [documentId, resumeId]);

  useEffect(() => {
    if (!streamStatus.isComplete && !existingResume) {
      resultsEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [streamData]);

  // Start generation on first visit if no resumeId yet, OR if resumeId exists but data doesn't
  useEffect(() => {
    // Determine if we need to generate/regenerate
    const shouldGenerate =
      user &&
      jobDescription &&
      !hasGeneratedRef.current &&
      // Start streaming if no resumeId yet (initial load with jobDescription)
      (!resumeId ||
        // Or regenerate if resumeId exists but fetch failed or no data
        (resumeId &&
          (resumeStatus === "error" ||
            (resumeStatus === "success" && !existingResume))));

    if (shouldGenerate) {
      hasGeneratedRef.current = true;
      const isRegenerating = Boolean(resumeId);
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
  }, [resumeId, resumeStatus, existingResume, user, jobDescription]);

  // Normalize the API data and use it as the source of truth
  const normalizedExistingResume = existingResume
    ? normalizeResumeData(existingResume)
    : null;
  const displayResumeData = normalizedExistingResume || streamData;

  // Update URL with actual resumeId after generation completes
  useEffect(() => {
    if (resumeId && streamStatus.isComplete) {
      const newUrl = buildResumeUpdateUrl(resumeId);
      router.replace(newUrl);
      startConfetti();
    }
  }, [resumeId, streamStatus.isComplete, router]);

  const isLoading =
    resumeStatus === "pending" || (!existingResume && !streamStatus.isComplete);

  const handleResumeDelete = async () => {
    const idToDelete = resumeId;
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

  const handleEditClick = (value: boolean) => {
    setEditResume(value);
  };
  return (
    <div className="space-y-4 sm:space-y-8">
      {isLoading ? (
        <ResumeLoadingSkeleton />
      ) : (
        <>
          <div className="flex w-full gap-3 items-center  p-4  bg-white justify-between">
            <p className="text-xl font-medium font-inter">Tailored Resume</p>
            <div className="flex gap-2">
              <Button
                className=""
                variant={"destructive"}
                onClick={() => {
                  handleResumeDelete();
                }}
              >
                <TrashIcon className="w-5 h-5 " />
              </Button>
              <ResumeDownloadButton resumeData={displayResumeData} />
            </div>
          </div>

          {editResume ? (
            <CreateUserResume
              resumeId={resumeId}
              data={displayResumeData}
              handleEditClick={handleEditClick}
            />
          ) : (
            <>
              <ViewResume
                data={displayResumeData}
                handleEditClick={handleEditClick}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};
