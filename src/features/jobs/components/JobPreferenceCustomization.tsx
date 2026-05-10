import React from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Reusable row with label + right-aligned switch
function ToggleRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-[15px] text-gray-600">{label}</span>
      <Switch className="data-[state=unchecked]:bg-gray-300 data-[state=checked]:bg-black" />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h3 className="text-[18px] font-semibold text-gray-900 mb-2">{title}</h3>
      <div className="">{children}</div>
    </div>
  );
}

export default function RecommendationPreferences() {
  return (
      <div className="p-4 bg-white">
        <div className="p-6">
          {/* Header */}
          <h1 className="text-[22px] font-semibold text-center text-gray-900 mb-6">
            Recommendation Preferences
          </h1>

          {/* Work arrangement */}
          <Section title="Work arrangement">
            <ToggleRow label="Remote" />
            <ToggleRow label="Onsite" />
            <ToggleRow label="Hybrid" />
          </Section>

          {/* Employment Type */}
          <Section title="Employment Type">
            <ToggleRow label="Full-time" />
            <ToggleRow label="Part-time" />
            <ToggleRow label="Contract / Freelance" />
            <ToggleRow label="Internship" />
          </Section>

          {/* Location Preferences */}
          <div className="mt-6">
            <h3 className="text-[18px] font-semibold text-gray-900 mb-3">
              Location Preferences
            </h3>

            {/* Add location */}
            <div className="flex items-center gap-3 text-gray-500 py-2">
              <div className="size-8 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                <span className="text-xl">+</span>
              </div>
              <span className="text-[15px]">Add target city or regions</span>
            </div>

            {/* Relocation */}
            <div className="mt-2">
              <ToggleRow label="Open to relocation" />
            </div>
          </div>

          {/* Search Keywords */}
          <div className="mt-6">
            <h3 className="text-[18px] font-semibold text-gray-900 mb-3">
              search Keywords
            </h3>

            <Input
              placeholder='Enter job titles or description e.g "product designer", "figma"'
              className={cn(
                "h-12 rounded-xl border border-gray-300 bg-white",
                "placeholder:text-gray-400 text-[14px]"
              )}
            />
          </div>
        </div>
      </div>
  );
}
