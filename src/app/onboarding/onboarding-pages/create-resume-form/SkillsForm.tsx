"use client";

import { useState, KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Star, X, ArrowLeft } from "lucide-react";
import { useResumeForm } from "./ResumeFormContext";
import { useAddSkillsMutation } from "@/lib/mutations/resume.mutations";
import { resumeApi } from "@/lib/api/resume.api";
import { CloseEditButton } from "@/components/shared/CloseEditButton";

// ─── Schema ────────────────────────────────────────────────────────

const skillsSchema = z.object({
  hardSkills: z
    .array(z.string().min(1))
    .min(1, "Please add at least one hard skill"),
  softSkills: z.array(z.string().min(1)),
});

type SkillsFormValues = z.infer<typeof skillsSchema>;

// ─── Skill Tag Input ───────────────────────────────────────────────

function SkillTagInput({
  skills,
  onAdd,
  onRemove,
  placeholder,
}: {
  skills: string[];
  onAdd: (skill: string) => void;
  onRemove: (skill: string) => void;
  placeholder: string;
}) {
  const [inputText, setInputText] = useState("");

  const addSkill = () => {
    const trimmed = inputText.trim();
    if (!trimmed || skills.includes(trimmed)) {
      setInputText("");
      return;
    }
    onAdd(trimmed);
    setInputText("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div>
      <div className="flex gap-3 mt-1">
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-12 flex-1 rounded-xl border-gray-200 bg-white placeholder:text-gray-300 text-gray-800 text-sm focus-visible:ring-indigo-400 focus-visible:ring-1 focus-visible:border-indigo-400"
        />
        <Button
          type="button"
          onClick={addSkill}
          className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shrink-0 transition-colors"
        >
          Add
        </Button>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2.5 mt-4">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium"
            >
              {skill}
              <button
                type="button"
                onClick={() => onRemove(skill)}
                className="text-indigo-400 hover:text-indigo-700 transition-colors ml-0.5"
                aria-label={`Remove ${skill}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────

interface SkillsFormProps {
  onNext?: () => void;
  onBack?: () => void;
  handleEditClick: (isEditing: boolean) => void;
}

export default function SkillsForm({
  onNext,
  onBack,
  handleEditClick,
}: SkillsFormProps) {
  const { resumeId, resumeData, updateResumeField, createNewResume, isCreating } = useResumeForm();
  const addSkillsMutation = useAddSkillsMutation(resumeId || "");

  const form = useForm<SkillsFormValues>({
    resolver: zodResolver(skillsSchema),
    defaultValues: {
      hardSkills: resumeData?.hardSkill?.map((s) => s.value || s.label) || [],
      softSkills: resumeData?.softSkill?.map((s) => s.value || s.label) || [],
    },
  });

  const hardSkills = form.watch("hardSkills");
  const softSkills = form.watch("softSkills");

  async function onSubmit(values: SkillsFormValues) {
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

    // If creating anew, call API directly; otherwise use mutation
    const addSkillsPromise = resumeId
      ? addSkillsMutation.mutateAsync({
          hardSkill: values.hardSkills,
          softSkill: values.softSkills,
        })
      : resumeApi.addSkills(activeResumeId, {
          hardSkill: values.hardSkills,
          softSkill: values.softSkills,
        });

    addSkillsPromise.then(() => {
      updateResumeField(
        "hardSkill",
        values.hardSkills.map((s) => ({ label: s, value: s })),
      );
      updateResumeField(
        "softSkill",
        values.softSkills.map((s) => ({ label: s, value: s })),
      );
      onNext?.();
    });
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6 relative">
      {/* Section header */}
      <CloseEditButton
        onClick={() => handleEditClick(false)}
        ariaLabel="Close skills form"
        className="top-2 right-2"
      />
      <div className="flex items-start gap-4 mb-7">
        <span className="flex items-center justify-center size-12 rounded-full bg-orange-100 shrink-0 mt-0.5">
          <Star className="w-5 h-5 text-red-500 fill-red-500" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            Skills
          </h1>
          <p className="text-sm text-gray-400 mt-1 leading-relaxed">
            Add both technical and soft skills that showcase your expertise.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Hard Skills */}
          <FormField
            control={form.control}
            name="hardSkills"
            render={() => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-gray-900">
                  Technical / Hard Skills{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <SkillTagInput
                  skills={hardSkills}
                  onAdd={(skill) =>
                    form.setValue("hardSkills", [...hardSkills, skill], {
                      shouldValidate: true,
                    })
                  }
                  onRemove={(skill) =>
                    form.setValue(
                      "hardSkills",
                      hardSkills.filter((s) => s !== skill),
                      { shouldValidate: true },
                    )
                  }
                  placeholder="Type a technical skill and press Enter (e.g., JavaScript, Figma)"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Examples: JavaScript, React, Figma, Python, SQL, AWS
                </p>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Soft Skills */}
          <FormField
            control={form.control}
            name="softSkills"
            render={() => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-gray-900">
                  Soft Skills{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </FormLabel>
                <SkillTagInput
                  skills={softSkills}
                  onAdd={(skill) =>
                    form.setValue("softSkills", [...softSkills, skill], {
                      shouldValidate: true,
                    })
                  }
                  onRemove={(skill) =>
                    form.setValue(
                      "softSkills",
                      softSkills.filter((s) => s !== skill),
                      { shouldValidate: true },
                    )
                  }
                  placeholder="Type a soft skill and press Enter (e.g., Leadership)"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Examples: Leadership, Communication, Problem Solving, Teamwork
                </p>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

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
              disabled={addSkillsMutation.isPending || isCreating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 h-12 rounded-xl text-sm transition-colors"
            >
              {addSkillsMutation.isPending || isCreating ? "Saving..." : "Save & Continue"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
