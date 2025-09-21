"use client";
import { z } from "zod";
import { motion } from "framer-motion";

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

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { FloatingLabelInputProps } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
const formSchema = z.object({
  type: z
    .enum(["linkedin", "instagram", "tiktok", "google", "friend", "whatsapp"])
    .refine((val) => !!val, {
      message: "You need to select a notification type.",
    }),
  others: z.string().optional(),
});

export const OnBoardingForm5 = ({ onNext, onPrev }: any) => {
  const { updateUser, isUpdatingUserLoading, user } = useAuth();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
              h-12 pt-4 pb-2 px-3 pr-${showPasswordToggle ? "12" : "3"}
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
      toast.success(`${user?.firstName} Your data has be saved!`);
      onNext();
    } catch (error) {
      toast.error(`${user?.firstName} please try again.`);
      toast("Skip this process", {
        action: {
          label: "Skip",
          onClick: () => () => onNext(),
        },
      });
    }
  }

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
            <p className="">5/6</p>
          </div>
          <Progress value={70} className="w-full " />
        </div>
      </div>
      <div className="flex items-center justify-center flex-1 mb-16">
        <div className="flex-1 flex items-center justify-center bg-white max-w-3xl shadow-2xl rounded-[4px] p-8 sm:p-16">
          <div className="w-full max-w-2xl space-y-8">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-medium text-center text-gray-900 mb-2">
                  How did you hear about{" "}
                  <span className="text-blue-500">Cver</span>?
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
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-3 ">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          <FormItem className="flex flex-row items-center border p-4 rounded-sm gap-3">
                            <FormControl>
                              <RadioGroupItem id="linkedin" value="linkedin" />
                            </FormControl>
                            <FormLabel
                              className={`${
                                field.value
                                  ? "text-black"
                                  : "text-muted-foreground font-normal"
                              } `}
                              htmlFor="linkedin"
                            >
                              Linkendin
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex flex-row items-center border p-4 rounded-sm gap-3">
                            <FormControl>
                              <RadioGroupItem
                                id={"instagram"}
                                value="instagram"
                              />
                            </FormControl>
                            <FormLabel
                              className={`${
                                field.value
                                  ? "text-black"
                                  : "text-muted-foreground font-normal"
                              } `}
                              htmlFor="instagram"
                            >
                              Instagram
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex flex-row items-center border p-4 rounded-sm gap-3">
                            <FormControl>
                              <RadioGroupItem id="tiktok" value="tiktok" />
                            </FormControl>
                            <FormLabel
                              className={`${
                                field.value
                                  ? "text-black"
                                  : "text-muted-foreground font-normal"
                              } `}
                              htmlFor="tiktok"
                            >
                              Tiktok
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex flex-row items-center border p-4 rounded-sm gap-3">
                            <FormControl>
                              <RadioGroupItem id="friend" value="friend" />
                            </FormControl>
                            <FormLabel
                              className={`${
                                field.value
                                  ? "text-black"
                                  : "text-muted-foreground font-normal"
                              } `}
                              htmlFor="friend"
                            >
                              Friend
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex flex-row items-center border p-4 rounded-sm gap-3">
                            <FormControl>
                              <RadioGroupItem id="google" value="google" />
                            </FormControl>
                            <FormLabel
                              className={`${
                                field.value
                                  ? "text-black"
                                  : "text-muted-foreground font-normal"
                              } `}
                              htmlFor="google"
                            >
                              Google
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex flex-row items-center border p-4 rounded-sm gap-3">
                            <FormControl>
                              <RadioGroupItem id="whatsapp" value="whatsapp" />
                            </FormControl>
                            <FormLabel
                              className={`${
                                field.value
                                  ? "text-black"
                                  : "text-muted-foreground font-normal"
                              } `}
                              htmlFor="whatsapp"
                            >
                              WhatsApp
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
