import React, { useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useCoverLetterGenerator } from "@/hooks/useCoverLetterGenerator";
import { useAuth } from "@/hooks/use-auth";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createOrderedParams } from "@/lib/utils/helpers";
import { toast } from "sonner";
import { isEmpty } from "lodash";

export const TemporaryEmailCompose: React.FC<{
  handleStepChange: (
    step: number,
    key: "resume" | "emailContent",
    value: any
  ) => void;
  userProfile: string;
  jobDescription: string;
  coverletterId: string;
}> = ({ handleStepChange, userProfile, jobDescription, coverletterId }) => {
  const {
    generatedContent,
    isGenerating,
    error,
    documentId,
    generateCoverLetter,
  } = useCoverLetterGenerator();


  const contentRef = useRef<HTMLDivElement>(null);

  console.log("Document ID:", coverletterId, documentId);

  const { useCareerDoc } = useAuth();
  const { data } = useCareerDoc(coverletterId ?? documentId);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  console.log("Current Pathname:", pathname);

  useEffect(() => {
    console.log("Render phase", userProfile, jobDescription, coverletterId);

    if (userProfile && jobDescription && !coverletterId) {
      generateCoverLetter({ userProfile, jobDescription });
    }
  }, []);

  useEffect(() => {
    if (!documentId) return;
    const orderedParams = createOrderedParams(documentId, jobDescription);
    router.replace(`${pathname}?${orderedParams.toString()}`);
    console.log({ data, searchParams, pathname, documentId });
    toast.success(
      "Resume generation complete! Proceeding to next step in 5 seconds..." +
        JSON.stringify({ data, searchParams, pathname, documentId })
    );

    setTimeout(() => {
      handleStepChange(2, "emailContent", generatedContent);
    }, 5000);
  }, [documentId]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [generatedContent]);

  const isGeneratedEmpty = isEmpty(generatedContent);

  console.log("Generating : ", generatedContent, isGenerating, error);

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
          {isGenerating && !generatedContent && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="text-sm">Generating your cover letter...</p>
            </div>
          )}

          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-mono text-sm">
            {isGeneratedEmpty ? data?.coverLetter : generatedContent}
            {isGenerating && (
              <span className="inline-block w-2 h-5 bg-blue-600 ml-1 animate-pulse"></span>
            )}
          </div>
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
            {JSON.stringify(error)}
          </div>
        )}
      </div>
    </div>
  );
};

// [
//   documentId,
//   jobDescription,
//   createOrderedParams,
//   pathname,
//   router,
//   handleStepChange,
// ]
// const generateCoverLetter = async () => {
//   if (!formData.jobDescription.trim()) {
//     setError("Please provide a job description");
//     return;
//   }

//   setIsGenerating(true);
//   setError("");
//   setGeneratedContent("");
//   setCopied(false);

//   abortControllerRef.current = new AbortController();

//   const API_BASE_URL =
//     process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:3000";

//   try {
//     const response = await fetch(`${API_BASE_URL}/v1/generate-cover-letter`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(formData),
//       signal: abortControllerRef.current.signal,
//     });

//     if (!response.ok) {
//       throw new Error("Failed to generate cover letter");
//     }

//     const reader = response.body?.getReader();
//     const decoder = new TextDecoder();

//     if (!reader) {
//       throw new Error("No response body");
//     }

//     while (true) {
//       const { done, value } = await reader.read();
//       if (done) break;

//       const chunk = decoder.decode(value);
//       const lines = chunk.split("\n");

//       for (const line of lines) {
//         if (line.startsWith("data: ")) {
//           const data = JSON.parse(line.slice(6));

//           if (data.error) {
//             setError(data.error);
//             setIsGenerating(false);
//             return;
//           }

//           if (data.done) {
//             setIsGenerating(false);
//             return;
//           }

//           if (data.content) {
//             setGeneratedContent((prev) => prev + data.content);
//           }
//         }
//       }
//     }
//   } catch (err: any) {
//     if (err.name === "AbortError") {
//       setError("Generation cancelled");
//     } else {
//       setError("Failed to generate cover letter. Please try again.");
//     }
//   } finally {
//     setIsGenerating(false);
//   }
// };

// const handleCopy = async () => {
//   try {
//     await navigator.clipboard.writeText(generatedContent);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   } catch (err) {
//     // setError("Failed to copy to clipboard");
//   }
// };

// const handleDownload = () => {
//   const blob = new Blob([generatedContent], { type: "text/plain" });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = "cover-letter.txt";
//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);
//   URL.revokeObjectURL(url);
// };

// const handleCancel = () => {
//   if (abortControllerRef.current) {
//     abortControllerRef.current.abort();
//     // setIsGenerating(false);
//   }
// };
// const allEmpty = isEmpty(data) && isGeneratedEmpty;

{
  /* <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Input Details
        </h2>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            {!isGenerating ? (
              <button
                onClick={() =>
                  generateCoverLetter({ userProfile, jobDescription })
                }
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
              >
                <Sparkles className="w-5 h-5" />
                Generate Cover Letter
              </button>
            ) : (
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-200 flex items-center justify-center gap-2"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div> */
}

{
  /* <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"> */
}
{
  /* <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Generated Cover Letter
          </h2>
          {generatedContent && !isGenerating && (
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Copy to clipboard"
              >
                {copied ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={handleDownload}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Download as text file"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          )}
        </div> */
}
