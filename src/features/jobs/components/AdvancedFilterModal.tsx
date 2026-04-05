"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronDown } from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────

export const SUPPORTED_COUNTRIES = [
  "Australia",
  "Canada",
  "Germany",
  "Ireland",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "Singapore",
  "United Kingdom",
  "United States",
] as const;

export type SupportedCountry = (typeof SUPPORTED_COUNTRIES)[number];

const CLASSIFICATION_OPTIONS = [
  { value: null, label: "All" },
  { value: "remote", label: "Remote" },
  { value: "relocate", label: "Relocate" },
] as const;

// ── Types ─────────────────────────────────────────────────────────────────────

type MatchOption = "81-100" | "61-80" | "41-60" | "0-40";
type SalaryRange =
  | "$50-1000"
  | "$1000-2000"
  | "$3000-4000"
  | "$4000-6000"
  | "$6000-8000"
  | "$8000-10000"
  | "$10000-15000"
  | "$15000+";
type JobType =
  | "all"
  | "fullTime"
  | "partTime"
  | "internship"
  | "remote"
  | "temporary"
  | "contractBase";
type JobLevel = "entry" | "mid" | "expert";

interface FilterState {
  matchOptions: MatchOption;
  salary: SalaryRange;
  jobTypes: JobType[];
  jobLevel: JobLevel;
  /** null = "All countries" (no filter), string = specific country */
  country: string | null;
  /** null = "All", "remote" | "relocate" = scraper classification */
  classification: string | null;
}

// ── Config ────────────────────────────────────────────────────────────────────

const FILTER_CONFIG = {
  matchOptions: [
    { value: "81-100" as MatchOption, label: "81 - 100%" },
    { value: "61-80" as MatchOption, label: "61 - 80%" },
    { value: "41-60" as MatchOption, label: "41 - 60%" },
    { value: "0-40" as MatchOption, label: "0 - 40%" },
  ],
  salaryRanges: [
    { value: "$50-1000" as SalaryRange, label: "$50 - $1,000" },
    { value: "$1000-2000" as SalaryRange, label: "$1,000 - $2,000" },
    { value: "$3000-4000" as SalaryRange, label: "$3,000 - $4,000" },
    { value: "$4000-6000" as SalaryRange, label: "$4,000 - $6,000" },
    { value: "$6000-8000" as SalaryRange, label: "$6,000 - $8,000" },
    { value: "$8000-10000" as SalaryRange, label: "$8,000 - $10,000" },
    { value: "$10000-15000" as SalaryRange, label: "$10,000 - $15,000" },
    { value: "$15000+" as SalaryRange, label: "$15,000+" },
  ],
  jobTypes: [
    { value: "all" as JobType, label: "All" },
    { value: "fullTime" as JobType, label: "Full Time" },
    { value: "partTime" as JobType, label: "Part Time" },
    { value: "internship" as JobType, label: "Internship" },
    { value: "remote" as JobType, label: "Remote" },
    { value: "temporary" as JobType, label: "Temporary" },
    { value: "contractBase" as JobType, label: "Contract Base" },
  ],
  jobLevels: [
    { value: "entry" as JobLevel, label: "Entry Level" },
    { value: "mid" as JobLevel, label: "Mid Level" },
    { value: "expert" as JobLevel, label: "Expert Level" },
  ],
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface AdvancedFilterModalProps {
  /** Currently active country filter — keeps panel in sync with external state. */
  initialCountry?: string;
  /** Currently active classification filter. */
  initialClassification?: string;
  /** Called when the user clicks "Apply filter". Modal closes automatically. */
  onApplyFilters: (filters: {
    country: string | null;
    classification: string | null;
  }) => void;
}

// ── Inner filter panel ────────────────────────────────────────────────────────

function AdvancedJobFilter({
  initialCountry,
  initialClassification,
  onApply,
}: {
  initialCountry?: string;
  initialClassification?: string;
  onApply: (filters: { country: string | null; classification: string | null }) => void;
}) {
  const [filters, setFilters] = useState<FilterState>(() => ({
    matchOptions: "81-100",
    salary: "$6000-8000",
    jobTypes: ["fullTime"],
    jobLevel: "mid",
    country: initialCountry ?? null,
    classification: initialClassification ?? null,
  }));

  const handleCountryChange = useCallback((country: string, checked: boolean) => {
    // Single-select: clicking a checked country deselects it (shows all).
    setFilters((prev) => ({ ...prev, country: checked ? country : null }));
  }, []);

  const handleClassificationChange = useCallback((value: string | null) => {
    setFilters((prev) => ({ ...prev, classification: value }));
  }, []);

  const handleMatchOptionChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, matchOptions: value as MatchOption }));
  }, []);

  const handleSalaryChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, salary: value as SalaryRange }));
  }, []);

  const handleJobTypeChange = useCallback((type: JobType, checked: boolean) => {
    setFilters((prev) => {
      let newJobTypes: JobType[];
      if (type === "all") {
        newJobTypes = checked ? ["all"] : [];
      } else if (checked) {
        newJobTypes = [...prev.jobTypes.filter((t) => t !== "all"), type];
      } else {
        newJobTypes = prev.jobTypes.filter((t) => t !== type);
      }
      return { ...prev, jobTypes: newJobTypes };
    });
  }, []);

  const handleJobLevelChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, jobLevel: value as JobLevel }));
  }, []);

  const handleApply = useCallback(() => {
    onApply({ country: filters.country, classification: filters.classification });
  }, [filters.country, filters.classification, onApply]);

  return (
    <div className="relative bg-white border-gray-200 rounded-lg shadow-lg">
      <div className="mb-4 ml-4 pt-4 w-fit">
        <Button
          onClick={handleApply}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded text-base font-semibold"
        >
          Apply filter
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 overflow-auto max-md:h-[70svh]">
        {/* Match Options */}
        <div className="space-y-4 border p-4">
          <h3 className="text-gray-900 font-medium text-base">Match options</h3>
          <RadioGroup
            value={filters.matchOptions}
            onValueChange={handleMatchOptionChange}
            className="space-y-3"
          >
            {FILTER_CONFIG.matchOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`match-${option.value}`} className="w-5 h-5" />
                <Label
                  htmlFor={`match-${option.value}`}
                  className={`text-sm font-normal ${
                    filters.matchOptions === option.value ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Salary */}
        <div className="space-y-4 border p-4">
          <h3 className="text-gray-900 font-medium text-base">Salary</h3>
          <RadioGroup
            value={filters.salary}
            onValueChange={handleSalaryChange}
            className="space-y-3"
          >
            {FILTER_CONFIG.salaryRanges.map((salary) => (
              <div key={salary.value} className="flex items-center space-x-2">
                <RadioGroupItem value={salary.value} id={`salary-${salary.value}`} className="w-5 h-5" />
                <Label
                  htmlFor={`salary-${salary.value}`}
                  className={`text-sm font-normal ${
                    filters.salary === salary.value ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {salary.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Job Type */}
        <div className="space-y-4 border p-4">
          <h3 className="text-gray-900 font-medium text-base">Job Type</h3>
          <div className="space-y-3">
            {FILTER_CONFIG.jobTypes.map((jobType) => (
              <div key={jobType.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`jobtype-${jobType.value}`}
                  checked={filters.jobTypes.includes(jobType.value)}
                  onCheckedChange={(checked) =>
                    handleJobTypeChange(jobType.value, checked as boolean)
                  }
                  className="w-4 h-4 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <Label
                  htmlFor={`jobtype-${jobType.value}`}
                  className={`text-sm font-normal ${
                    filters.jobTypes.includes(jobType.value) ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {jobType.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Job Level */}
        <div className="space-y-4 border p-4">
          <h3 className="text-gray-900 font-medium text-base">Job Level</h3>
          <RadioGroup
            value={filters.jobLevel}
            onValueChange={handleJobLevelChange}
            className="space-y-3"
          >
            {FILTER_CONFIG.jobLevels.map((level) => (
              <div key={level.value} className="flex items-center space-x-2">
                <RadioGroupItem value={level.value} id={`level-${level.value}`} className="w-5 h-5" />
                <Label
                  htmlFor={`level-${level.value}`}
                  className={`text-sm font-normal ${
                    filters.jobLevel === level.value ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  {level.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Country — single-select, with "All countries" as the clear option */}
        <div className="space-y-4 border p-4">
          <h3 className="text-gray-900 font-medium text-base">Country</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="country-all"
                checked={filters.country === null}
                onCheckedChange={(checked) => {
                  if (checked) setFilters((prev) => ({ ...prev, country: null }));
                }}
                className="w-4 h-4 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label
                htmlFor="country-all"
                className={`text-sm font-normal ${
                  filters.country === null ? "text-blue-600" : "text-gray-500"
                }`}
              >
                All countries
              </Label>
            </div>

            {SUPPORTED_COUNTRIES.map((country) => (
              <div key={country} className="flex items-center space-x-2">
                <Checkbox
                  id={`country-${country}`}
                  checked={filters.country === country}
                  onCheckedChange={(checked) =>
                    handleCountryChange(country, checked as boolean)
                  }
                  className="w-4 h-4 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <Label
                  htmlFor={`country-${country}`}
                  className={`text-sm font-normal ${
                    filters.country === country ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {country}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Classification */}
        <div className="space-y-4 border p-4">
          <h3 className="text-gray-900 font-medium text-base">Classification</h3>
          <RadioGroup
            value={filters.classification ?? "all"}
            onValueChange={(value) =>
              handleClassificationChange(value === "all" ? null : value)
            }
            className="space-y-3"
          >
            {CLASSIFICATION_OPTIONS.map((option) => {
              const radioValue = option.value ?? "all";
              return (
                <div key={radioValue} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={radioValue}
                    id={`classification-${radioValue}`}
                    className="w-5 h-5"
                  />
                  <Label
                    htmlFor={`classification-${radioValue}`}
                    className={`text-sm font-normal ${
                      filters.classification === option.value
                        ? "text-blue-600"
                        : "text-gray-600"
                    }`}
                  >
                    {option.label}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}

// ── Public export — trigger + modal wrapper ───────────────────────────────────

export default function AdvancedFilterModal({
  initialCountry,
  initialClassification,
  onApplyFilters,
}: AdvancedFilterModalProps) {
  const [open, setOpen] = useState(false);

  const handleApply = useCallback(
    (filters: { country: string | null; classification: string | null }) => {
      onApplyFilters(filters);
      setOpen(false);
    },
    [onApplyFilters],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          Filter options <ChevronDown className="size-3 ml-1" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95svw]! p-0 max-w-none! h-fit overflow-auto bg-white">
        <DialogHeader>
          <DialogTitle className="sr-only">Filter jobs</DialogTitle>
          <DialogDescription className="sr-only">
            Filter jobs by country, classification, match score, salary, job type, and level.
          </DialogDescription>
        </DialogHeader>
        <AdvancedJobFilter
          initialCountry={initialCountry}
          initialClassification={initialClassification}
          onApply={handleApply}
        />
      </DialogContent>
    </Dialog>
  );
}
