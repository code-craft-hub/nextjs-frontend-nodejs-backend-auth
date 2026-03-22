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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

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

import React, { useState } from "react";
import { X, ThumbsUp, ThumbsDown } from "lucide-react";

type FeedbackType = "good" | "not_relevant" | null;

interface JobReviewModalProps {
  children: React.ReactNode;
  onClose?: () => void;
  onSubmit?: (feedback: { type: FeedbackType; message: string }) => void;
  isOpen?: boolean;
}

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

export const JobQualityFeedbackModal: React.FC<JobReviewModalProps> = ({
  children,
  onClose = () => {},
  onSubmit = () => {},
  isOpen = true,
}) => {
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackType>(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const handleSubmit = () => {
    onSubmit({
      type: selectedFeedback,
      message: feedbackMessage,
    });
    setSelectedFeedback(null);
    setFeedbackMessage("");
  };

  if (!isOpen) return null;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  // 2. Define a submit handler.
  // function onSubmit(values: z.infer<typeof formSchema>) {
  //   console.log(values);
  // }

  return (
    <Dialog>
      <form>
        <DialogTrigger className="w-full">
          {children}
          {/* <Button variant="ghost">
            <Iconify
              icon="fluent-color:person-feedback-48"
              width={24}
              height={24}
            />
            <span className="text-2xs">Feedback</span>
            <div className="bg-green-500 size-1 animate-ping rounded-full" />
          </Button> */}
        </DialogTrigger>
        <DialogContent className="w-full">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-[520px] relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200 z-10"
                aria-label="Close modal"
              >
                <X size={24} className="text-gray-400 hover:text-gray-600" />
              </button>

              {/* Modal Content */}
              <div className="px-8 pt-8 pb-8 flex flex-col items-center">
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
                  <button
                    onClick={() => setSelectedFeedback("good")}
                    className={`flex flex-col items-center gap-3 px-8 py-4 rounded-lg transition-all duration-200 ${
                      selectedFeedback === "good"
                        ? "bg-gray-100 border-2 border-gray-300"
                        : "bg-white border-2 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-full transition-colors duration-200 ${
                        selectedFeedback === "good"
                          ? "bg-gray-200 text-gray-700"
                          : "bg-gray-100 text-gray-500 group-hover:text-gray-700"
                      }`}
                    >
                      <ThumbsUp size={24} strokeWidth={1.5} />
                    </div>
                    <span className="text-gray-700 font-medium text-sm">
                      Good
                    </span>
                  </button>

                  <button
                    onClick={() => setSelectedFeedback("not_relevant")}
                    className={`flex flex-col items-center gap-3 px-8 py-4 rounded-lg transition-all duration-200 ${
                      selectedFeedback === "not_relevant"
                        ? "bg-gray-100 border-2 border-gray-300"
                        : "bg-white border-2 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-full transition-colors duration-200 ${
                        selectedFeedback === "not_relevant"
                          ? "bg-gray-200 text-gray-700"
                          : "bg-gray-100 text-gray-500 group-hover:text-gray-700"
                      }`}
                    >
                      <ThumbsDown size={24} strokeWidth={1.5} />
                    </div>
                    <span className="text-gray-700 font-medium text-sm">
                      Not relevant
                    </span>
                  </button>
                </div>

                {/* Optional Feedback Section */}
                {selectedFeedback && (
                  <div className="w-full animate-in fade-in duration-300">
                    <label className="block text-base font-medium text-gray-700 mb-3">
                      Additional feedback (optional)
                    </label>
                    <textarea
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="What do you think about this job?"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-300 focus:outline-none resize-none transition-colors duration-200 text-gray-700 placeholder-gray-400"
                      rows={6}
                    />
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={!selectedFeedback}
                  className={`w-full mt-8 py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                    selectedFeedback
                      ? "bg-gray-700 hover:bg-gray-800 active:scale-95"
                      : "bg-gray-400 cursor-not-allowed opacity-60"
                  }`}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
          {/* <div className="">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Select>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a fruit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Fruits</SelectLabel>
                              <SelectItem value="apple">Apple</SelectItem>
                              <SelectItem value="banana">Banana</SelectItem>
                              <SelectItem value="blueberry">
                                Blueberry
                              </SelectItem>
                              <SelectItem value="grapes">Grapes</SelectItem>
                              <SelectItem value="pineapple">
                                Pineapple
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        This is your public display name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="shadcn" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is your public display name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Submit</Button>
              </form>
            </Form>
          </div> */}
        </DialogContent>
      </form>
    </Dialog>
  );
};
