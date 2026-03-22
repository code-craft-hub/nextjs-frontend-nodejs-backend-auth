"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Iconify } from "@/components/iconify";
import { Textarea } from "@/components/ui/textarea";
import {
  useSubmitFeedback,
  FEEDBACK_TYPES,
  FEEDBACK_TYPE_LABELS,
} from "@/features/user-feedback";
import type { FeedbackType } from "@/features/user-feedback";

// Only the general-purpose types are shown in this modal.
// job_review and cv_quality are submitted from their own dedicated modals.
const GENERAL_FEEDBACK_TYPES: FeedbackType[] = [
  "product_feedback",
  "job_quality",
  "resume_cv_generation",
  "bug_report",
  "crash_technical_issue",
  "other",
];

const formSchema = z.object({
  feedbackType: z.enum(FEEDBACK_TYPES, {
    message: "Please select a feedback type.",
  }),
  details: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function UserFeedbackModal() {
  const [open, setOpen] = useState(false);

  const { mutate: submitFeedback, isPending } = useSubmitFeedback({
    onSuccess: () => {
      setOpen(false);
      form.reset();
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      feedbackType: undefined,
      details: "",
    },
  });

  function onSubmit(values: FormValues) {
    submitFeedback({
      feedbackType: values.feedbackType,
      details: values.details || undefined,
    });
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Iconify
            icon="fluent-color:person-feedback-48"
            width={24}
            height={24}
          />
          <span className="text-2xs">Feedback</span>
          <div className="bg-green-500 size-1 animate-ping rounded-full" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm p-0">
        <DialogHeader className="border-b p-6">
          <DialogTitle>Share Your Feedback</DialogTitle>
          <DialogDescription className="sr-only">
            Select a feedback type and tell us about your experience.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="p-6 space-y-4">
              <FormField
                control={form.control}
                name="feedbackType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feedback Type</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Feedback Types</SelectLabel>
                            {GENERAL_FEEDBACK_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {FEEDBACK_TYPE_LABELS[type]}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your experience..."
                        className="h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="bg-slate-100 border-t-2 p-6 rounded-ee-lg rounded-es-lg">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
