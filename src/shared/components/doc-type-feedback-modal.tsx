"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
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
import { Iconify } from "@/components/iconify";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useSubmitFeedback } from "@/features/user-feedback";

interface CVQualityRatingModalProps {
  docType?: "cv" | "resume" | "cover-letter" | "interview-question";
  resourceId: string;
  onClose?: () => void;
}

const formSchema = z.object({
  details: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function DocTypeFeedbackModal({
  docType = "cv",
  resourceId,
}: CVQualityRatingModalProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);

  const { mutateAsync: submitFeedback, isPending } = useSubmitFeedback({
    onSuccess: () => {
      setOpen(false);
      form.reset();
      setRating(0);
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      details: "",
    },
  });

  async function onSubmit(values: FormValues) {
    await submitFeedback({
      feedbackType: "cv_quality",
      rating,
      details: values.details || undefined,
      resourceType: docType,
      resourceId: resourceId,
    });
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset();
      setRating(0);
    }
  }

  const handleStarClick = useCallback((starIndex: number): void => {
    setRating(starIndex + 1);
  }, []);

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
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            {" "}
            Rate the quality of the{" "}
            {docType === "cv"
              ? "CV"
              : docType === "resume"
                ? "Resume"
                : docType === "cover-letter"
                  ? "Cover Letter"
                  : "Interview Question"}
          </DialogTitle>
          <DialogDescription className="text-center">
            Your feedback helps us improve our AI models.
          </DialogDescription>
        </DialogHeader>
        <div className="mb-6">
          <div className="flex justify-center gap-4 mb-6">
            {[0, 1, 2, 3, 4].map((index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleStarClick(index)}
                className="focus:outline-none transition-transform duration-150 hover:scale-110"
                aria-label={`Rate ${index + 1} star${index > 0 ? "s" : ""}`}
              >
                <Iconify
                  icon="material-symbols-light:star-outline"
                  width={38}
                  height={38}
                  className={cn(
                    "transition-colors duration-200",
                    index < rating
                      ? "fill-yellow-500 text-yellow-500"
                      : "fill-none text-gray-300",
                  )}
                />
              </button>
            ))}
          </div>
          <div className="flex justify-between px-2">
            <span className="text-sm font-medium text-gray-500">Poor</span>
            <span className="text-sm font-medium text-gray-500">Excellent</span>
          </div>
        </div>
        <div className="">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional feedback (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us what worked well or what could be improved."
                        className="h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="w-full mt-4">
                <Button
                  type="submit"
                  className="rounded-xl w-full h-12 bg-gray-400 hover:bg-gray-500"
                  disabled={isPending || rating === 0 || !resourceId}
                >
                  {isPending ? "Submitting..." : "Submit"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
