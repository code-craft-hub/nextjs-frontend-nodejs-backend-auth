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

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { OnboardingFormProps } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { FloatingLabelInput } from "./FloatingInput";
import Progress from "./Progress";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
const formSchema = z.object({
  type: z
    .enum(["linkedin", "instagram", "tiktok", "google", "friend", "whatsapp"])
    .refine((val) => !!val, {
      message: "You need to select a notification type.",
    }),
  others: z.string().optional(),
});

export const OnBoardingForm5 = ({ onNext, onPrev }: OnboardingFormProps) => {
  const { updateUser, isUpdatingUserLoading, user } = useAuth();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      others: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateUser({ discovery: values });
      toast.success(`${user?.firstName} Your data has be saved!`);
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
      <div className="onboarding-container !mt-4">
        <div
          className={cn(
            "flex justify-between mb-9 w-full max-w-screen-lg ",
            isMobile &&
              "fixed top-0 left-0 width-full px-4 pt-5 backdrop-blur-2xl z-50 pb-4"
          )}
        >
          <img src="/cverai-logo.png" alt="" className="w-28 h-8" />
          <Progress min={5} max={7} progress={70} />
        </div>
        <div className="onboarding-card">
          <div className="space-y-6">
            <div>
              <h1 className="onboarding-h1">
                How did you hear about{" "}
                <span className="text-blue-500">Cver</span>?
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
                            className={cn(
                              field.value
                                ? "text-black"
                                : "text-muted-foreground font-normal",
                              "h1"
                            )}
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
                            className={cn(
                              field.value
                                ? "text-black"
                                : "text-muted-foreground font-normal",
                              "h1"
                            )}
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
                            className={cn(
                              field.value
                                ? "text-black"
                                : "text-muted-foreground font-normal",
                              "h1"
                            )}
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
                            className={cn(
                              field.value
                                ? "text-black"
                                : "text-muted-foreground font-normal",
                              "h1"
                            )}
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
                            className={cn(
                              field.value
                                ? "text-black"
                                : "text-muted-foreground font-normal",
                              "h1"
                            )}
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
                            className={cn(
                              field.value
                                ? "text-black"
                                : "text-muted-foreground font-normal",
                              "h1"
                            )}
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
