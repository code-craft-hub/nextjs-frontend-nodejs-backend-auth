"use client";

import { useId, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ChevronDownIcon } from "lucide-react";
import "react-phone-number-input/style.css";

import { Progress } from "@/components/ui/progress";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { useUserLocation } from "@/hooks/get-user-location";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { OnboardingFormProps } from "@/types";

const formSchema = z.object({
  location: z.string({ message: "Please enter a valid country name." }),
  city: z.string({ message: "Please enter a valid city name." }),
  phoneNumber: z.string().refine((val) => isValidPhoneNumber(val || ""), {
    message: "Invalid phone number",
  }),
});

interface FloatingLabelInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  label: string;
  type?: string;
  className?: string;
  showPasswordToggle?: boolean;
}

export const OnBoardingForm1 = ({
  onNext,
  onPrev,
  initialUser,
}: OnboardingFormProps) => {
  const { updateUser, isUpdatingUserLoading, user } = useAuth();

  console.log(user, initialUser);

  function FloatingLabelInput({
    id,
    label,
    className = "",
    showPasswordToggle = false,
    ...props
  }: FloatingLabelInputProps) {
    const inputId = useId();
    const actualId = id || inputId;

    return (
      <div className="group relative">
        <label
          htmlFor={actualId}
          className={`
            absolute left-3 z-10 px-2 font-medium
            bg-background
            transition-all duration-200 ease-in-out
            pointer-events-none font-poppins
           -top-2.5 text-xs text-foreground}
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
            {...props}
          />

          <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>
      </div>
    );
  }
  const { country, region, country_code } = useUserLocation();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      city: "",
      phoneNumber: "",
    },
  });

  useEffect(() => {
    form.setValue("location", country);
    form.setValue("city", region);
  }, [country, region, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form submitted:", values);
    try {
      await updateUser(values);
      toast.success(
        ` Your data has be saved! ${user?.firstName}, InitialUser : ${initialUser?.displayName}`
      );
      onNext();
    } catch (error) {
      console.error(error)
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
      active: true,
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
      active: false,
    },
  ];
  const inputId = useId();
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
            <p className="">1/7</p>
          </div>
          <Progress value={10} className="w-full " />
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
                  Let&apto;s add your basic information
                </h1>
              </div>
            </div>

            <Form {...form}>
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelInput
                          label="Select a country"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelInput label="Select a city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="group relative flex items-center w-full rounded-[4px] h-12 border border-input bg-background px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                          <label
                            htmlFor={inputId}
                            className={`absolute left-3 z-10 px-2 font-medium bg-background transition-all duration-200 ease-in-out pointer-events-none font-poppins -top-2.5 text-xs text-foreground`}
                          >
                            Phone number
                          </label>
                          <PhoneInput
                            {...field}
                            id={inputId}
                            international
                            defaultCountry={(country_code as any) ?? "US"}
                            placeholder="Enter phone number"
                            className="!border-0 !outline-none !ring-0" // kill default input borders
                            // inputClassName="!border-0 !outline-none !ring-0 w-full"
                            numberInputProps={{
                              className:
                                "!border-0 !outline-none !ring-0 w-full",
                            }}
                          />{" "}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                    {isUpdatingUserLoading ? "Saving..." : "Save and Continue"}
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
