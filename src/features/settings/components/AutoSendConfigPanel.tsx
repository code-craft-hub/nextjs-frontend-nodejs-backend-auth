import { cn } from "@/lib/utils";
import React from "react";
import { ExcludedCompaniesInput } from "./ExcludedCompaniesInput";

const JOB_TYPE_OPTIONS = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
  { value: "internship", label: "Internship" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

export interface AutoSendConfig {
  maxApplicationsPerDay: number;
  minMatchScore: number;
  preferredJobTypes: string[];
  excludedCompanies: string[];
}

interface AutoSendConfigPanelProps {
  accountTier: string;
  tierCap: number;
  config: AutoSendConfig;
  onConfigChange: (patch: Partial<AutoSendConfig>) => void;
  onSave: (patch: Partial<AutoSendConfig>) => Promise<void>;
}

export const AutoSendConfigPanel: React.FC<AutoSendConfigPanelProps> = ({
  accountTier,
  tierCap,
  config,
  onConfigChange,
  onSave,
}) => {
  return (
    <div className="mt-2 pt-4 border-t border-gray-100 space-y-5">
      {/* Applications per day */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm text-gray-800">Applications per day</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Your <span className="capitalize">{accountTier}</span> plan allows up to{" "}
              <strong>{tierCap}</strong> per day
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              max={tierCap}
              value={config.maxApplicationsPerDay}
              disabled={tierCap === 0}
              onChange={(e) => {
                const val = Math.min(Math.max(1, Number(e.target.value)), tierCap);
                onConfigChange({ maxApplicationsPerDay: val });
              }}
              onBlur={() => onSave({ maxApplicationsPerDay: config.maxApplicationsPerDay })}
              className="w-16 text-center border border-gray-300 rounded-lg py-1.5 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="text-xs text-gray-500">/ day</span>
          </div>
        </div>
        {tierCap === 0 && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
            Upgrade your plan to enable auto-send applications.
          </p>
        )}
      </div>

      {/* Minimum match score */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm text-gray-800">Minimum match score</p>
            <p className="text-xs text-gray-500 mt-0.5">Only apply to jobs above this score</p>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={0}
              max={100}
              value={config.minMatchScore}
              onChange={(e) => {
                const val = Math.min(100, Math.max(0, Number(e.target.value)));
                onConfigChange({ minMatchScore: val });
              }}
              onBlur={() => onSave({ minMatchScore: config.minMatchScore })}
              className="w-16 text-center border border-gray-300 rounded-lg py-1.5 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-500">%</span>
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={config.minMatchScore}
          onChange={(e) => onConfigChange({ minMatchScore: Number(e.target.value) })}
          onMouseUp={() => onSave({ minMatchScore: config.minMatchScore })}
          onTouchEnd={() => onSave({ minMatchScore: config.minMatchScore })}
          className="w-full accent-blue-600"
        />
      </div>

      {/* Preferred job types */}
      <div className="space-y-1.5">
        <p className="font-medium text-sm text-gray-800">Preferred job types</p>
        <p className="text-xs text-gray-500">Leave empty to match all types</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {JOB_TYPE_OPTIONS.map((opt) => {
            const selected = config.preferredJobTypes.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={async () => {
                  const updated = selected
                    ? config.preferredJobTypes.filter((t) => t !== opt.value)
                    : [...config.preferredJobTypes, opt.value];
                  onConfigChange({ preferredJobTypes: updated });
                  await onSave({ preferredJobTypes: updated });
                }}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                  selected
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-blue-400",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Excluded companies */}
      <ExcludedCompaniesInput
        companies={config.excludedCompanies}
        onChange={async (updated) => {
          onConfigChange({ excludedCompanies: updated });
          await onSave({ excludedCompanies: updated });
        }}
      />
    </div>
  );
};
