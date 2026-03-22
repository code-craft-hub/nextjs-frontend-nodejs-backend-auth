"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { CoverLetter, IUser } from "@/shared/types";
import { useUpdateCoverLetterMutation } from "@/features/cover-letter/mutations/cover-letter.mutations";

const coverLetterEditSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(10, "Cover letter must be at least 10 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  salutation: z.string().min(1, "Salutation is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  recruiterEmail: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
});

type CoverLetterEditFormData = z.infer<typeof coverLetterEditSchema>;

interface TailorCoverLetterEditFormProps {
  coverLetter: CoverLetter;
  user?: Partial<IUser>;
  onCancel: () => void;
}

export const TailorCoverLetterEditForm = ({
  coverLetter,
  user,
  onCancel,
}: TailorCoverLetterEditFormProps) => {
  const updateMutation = useUpdateCoverLetterMutation();

  const form = useForm<CoverLetterEditFormData>({
    resolver: zodResolver(coverLetterEditSchema),
    defaultValues: {
      title: coverLetter.title || "",
      content: coverLetter.content || "",
      firstName: coverLetter.firstName || user?.firstName || "",
      lastName: coverLetter.lastName || user?.lastName || "",
      salutation: coverLetter.salutation || "Dear Hiring Manager,",
      phoneNumber: coverLetter.phoneNumber || user?.phoneNumber || "",
      recruiterEmail: coverLetter.recruiterEmail || "",
    },
  });

  useEffect(() => {
    form.reset({
      title: coverLetter.title || "",
      content: coverLetter.content || "",
      firstName: coverLetter.firstName || user?.firstName || "",
      lastName: coverLetter.lastName || user?.lastName || "",
      salutation: coverLetter.salutation || "Dear Hiring Manager,",
      phoneNumber: coverLetter.phoneNumber || user?.phoneNumber || "",
      recruiterEmail: coverLetter.recruiterEmail || "",
    });
  }, [coverLetter, user, form]);

  const onSubmit = async (values: CoverLetterEditFormData) => {
    await updateMutation.mutateAsync({
      id: coverLetter.id,
      data: {
        title: values.title,
        content: values.content,
        firstName: values.firstName,
        lastName: values.lastName,
        salutation: values.salutation,
        phoneNumber: values.phoneNumber,
        recruiterEmail: values.recruiterEmail || undefined,
      },
    });
    onCancel();
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6">
      <div className="flex w-full gap-3 items-center p-4 bg-white justify-between">
        <div className="flex w-full justify-between items-center gap-3">
          <p className="text-xl font-medium font-inter">Edit Cover Letter</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-md rounded-xl p-6 sm:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="recruiterEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={updateMutation.isPending}
                      placeholder="hiring@company.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={updateMutation.isPending}
                      placeholder="Application for Software Engineer Position"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salutation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salutation</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={updateMutation.isPending}
                      placeholder="Dear Hiring Manager,"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Letter Content</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={updateMutation.isPending}
                      placeholder="Write your cover letter here..."
                      rows={14}
                      className="resize-y"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={updateMutation.isPending}
                        placeholder="John"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={updateMutation.isPending}
                        placeholder="Doe"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={updateMutation.isPending}
                      placeholder="+1 (555) 123-4567"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {updateMutation.isError && (
              <p className="text-sm text-red-600">
                Failed to save. Please try again.
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && (
                  <Loader className="size-4 mr-2 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
