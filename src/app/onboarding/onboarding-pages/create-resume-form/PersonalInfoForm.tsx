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
import { Progress } from "@/components/ui/progress";
import {
  User,
  MapPin,
  Linkedin,
  Globe,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Schema ────────────────────────────────────────────────────────────────────

const personalInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  professionalTitle: z.string().min(1, "Professional title is required"),
  fullName2: z.string().min(1, "Full name is required"),
  professionalTitle2: z.string().min(1, "Professional title is required"),
  location: z.string().min(1, "Location is required"),
  linkedIn: z.string().optional(),
  portfolio: z.string().optional(),
});

type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

// ─── Sidebar data ──────────────────────────────────────────────────────────────

const sections = [
  { id: 1, label: "Personal Info" },
  { id: 2, label: "Summary" },
  { id: 3, label: "Experience" },
  { id: 4, label: "Education" },
  { id: 5, label: "Skills" },
  { id: 6, label: "Additional" },
];

const ACTIVE_SECTION = 1;
const PROGRESS = 16;
const COMPLETED = 1;
const TOTAL = 6;

// ─── Component ────────────────────────────────────────────────────────────────

export default function PersonalInfoForm() {
  const form = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: "",
      professionalTitle: "",
      fullName2: "",
      professionalTitle2: "",
      location: "",
      linkedIn: "",
      portfolio: "",
    },
  });

  function onSubmit(values: PersonalInfoFormValues) {
    console.log(values);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-start justify-center">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-5">
        {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
        <aside className="flex flex-col gap-4 w-full md:w-[260px] shrink-0">
          {/* Form Sections card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Form Sections
            </p>

            <nav className="flex flex-col gap-1">
              {sections.map((s) => {
                const isActive = s.id === ACTIVE_SECTION;
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors w-full text-left",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <span
                      className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold shrink-0",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {s.id}
                    </span>
                    {s.label}
                  </button>
                );
              })}
            </nav>

            {/* Progress */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">
                  Progress
                </span>
                <span className="text-xs font-semibold text-blue-600">
                  {PROGRESS}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${PROGRESS}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {COMPLETED} of {TOTAL} sections completed
              </p>
            </div>
          </div>

          {/* Need Help card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                <Headphones className="w-4 h-4 text-gray-500" />
              </span>
              <span className="font-semibold text-gray-900 text-sm">
                Need Help?
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Our support team is here to assist you with any questions.
            </p>
            <Button
              variant="outline"
              className="w-full text-sm font-medium border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl"
              type="button"
            >
              Contact Support
            </Button>
          </div>
        </aside>

        {/* ── Main form card ───────────────────────────────────────────────────── */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-8">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 text-indigo-400">
              <User className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Personal Information
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Let&apos;s start with the basics. This helps employers contact
                you.
              </p>
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {/* Row 1: Full name + Professional Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Full name{" "}
                        <span className="text-red-500">*</span>
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
                  name="professionalTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Professional Title{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Product Designer"
                          className="h-12 rounded-xl border-gray-200 bg-white placeholder:text-gray-300 text-gray-800 text-sm focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:border-blue-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 2: Full name + Professional Title (duplicate row as in design) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Full name{" "}
                        <span className="text-red-500">*</span>
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
                  name="professionalTitle2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Professional Title{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Product Designer"
                          className="h-12 rounded-xl border-gray-200 bg-white placeholder:text-gray-300 text-gray-800 text-sm focus-visible:ring-blue-500 focus-visible:ring-1 focus-visible:border-blue-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Location */}
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
                    <p className="text-xs text-gray-400 mt-1">
                      City and state are enough. No need for full address.
                    </p>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Divider */}
              <div className="pt-1" />

              {/* Online Presence */}
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-4">
                  Online Presence{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </p>

                {/* LinkedIn */}
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

                  {/* Portfolio */}
                  <FormField
                    control={form.control}
                    name="portfolio"
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
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 h-12 rounded-xl text-sm transition-colors"
                >
                  Save &amp; Continue
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}