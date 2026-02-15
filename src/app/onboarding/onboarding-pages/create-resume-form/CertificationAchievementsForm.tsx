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
import { Trash2, Plus, Award, ArrowLeft, ArrowRight } from "lucide-react";

// ─── Schema ────────────────────────────────────────────────────────────────────

const certificationEntrySchema = z.object({
  title: z.string().optional(),
  issuer: z.string().optional(),
  year: z.string().optional(),
});

const certificationFormSchema = z.object({
  certifications: z.array(certificationEntrySchema).min(1),
});

type CertificationFormValues = z.infer<typeof certificationFormSchema>;

// ─── Single Certification Card ────────────────────────────────────────────────

function CertificationCard({
  index,
  control,
  remove,
  canRemove,
}: {
  index: number;
  control: any;
  remove: (i: number) => void;
  canRemove: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 space-y-5">
      {/* Card header */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-gray-900">
          Certification #{index + 1}
        </h2>
        {canRemove && (
          <button
            type="button"
            onClick={() => remove(index)}
            className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
            aria-label="Remove certification"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Title */}
      <FormField
        control={control}
        name={`certifications.${index}.title`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-gray-900">
              Title
            </FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., Google UX Design Professional Certificate"
                className="h-12 rounded-xl border-gray-200 bg-white placeholder:text-gray-300 text-gray-800 text-sm text-center focus-visible:ring-indigo-400 focus-visible:ring-1 focus-visible:border-indigo-400"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      {/* Issuer + Year */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`certifications.${index}.issuer`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-900">
                Issuer
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Google / Coursera"
                  className="h-12 rounded-xl border-gray-200 bg-white placeholder:text-gray-300 text-gray-800 text-sm text-center focus-visible:ring-indigo-400 focus-visible:ring-1 focus-visible:border-indigo-400"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`certifications.${index}.year`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-gray-900">
                Year
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="2023"
                  maxLength={4}
                  className="h-12 rounded-xl border-gray-200 bg-white placeholder:text-gray-300 text-gray-800 text-sm text-center focus-visible:ring-indigo-400 focus-visible:ring-1 focus-visible:border-indigo-400"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface CertificationAchievementsFormProps {
  onBack?: () => void;
  onSaveDraft?: () => void;
  onContinue?: () => void;
}

export default function CertificationAchievementsForm({
  onBack,
  onSaveDraft,
  onContinue,
}: CertificationAchievementsFormProps) {
  const form = useForm<CertificationFormValues>({
    resolver: zodResolver(certificationFormSchema),
    defaultValues: {
      certifications: [{ title: "", issuer: "", year: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "certifications",
  });

  function onSubmit(values: CertificationFormValues) {
    console.log(values);
    onContinue?.();
  }

  const handleAddCertification = () => {
    append({ title: "", issuer: "", year: "" });
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* ── Main card ─────────────────────────────────────────────────────────── */}
      <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
        {/* ── Section header ──────────────────────────────────────────────────── */}
        <div className="flex items-start gap-4 mb-7">
          <span className="flex items-center justify-center w-11 h-11 rounded-full bg-yellow-100 shrink-0 mt-0.5">
            <Award className="w-5 h-5 text-yellow-500" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Certification &amp; Achievements
              </h1>
              <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium shrink-0">
                Optional
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1 leading-relaxed">
              Highlight professional certifications, awards, or notable
              achievements.
            </p>
          </div>
        </div>

        {/* ── Form ────────────────────────────────────────────────────────────── */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Certification cards */}
            {fields.map((field, index) => (
              <CertificationCard
                key={field.id}
                index={index}
                control={form.control}
                remove={remove}
                canRemove={fields.length > 1}
              />
            ))}

            {/* Add Another Certification */}
            <button
              type="button"
              onClick={handleAddCertification}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-indigo-400 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Another Certification
            </button>
          </form>
        </Form>
      </div>

      {/* ── Bottom navigation ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-3">
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
          type="button"
          variant="outline"
          onClick={onSaveDraft}
          className="h-12 px-6 rounded-xl border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50"
        >
          Save as Draft
        </Button>

        <Button
          type="submit"
          onClick={form.handleSubmit(onSubmit)}
          className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm gap-2 transition-colors"
        >
          Continue to Preview
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
