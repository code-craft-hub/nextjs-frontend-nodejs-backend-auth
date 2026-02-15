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
import { Lightbulb, BriefcaseBusiness } from "lucide-react";

// ─── Schema ────────────────────────────────────────────────────────────────────

const MAX_CHARS = 500;

const professionalSummarySchema = z.object({
  summary: z
    .string()
    .min(1, "Summary is required")
    .max(MAX_CHARS, `Summary must be at most ${MAX_CHARS} characters`),
});

type ProfessionalSummaryFormValues = z.infer<typeof professionalSummarySchema>;

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProfessionalSummaryForm() {
  const form = useForm<ProfessionalSummaryFormValues>({
    resolver: zodResolver(professionalSummarySchema),
    defaultValues: {
      summary: "",
    },
  });

  const summaryValue = form.watch("summary");
  const charCount = summaryValue?.length ?? 0;

  function onSubmit(values: ProfessionalSummaryFormValues) {
    console.log(values);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
        {/* ── Section header ──────────────────────────────────────────────────── */}
        <div className="flex items-start gap-4 mb-7">
          <span className="flex items-center justify-center w-11 h-11 rounded-full bg-purple-100 text-purple-500 shrink-0 mt-0.5">
            <BriefcaseBusiness className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              Professional Summary
            </h1>
            <p className="text-sm text-gray-400 mt-1 leading-relaxed">
              A brief overview of your career highlights and what you bring to
              the table.
            </p>
          </div>
        </div>

        {/* ── Form ────────────────────────────────────────────────────────────── */}
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
                      Keep it between 3-5 sentences. Focus on your key
                      strengths and achievements.
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

            {/* ── Pro Tip ─────────────────────────────────────────────────────── */}
            <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 mt-2">
              <div className="flex items-center gap-2 mb-1.5">
                <Lightbulb className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="text-sm font-bold text-indigo-700">
                  Pro Tip
                </span>
              </div>
              <p className="text-sm text-indigo-600 leading-relaxed">
                Start with your years of experience, mention your specialty,
                and highlight 1-2 major achievements or skills that set you
                apart.
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}