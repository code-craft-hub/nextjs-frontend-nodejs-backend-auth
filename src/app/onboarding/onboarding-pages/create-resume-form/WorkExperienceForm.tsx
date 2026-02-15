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
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, CalendarDays, Plus } from "lucide-react";

// ─── Schema ────────────────────────────────────────────────────────────────────

const bulletSchema = z.object({
  text: z.string().min(1, "Bullet point cannot be empty"),
});

const experienceEntrySchema = z
  .object({
    jobTitle: z.string().min(1, "Job title is required"),
    companyName: z.string().min(1, "Company name is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    currentlyWorking: z.boolean(),
    bullets: z
      .array(bulletSchema)
      .min(1, "At least one bullet point is required"),
  })
  .refine(
    (data) =>
      data.currentlyWorking || (data.endDate && data.endDate.length > 0),
    {
      message: "End date is required unless currently working here",
      path: ["endDate"],
    },
  );

const experienceFormSchema = z.object({
  experiences: z.array(experienceEntrySchema).min(1),
});

type ExperienceFormValues = z.infer<typeof experienceFormSchema>;

// ─── Date input with calendar icon ────────────────────────────────────────────

function DateInput({
  value,
  onChange,
  placeholder = "mm-dd-yyyy",
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-12 rounded-xl border-gray-200 bg-white pl-10 placeholder:text-gray-300 text-gray-800 text-sm focus-visible:ring-indigo-400 focus-visible:ring-1 focus-visible:border-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed"
      />
    </div>
  );
}

// ─── Single Experience Card ───────────────────────────────────────────────────

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
  const currentlyWorking = watch(`experiences.${index}.currentlyWorking`);

  const {
    fields: bulletFields,
    append: appendBullet,
    remove: removeBullet,
  } = useFieldArray({ control, name: `experiences.${index}.bullets` });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 space-y-5">
      {/* Card header */}
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

      {/* Company Name */}
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
                placeholder="e.g., Tech Innovations inc"
                className="h-12 rounded-xl border-gray-200 bg-white placeholder:text-gray-300 text-gray-800 text-sm focus-visible:ring-indigo-400 focus-visible:ring-1 focus-visible:border-indigo-400"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

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
                  disabled={currentlyWorking}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </div>

      {/* Currently work here checkbox */}
      <FormField
        control={control}
        name={`experiences.${index}.currentlyWorking`}
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

      {/* Role Description / Bullets */}
      <div className="space-y-2">
        <FormLabel className="text-sm font-semibold text-gray-900">
          Role Description <span className="text-red-500">*</span>
        </FormLabel>

        <div className="space-y-2">
          {bulletFields.map((bullet, bIdx) => (
            <FormField
              key={bullet.id}
              control={control}
              name={`experiences.${index}.bullets.${bIdx}.text`}
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

        {/* Add bullet */}
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ExperienceForm() {
  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: {
      experiences: [
        {
          jobTitle: "",
          companyName: "",
          startDate: "",
          endDate: "",
          currentlyWorking: false,
          bullets: [{ text: "" }],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "experiences",
  });

  function onSubmit(values: ExperienceFormValues) {
    console.log(values);
  }

  const handleAddRole = () => {
    append({
      jobTitle: "",
      companyName: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      bullets: [{ text: "" }],
    });
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Experience cards */}
          {fields.map((field, index) => (
            <ExperienceCard
              key={field.id}
              index={index}
              control={form.control}
              remove={remove}
              canRemove={fields.length > 1}
              watch={form.watch}
              setValue={form.setValue}
            />
          ))}

          {/* Add Another Role button */}
          <button
            type="button"
            onClick={handleAddRole}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-indigo-400 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Another Role
          </button>
        </form>
      </Form>
    </div>
  );
}
