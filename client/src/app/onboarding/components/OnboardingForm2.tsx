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

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { FileUpload } from "./file-upload";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

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

export const OnBoardingForm2 = ({ onNext, onPrev }: any) => {
  const { updateUser, isUpdatingUserLoading, user } = useAuth();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scratch: false,
      resume: null,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form submitted:", values);
    const { resume, ...rest } = values;
    try {
      await updateUser(rest);
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

  const tabs = [
    {
      title: "Basic Information",
      url: "",
      active: false,
    },
    {
      title: "CV Handling",
      url: "",
      active: true,
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
            <p className="">2/6</p>
          </div>
          <Progress value={20} className="w-full " />
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
                  Do you have CV?
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
                  name="resume"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          onChange={(file) => {
                            field.onChange(file);
                          }}
                          // value={field.value ? [field.value] : []}
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
                            // if (email) {
                            //   await sendOrSaveEmailToDraft({
                            //     email,
                            //     emailOption: checked,
                            //   });
                            // }
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
