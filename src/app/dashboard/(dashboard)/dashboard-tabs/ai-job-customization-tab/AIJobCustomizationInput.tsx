"use client";
import { ArrowUp, Plus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { memo, useState } from "react";
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
import {
  ACTION_OPTIONS,
  ActionValue,
  PROFILE_OPTIONS,
} from "../../components/constants";
import { SelectOptions, SelectProfile } from "../../components/SelectOptions";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useDocumentExtraction } from "@/app/onboarding/onboarding-pages/AnyFormatToText";
import { UploadedFile } from "@/types";
import { userQueries } from "@/lib/queries/user.queries";
import { useQuery } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import { FileUploadForm } from "@/components/FileUploadForm";
import { isEmpty } from "lodash";
import JoinOurTelegramGroupAlert from "@/components/shared/JoinOurTelegramGroupAlert";

const FORM_SCHEMA = z.object({
  jobDescription: z.string().min(2, {
    message: "job description must be at least 2 characters.",
  }),
});

export const AIJobCustomizationInput = memo(() => {
  const { data: user } = useQuery(userQueries.detail());
  const profile = user?.dataSource;
  const [docsInput, setDocsInput] = useState<ActionValue>("tailor-resume");
  const [userProfile, setUserProfile] = useState<string>(() => {
    return profile?.[0]?.id || "";
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");

  const router = useRouter();
  const noCredit = user?.credit === 0;

  const isSelectedFile = !isEmpty(uploadedFiles);

  const form = useForm<z.infer<typeof FORM_SCHEMA>>({
    // resolver: zodResolver(FORM_SCHEMA),
    defaultValues: {
      jobDescription: "",
    },
  });

  const onSubmit = ({ jobDescription }: z.infer<typeof FORM_SCHEMA>) => {
    if (noCredit) {
      toast.error(`Please upgrade or refer more people to Cver AI`);
      return;
    }
    router.push(
      `/dashboard/${docsInput}/${uuidv4()}?profile=${userProfile}&jobDescription=${
        jobDescription + extractedText
      }&aiApply=false`,
    );
  };

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

  return (
    <div>
      <div className="relative! h-36">
        <div
          // className="relative shadow-blue-200 border-blue-500 rounded-2xl border-r shadow-xl h-38"
          className={cn(
            "relative shadow-blue-200 border-blue-500 rounded-2xl border-r shadow-xl  flex flex-col justify-between",
            isSelectedFile ? "" : "h-38",
          )}
        >
          <FileUploadForm
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
            isProcessing={isProcessing}
          />
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
              <FormField
                control={form.control}
                name="jobDescription"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <textarea
                        placeholder="Let's get started"
                        // className="w-full outline-none focus:outline-none text-xs focus:border-none p-2 resize-none pl-4 pt-2 border-none placeholder:font-medium focus-visible:border-none h-26"
                        className={cn(
                          "w-full outline-none focus:outline-none focus:border-none p-2 resize-none pl-4 pt-2 border-none placeholder:font-medium focus-visible:border-none  text-xs",
                          isSelectedFile ? "" : "h-26",
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex  justify-between bg-yellow py-2">
                <div className="flex gap-2 px-3">
                  <DropdownMenu
                    open={isDropdownOpen}
                    onOpenChange={setIsDropdownOpen}
                  >
                    <DropdownMenuTrigger className="data-[state=open]:shadow-2xl! rounded-full border-blue-500 p-1 hover:cursor-pointer z-20 border-2">
                      <Plus className="text-blue-400 size-4 font-bold" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="p-0 flex flex-col gap-"
                      align="start"
                    >
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                        className="hidden "
                      />

                      {PROFILE_OPTIONS.slice(1).map(
                        ({ label, value, icon: Icon }, index) => (
                          <div key={value}>
                            <label
                              htmlFor="file-upload"
                              className={cn(
                                "gap-2 p-2 group hover:text-primary hover:cursor-pointer flex items-center text-xs",
                              )}
                            >
                              {Icon && (
                                <Icon className="size-4 group-hover:text-primary" />
                              )}
                              <span className="group-hover:text-primary">
                                {label}
                              </span>
                            </label>
                            <Separator
                              className={cn(index == 1 && "hidden", "m")}
                            />
                          </div>
                        ),
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="hover:cursor-pointer z-20">
                    <SelectOptions
                      options={ACTION_OPTIONS}
                      value={docsInput}
                      onValueChange={(value) => setDocsInput(value)}
                      placeholder="Tailor Resume"
                      triggerClassName={
                        " border-2 border-primary/70 rounded-xl text-primary hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 [&_svg]:!text-primary  text-2xs"
                      }
                      contentClassName="text-xs"
                    />
                  </div>
                </div>
                <div className="flex gap-2 px-3">
                  <div className="hover:cursor-pointer ">
                    <SelectProfile
                      options={profile ?? []}
                      value={userProfile}
                      onValueChange={(value) => {
                        setUserProfile(value);
                      }}
                      placeholder="Tailor Resume"
                      triggerClassName={
                        " border-2 border-primary/70 rounded-xl text-primary hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 [&_svg]:!text-primary  text-2xs"
                      }
                      contentClassName="text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-full border-blue-500 border-2 p-1 hover:cursor-pointer "
                  >
                    <ArrowUp className="text-blue-400 size-4" />
                  </button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>

      <JoinOurTelegramGroupAlert />
    </div>
  );
});

AIJobCustomizationInput.displayName = "AIJobCustomizationInput";
