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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Lightbulb, BriefcaseBusiness, ArrowLeft } from "lucide-react";
import { useResumeForm } from "./ResumeFormContext";
import { useUpdateResumeMutation } from "@/lib/mutations/resume.mutations";
import { CloseEditButton } from "@/components/shared/CloseEditButton";

// ─── Schema ────────────────────────────────────────────────────────

const MAX_CHARS = 1024;

const professionalSummarySchema = z.object({
  summary: z
    .string()
    .min(1, "Summary is required")
    .max(MAX_CHARS, `Summary must be at most ${MAX_CHARS} characters`),
});

type ProfessionalSummaryFormValues = z.infer<typeof professionalSummarySchema>;

// ─── Component ────────────────────────────────────────────────────

interface ProfessionalSummaryFormProps {
  onNext?: () => void;
  onBack?: () => void;
  handleEditClick: (value: boolean) => void;
}

export default function ProfessionalSummaryForm({
  onNext,
  onBack,
  handleEditClick,
}: ProfessionalSummaryFormProps) {
  const {
    resumeId,
    resumeData,
    updateResumeField,
    createNewResume,
    isCreating,
  } = useResumeForm();
  const updateResume = useUpdateResumeMutation();

  const form = useForm<ProfessionalSummaryFormValues>({
    resolver: zodResolver(professionalSummarySchema),
    defaultValues: {
      summary: resumeData?.description || resumeData?.summary || "",
    },
  });

  const summaryValue = form.watch("summary");
  const charCount = summaryValue?.length ?? 0;

  async function onSubmit({ summary }: ProfessionalSummaryFormValues) {
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

    updateResume.mutate(
      { id: activeResumeId, data: { summary } },
      {
        onSuccess: () => {
          updateResumeField("summary", summary);
          onNext?.();
        },
      },
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-2 sm:p-6 relative">
      {/* ── Section header ──────────────────────────────────────────── */}
      <CloseEditButton
        onClick={() => handleEditClick(false)}
        className="top-2 right-2"
        ariaLabel="Close professional summary form"
      />
      <div className="flex items-start gap-4 mb-7">
        <span className="flex items-center justify-center size-12 rounded-full bg-purple-100 text-purple-500 shrink-0 mt-0.5">
          <BriefcaseBusiness className="w-5 h-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            Professional Summary
          </h1>
          <p className="text-sm text-gray-400 mt-1 leading-relaxed">
            A brief overview of your career highlights and what you bring to the
            table.
          </p>
        </div>
      </div>

      {/* ── Form ──────────────────────────────────────────────────── */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-gray-900">
                  Summary <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={
                      "Example: Results-driven Product Designer with 5+ years of experience creating user-centered digital products. Specialized in UX research, prototyping, and design systems. Led design initiatives that increased user engagement by 40%."
                    }
                    maxLength={MAX_CHARS}
                    rows={6}
                    className="resize-none rounded-xl border-gray-200 bg-white placeholder:text-gray-300 text-gray-800 text-sm leading-relaxed focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:border-blue-400 mt-1"
                    {...field}
                  />
                </FormControl>

                {/* Helper row */}
                <div className="flex items-start justify-between gap-4 pt-0.5">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Keep it between 3-5 sentences. Focus on your key strengths
                    and achievements.
                  </p>
                  <span
                    className={`text-xs shrink-0 tabular-nums ${
                      charCount >= MAX_CHARS
                        ? "text-red-500 font-medium"
                        : "text-gray-400"
                    }`}
                  >
                    {charCount}&nbsp;/{MAX_CHARS}
                  </span>
                </div>

                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* ── Pro Tip ─────────────────────────────────────────── */}
          <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 mt-2">
            <div className="flex items-center gap-2 mb-1.5">
              <Lightbulb className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="text-sm font-bold text-indigo-700">Pro Tip</span>
            </div>
            <p className="text-sm text-indigo-600 leading-relaxed">
              Start with your years of experience, mention your specialty, and
              highlight 1-2 major achievements or skills that set you apart.
            </p>
          </div>

          {/* ── Navigation ─────────────────────────────────────── */}
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
              disabled={updateResume.isPending || isCreating}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 h-12 rounded-xl text-sm transition-colors"
            >
              {updateResume.isPending || isCreating
                ? "Saving..."
                : "Save & Continue"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
