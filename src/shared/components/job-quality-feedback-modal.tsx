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

import React, { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitFeedback } from "@/features/user-feedback";

type JobFeedbackValue = "good" | "not_relevant" | null;

interface JobReviewModalProps {
  children: React.ReactNode;
  resourceId: string;
  onClose?: () => void;
}

const formSchema = z.object({
  details: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const JobQualityFeedbackModal: React.FC<JobReviewModalProps> = ({
  children,
  resourceId,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] =
    useState<JobFeedbackValue>(null);

  const { mutateAsync: submitFeedback, isPending } = useSubmitFeedback({
    onSuccess: () => {
      setOpen(false);
      form.reset();
      setSelectedFeedback(null);
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
      feedbackType: "job_review",
      // good → 1, not_relevant → 0 (as documented in SubmitFeedbackPayload)
      rating: selectedFeedback === "good" ? 1 : 0,
      details: values.details || undefined,
      resourceType: "job",
      resourceId: resourceId,
    });
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset();
      setSelectedFeedback(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className="w-full">{children}</DialogTrigger>
      <DialogContent className="w-full">
        <DialogHeader>
          <DialogTitle className="sr-only">Job review</DialogTitle>
          <DialogDescription className="sr-only">
            Give us your feedback to help improve future generations.
          </DialogDescription>
        </DialogHeader>
        <div className="">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className=" flex flex-col items-center">
                {/* Icon */}
                <div className="mb-6 p-4 bg-blue-50 rounded-full">
                  <svg
                    className="w-8 h-8 text-blue-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>

                {/* Heading */}
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  Job review
                </h2>

                {/* Description */}
                <p className="text-center text-gray-600 text-base mb-8 leading-relaxed">
                  Give us your feedback to help improve future generations.
                </p>

                {/* Feedback Buttons */}
                <div className="flex gap-6 mb-8 w-full justify-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectedFeedback("good")}
                      className={`flex flex-col items-center gap-3 rounded-full transition-all duration-200 ${
                        selectedFeedback === "good"
                          ? "bg-gray-100 border-2 border-gray-300"
                          : "bg-white border-2 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-full transition-colors duration-200 ${
                          selectedFeedback === "good"
                            ? "bg-gray- text-gray-700"
                            : "bg-gr text-gray-500 group-hover:text-gray-700"
                        }`}
                      >
                        <ThumbsUp size={24} strokeWidth={1.5} />
                      </div>
                    </button>
                    <p className="text-gray-700 font-medium text-sm">Good</p>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectedFeedback("not_relevant")}
                      className={`flex flex-col items-center gap-3 rounded-full transition-all duration-200 ${
                        selectedFeedback === "not_relevant"
                          ? "bg-gray-100 border-2 border-gray-300"
                          : "bg-white border-2 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-full transition-colors duration-200 ${
                          selectedFeedback === "not_relevant"
                            ? "bg-gray- text-gray-700"
                            : "bg-gray text-gray-500 group-hover:text-gray-700"
                        }`}
                      >
                        <ThumbsDown size={24} strokeWidth={1.5} />
                      </div>
                    </button>
                    <p className="text-gray-700 font-medium text-sm">
                      Not relevant
                    </p>
                  </div>
                </div>
              </div>
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
                  className="rounded-xl h-12 w-full bg-gray-400 hover:bg-gray-500"
                  disabled={isPending || selectedFeedback === null || !resourceId}
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
};
