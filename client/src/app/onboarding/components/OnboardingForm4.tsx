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

import { Progress } from "@/components/ui/progress";
import { useId, useState } from "react";
import { FloatingLabelInputProps } from "@/types";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const formSchema = z.object({
  tailoringIssue: z.boolean().default(false).optional(),
  coverLetterIssue: z.boolean().default(false).optional(),
  aiJobIssue: z.boolean().default(false).optional(),
  jobTrackingIssue: z.boolean().default(false).optional(),
  findingJobIssue: z.boolean().default(false).optional(),
  aiPersonalizationIssue: z.boolean().default(false).optional(),
  others: z.string(),
});

export const OnBoardingForm4 = ({ onNext, onPrev }: any) => {
  const { updateUser, isUpdatingUserLoading, user } = useAuth();

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

  function FloatingLabelInput({
    id,
    label,
    type = "text",
    className = "",
    showPasswordToggle = false,
    ...props
  }: FloatingLabelInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const inputId = useId();
    const actualId = id || inputId;

    const handleFocus = () => setIsFocused(true);

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(e.target.value.length > 0);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      props.onChange?.(e);
    };

    const isLabelFloated = isFocused || hasValue;

    return (
      <div className="group relative">
        <label
          htmlFor={actualId}
          className={`
            absolute left-3 z-10 px-2 text-sm
            bg-background text-muted-foreground
            transition-all duration-200 ease-in-out
            pointer-events-none font-poppins
            ${isLabelFloated ? "-top-2.5 text-xs text-foreground" : "top-3"}
          `}
        >
          {label}
        </label>
        <div className="relative">
          <Input
            id={actualId}
            disabled={isUpdatingUserLoading}
            className={`
              h-12  px-3 pr-${showPasswordToggle ? "12" : "3"}
              transition-colors duration-200 font-poppins
              border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-[4px]
              ${className}
            `}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
        </div>
      </div>
    );
  }
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form submitted:", values);
    try {
      await updateUser(values);
      toast.success(` Your data has be saved!`);
      onNext();
    } catch (error) {
      toast.error(` please try again.`);
      toast("Skip this process", {
        action: {
          label: "Skip",
          onClick: () => () => onNext(),
        },
      });
    }
  }

  const tabs = [
    {
      title: "Basic Information",
      url: "",
      active: false,
    },
    {
      title: "CV Handling",
      url: "",
      active: false,
    },
    {
      title: "Job Preference",
      url: "",
      active: false,
    },
    {
      title: "Identify Challenges",
      url: "",
      active: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="min-h-screen flex flex-col font-poppins"
    >
      <div
        className="h-32 w-full fixed"
        style={{
          background: "url('/landing-page-menu-gradient.svg')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      />
      <div className="grid grid-cols-3 gap-4 justify-between w-full max-w-[763px] mx-auto mb-8 mt-16 px-4">
        <div className="flex col-span-2 items-center space-x-2">
          <img src="/logo.svg" alt="" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <p className="">Progress</p>
            <p className="">4/6</p>
          </div>
          <Progress value={50} className="w-full " />
        </div>
      </div>
      <div className="flex items-center justify-center flex-1 mb-16">
        <div className="flex-1 flex items-center justify-center bg-white max-w-3xl shadow-2xl rounded-[4px] p-8 sm:p-16">
          <div className="w-full max-w-2xl space-y-8">
            <div className="flex justify-between max-sm:flex-wrap max-sm:gap-4">
              {tabs.map((tab) => (
                <div
                  className={cn(
                    "w-full text-center text-sm font-light",
                    tab.active
                      ? "border-b-2 border-b-blue-500 text-blue-500  "
                      : "border-b-2 text-gray-400"
                  )}
                  key={tab.title}
                >
                  {tab.title}
                </div>
              ))}
            </div>
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-medium text-center text-gray-900 mb-2">
                  What challenges are you facing in your job search?
                </h1>
              </div>
            </div>

            <Form {...form}>
              <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-4">
                  <h1>Job Type</h1>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tailoringIssue"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center border p-4 rounded-sm ">
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
                            className={`${
                              field.value
                                ? "text-black"
                                : "text-muted-foreground font-normal"
                            }`}
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
                        <FormItem className="flex flex-row items-center border p-4 rounded-sm ">
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
                            className={`${
                              field.value
                                ? "text-black"
                                : "text-muted-foreground font-normal"
                            }`}
                            htmlFor="coverLetterIssue"
                          >
                            Cover letter writing
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="aiJobIssue"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center border p-4 rounded-sm ">
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
                            className={`${
                              field.value
                                ? "text-black"
                                : "text-muted-foreground font-normal"
                            }`}
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
                        <FormItem className="flex flex-row items-center border p-4 rounded-sm ">
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
                            className={`${
                              field.value
                                ? "text-black"
                                : "text-muted-foreground font-normal"
                            }`}
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
                  <h1>Work mode</h1>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="findingJobIssue"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center border p-4 rounded-sm ">
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
                            className={`${
                              field.value
                                ? "text-black"
                                : "text-muted-foreground font-normal"
                            }`}
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
                        <FormItem className="flex flex-row items-center border p-4 rounded-sm ">
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
                            className={`${
                              field.value
                                ? "text-black"
                                : "text-muted-foreground font-normal"
                            }`}
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
                  >
                    Previous
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUpdatingUserLoading}
                    className=""
                  >
                    {isUpdatingUserLoading ? "Saving..." : "Save and Continue"}{" "}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
