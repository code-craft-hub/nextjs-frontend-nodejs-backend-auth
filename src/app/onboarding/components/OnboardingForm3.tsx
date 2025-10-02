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
import { cn } from "@/lib/utils";
import { useId, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FloatingLabelInputProps, OnboardingFormProps } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const formSchema = z.object({
  partTime: z.boolean().default(false).optional(),
  fullTime: z.boolean().default(false).optional(),
  intership: z.boolean().default(false).optional(),
  contract: z.boolean().default(false).optional(),
  hybrid: z.boolean().default(false).optional(),
  remote: z.boolean().default(false).optional(),
  onsite: z.boolean().default(false).optional(),
  location: z.string(),
  role: z.string(),
});

export const OnBoardingForm3 = ({ onNext, onPrev,initialUser }: OnboardingFormProps) => {
  const { updateUser, isUpdatingUserLoading, user } = useAuth();

  console.log(user, initialUser);

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
      location: "",
      role: "",
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
      active: true,
    },
    {
      title: "Identify Challenges",
      url: "",
      active: false,
    },
  ];

  const locations = [
    "North America",
    "South America",
    "Europe",
    "Asia",
    "Africa",
    "Oceania",
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
            <p className="">3/6</p>
          </div>
          <Progress value={30} className="w-full " />
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
                  Let us know your job preference
                </h1>
              </div>
            </div>

            <Form {...form}>
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div className="space-y-4">
                  <h1>Job Type</h1>
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
                  <h1>Work mode</h1>
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
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <p className="absolute text-muted-foreground bg-background px-2 -mt-2 ml-4 text-xs">
                            Preferred location
                          </p>
                          <FormControl>
                            <SelectTrigger className="w-full !h-12 rounded-sm">
                              <SelectValue placeholder="Select location" />
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
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FloatingLabelInput
                            label="Preferred Roles"
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
