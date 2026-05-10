"use client";

import React, { useEffect, useRef, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, Plus, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { jobPreferencesApi } from "@/features/job-preferences/api/job-preferences.api";
import { jobPreferencesQueries, JOB_PREFERENCES_KEY } from "@/features/job-preferences/queries/job-preferences.queries";
import type { JobPreferences } from "@/features/job-preferences/api/job-preferences.api.types";
import { queryKeys } from "@/shared/query/keys";

// ─── Types ────────────────────────────────────────────────────────────────────

type WorkArrangement = "remote" | "onsite" | "hybrid";
type EmploymentType = "full_time" | "part_time" | "contract" | "internship";

const EMPTY: JobPreferences = {
  workArrangements: [],
  employmentTypes: [],
  preferredLocations: [],
  openToRelocation: false,
  keywords: "",
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function ToggleRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-[15px] text-gray-600">{label}</span>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="data-[state=unchecked]:bg-gray-300 data-[state=checked]:bg-black"
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h3 className="text-[18px] font-semibold text-gray-900 mb-2">{title}</h3>
      <div>{children}</div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function RecommendationPreferences() {
  const queryClient = useQueryClient();
  const { data } = useQuery(jobPreferencesQueries.detail());

  const [form, setForm] = useState<JobPreferences>(EMPTY);
  const [locationInput, setLocationInput] = useState("");
  const locationRef = useRef<HTMLInputElement>(null);

  const isHydrated = useRef(false);
  const skipNextKeywordEffect = useRef(false);
  const formRef = useRef(form);
  formRef.current = form;

  // Hydrate form from server data once loaded
  useEffect(() => {
    if (data?.data) {
      skipNextKeywordEffect.current = true;
      setForm(data.data);
      isHydrated.current = true;
    }
  }, [data]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  // Silent auto-save: no toast, no form resync — only refreshes recommendations
  const autoSaveMutation = useMutation({
    mutationFn: (payload: JobPreferences) => jobPreferencesApi.save(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendations.user() });
    },
  });

  const saveMutation = useMutation({
    mutationFn: (payload: JobPreferences) => jobPreferencesApi.save(payload),
    onSuccess: (res) => {
      if (res?.data) setForm(res.data);
      queryClient.invalidateQueries({ queryKey: JOB_PREFERENCES_KEY });
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendations.user() });
      toast.success("Preferences saved");
    },
    onError: () => toast.error("Failed to save preferences"),
  });

  const clearMutation = useMutation({
    mutationFn: () => jobPreferencesApi.clear(),
    onSuccess: () => {
      setForm(EMPTY);
      queryClient.invalidateQueries({ queryKey: JOB_PREFERENCES_KEY });
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendations.user() });
      toast.success("Preferences cleared");
    },
    onError: () => toast.error("Failed to clear preferences"),
  });

  // Auto-save keywords 700ms after the user stops typing
  useEffect(() => {
    if (!isHydrated.current || skipNextKeywordEffect.current) {
      skipNextKeywordEffect.current = false;
      return;
    }
    const timer = setTimeout(() => {
      autoSaveMutation.mutate(formRef.current);
    }, 700);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.keywords]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  function toggleArr<T extends string>(arr: T[], value: T): T[] {
    return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
  }

  function toggleWork(loc: WorkArrangement) {
    setForm((f) => ({ ...f, workArrangements: toggleArr(f.workArrangements, loc) }));
  }

  function toggleEmp(type: EmploymentType) {
    setForm((f) => ({ ...f, employmentTypes: toggleArr(f.employmentTypes, type) }));
  }

  function addLocation() {
    const trimmed = locationInput.trim();
    if (!trimmed || form.preferredLocations.includes(trimmed)) return;
    const newForm = { ...form, preferredLocations: [...form.preferredLocations, trimmed] };
    setForm(newForm);
    setLocationInput("");
    locationRef.current?.focus();
    autoSaveMutation.mutate(newForm);
  }

  function removeLocation(loc: string) {
    const newForm = { ...form, preferredLocations: form.preferredLocations.filter((l) => l !== loc) };
    setForm(newForm);
    autoSaveMutation.mutate(newForm);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const isBusy = saveMutation.isPending || clearMutation.isPending;

  return (
    <div className="p-4 bg-white">
      <div className="p-6">
        {/* Header */}
        <h1 className="text-[22px] font-semibold text-center text-gray-900 mb-6">
          Recommendation Preferences
        </h1>

        {/* Work arrangement */}
        <Section title="Work arrangement">
          {(["remote", "onsite", "hybrid"] as WorkArrangement[]).map((loc) => (
            <ToggleRow
              key={loc}
              label={loc.charAt(0).toUpperCase() + loc.slice(1)}
              checked={form.workArrangements.includes(loc)}
              onCheckedChange={() => toggleWork(loc)}
            />
          ))}
        </Section>

        {/* Employment Type */}
        <Section title="Employment Type">
          {(
            [
              ["full_time", "Full-time"],
              ["part_time", "Part-time"],
              ["contract", "Contract / Freelance"],
              ["internship", "Internship"],
            ] as [EmploymentType, string][]
          ).map(([type, label]) => (
            <ToggleRow
              key={type}
              label={label}
              checked={form.employmentTypes.includes(type)}
              onCheckedChange={() => toggleEmp(type)}
            />
          ))}
        </Section>

        {/* Location Preferences */}
        <div className="mt-6">
          <h3 className="text-[18px] font-semibold text-gray-900 mb-3">
            Location Preferences
          </h3>

          {/* Location chips */}
          {form.preferredLocations.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {form.preferredLocations.map((loc) => (
                <span
                  key={loc}
                  className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-[13px] font-medium px-3 py-1.5 rounded-full"
                >
                  {loc}
                  <button
                    onClick={() => removeLocation(loc)}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label={`Remove ${loc}`}
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Add location input */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                ref={locationRef}
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addLocation()}
                placeholder="Add target city or region"
                className="h-10 rounded-xl border border-gray-300 bg-white placeholder:text-gray-400 text-[14px] pr-10"
              />
            </div>
            <button
              onClick={addLocation}
              disabled={!locationInput.trim()}
              className="size-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 disabled:opacity-40 transition-colors"
              aria-label="Add location"
            >
              <Plus className="size-4" />
            </button>
          </div>

          {/* Relocation */}
          <div className="mt-2">
            <ToggleRow
              label="Open to relocation"
              checked={form.openToRelocation}
              onCheckedChange={(v) => setForm((f) => ({ ...f, openToRelocation: v }))}
            />
          </div>
        </div>

        {/* Search Keywords */}
        <div className="mt-6">
          <h3 className="text-[18px] font-semibold text-gray-900 mb-3">
            Search Keywords
          </h3>
          <Input
            value={form.keywords}
            onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
            placeholder='e.g. "product designer", "figma", "react"'
            className={cn(
              "h-12 rounded-xl border border-gray-300 bg-white",
              "placeholder:text-gray-400 text-[14px]",
            )}
          />
          <p className="mt-1.5 text-[12px] text-gray-400">Separate keywords with commas</p>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            onClick={() => clearMutation.mutate()}
            disabled={isBusy}
            className="text-[13px] text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
          >
            Clear all
          </button>
          <Button
            onClick={() => saveMutation.mutate(form)}
            disabled={isBusy}
            className="px-8 rounded-full bg-black text-white hover:bg-gray-800"
          >
            {saveMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Save preferences"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
