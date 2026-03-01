"use client";

import { useFieldArray, useForm } from "react-hook-form";
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
import { Trash2, PlusCircle, GraduationCap, ArrowLeft } from "lucide-react";
import { useResumeForm } from "./ResumeFormContext";
import {
  useCreateEducationMutation,
  useUpdateEducationMutation,
  useDeleteEducationMutation,
} from "@/lib/mutations/resume.mutations";
import { CloseEditButton } from "@/components/shared/CloseEditButton";

// ─── Schema ────────────────────────────────────────────────────────

const educationEntrySchema = z.object({
  id: z.string().optional(),
  degree: z.string().min(1, "Degree is required"),
  schoolName: z.string().min(1, "Institution is required"),
  fieldOfStudy: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const educationFormSchema = z.object({
  educations: z.array(educationEntrySchema).min(1),
});

type EducationFormValues = z.infer<typeof educationFormSchema>;

// ─── Component ────────────────────────────────────────────────────

interface EducationSectionProps {
  onNext?: () => void;
  onBack?: () => void;
  handleEditClick: (isEditing: boolean) => void;
}

export default function EducationSection({
  onNext,
  onBack,
  handleEditClick,
}: EducationSectionProps) {
  const {
    resumeId,
    resumeData,
    updateResumeField,
    createNewResume,
    isCreating,
  } = useResumeForm();
  const createMutation = useCreateEducationMutation();
  const updateMutation = useUpdateEducationMutation(resumeId || "");
  const deleteMutation = useDeleteEducationMutation(resumeId || "");

  const existingEducations = resumeData?.education || [];

  const form = useForm<EducationFormValues>({
    resolver: zodResolver(educationFormSchema),
    defaultValues: {
      educations:
        existingEducations.length > 0
          ? existingEducations.map((edu) => ({
              id: edu.id || undefined,
              degree: edu.degree || "",
              schoolName: edu.schoolName || "",
              fieldOfStudy: edu.fieldOfStudy || "",
              location: edu.location || "",
              startDate: edu.startDate
                ? new Date(edu.startDate).getFullYear().toString()
                : "",
              endDate: edu.endDate
                ? new Date(edu.endDate).getFullYear().toString()
                : "",
            }))
          : [
              {
                degree: "",
                schoolName: "",
                fieldOfStudy: "",
                location: "",
                startDate: "",
                endDate: "",
              },
            ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "educations",
  });

  async function onSubmit(values: EducationFormValues) {
    let activeResumeId = resumeId;

    // If no resume exists, create one first
    if (!activeResumeId) {
      const newResumeId = await createNewResume("My Resume");
      if (!newResumeId) {
        console.error("Failed to create resume");
        return;
      }
      activeResumeId = newResumeId;
    }

    const savePromises = values.educations.map((edu) => {
      const payload = {
        degree: edu.degree,
        schoolName: edu.schoolName,
        fieldOfStudy: edu.fieldOfStudy,
        location: edu.location,
        startDate: edu.startDate,
        endDate: edu.endDate,
      };

      if (edu.id) {
        return updateMutation.mutateAsync({ id: edu.id, data: payload });
      }
      return createMutation.mutateAsync({ resumeId: activeResumeId, data: payload });
    });

    await Promise.all(savePromises);
    updateResumeField(
      "education",
      values.educations.map((edu) => ({
        id: edu.id,
        degree: edu.degree,
        schoolName: edu.schoolName,
        fieldOfStudy: edu.fieldOfStudy,
        location: edu.location,
        startDate: edu.startDate,
        endDate: edu.endDate,
      })),
    );
    onNext?.();
  }

  const handleRemoveEducation = (index: number) => {
    const edu = form.getValues(`educations.${index}`);
    if (edu.id && resumeId) {
      deleteMutation.mutate(edu.id);
    }
    remove(index);
  };

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    isCreating;

  return (
    <div className="w-full relative bg-white rounded-2xl p-4 sm:p-6">
      <CloseEditButton
        onClick={() => handleEditClick(false)}
        ariaLabel="Close education form"
        className="top-2 right-2"
      />
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-green-600" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">
            Education
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Your academic background and relevant certifications.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="relative bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">
                  Education #{index + 1}
                </h3>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEducation(index)}
                    className="text-red-500 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50"
                    aria-label={`Remove education ${index + 1}`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Degree + Field of Study */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`educations.${index}.degree`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-800">
                        Degree / Certification{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Bachelor of Science"
                          className="h-12 rounded-xl border-gray-200 bg-white placeholder:text-gray-300 text-gray-800 text-sm focus-visible:ring-indigo-400 focus-visible:ring-1 focus-visible:border-indigo-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`educations.${index}.fieldOfStudy`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-800">
                        Field of Study
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Computer Science"
                          className="h-12 rounded-xl border-gray-200 bg-white placeholder:text-gray-300 text-gray-800 text-sm focus-visible:ring-indigo-400 focus-visible:ring-1 focus-visible:border-indigo-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Institution + Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`educations.${index}.schoolName`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-800">
                        Institution <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Stanford University"
                          className="h-12 rounded-xl border-gray-200 bg-white placeholder:text-gray-300 text-gray-800 text-sm focus-visible:ring-indigo-400 focus-visible:ring-1 focus-visible:border-indigo-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`educations.${index}.location`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-800">
                        Location
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Stanford, CA"
                          className="h-12 rounded-xl border-gray-200 bg-white placeholder:text-gray-300 text-gray-800 text-sm focus-visible:ring-indigo-400 focus-visible:ring-1 focus-visible:border-indigo-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Start Year + End Year */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`educations.${index}.startDate`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-800">
                        Start Year
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="2015"
                          className="h-12 rounded-xl border-gray-200 bg-white placeholder:text-gray-300 text-gray-800 text-sm focus-visible:ring-indigo-400 focus-visible:ring-1 focus-visible:border-indigo-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`educations.${index}.endDate`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-800">
                        End Year
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="2019"
                          className="h-12 rounded-xl border-gray-200 bg-white placeholder:text-gray-300 text-gray-800 text-sm focus-visible:ring-indigo-400 focus-visible:ring-1 focus-visible:border-indigo-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              append({
                degree: "",
                schoolName: "",
                fieldOfStudy: "",
                location: "",
                startDate: "",
                endDate: "",
              })
            }
            className="w-full h-14 flex items-center justify-center gap-2 border-2 border-dashed border-indigo-400 rounded-2xl text-indigo-600 font-medium text-sm hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <PlusCircle className="w-5 h-5" />
            Add Another Education
          </button>

          {/* Navigation */}
          <div className="pt-4 flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="h-12 px-6 rounded-xl border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 h-12 rounded-xl text-sm transition-colors"
            >
              {isSaving ? "Saving..." : "Save & Continue"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
