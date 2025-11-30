"use client";

import { ArrowUp, Plus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { memo, useCallback, useState } from "react";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { PROFILE_OPTIONS } from "../../components/constants";
import { useRouter } from "next/navigation";
import { emailRegex } from "@/validation";
import { FileUploadForm } from "@/components/FileUploadForm";
import { UploadedFile } from "@/types";
import { cn } from "@/lib/utils";
import { useDocumentExtraction } from "@/app/onboarding/onboarding-pages/AnyFormatToText";
import { isEmpty } from "lodash";
import { apiService, useAuth } from "@/hooks/use-auth";

const FORM_SCHEMA = z.object({
  jobDescription: z.string().min(2, {
    message: "job description must be at least 2 characters.",
  }),
});

export const AIApplyInput = memo(
  ({ jobDescription }: { jobDescription: string }) => {
    const { user } = useAuth();
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile | null>(
      null
    );
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [extractedText, setExtractedText] = useState<string>("");

    const router = useRouter();
    const isSelectedFile = !isEmpty(uploadedFiles);

    const form = useForm<z.infer<typeof FORM_SCHEMA>>({
      defaultValues: {
        jobDescription: jobDescription || "",
      },
    });

    const { processDocument, isProcessing } = useDocumentExtraction();

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];

      const fileType = file.type.startsWith("image/") ? "image" : "pdf";
      const reader = new FileReader();

      reader.onload = async (e) => {
        const preview = e.target?.result as string;
        setUploadedFiles({ file, preview, type: fileType });
        try {
          toast.promise(processDocument(file), {
            loading: `Cver AI is converting this ${fileType} into text.`,
            success: (data) => {
              setExtractedText(data?.text ?? "");
              return `Done processing the ${fileType}`;
            },
            error: "Error",
          });
        } catch (error) {
          console.error("Error extracting text:", error);
        }
      };

      reader.readAsDataURL(file);

      event.target.value = "";

      setIsDropdownOpen(false);
    };

    const onSubmit = useCallback(
      async ({ jobDescription }: z.infer<typeof FORM_SCHEMA>) => {
        const foundEmails =
          jobDescription.match(emailRegex) ||
          extractedText.match(emailRegex) ||
          [];

        if (user?.email) {
          const { isAuthorized } = await apiService.gmailOauthStatus();

          if (!isAuthorized) {
            toast(
              "Please authorize Cver AI to send emails on your behalf from the settings page.  ",
              {
                action: {
                  label: "Authorize now",
                  onClick: () =>
                    router.push(`/dashboard/settings?tab=ai-applypreference`),
                },
                classNames: {
                  // toast: "!bg-yellow-50 !border-yellow-200",
                  actionButton:
                    "!bg-blue-600 hover:!bg-blue-700 !text-white !h-8",
                },
              }
            );

            return;
          }
        }

        if (foundEmails.length === 0) {
          toast.error(
            "No destination email found in job description. Please include the destination email in the job description."
          );
          return;
        }

        const params = new URLSearchParams();
        params.set(
          "jobDescription",
          JSON.stringify(jobDescription + extractedText)
        );
        params.set("recruiterEmail", JSON.stringify(foundEmails[0]));
        router.push(
          `/dashboard/tailor-cover-letter/${uuidv4()}?${params}&aiApply=true`
        );
      },
      [router, extractedText]
    );

    return (
      <div
        className={cn(
          "relative shadow-blue-200 border-blue-500 rounded-2xl border-r shadow-xl  flex flex-col justify-between",
          isSelectedFile ? "" : "h-38"
        )}
      >
        <FileUploadForm
          uploadedFiles={uploadedFiles}
          setUploadedFiles={setUploadedFiles}
          isProcessing={isProcessing}
        />

        <Form {...form}>
          <form className="w-full h-full">
            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <textarea
                      placeholder="Let's get started"
                      className={cn(
                        "w-full outline-none focus:outline-none focus:border-none p-2 resize-none pl-4 pt-2 border-none placeholder:font-medium focus-visible:border-none  text-xs",
                        isSelectedFile ? "" : "h-26"
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <div className="flex justify-between  p-2">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger className="data-[state=open]:!shadow-2xl rounded-full border-blue-500 p-1 hover:cursor-pointer z-20 border-2">
              <Plus className="text-blue-400 size-4 font-bold" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="p-2 flex flex-col gap-2"
              align="start"
            >
              <input
                id="file-upload"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden "
              />

              {PROFILE_OPTIONS.slice(1).map(({ label, value, icon: Icon }) => (
                <label
                  htmlFor="file-upload"
                  key={value}
                  className={cn(
                    "gap-2 group hover:text-primary hover:cursor-pointer p-0 flex items-center text-xs"
                  )}
                >
                  {Icon && <Icon className="size-4 group-hover:text-primary" />}
                  <span className="group-hover:text-primary">{label}</span>
                  <DropdownMenuSeparator />
                </label>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={form.handleSubmit(onSubmit)}
            className="rounded-full border-blue-500 border-2 p-1 hover:cursor-pointer z-50,"
          >
            <ArrowUp className="text-blue-400 size-4" />
          </button>
        </div>
      </div>
    );
  }
);

AIApplyInput.displayName = "AIApplyInput";
