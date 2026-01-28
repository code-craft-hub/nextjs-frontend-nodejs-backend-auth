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
} from "@/components/ui/form";

import { cn } from "@/lib/utils";
import { OnboardingFormProps } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import OnboardingTabs from "./OnBoardingTabs";
import { useIsMobile } from "@/hooks/use-mobile";
import Progress from "./Progress";
import { userQueries } from "@/lib/queries/user.queries";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useUserLocation } from "@/hooks/get-user-location";
// import { axiosApiClient } from "@/lib/axios/auth-api";
import { useUpdateOnboarding } from "@/hooks/mutations";

const formSchema = z
  .object({
    partTime: z.boolean().default(false).optional(),
    fullTime: z.boolean().default(false).optional(),
    intership: z.boolean().default(false).optional(),
    contract: z.boolean().default(false).optional(),
    hybrid: z.boolean().default(false).optional(),
    remote: z.boolean().default(false).optional(),
    onsite: z.boolean().default(false).optional(),
  })
  .refine(
    (data) =>
      data.partTime ||
      data.fullTime ||
      data.intership ||
      data.contract ||
      data.hybrid ||
      data.remote ||
      data.onsite,
    {
      message: "Please select at least one job preference",
    },
  );

export const OnBoardingForm3 = ({
  onNext,
  onPrev,
  children,
}: OnboardingFormProps) => {
  const { isUpdatingUserLoading } = useAuth();
  const { continent } = useUserLocation();

  const { data: user } = useQuery(userQueries.detail());

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      partTime: false,
      fullTime: false,
      intership: false,
      contract: false,
      hybrid: false,
      remote: false,
      onsite: false,
    },
  });

  useEffect(() => {
    if (user?.dataSource) {
      const data = user.dataSource[0];
      form.setValue("partTime", data?.partTime || false);
      form.setValue("fullTime", data?.fullTime || false);
      form.setValue("intership", data?.intership || false);
      form.setValue("contract", data?.contract || false);
      form.setValue("hybrid", data?.hybrid || false);
      form.setValue("remote", data?.remote || false);
      form.setValue("onsite", data?.onsite || false);
    }
  }, [user, form, continent]);

  const updateOnboarding = useUpdateOnboarding({
    userFirstName: user?.firstName,
    onSuccess: () => {
      onNext();
    },
    onError: () => {
      toast("Skip this process", {
        action: {
          label: "Skip",
          onClick: () => onNext(),
        },
      });
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    onNext();
    updateOnboarding.mutate({
      stepNumber: 3,
      employmentPreferences: values,
    });
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
            "flex justify-between mb-9 w-full max-w-5xl ",
            isMobile &&
              "fixed top-0 left-0 width-full px-4 pt-5 backdrop-blur-2xl z-50 pb-4",
          )}
        >
          <img src="/cverai-logo.png" alt="" className="w-24 h-8" />
          <Progress min={3} max={7} progress={30} />
        </div>
        <div className="onboarding-card">
          <OnboardingTabs activeTab={"job-preference"} />
          <div className="space-y-6">
            <div>
              <h1 className="onboarding-h1">Let us know your job preference</h1>
            </div>
          </div>
          <Form {...form}>
            <form
              className="space-y-6 w-full"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="partTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center border p-4 rounded-sm ">
                        <FormControl>
                          <Checkbox
                            id="partTime"
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
                          htmlFor="partTime"
                        >
                          Part time
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fullTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center border p-4 rounded-sm ">
                        <FormControl>
                          <Checkbox
                            id="fullTime"
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
                          htmlFor="fullTime"
                        >
                          Full time
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="intership"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center border p-4 rounded-sm ">
                        <FormControl>
                          <Checkbox
                            id="intership"
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
                          htmlFor="intership"
                        >
                          Intership
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contract"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center border p-4 rounded-sm ">
                        <FormControl>
                          <Checkbox
                            id="contract"
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
                          htmlFor="contract"
                        >
                          Contract
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="hybrid"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center border p-4 rounded-sm ">
                        <FormControl>
                          <Checkbox
                            id="hybrid"
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
                          htmlFor="hybrid"
                        >
                          Hybrid
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="remote"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center border p-4 rounded-sm ">
                        <FormControl>
                          <Checkbox
                            id="remote"
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
                          htmlFor="remote"
                        >
                          Remote
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="onsite"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center border p-4 rounded-sm ">
                        <FormControl>
                          <Checkbox
                            id="onsite"
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
                          htmlFor="onsite"
                        >
                          Onsite
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
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
