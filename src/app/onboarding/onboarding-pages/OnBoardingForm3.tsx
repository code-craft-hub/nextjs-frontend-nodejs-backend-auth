"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { cn } from "@/lib/utils";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import { OnboardingFormProps } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import OnboardingTabs from "./OnBoardingTabs";
import { useIsMobile } from "@/hooks/use-mobile";
import Progress from "./Progress";
import { SelectCreatable } from "@/components/shared/SelectCreatable";
import { userQueries } from "@/lib/queries/user.queries";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { FloatingLabelInput } from "./FloatingInput";
import { useUserLocation } from "@/hooks/get-user-location";

const formSchema = z.object({
  partTime: z.boolean().default(false).optional(),
  fullTime: z.boolean().default(false).optional(),
  intership: z.boolean().default(false).optional(),
  contract: z.boolean().default(false).optional(),
  hybrid: z.boolean().default(false).optional(),
  remote: z.boolean().default(false).optional(),
  onsite: z.boolean().default(false).optional(),
  // location: z.string().min(1, "Please select a preferred location"),
  title: z.string().min(1, "Please select a job title"),
  rolesOfInterest: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .min(1, "Please add at least one role of interest"),
});

export const OnBoardingForm3 = ({ onNext, onPrev , children}: OnboardingFormProps) => {
  const { updateUser, isUpdatingUserLoading } = useAuth();
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
      // location: "",
      title: "",
      rolesOfInterest: [],
    },
  });

  useEffect(() => {
    if (user?.dataSource) {
      const data = user.dataSource[0];
      form.setValue("rolesOfInterest", data?.rolesOfInterest || []);
      // form.setValue("location", data?.location || continent || "");
      form.setValue("partTime", data?.partTime || false);
      form.setValue("fullTime", data?.fullTime || false);
      form.setValue("intership", data?.intership || false);
      form.setValue("contract", data?.contract || false);
      form.setValue("hybrid", data?.hybrid || false);
      form.setValue("remote", data?.remote || false);
      form.setValue("onsite", data?.onsite || false);
      form.setValue("title", data?.title || "");
    }
  }, [user, form, continent]);
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const dataSource = [
        {
          ...user?.dataSource?.[0],
          ...values,
        },
      ];

      await updateUser({
        dataSource: dataSource,
        defaultDataSource: user?.dataSource?.[0]?.id,
      });
      toast.success(`${user?.firstName} Your data has be saved!`);
      onNext();
    } catch (error) {
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

  // const locations = [
  //   "North America",
  //   "South America",
  //   "Europe",
  //   "Asia",
  //   "Africa",
  //   "Oceania",
  // ];

  const isMobile = useIsMobile();

  return (
    <motion.div
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
              "fixed top-0 left-0 width-full px-4 pt-5 backdrop-blur-2xl z-50 pb-4"
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

              <div className="mt-8 space-y-4">
                {/* <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <p className="absolute text-muted-foreground bg-background px-2 -mt-2 ml-4 text-2xs">
                          Preferred location
                        </p>
                        <FormControl>
                          <SelectTrigger className="w-full sm:!h-12 rounded-sm">
                            <SelectValue
                              placeholder="Select location"
                              className="text-2xs"
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem value={location} key={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <p className="absolute text-muted-foreground bg-background px-2 -mt-2 ml-4 text-2xs">
                        Job Title
                      </p>
                      <FormControl>
                        <FloatingLabelInput
                          label="Job Title"
                          isUpdatingUserLoading={isUpdatingUserLoading}
                          {...field}
                          placeholder="Software engineer, Backend developer"
                          className="rounded-sm"
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Controller
                  name="rolesOfInterest"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div className="space-y-2  rounded-md">
                      {/* <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        
                      </label> */}
                      <p className="absolute z-10  text-muted-foreground bg-background px-2 -mt-2 ml-4 text-2xs">
                        Roles of Interest{" "}
                      </p>
                      <SelectCreatable
                        placeholder="This field will be used to recommend jobs to you. (E.g., Software Engineer)"
                        value={field.value}
                        onChange={field.onChange}
                      />
                      {fieldState.error && (
                        <p className="text-sm font-medium text-destructive ">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
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
