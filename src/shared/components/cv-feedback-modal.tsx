"use client";

import React, { useState, useCallback } from "react";
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

interface CVQualityRatingModalProps {
  onClose?: () => void;
  onSubmit?: (data: RatingSubmissionData) => Promise<void> | void;
}

interface RatingSubmissionData {
  rating: number;
  feedback: string;
}

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

export function CVFeedbackModal() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleStarClick = useCallback((starIndex: number): void => {
    setRating(starIndex + 1);
  }, []);

  const handleFeedbackChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
      setFeedback(e.target.value);
    },
    [],
  );

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await Promise.resolve(onSubmit?.({ rating, feedback }));
    } finally {
      setIsSubmitting(false);
    }
  }, [rating, feedback, onSubmit, isSubmitting]);

  return (
    <Dialog>
      <form>
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
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div>
            <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
              <div className="w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl p-12">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  aria-label="Close dialog"
                >
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* Title */}
                <h2 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                  Rate the quality of the CV
                </h2>

                {/* Subtitle */}
                <p className="text-lg text-gray-500 mb-8 font-normal">
                  Your feedback helps us improve our AI models.
                </p>

                {/* Star Rating */}
                <div className="mb-6">
                  <div className="flex justify-center gap-4 mb-6">
                    {[0, 1, 2, 3, 4].map((index) => (
                      <button
                        key={index}
                        onClick={() => handleStarClick(index)}
                        className="focus:outline-none transition-transform duration-150 hover:scale-110"
                        aria-label={`Rate ${index + 1} star${index > 0 ? "s" : ""}`}
                      >
                        <svg
                          className={`w-14 h-14 transition-colors duration-200 ${
                            index < rating
                              ? "fill-blue-500 text-blue-500"
                              : "fill-none text-gray-300"
                          }`}
                          stroke="currentColor"
                          strokeWidth={1.5}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                          />
                        </svg>
                      </button>
                    ))}
                  </div>

                  {/* Rating Labels */}
                  <div className="flex justify-between px-2">
                    <span className="text-sm font-medium text-gray-500">
                      Poor
                    </span>
                    <span className="text-sm font-medium text-gray-500">
                      Excellent
                    </span>
                  </div>
                </div>

                {/* Feedback Section */}
                <div className="mb-8">
                  <label className="block text-base font-semibold text-gray-900 mb-4">
                    Additional feedback{" "}
                    <span className="font-normal text-gray-600">
                      (optional)
                    </span>
                  </label>

                  <textarea
                    value={feedback}
                    onChange={handleFeedbackChange}
                    placeholder="Tell us what worked well or what could be improved."
                    className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder:text-gray-400 text-gray-900 text-sm"
                    rows={5}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-2xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-lg"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
          <div className="">
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
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
