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
import { Star, X } from "lucide-react";

// ─── Schema ────────────────────────────────────────────────────────────────────

const skillsSchema = z.object({
  skills: z.array(z.string().min(1)).min(1, "Please add at least one skill"),
  inputValue: z.string().optional(),
});

type SkillsFormValues = z.infer<typeof skillsSchema>;

// ─── Component ────────────────────────────────────────────────────────────────

export default function SkillsForm() {
  const [inputText, setInputText] = useState("");

  const form = useForm<SkillsFormValues>({
    resolver: zodResolver(skillsSchema),
    defaultValues: {
      skills: [
        "Figma",
        "UI/UX Design",
        "User Research",
        "Prototyping",
        "Adobe XD",
      ],
      inputValue: "",
    },
  });

  const skills = form.watch("skills");

  const addSkill = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    const current = form.getValues("skills");
    if (current.includes(trimmed)) {
      setInputText("");
      return;
    }
    form.setValue("skills", [...current, trimmed], { shouldValidate: true });
    setInputText("");
  };

  const removeSkill = (skill: string) => {
    const current = form.getValues("skills");
    form.setValue(
      "skills",
      current.filter((s) => s !== skill),
      { shouldValidate: true },
    );
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  function onSubmit(values: SkillsFormValues) {
    console.log(values);
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
      {/* ── Section header ──────────────────────────────────────────────── */}
      <div className="flex items-start gap-4 mb-7">
        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-orange-100 shrink-0 mt-0.5">
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

      {/* ── Form ────────────────────────────────────────────────────────── */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="skills"
            render={() => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-gray-900">
                  Add Your Skills <span className="text-red-500">*</span>
                </FormLabel>

                {/* Input + Add button */}
                <div className="flex gap-3 mt-1">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a skill and press Enter"
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

                {/* Helper text */}
                <p className="text-xs text-gray-400 mt-1">
                  Examples: Figma, User Research, JavaScript, Leadership,
                  Problem Solving
                </p>

                {/* Skill tags */}
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
                          onClick={() => removeSkill(skill)}
                          className="text-indigo-400 hover:text-indigo-700 transition-colors ml-0.5"
                          aria-label={`Remove ${skill}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
