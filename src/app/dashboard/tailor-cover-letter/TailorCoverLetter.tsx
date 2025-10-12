import React, { useRef, useEffect, memo } from "react";
import { Loader2 } from "lucide-react";
import { useCoverLetterGenerator } from "@/hooks/useCoverLetterGenerator";
import { useAuth } from "@/hooks/use-auth";
import { usePathname, useRouter } from "next/navigation";
import { createCoverLetterOrderedParams } from "@/lib/utils/helpers";
import { toast } from "sonner";
import { isEmpty } from "lodash";
import { COLLECTIONS } from "@/lib/utils/constants";

export const TailorCoverLetter = memo<{
  jobDescription: string;
  coverletterId: string;
}>(({ jobDescription, coverletterId }) => {
  console.count("TEMP EMAIL COMPOSE RENDERED");

  const {
    generatedContent,
    isGenerating,
    error,
    documentId,
    generateCoverLetter,
  } = useCoverLetterGenerator();

  const contentRef = useRef<HTMLDivElement>(null);
  const hasGeneratedRef = useRef(false); // Track if we've already generated
  const hasUpdatedRouteRef = useRef(false); // Track if we've updated the route

  const { user, useCareerDoc } = useAuth();
  const { data } = useCareerDoc<{ coverLetter: string }>(
    coverletterId ?? documentId,
    COLLECTIONS.COVER_LETTER
  );
  const router = useRouter();
  const pathname = usePathname();

  // ✅ Generate cover letter only once when component mounts
  useEffect(() => {
    if (user && jobDescription && !coverletterId && !hasGeneratedRef.current) {
      hasGeneratedRef.current = true;

      toast.promise(generateCoverLetter({ user, jobDescription }), {
        loading: "Generating your tailored cover letter...",
        success: () => {
          return {
            message: "Cover letter generation complete!",
            description: "Cverai is thinking...",
            closeButton: true,
          };
        },
        error: "Failed to generate cover letter",
      });
    }
  }, [user, jobDescription, coverletterId, generateCoverLetter]);

  // ✅ Update route and trigger step change only once when documentId is available
  useEffect(() => {
    if (!documentId || hasUpdatedRouteRef.current) return;

    hasUpdatedRouteRef.current = true;

    const orderedParams = createCoverLetterOrderedParams(
      documentId,
      jobDescription
    );
    router.replace(`${pathname}?${orderedParams.toString()}`);

 
  }, [
    documentId,
    jobDescription,
    pathname,
    router,
    generatedContent,
  ]);

  // ✅ Auto-scroll to bottom when content changes
  useEffect(() => {
    if (contentRef.current && generatedContent) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [generatedContent]);

  const isGeneratedEmpty = isEmpty(generatedContent);
  const displayContent = isGeneratedEmpty
    ? data?.coverLetter
    : generatedContent;

  return (
    <div className="grid grid-cols-1">
      <div className="bg-slate-50 border-b border-slate-200 shadow-md rounded-xl flex flex-col items-center justify-between">
        <div className="flex w-full gap-3 items-center p-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <span className="text-sm font-medium text-slate-500">
            Email content
          </span>
        </div>

        <div
          ref={contentRef}
          className="bg-white p-4 h-[500px] overflow-y-auto w-full"
        >
          {isGenerating && !generatedContent ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="text-sm">Generating your cover letter...</p>
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-mono text-sm">
              {displayContent}
              {isGenerating && (
                <span className="inline-block w-2 h-5 bg-blue-600 ml-1 animate-pulse"></span>
              )}
            </div>
          )}
        </div>

        {generatedContent && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Review and customize the generated content
              before sending. Add personal touches to make it uniquely yours!
            </p>
          </div>
        )}

        {error && (
          <div className="text-red-500 p-4 shadow-xl w-full">
            Error: {JSON.stringify(error)}
          </div>
        )}
      </div>
    </div>
  );
});

TailorCoverLetter.displayName = "TailorCoverLetter";
