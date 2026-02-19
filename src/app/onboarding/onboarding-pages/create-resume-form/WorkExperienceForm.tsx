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
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, CalendarDays, Plus, ArrowLeft, BriefcaseBusiness } from "lucide-react";
import { useResumeForm } from "./ResumeFormContext";
import {
  useCreateWorkExperienceMutation,
  useUpdateWorkExperienceMutation,
  useDeleteWorkExperienceMutation,
} from "@/lib/mutations/resume.mutations";
import { CloseEditButton } from "@/components/shared/CloseEditButton";

// ─── Schema ────────────────────────────────────────────────────────

// Helper function to validate date format (MM/DD/YYYY or MM-DD-YYYY)
function isValidDateFormat(dateStr: string): boolean {
  if (!dateStr) return false;
  const dateRegex = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/;
  const match = dateStr.match(dateRegex);
  if (!match) return false;

  const month = parseInt(match[1], 10);
  const day = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900) {
    return false;
  }

  const date = new Date(year, month - 1, day);
  return date.getMonth() === month - 1 && date.getDate() === day;
}

// Helper function to convert date string to ISO format
function dateStringToISO(dateStr: string): string {
  if (!dateStr) return "";
  const dateRegex = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/;
  const match = dateStr.match(dateRegex);
  if (!match) return dateStr;

  const month = match[1].padStart(2, "0");
  const day = match[2].padStart(2, "0");
  const year = match[3];

  return `${year}-${month}-${day}`;
}

const experienceEntrySchema = z
  .object({
    id: z.string().optional(),
    jobTitle: z.string().min(1, "Job title is required"),
    companyName: z.string().min(1, "Company name is required"),
    location: z.string().optional(),
    startDate: z
      .string()
      .min(1, "Start date is required")
      .refine(isValidDateFormat, "Please enter a valid date (MM/DD/YYYY)"),
    endDate: z
      .string()
      .refine(
        (val) => !val || isValidDateFormat(val),
        "Please enter a valid date (MM/DD/YYYY)",
      )
      .optional(),
    isCurrent: z.boolean(),
    responsibilities: z
      .array(z.object({ text: z.string().min(1, "Cannot be empty") }))
      .min(1, "At least one responsibility is required"),
  })
  .refine(
    (data) => data.isCurrent || (data.endDate && data.endDate.length > 0),
    {
      message: "End date is required unless currently working here",
      path: ["endDate"],
    },
  )
  .refine(
    (data) => {
      if (!data.endDate || data.isCurrent) return true;
      const startDate = new Date(dateStringToISO(data.startDate));
      const endDate = new Date(dateStringToISO(data.endDate));
      return endDate >= startDate;
    },
    {
      message: "End date must be after or equal to start date",
      path: ["endDate"],
    },
  );

const experienceFormSchema = z.object({
  experiences: z.array(experienceEntrySchema).min(1),
});

type ExperienceFormValues = z.infer<typeof experienceFormSchema>;

// ─── Date input ────────────────────────────────────────────────────

function DateInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  // Convert MM/DD/YYYY to YYYY-MM-DD for date input
  const convertToDateInputFormat = (dateStr: string): string => {
    if (!dateStr) return "";
    const dateRegex = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/;
    const match = dateStr.match(dateRegex);
    if (!match) return dateStr;
    const month = match[1].padStart(2, "0");
    const day = match[2].padStart(2, "0");
    const year = match[3];
    return `${year}-${month}-${day}`;
  };

  // Convert YYYY-MM-DD to MM/DD/YYYY for form submission
  const convertFromDateInputFormat = (dateStr: string): string => {
    if (!dateStr) return "";
    const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
    const match = dateStr.match(dateRegex);
    if (!match) return dateStr;
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    const year = match[1];
    return `${month}/${day}/${year}`;
  };

  return (
    <div className="relative">
      <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <Input
        type="date"
        value={convertToDateInputFormat(value)}
        onChange={(e) => onChange(convertFromDateInputFormat(e.target.value))}
        disabled={disabled}
        className="h-12 rounded-xl border-gray-200 bg-white pl-10 placeholder:text-gray-300 text-gray-800 text-sm focus-visible:ring-indigo-400 focus-visible:ring-1 focus-visible:border-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed"
      />
    </div>
  );
}

// ─── Single Experience Card ────────────────────────────────────────

function ExperienceCard({
  index,
  control,
  remove,
  canRemove,
  watch,
  setValue,
}: {
  index: number;
  control: any;
  remove: (i: number) => void;
  canRemove: boolean;
  watch: any;
  setValue: any;
}) {
  const isCurrent = watch(`experiences.${index}.isCurrent`);

  const {
    fields: bulletFields,
    append: appendBullet,
    remove: removeBullet,
  } = useFieldArray({ control, name: `experiences.${index}.responsibilities` });

  return (
    <div className=" border rounded-2xl border-gray-200 p-2 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">
          Experience #{index + 1}
        </h2>
        {canRemove && (
          <button
            type="button"
            onClick={() => remove(index)}
            className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
            aria-label="Remove experience"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Job Title */}
      <FormField
        control={control}
        name={`experiences.${index}.jobTitle`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-gray-900">
              Job Title <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., Senior UX Designer"
                className="h-12 rounded-xl border-gray-200 bg-white placeholder:text-gray-300 text-gray-800 text-sm focus-visible:ring-indigo-400 focus-visible:ring-1 focus-visible:border-indigo-400"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      {/* Company Name + Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`experiences.${index}.companyName`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-900">
                Company Name <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Tech Innovations Inc"
                  className="h-12 rounded-xl border-gray-200 bg-white placeholder:text-gray-300 text-gray-800 text-sm focus-visible:ring-indigo-400 focus-visible:ring-1 focus-visible:border-indigo-400"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`experiences.${index}.location`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-900">
                Location
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., San Francisco, CA"
                  className="h-12 rounded-xl border-gray-200 bg-white placeholder:text-gray-300 text-gray-800 text-sm focus-visible:ring-indigo-400 focus-visible:ring-1 focus-visible:border-indigo-400"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </div>

      {/* Start Date + End Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`experiences.${index}.startDate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-900">
                Start Date <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <DateInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`experiences.${index}.endDate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-900">
                End Date <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <DateInput
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  disabled={isCurrent}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </div>

      {/* Currently work here */}
      <FormField
        control={control}
        name={`experiences.${index}.isCurrent`}
        render={({ field }) => (
          <FormItem className="flex items-center gap-2.5 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  if (checked) setValue(`experiences.${index}.endDate`, "");
                }}
                className="w-4 h-4 rounded border-gray-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
              />
            </FormControl>
            <FormLabel className="text-sm text-gray-700 font-normal cursor-pointer">
              I currently work here
            </FormLabel>
          </FormItem>
        )}
      />

      {/* Responsibilities */}
      <div className="space-y-2">
        <FormLabel className="text-sm font-semibold text-gray-900">
          Responsibilities <span className="text-red-500">*</span>
        </FormLabel>

        <div className="space-y-2">
          {bulletFields.map((bullet, bIdx) => (
            <FormField
              key={bullet.id}
              control={control}
              name={`experiences.${index}.responsibilities.${bIdx}.text`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative group">
                      <Input
                        placeholder="-Led design for mobile app redesign, improving user retention by 35%"
                        className="h-12 rounded-xl border-gray-200 bg-white placeholder:text-gray-300 text-gray-800 text-sm focus-visible:ring-indigo-400 focus-visible:ring-1 focus-visible:border-indigo-400 pr-10"
                        {...field}
                      />
                      {bulletFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBullet(bIdx)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                          aria-label="Remove bullet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => appendBullet({ text: "" })}
          className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors mt-1"
        >
          <Plus className="w-4 h-4" />
          Add another bullet point
        </button>

        <p className="text-xs text-gray-400 leading-relaxed">
          Focus on achievements and impact. Use numbers when possible.
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────

interface ExperienceFormProps {
  onNext?: () => void;
  onBack?: () => void;
  handleEditClick: (isEditing: boolean) => void;
}

export default function ExperienceForm({
  onNext,
  onBack,
  handleEditClick,
}: ExperienceFormProps) {
  const { resumeId, resumeData, updateResumeField, createNewResume, isCreating } = useResumeForm();
  const createMutation = useCreateWorkExperienceMutation();
  const updateMutation = useUpdateWorkExperienceMutation(resumeId || "");
  const deleteMutation = useDeleteWorkExperienceMutation(resumeId || "");

  const existingExperiences = resumeData?.workExperience || [];

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: {
      experiences:
        existingExperiences.length > 0
          ? existingExperiences.map((exp) => ({
              id: exp.id || undefined,
              jobTitle: exp.jobTitle || "",
              companyName: exp.companyName || "",
              location: exp.location || "",
              startDate: exp.startDate
                ? new Date(exp.startDate).toLocaleDateString("en-US")
                : "",
              endDate: exp.endDate
                ? new Date(exp.endDate).toLocaleDateString("en-US")
                : "",
              isCurrent: exp.isCurrent || false,
              responsibilities: (exp.responsibilities as string[])?.length
                ? (exp.responsibilities as string[]).map((r) => ({
                    text: r,
                  }))
                : [{ text: "" }],
            }))
          : [
              {
                jobTitle: "",
                companyName: "",
                location: "",
                startDate: "",
                endDate: "",
                isCurrent: false,
                responsibilities: [{ text: "" }],
              },
            ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "experiences",
  });

  async function onSubmit(values: ExperienceFormValues) {
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

    const savePromises = values.experiences.map((exp) => {
      const payload = {
        jobTitle: exp.jobTitle,
        companyName: exp.companyName,
        location: exp.location,
        startDate: dateStringToISO(exp.startDate),
        endDate: exp.isCurrent ? undefined : dateStringToISO(exp.endDate || ""),
        isCurrent: exp.isCurrent,
        responsibilities: exp.responsibilities
          .map((r) => r.text)
          .filter(Boolean),
      };

      if (exp.id) {
        return updateMutation.mutateAsync({ id: exp.id, data: payload });
      }
      return createMutation.mutateAsync({ resumeId: activeResumeId, data: payload });
    });

    await Promise.all(savePromises);
    updateResumeField(
      "workExperience",
      values.experiences.map((exp) => ({
        id: exp.id,
        jobTitle: exp.jobTitle,
        companyName: exp.companyName,
        location: exp.location,
        startDate: dateStringToISO(exp.startDate),
        endDate: exp.isCurrent ? "" : dateStringToISO(exp.endDate || ""),
        isCurrent: exp.isCurrent,
        responsibilities: exp.responsibilities
          .map((r) => r.text)
          .filter(Boolean),
      })),
    );
    onNext?.();
  }

  const handleRemoveExperience = (index: number) => {
    const exp = form.getValues(`experiences.${index}`);
    if (exp.id && resumeId) {
      deleteMutation.mutate(exp.id);
    }
    remove(index);
  };

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    isCreating;

  return (
    <div className="w-full relative bg-white rounded-2xl p-2 sm:p-6 ">
      <CloseEditButton
        onClick={() => handleEditClick(false)}
        ariaLabel="Close work experience form"
        className="top-2 right-2"
      />
      <div className="flex items-start gap-4 mb-7">
        <span className="flex items-center justify-center size-12 rounded-full bg-gray-100 text-gray-500 shrink-0 mt-0.5">
          <BriefcaseBusiness className="w-5 h-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            Work Experience
          </h1>
          <p className="text-sm text-gray-400 mt-1 leading-relaxed">
            List your relevant work experience in reverse chronological order.
          </p>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {fields.map((field, index) => (
            <ExperienceCard
              key={field.id}
              index={index}
              control={form.control}
              remove={handleRemoveExperience}
              canRemove={fields.length > 1}
              watch={form.watch}
              setValue={form.setValue}
            />
          ))}

          <button
            type="button"
            onClick={() =>
              append({
                jobTitle: "",
                companyName: "",
                location: "",
                startDate: "",
                endDate: "",
                isCurrent: false,
                responsibilities: [{ text: "" }],
              })
            }
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-indigo-400 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Another Role
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
