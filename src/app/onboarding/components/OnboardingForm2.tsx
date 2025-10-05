"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { cn } from "@/lib/utils";
import { FileUpload } from "./file-upload";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { OnboardingFormProps } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import Progress from "./Progress";
import OnboardingTabs from "./OnboardingTabs";

const formSchema = z.object({
  scratch: z.boolean().default(false).optional(),
  resume: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "File must be 10MB or smaller",
    })
    .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
      message: "Only PDF or Word documents are allowed",
    })
    .optional()
    .nullable(),
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const OnBoardingForm2 = ({
  onNext,
  onPrev,
  initialUser,
}: OnboardingFormProps) => {
  const { updateUser, isUpdatingUserLoading } = useAuth();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scratch: false,
      resume: null,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { resume, ...rest } = values;
    try {
      await updateUser(rest);
      toast.success(
        `${initialUser?.displayName} Your data has be saved!`
      );
      onNext();
    } catch (error) {
      console.error(error);
      toast.error(` please try again.`);
      toast("Skip this process", {
        action: {
          label: "Skip",
          onClick: () => () => onNext(),
        },
      });
    }
  }
  const isMobile = useIsMobile();
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="min-h-screen items-center justify-center flex flex-col font-poppins"
    >
      <div className="onboarding-container">
        <div
          className={cn(
            "flex justify-between mb-9 w-full max-w-screen-lg ",
            isMobile && "fixed top-0 left-0 width-full px-4 pt-5"
          )}
        >
          <img src="/logo.svg" alt="" className="" />
          <Progress min={2} max={7} progress={20} />
        </div>
        <div className="onboarding-card">
          <OnboardingTabs activeTab={"cv-handling"}/>
          <div className="space-y-6">
            <div>
              <h1 className="onboarding-h1">
                Do you have CV?
              </h1>
            </div>
          </div>
          <Form {...form}>
            <form className="space-y-6 w-full" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="resume"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FileUpload
                        onChange={(file) => {
                          field.onChange(file);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scratch"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center border p-4 rounded-sm ">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={async (checked: boolean) => {
                          field.onChange(checked);
                         
                        }}
                      />
                    </FormControl>
                    <FormLabel>Create from scratch</FormLabel>
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={"outline"}
                  onClick={() => onPrev()}
                  className="onboarding-btn"
                >
                  Previous
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdatingUserLoading}
                    className="onboarding-btn"
                >
                  {isUpdatingUserLoading ? "Saving..." : "Save and Continue"}{" "}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </motion.div>
  );
};
