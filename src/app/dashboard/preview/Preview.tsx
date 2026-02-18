"use client";

import { ProgressIndicator } from "../(dashboard)/ai-apply/progress-indicator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@module/user";
import { resumeQueries } from "@/lib/queries/resume.queries";
import { coverLetterQueries } from "@/lib/queries/cover-letter.queries";
import { CongratulationModal } from "@/components/shared/CongratulationModal";
import { Loader, Send, Sparkles, Trash } from "lucide-react";
import { sendGTMEvent } from "@next/third-parties/google";
import { useFireworksConfetti } from "@/components/ui/confetti";
import AuthorizeGoogle from "@/hooks/gmail/AuthorizeGoogle";
import TailorCoverLetterDisplay from "../tailor-cover-letter/TailorCoverLetterDisplay";
import { ViewResume } from "../tailor-resume/ViewResume";
import CreateUserResume from "@/app/onboarding/onboarding-pages/create-resume-form/CreateUserResume";
import { aiSettingsQueries } from "@/lib/queries/ai-settings.queries";
import { normalizeResumeData } from "@/lib/utils/resume-normalizer";
import {
  useSendEmailApplicationMutation,
  useDeleteEmailApplicationMutation,
  GmailCompose,
} from "@/modules/email-application";

interface PreviewProps {
  coverLetterId: string;
  resumeId: string;
  recruiterEmail: string;
  jobDescription: string;
  autoApplyId: string;
  masterCvId?: string;
}

const Preview = ({
  coverLetterId,
  resumeId,
  recruiterEmail,
  jobDescription,
  autoApplyId,
  masterCvId,
}: PreviewProps) => {
  const [activeStep, setActiveStep] = useState(3);
  const [openModal, setOpenModal] = useState(false);
  const [editResume, setEditResume] = useState(false);

  const router = useRouter();
  const { start: startConfetti } = useFireworksConfetti();

  const { data: user } = useQuery(userQueries.detail());
  const { data: settings } = useQuery(aiSettingsQueries.detail());

  const isMasterCv = !!masterCvId;
  const { data: resumeData } = useQuery(resumeQueries.detail(resumeId));
  const { data: masterCvData } = useQuery({
    ...resumeQueries.detail(masterCvId ?? ""),
    enabled: isMasterCv,
  });
  const { data: coverLetterData } = useQuery(
    coverLetterQueries.detail(coverLetterId),
  );

  // Initialize mutations
  const sendApplicationMutation = useSendEmailApplicationMutation();
  const deleteApplicationMutation = useDeleteEmailApplicationMutation();

  const displayResumeData = normalizeResumeData(resumeData);

  const handleOpenModal = (value: boolean) => {
    setOpenModal(value);
  };

  const handleCoverLetterDelete = async () => {
    try {
      await deleteApplicationMutation.mutateAsync({
        autoApplyId,
        resumeId,
        coverLetterId,
      });
      toast.success("Cover letter deleted successfully");
      router.push("/dashboard/home");
    } catch (error: any) {
      toast.error(
        error.message || "Failed to delete cover letter. Please try again.",
      );
    }
  };

  const handleSubmit = async () => {
    try {
      await sendApplicationMutation.mutateAsync({
        autoApplyId,
        coverLetterId,
        resumeId,
        recruiterEmail,
        jobDescription,
      });
      setActiveStep(4);
      startConfetti();
      toast.success("Application Submitted Successfully!");
      setOpenModal(true);
    } catch (error: any) {
      toast.error("Auto apply failed. Please try again.", {
        action: {
          label: "Authenticate",
          onClick: () => router.push("/dashboard/settings"),
        },
        classNames: {
          actionButton: "!bg-blue-600 hover:!bg-blue-700 !text-white !h-8",
        },
      });
    }
  };

  const BUCKET_PUBLIC_URL = "https://storage.googleapis.com/cverai";

  const buildViewerSrc = (gcsPath: string) => {
    if (!gcsPath) return "";

    // Construct permanent public URL
    const publicUrl = `${BUCKET_PUBLIC_URL}/${encodeURIComponent(gcsPath)}`;

    const isPDF = publicUrl.toLowerCase().endsWith(".pdf");

    if (isPDF) {
      // PDF viewer options
      return `${publicUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
    }

    // Word or any Office document
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
      publicUrl,
    )}`;
  };

  // Usage
  const viewerSrc = buildViewerSrc(
    masterCvData?.gcsPath ?? resumeData?.gcsPath ?? "",
  );

  useEffect(() => {
    if (user?.firstName)
      sendGTMEvent({
        event: `Preview Page`,
        value: `${user?.firstName} viewed Preview Page`,
      });
  }, [user?.firstName]);

  const handleEditClick = (value: boolean) => {
    setEditResume(value);
  };

  const isSubmitting =
    sendApplicationMutation.isPending || deleteApplicationMutation.isPending;

  return openModal ? (
    <CongratulationModal handleOpenModal={handleOpenModal} />
  ) : (
    <div className="space-y-4 sm:space-y-8">
      <ProgressIndicator activeStep={activeStep} />
      <div className="flex w-full gap-3 items-center  p-4 bg-white justify-between">
        <p className="text-md font-medium font-inter">
          {isSubmitting ? "Sending application... " : "Preview Application"}
        </p>

        <div className="flex gap-2">
          <GmailCompose
            coverLetterData={coverLetterData!}
            recruiterEmail={recruiterEmail}
          />
          <Button
            className="text-2xs"
            variant="destructive"
            disabled={isSubmitting}
            onClick={handleCoverLetterDelete}
          >
            <Trash className="size-4" />
          </Button>
          <Button
            disabled={isSubmitting}
            variant="outline"
            className="text-xs"
            onClick={handleSubmit}
          >
            {isSubmitting ? <Loader className="animate-spin" /> : <Send />}
          </Button>
        </div>
      </div>
      <TailorCoverLetterDisplay
        user={user}
        data={coverLetterData}
        recruiterEmail={recruiterEmail}
      />
      {settings?.useMasterCv || isMasterCv ? (
        <div className="h-[80svh] overflow-hidden">
          <iframe
            src={viewerSrc}
            className="w-full h-[85svh] overflow-hidden border-0"
            title="Resume PDF"
          />
        </div>
      ) : editResume ? (
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
      <div className="flex items-center justify-center max-sm:fixed w-full h-16 bottom-4 left-0 ">
        <Button disabled={isSubmitting} onClick={handleSubmit} className="w-64">
          Submit <Sparkles className="ml-2 h-4 w-4" />
        </Button>
      </div>
      <AuthorizeGoogle hidden={true} />
    </div>
  );
};

export default Preview;
