"use client";

import { apiService } from "@/hooks/use-auth";
import { EditableResume } from "../(dashboard)/ai-apply/components/resume/EditableResume";
import { ProgressIndicator } from "../(dashboard)/ai-apply/progress-indicator";
import TailorCoverLetterDisplay from "../tailor-cover-letter/[coverLetterId]/TailorCoverLetterDisplay";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries/user.queries";
import { resumeQueries } from "@/lib/queries/resume.queries";
import { coverLetterQueries } from "@/lib/queries/cover-letter.queries";
import { CongratulationModal } from "@/components/shared/CongratulationModal";
import { Loader, Send, Sparkles, Trash } from "lucide-react";
import { api } from "@/lib/api/client";
import { COLLECTIONS } from "@/lib/utils/constants";
import { aiApplyQueries } from "@/lib/queries/ai-apply.queries";
import { isEmpty } from "lodash";
import { sendGTMEvent } from "@next/third-parties/google";
import { useFireworksConfetti } from "@/components/ui/confetti";
import AuthorizeGoogle from "@/hooks/gmail/AuthorizeGoogle";
import { GmailCompose } from "./GmailCompose";

const Preview = ({
  coverLetterId,
  resumeId,
  recruiterEmail,
  jobDescription,
  aiApplyId,
}: {
  coverLetterId: string;
  resumeId: string;
  jobDescription: string;
  recruiterEmail: string;
  aiApplyId: string;
}) => {
  const [activeStep, setActiveStep] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { start: startConfetti } = useFireworksConfetti();

  const { data: user } = useQuery(userQueries.detail());

  const { data: resumeData } = useQuery(resumeQueries.detail(resumeId));
  const { data: coverLetterData } = useQuery(
    coverLetterQueries.detail(coverLetterId),
  );

  const defaultResume = user?.dataSource?.find(
    (resume) => resume.id === user?.defaultDataSource,
  );

  const handleOpenModal = (value: boolean) => {
    setOpenModal(value);
  };

  const handleCoverLetterDelete = async () => {
    await api.delete(
      `/delete-document/${aiApplyId}?docType=${COLLECTIONS.AI_APPLY}&resumeId=${resumeId}&coverLetterId=${coverLetterId}`,
    );
    toast.success("Cover letter deleted successfully");
    router.push("/dashboard/home");
    await Promise.all([
      queryClient.invalidateQueries(resumeQueries.all()),
      queryClient.invalidateQueries(coverLetterQueries.all()),
      queryClient.invalidateQueries(aiApplyQueries.all()),
      queryClient.invalidateQueries(userQueries.detail()),
    ]);
  };

  const handleSubmit = async () => {
    const frontendURL = process.env.NEXT_PUBLIC_APP_URL;
    if (!user?.aiApplyPreferences) {
      toast.error(
        "Visit the Settings to configure your AI Apply Preferences. Enable Auto Apply in the third card section to get started.",
        {
          action: {
            label: "Enable",
            onClick: () =>
              window.open(
                `${frontendURL}/dashboard/settings?tab=ai-applypreference`,
              ),
          },
          classNames: {
            // toast: "!bg-yellow-50 !border-yellow-200",
            actionButton: "!bg-blue-600 hover:!bg-blue-700 !text-white !h-8",
          },
        },
      );

      return;
    }

    if (!user || !coverLetterData) {
      toast.error("Missing required data");
      return;
    }
    try {
      setIsSubmitting(true);
      await apiService.sendApplication(
        user,
        coverLetterId,
        resumeId,
        recruiterEmail,
        jobDescription,
        user?.aiApplyPreferences.autoSendApplications,
        user?.aiApplyPreferences?.useMasterCV && defaultResume?.gcsPath,
      );
      setActiveStep(4);
      startConfetti();
      toast.success("Application Submitted Successfully!");
      await Promise.all([
        queryClient.invalidateQueries(resumeQueries.all()),
        queryClient.invalidateQueries(coverLetterQueries.all()),
        queryClient.invalidateQueries(aiApplyQueries.all()),
        queryClient.invalidateQueries(userQueries.detail()),
      ]);
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
    } finally {
      setIsSubmitting(false);
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
  const viewerSrc = buildViewerSrc(defaultResume?.gcsPath);

  useEffect(() => {
    if (user?.firstName)
      sendGTMEvent({
        event: `Preview Page`,
        value: `${user?.firstName} viewed Preview Page`,
      });
  }, [user?.firstName]);
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
            resumeData={resumeData!}
          />
          <Button
            className="text-2xs"
            variant={"destructive"}
            disabled={isSubmitting}
            onClick={() => {
              handleCoverLetterDelete();
            }}
          >
            <Trash className="size-4" />
          </Button>
          <Button
            disabled={isSubmitting}
            variant={"outline"}
            className="text-xs"
            onClick={handleSubmit}
          >
            {isSubmitting ? <Loader className="animate-spin" /> : <Send />}
          </Button>
        </div>
      </div>
      {isEmpty(coverLetterData) ? null : (
        <TailorCoverLetterDisplay
          user={user}
          data={coverLetterData}
          recruiterEmail={recruiterEmail}
        />
      )}
      {user?.aiApplyPreferences?.useMasterCV ? (
        <div className="h-[80svh] overflow-hidden">
          <iframe
            src={viewerSrc}
            // src={`${defaultResume?.url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
            className="w-full h-[85svh] overflow-hidden border-0"
            title="Resume PDF"
          />
        </div>
      ) : (
        <EditableResume data={resumeData!} resumeId={resumeId} />
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
