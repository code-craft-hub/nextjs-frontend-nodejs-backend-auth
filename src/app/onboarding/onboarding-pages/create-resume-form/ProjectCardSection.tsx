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
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Link2, Plus } from "lucide-react";
import { useResumeForm } from "./ResumeFormContext";
import { CloseEditButton } from "@/components/shared/CloseEditButton";
import {
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from "@/lib/mutations/resume.mutations";
import { PiOfficeChair } from "react-icons/pi";

// ─── Schema ────────────────────────────────────────────────────────

const projectEntrySchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  techStack: z.string().optional(),
  url: z.string().optional(),
});

const projectsFormSchema = z.object({
  projects: z.array(projectEntrySchema).min(1),
});

type ProjectsFormValues = z.infer<typeof projectsFormSchema>;

// ─── Single Project Card ───────────────────────────────────────────

function ProjectCard({
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
    <div className="bg-white rounded-2xl border border-gray-200 p-2 sm:p-6 space-y-5">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-gray-900">
          Project #{index + 1}
        </h2>
        {canRemove && (
          <button
            type="button"
            onClick={() => remove(index)}
            className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
            aria-label="Remove project"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <FormField
        control={control}
        name={`projects.${index}.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-gray-900">
              Project Name
            </FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., E-commerce Mobile App Redesign"
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
        name={`projects.${index}.description`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-gray-900">
              Description
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Brief overview of the project, your role, and the outcome"
                rows={4}
                className="resize-none rounded-xl border-gray-200 bg-white placeholder:text-gray-300 text-gray-800 text-sm leading-relaxed focus-visible:ring-indigo-400 focus-visible:ring-1 focus-visible:border-indigo-400"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`projects.${index}.techStack`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-gray-900">
              Tech Stack / Tools Used
            </FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., React, Node.js, PostgreSQL (comma-separated)"
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
        name={`projects.${index}.url`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-gray-900">
              Project Link
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                <Input
                  placeholder="https://yourproject.com"
                  className="h-12 rounded-xl border-gray-200 bg-white pl-10 placeholder:text-gray-300 text-gray-800 text-sm focus-visible:ring-indigo-400 focus-visible:ring-1 focus-visible:border-indigo-400"
                  {...field}
                />
              </div>
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────

interface ProjectsFormProps {
  onNext?: () => void;
  onBack?: () => void;
  handleEditClick: (isEditing: boolean) => void;
}

export default function ProjectsForm({
  onNext,
  onBack,
  handleEditClick,
}: ProjectsFormProps) {
  const { resumeId, resumeData, updateResumeField } = useResumeForm();
  const createMutation = useCreateProjectMutation(resumeId || "");
  const updateMutation = useUpdateProjectMutation(resumeId || "");
  const deleteMutation = useDeleteProjectMutation(resumeId || "");

  const existingProjects = resumeData?.project || [];

  const form = useForm<ProjectsFormValues>({
    resolver: zodResolver(projectsFormSchema),
    defaultValues: {
      projects:
        existingProjects.length > 0
          ? existingProjects.map((proj) => ({
              id: proj.id || undefined,
              name: proj.name || "",
              description: proj.description || "",
              techStack: (proj.techStack as string[])?.join(", ") || "",
              url: proj.url || "",
            }))
          : [{ name: "", description: "", techStack: "", url: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "projects",
  });

  async function onSubmit(values: ProjectsFormValues) {
    if (!resumeId) {
      onNext?.();
      return;
    }

    const savePromises = values.projects.map((proj) => {
      const payload = {
        name: proj.name,
        description: proj.description,
        techStack: proj.techStack
          ? proj.techStack
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        url: proj.url,
      };

      if (proj.id) {
        return updateMutation.mutateAsync({ id: proj.id, data: payload });
      }
      return createMutation.mutateAsync(payload);
    });

    await Promise.all(savePromises);
    updateResumeField(
      "project",
      values.projects.map((proj) => ({
        id: proj.id,
        name: proj.name,
        description: proj.description,
        techStack: proj.techStack
          ? proj.techStack
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        url: proj.url,
      })),
    );
    onNext?.();
  }

  const handleRemoveProject = (index: number) => {
    const proj = form.getValues(`projects.${index}`);
    if (proj.id && resumeId) {
      deleteMutation.mutate(proj.id);
    }
    remove(index);
  };

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <div className="w-full relative bg-white p-2 sm:p-6 rounded-2xl">
      <CloseEditButton
        onClick={() => handleEditClick(false)}
        ariaLabel="Close projects form"
        className="top-2 right-3"
      />
      <div className="flex items-start gap-4 mb-4">
        <span className="flex items-center justify-center size-12 rounded-full bg-purple-100 text-purple-500 shrink-0 mt-0.5">
          <PiOfficeChair className="w-5 h-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            Projects
          </h1>
          <p className="text-sm text-gray-400 mt-1 leading-relaxed">
            Highlight key projects you've worked on. Include personal, academic,
          </p>
        </div>
      </div>
      <div className="bg-transparent py-4 md:py-5 space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {fields.map((field, index) => (
              <ProjectCard
                key={field.id}
                index={index}
                control={form.control}
                remove={handleRemoveProject}
                canRemove={fields.length > 1}
              />
            ))}

            <button
              type="button"
              onClick={() =>
                append({
                  name: "",
                  description: "",
                  techStack: "",
                  url: "",
                })
              }
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-indigo-400 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Another Project
            </button>

            {/* Navigation - hidden when used inside ProjectsAndCertifications wrapper */}
            {onBack && (
              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={onBack}
                  className="h-12 px-6 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save & Continue"}
                </button>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
