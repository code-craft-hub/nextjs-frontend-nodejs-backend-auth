"use client";

import { ArrowUp, Plus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { memo, useCallback } from "react";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { PROFILE_OPTIONS } from "../../components/constants";
import { useRouter } from "next/navigation";
import { emailRegex } from "@/validation";

const FORM_SCHEMA = z.object({
  jobDescription: z.string().min(2, {
    message: "job description must be at least 2 characters.",
  }),
});

export const AIApplyInput = memo(() => {
  const router = useRouter();

  const form = useForm<z.infer<typeof FORM_SCHEMA>>({
    // resolver: zodResolver(FORM_SCHEMA),
    defaultValues: {
      jobDescription: "",
    },
  });
  const onSubmit = useCallback(
    ({ jobDescription }: z.infer<typeof FORM_SCHEMA>) => {
      const foundEmails = jobDescription.match(emailRegex) || [];

      if (foundEmails.length === 0) {
        toast.error(
          "No destination email found in job description. Please include the destination email in the job description."
        );
        return;
      }
      const params = new URLSearchParams();
      params.set("jobDescription", JSON.stringify(jobDescription));
      params.set("destinationEmail", JSON.stringify(foundEmails[0]));
      localStorage?.removeItem("hasResumeAPICalled");
      router.push(
        `/dashboard/tailor-cover-letter/${uuidv4()}?${params}&aiApply=true`
      );
      // router.push(`/dashboard/resume/${uuidv4()}?${params}`);
    },
    []
  );

  //
  return (
    <div className="relative shadow-blue-200 border-blue-500 rounded-2xl border-r shadow-xl h-38  flex flex-col justify-between">
      <Form {...form}>
        <form className="w-full h-full">
          <FormField
            control={form.control}
            name="jobDescription"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <textarea
                    placeholder="Let's get started"
                    className="w-full outline-none focus:outline-none focus:border-none p-2 resize-none pl-4 pt-2 border-none placeholder:font-medium focus-visible:border-none h-26 text-xs z-50"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <div className="flex justify-between  p-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="data-[state=open]:!shadow-2xl rounded-full border-blue-500 p-1 hover:cursor-pointer z-20 border-2">
            <Plus className="text-blue-400 size-4 font-bold" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="p-3 " align="start">
            <DropdownMenuGroup>
              {PROFILE_OPTIONS.slice(1).map(({ label, value, icon: Icon }) => (
                <DropdownMenuItem
                  onSelect={() => {
                    toast.success("selected");
                  }}
                  key={value}
                  className="gap-2 group hover:text-primary hover:cursor-pointer"
                >
                  {Icon && <Icon className="size-4 group-hover:text-primary" />}
                  <p className="group-hover:text-primary">{label}</p>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>{" "}
        <button
          onClick={form.handleSubmit(onSubmit)}
          className="rounded-full border-blue-500 border-2 p-1 hover:cursor-pointer z-50"
        >
          <ArrowUp className="text-blue-400 size-4" />
        </button>
      </div>
    </div>
  );
});

AIApplyInput.displayName = "AIApplyInput";
