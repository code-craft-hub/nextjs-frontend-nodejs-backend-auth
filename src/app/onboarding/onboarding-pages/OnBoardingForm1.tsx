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
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { useUserLocation } from "@/hooks/get-user-location";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { OnboardingFormProps } from "@/types";
import Progress from "./Progress";
import { FloatingLabelInput } from "./FloatingInput";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
const formSchema = z.object({
  location: z.string({ message: "Please enter a valid country name." }),
  city: z.string({ message: "Please enter a valid city name." }),
  phoneNumber: z.string().refine((val) => isValidPhoneNumber(val || ""), {
    message: "Invalid phone number",
  }),
});

export const OnBoardingForm1 = ({
  onNext,
  onPrev,
  initialUser,
}: OnboardingFormProps) => {
  const { updateUser, isUpdatingUserLoading } = useAuth();

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
    try {
      await updateUser(values);
      toast.success(`${initialUser?.displayName} Your data has be saved!`);
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

  const inputId = useId();

  const isMobile = useIsMobile();

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="min-h-screen items-center justify-center flex flex-col font-poppins"
    >
      <div className="onboarding-container !mt-4">
        <div
          className={cn(
            "flex justify-between mb-9 w-full max-w-screen-lg ",
            isMobile &&
              "fixed top-0 left-0 width-full px-4 pt-5 backdrop-blur-2xl z-50 pb-4"
          )}
        >
          <img
            src="/cverai-logo.png"
            className="w-28 h-8"
            alt=""
          />
          <Progress min={1} max={7} progress={10} />
        </div>
        <div className="onboarding-card">
          <div className="space-y-6">
            <div>
              <h1 className="onboarding-h1">
                Let&#39;s add your basic information
              </h1>
            </div>
          </div>
          <Form {...form}>
            <form
              className="space-y-6 w-full"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FloatingLabelInput label="Select a country" {...field} />
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
                      <FloatingLabelInput
                        label="Select a city"
                        isUpdatingUserLoading={isUpdatingUserLoading}
                        {...field}
                      />
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
                      <div
                        className={cn(
                          "group relative flex items-center w-full rounded-[4px]  border border-input bg-background px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                          isMobile ? "h-8" : "h-10"
                        )}
                      >
                        <label
                          htmlFor={inputId}
                          className={`absolute left-3 z-10 px-2 font-medium bg-background transition-all duration-200 ease-in-out pointer-events-none font-poppins max-sm:-top-1.5 -top-2.5 max-sm:text-2xs text-xs text-foreground `}
                        >
                          Phone number
                        </label>
                        <PhoneInput
                          {...field}
                          id={inputId}
                          international
                          defaultCountry={(country_code as any) ?? "US"}
                          placeholder="Enter phone number"
                          className="!border-0 !outline-none !ring-0"
                          numberInputProps={{
                            className:
                              "!border-0 !outline-none !ring-0 w-full max-sm:text-2xs !w-full md:!w-96 lg:!w-[43rem] h-9",
                          }}
                        />
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
                  className="onboarding-btn"
                >
                  Previous
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdatingUserLoading}
                  className="onboarding-btn"
                >
                  {isUpdatingUserLoading ? "Saving..." : "Save and Continue"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </motion.div>
  );
};
