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

// ─── Schema ────────────────────────────────────────────────────────────────────

const projectEntrySchema = z.object({
  projectName: z.string().optional(),
  description: z.string().optional(),
  toolsUsed: z.string().optional(),
  projectLink: z.string().optional(),
});

const projectsFormSchema = z.object({
  projects: z.array(projectEntrySchema).min(1),
});

type ProjectsFormValues = z.infer<typeof projectsFormSchema>;

// ─── Single Project Card ──────────────────────────────────────────────────────

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
    <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 space-y-5">
      {/* Card header */}
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

      {/* Project Name */}
      <FormField
        control={control}
        name={`projects.${index}.projectName`}
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

      {/* Description */}
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

      {/* Tools Used */}
      <FormField
        control={control}
        name={`projects.${index}.toolsUsed`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-gray-900">
              Tools Used
            </FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., Figma, React, Node.js"
                className="h-12 rounded-xl border-gray-200 bg-white placeholder:text-gray-300 text-gray-800 text-sm focus-visible:ring-indigo-400 focus-visible:ring-1 focus-visible:border-indigo-400"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      {/* Project Link */}
      <FormField
        control={control}
        name={`projects.${index}.projectLink`}
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProjectsForm() {
  const form = useForm<ProjectsFormValues>({
    resolver: zodResolver(projectsFormSchema),
    defaultValues: {
      projects: [
        {
          projectName: "",
          description: "",
          toolsUsed: "",
          projectLink: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "projects",
  });

  function onSubmit(values: ProjectsFormValues) {
    console.log(values);
  }

  const handleAddProject = () => {
    append({
      projectName: "",
      description: "",
      toolsUsed: "",
      projectLink: "",
    });
  };

  return (
    <div className="w-full">
      {/* Outer wrapper card — matches the light rounded container in screenshot */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 md:p-5 space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Project cards */}
            {fields.map((field, index) => (
              <ProjectCard
                key={field.id}
                index={index}
                control={form.control}
                remove={remove}
                canRemove={fields.length > 1}
              />
            ))}

            {/* Add Another Project button */}
            <button
              type="button"
              onClick={handleAddProject}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-indigo-400 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Another Project
            </button>
          </form>
        </Form>
      </div>
    </div>
  );
}
