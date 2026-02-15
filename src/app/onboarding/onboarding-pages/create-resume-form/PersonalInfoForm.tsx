"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, MapPin, Linkedin, Globe, Mail, Phone, X } from "lucide-react";
import { useResumeForm } from "./ResumeFormContext";
import { useUpdateResumeMutation } from "@/lib/mutations/resume.mutations";

// ─── Schema ────────────────────────────────────────────────────────

const personalInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.email("Valid email is required"),
  phoneNumber: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  linkedIn: z.string().optional(),
  website: z.string().optional(),
});

type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

// ─── Component ────────────────────────────────────────────────────

interface PersonalInfoFormProps {
  onNext?: () => void;
  onBack?: () => void;
  handleEditClick: (value: boolean) => void;
}

export default function PersonalInfoForm({
  onNext,
  handleEditClick,
}: PersonalInfoFormProps) {
  const { resumeId, resumeData, updateResumeField } = useResumeForm();
  const updateResume = useUpdateResumeMutation();

  const form = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: resumeData?.fullName || "",
      email: resumeData?.email || "",
      phoneNumber: resumeData?.phoneNumber || "",
      location: resumeData?.location || "",
      linkedIn: resumeData?.linkedIn || "",
      website: resumeData?.website || "",
    },
  });

  async function onSubmit(values: PersonalInfoFormValues) {
    if (!resumeId) {
      onNext?.();
      return;
    }

    updateResume.mutate(
      { id: resumeId, data: values },
      {
        onSuccess: () => {
          updateResumeField("fullName", values.fullName);
          updateResumeField("email", values.email);
          updateResumeField("phoneNumber", values.phoneNumber || "");
          updateResumeField("location", values.location);
          updateResumeField("linkedIn", values.linkedIn || "");
          updateResumeField("website", values.website || "");
          onNext?.();
        },
      },
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-8 relative">
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 text-indigo-400">
          <User className="w-5 h-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            Personal Information
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Let&apos;s start with the basics. This helps employers contact you.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-6 -right-6"
          onClick={() => handleEditClick(false)}
        >
          <X />
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Row 1: Full name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Full name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Sarah Johnson"
                      className="h-12 rounded-xl border-gray-200 bg-white placeholder:text-gray-300 text-gray-800 text-sm focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:border-blue-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                      <Input
                        placeholder="e.g., sarah@example.com"
                        className="h-12 rounded-xl border-gray-200 bg-white pl-10 placeholder:text-gray-300 text-gray-800 text-sm focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:border-blue-400"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          {/* Row 2: Phone + Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Phone Number
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                      <Input
                        placeholder="e.g., +1 (555) 123-4567"
                        className="h-12 rounded-xl border-gray-200 bg-white pl-10 placeholder:text-gray-300 text-gray-800 text-sm focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:border-blue-400"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Location <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                      <Input
                        placeholder="e.g., Abuja, Nigeria"
                        className="h-12 rounded-xl border-gray-200 bg-white pl-10 placeholder:text-gray-300 text-gray-800 text-sm focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:border-blue-400"
                        {...field}
                      />
                    </div>
                  </FormControl>

                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          {/* Divider */}
          <div className="pt-1" />

          {/* Online Presence */}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-4">
              Online Presence{" "}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </p>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="linkedIn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      LinkedIn Profile
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Linkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                        <Input
                          placeholder="linkedin.com/in/yourprofile"
                          className="h-12 rounded-xl border-gray-200 bg-white pl-10 placeholder:text-gray-300 text-gray-800 text-sm focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:border-blue-400"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Portfolio/Website
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                        <Input
                          placeholder="www.yourportfolio.com"
                          className="h-12 rounded-xl border-gray-200 bg-white pl-10 placeholder:text-gray-300 text-gray-800 text-sm focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:border-blue-400"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={updateResume.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 h-12 rounded-xl text-sm transition-colors"
            >
              {updateResume.isPending ? "Saving..." : "Save & Continue"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
