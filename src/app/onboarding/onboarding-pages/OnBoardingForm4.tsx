"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { OnboardingFormProps } from "@/types";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import OnboardingTabs from "./OnBoardingTabs";
import Progress from "./Progress";
import { useIsMobile } from "@/hooks/use-mobile";
import { FloatingLabelInput } from "./FloatingInput";
import { userQueries } from "@/lib/queries/user.queries";
import { useQuery } from "@tanstack/react-query";
import { axiosApiClient } from "@/lib/axios/auth-api";

const formSchema = z.object({
  tailoringIssue: z.boolean().default(false).optional(),
  coverLetterIssue: z.boolean().default(false).optional(),
  aiJobIssue: z.boolean().default(false).optional(),
  jobTrackingIssue: z.boolean().default(false).optional(),
  findingJobIssue: z.boolean().default(false).optional(),
  aiPersonalizationIssue: z.boolean().default(false).optional(),
  others: z.string(),
});

export const OnBoardingForm4 = ({
  onNext,
  onPrev,
  children,
}: OnboardingFormProps) => {
  const { isUpdatingUserLoading } = useAuth();
  const { data: user } = useQuery(userQueries.detail());

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tailoringIssue: false,
      coverLetterIssue: false,
      aiJobIssue: false,
      jobTrackingIssue: false,
      findingJobIssue: false,
      aiPersonalizationIssue: false,
      others: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await axiosApiClient.put("/user/onboarding", {
        stepNumber: 4,
        userNeed: values,
      });
      toast.success(`${user?.firstName} Your data has be saved!`);
      onNext();
    } catch (error) {
      console.error(error);
      toast.error(` please try again.`);
      toast("Skip this process", {
        action: {
          label: "Skip",
          onClick: () => {
            onNext();
          },
        },
      });
    }
  }

  const isMobile = useIsMobile();

  return (
    <motion.div
      // @ts-ignore
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="min-h-screen items-center justify-center flex flex-col font-poppins"
    >
      <div className="absolute right-4 top-2 z-50">{children}</div>
      <div className="onboarding-container">
        <div
          className={cn(
            "flex justify-between mb-9 w-full max-w-screen-lg ",
            isMobile &&
              "fixed top-0 left-0 width-full px-4 pt-5 backdrop-blur-2xl z-50 pb-4",
          )}
        >
          <img src="/cverai-logo.png" className="w-28 h-8" alt="" />
          <Progress min={4} max={7} progress={50} />
        </div>
        <div className="onboarding-card">
          <OnboardingTabs activeTab={"identify-challenges"} />
          <div className="space-y-6">
            <div>
              <h1 className="onboarding-h1">
                What challenges are you facing in your job search?
              </h1>
            </div>
          </div>

          <Form {...form}>
            <form
              className="space-y-6 w-full"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tailoringIssue"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center border p-2 md:p-4 rounded-sm ">
                        <FormControl>
                          <Checkbox
                            id="tailoringIssue"
                            checked={field.value}
                            onCheckedChange={async (checked: boolean) => {
                              field.onChange(checked);
                            }}
                          />
                        </FormControl>
                        <FormLabel
                          className={cn(
                            field.value
                              ? "text-black"
                              : "text-muted-foreground font-normal",
                            "h1",
                          )}
                          htmlFor="tailoringIssue"
                        >
                          Writing/tailoring my CV
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="coverLetterIssue"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center border p-2 md:p-4 rounded-sm ">
                        <FormControl>
                          <Checkbox
                            id="coverLetterIssue"
                            checked={field.value}
                            onCheckedChange={async (checked: boolean) => {
                              field.onChange(checked);
                            }}
                          />
                        </FormControl>
                        <FormLabel
                          className={cn(
                            field.value
                              ? "text-black"
                              : "text-muted-foreground font-normal",
                            "h1",
                          )}
                          htmlFor="coverLetterIssue"
                        >
                          Cover letter writing
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="aiJobIssue"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center border p-2 md:p-4 rounded-sm ">
                        <FormControl>
                          <Checkbox
                            id="aiJobIssue"
                            checked={field.value}
                            onCheckedChange={async (checked: boolean) => {
                              field.onChange(checked);
                            }}
                          />
                        </FormControl>
                        <FormLabel
                          className={cn(
                            field.value
                              ? "text-black"
                              : "text-muted-foreground font-normal",
                            "h1",
                          )}
                          htmlFor="aiJobIssue"
                        >
                          AI job applications
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jobTrackingIssue"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center border p-2 md:p-4 rounded-sm ">
                        <FormControl>
                          <Checkbox
                            id="jobTrackingIssue"
                            checked={field.value}
                            onCheckedChange={async (checked: boolean) => {
                              field.onChange(checked);
                            }}
                          />
                        </FormControl>
                        <FormLabel
                          className={cn(
                            field.value
                              ? "text-black"
                              : "text-muted-foreground font-normal",
                            "h1",
                          )}
                          htmlFor="jobTrackingIssue"
                        >
                          Job tracking/management
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="findingJobIssue"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center border p-2.5 md:p-4 rounded-sm ">
                        <FormControl>
                          <Checkbox
                            id="findingJobIssue"
                            checked={field.value}
                            onCheckedChange={async (checked: boolean) => {
                              field.onChange(checked);
                            }}
                          />
                        </FormControl>
                        <FormLabel
                          className={cn(
                            field.value
                              ? "text-black"
                              : "text-muted-foreground font-normal",
                            "h1",
                          )}
                          htmlFor="findingJobIssue"
                        >
                          Finding jobs
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="aiPersonalizationIssue"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center border p-2 md:p-4 rounded-sm ">
                        <FormControl>
                          <Checkbox
                            id="aiPersonalizationIssue"
                            checked={field.value}
                            onCheckedChange={async (checked: boolean) => {
                              field.onChange(checked);
                            }}
                          />
                        </FormControl>
                        <FormLabel
                          className={cn(
                            field.value
                              ? "text-black"
                              : "text-muted-foreground font-normal",
                            "h1",
                          )}
                          htmlFor="aiPersonalizationIssue"
                        >
                          AI personalization
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="mt-8 space-y-4">
                <FormField
                  control={form.control}
                  name="others"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelInput
                          label="Input other reason"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                  {isUpdatingUserLoading
                    ? "Saving..."
                    : "Save and Continue"}{" "}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </motion.div>
  );
};
