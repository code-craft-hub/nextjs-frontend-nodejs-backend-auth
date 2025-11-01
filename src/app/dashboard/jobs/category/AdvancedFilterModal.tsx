"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronDown } from "lucide-react";
// Type definitions for enterprise-grade type safety
interface FilterState {
  matchOptions: MatchOption;
  salary: SalaryRange;
  jobTypes: JobType[];
  jobLevel: JobLevel;
}

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

interface FilterConfig {
  matchOptions: Array<{ value: MatchOption; label: string }>;
  salaryRanges: Array<{ value: SalaryRange; label: string }>;
  jobTypes: Array<{ value: JobType; label: string }>;
  jobLevels: Array<{ value: JobLevel; label: string }>;
}

// Configuration constants with enterprise-grade data structure
const FILTER_CONFIG: FilterConfig = {
  matchOptions: [
    { value: "81-100", label: "81 - 100%" },
    { value: "61-80", label: "61 - 80%" },
    { value: "41-60", label: "41 - 60%" },
    { value: "0-40", label: "0 - 40%" },
  ],
  salaryRanges: [
    { value: "$50-1000", label: "$50 - $1000" },
    { value: "$1000-2000", label: "$1000 - $2000" },
    { value: "$3000-4000", label: "$3000 - $4000" },
    { value: "$4000-6000", label: "$4000 - $6000" },
    { value: "$6000-8000", label: "$6000 - $8000" },
    { value: "$8000-10000", label: "$8000 - $10000" },
    { value: "$10000-15000", label: "$10000 - $15000" },
    { value: "$15000+", label: "$15000+" },
  ],
  jobTypes: [
    { value: "all", label: "All" },
    { value: "fullTime", label: "Full Time" },
    { value: "partTime", label: "Part Time" },
    { value: "internship", label: "Internship" },
    { value: "remote", label: "Remote" },
    { value: "temporary", label: "Temporary" },
    { value: "contractBase", label: "Contract Base" },
  ],
  jobLevels: [
    { value: "entry", label: "Entry Level" },
    { value: "mid", label: "Mid Level" },
    { value: "expert", label: "Expert Level" },
  ],
};

interface AdvancedFilterProps {
  onFilterChange?: (filters: FilterState) => void;
  onApplyFilters?: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
  className?: string;
}

const AdvancedJobFilter: React.FC<AdvancedFilterProps> = ({
  onFilterChange,
  onApplyFilters,
  initialFilters,
  className = "",
}) => {
  // State management with enterprise-grade default values
  const [filters, setFilters] = useState<FilterState>(() => ({
    matchOptions: initialFilters?.matchOptions || "81-100",
    salary: initialFilters?.salary || "$6000-8000",
    jobTypes: initialFilters?.jobTypes || ["fullTime"],
    jobLevel: initialFilters?.jobLevel || "mid",
  }));

  // Memoized handlers for optimal performance
  const handleMatchOptionChange = useCallback(
    (value: string) => {
      const newFilters = { ...filters, matchOptions: value as MatchOption };
      setFilters(newFilters);
      onFilterChange?.(newFilters);
    },
    [filters, onFilterChange]
  );

  const handleSalaryChange = useCallback(
    (value: string) => {
      const newFilters = { ...filters, salary: value as SalaryRange };
      setFilters(newFilters);
      onFilterChange?.(newFilters);
    },
    [filters, onFilterChange]
  );

  const handleJobTypeChange = useCallback(
    (type: JobType, checked: boolean) => {
      let newJobTypes: JobType[];

      if (type === "all") {
        newJobTypes = checked ? ["all"] : [];
      } else {
        if (checked) {
          newJobTypes = [...filters.jobTypes.filter((t) => t !== "all"), type];
        } else {
          newJobTypes = filters.jobTypes.filter((t) => t !== type);
        }
      }
      const newFilters = { ...filters, jobTypes: newJobTypes };
      setFilters(newFilters);
      onFilterChange?.(newFilters);
    },
    [filters, onFilterChange]
  );

  const handleJobLevelChange = useCallback(
    (value: string) => {
      const newFilters = { ...filters, jobLevel: value as JobLevel };
      setFilters(newFilters);
      onFilterChange?.(newFilters);
    },
    [filters, onFilterChange]
  );

  const handleApply = useCallback(() => {
    onApplyFilters?.(filters);
  }, [filters, onApplyFilters]);

  // Memoized computed values for performance
  const isJobTypeChecked = useCallback(
    (type: JobType) => {
      return filters.jobTypes.includes(type);
    },
    [filters.jobTypes]
  );

  const getJobTypeLabelColor = useCallback(
    (type: JobType) => {
      return isJobTypeChecked(type) ? "text-blue-600" : "text-gray-500";
    },
    [isJobTypeChecked]
  );

  const getSalaryLabelColor = useCallback(
    (salary: SalaryRange) => {
      return filters.salary === salary ? "text-blue-600" : "text-gray-500";
    },
    [filters.salary]
  );

  const getJobLevelLabelColor = useCallback(
    (level: JobLevel) => {
      return filters.jobLevel === level ? "text-blue-600" : "text-gray-600";
    },
    [filters.jobLevel]
  );

  const getMatchOptionLabelColor = useCallback(
    (option: MatchOption) => {
      return filters.matchOptions === option
        ? "text-blue-600"
        : "text-gray-600";
    },
    [filters.matchOptions]
  );

  return (
    <div
      className={`relative  bg-white  border-gray-200 rounded-lg shadow-lg ${className}`}
    >
      {/* Apply Button - Positioned exactly as in design */}
      <div className="p-4 w-fit ml-auto">
        <Button
          onClick={handleApply}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded text-base font-semibold"
        >
          Apply
        </Button>
      </div>

      <div className="grid grid-cols-4">
        {/* Match Options Section */}
        <div className="space-y-4 border p-4">
          <h3 className="text-gray-900 font-medium text-base">Match options</h3>
          <RadioGroup
            value={filters.matchOptions}
            onValueChange={handleMatchOptionChange}
            className="space-y-3"
          >
            {FILTER_CONFIG.matchOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`match-${option.value}`}
                  className="w-5 h-5"
                />
                <Label
                  htmlFor={`match-${option.value}`}
                  className={`text-sm font-normal ${getMatchOptionLabelColor(
                    option.value
                  )}`}
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Salary Section */}
        <div className="space-y-4 border p-4">
          <h3 className="text-gray-900 font-medium text-base">Salary</h3>
          <RadioGroup
            value={filters.salary}
            onValueChange={handleSalaryChange}
            className="space-y-3"
          >
            {FILTER_CONFIG.salaryRanges.map((salary) => (
              <div key={salary.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={salary.value}
                  id={`salary-${salary.value}`}
                  className="w-5 h-5"
                />
                <Label
                  htmlFor={`salary-${salary.value}`}
                  className={`text-sm font-normal ${getSalaryLabelColor(
                    salary.value
                  )}`}
                >
                  {salary.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Job Type Section */}
        <div className="space-y-4 border p-4">
          <h3 className="text-gray-900 font-medium text-base">Job Type</h3>
          <div className="space-y-3">
            {FILTER_CONFIG.jobTypes.map((jobType) => (
              <div key={jobType.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`jobtype-${jobType.value}`}
                  checked={isJobTypeChecked(jobType.value)}
                  onCheckedChange={(checked) =>
                    handleJobTypeChange(jobType.value, checked as boolean)
                  }
                  className="w-4 h-4 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <Label
                  htmlFor={`jobtype-${jobType.value}`}
                  className={`text-sm font-normal ${getJobTypeLabelColor(
                    jobType.value
                  )}`}
                >
                  {jobType.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Job Level Section */}
        <div className="space-y-4 border p-4">
          <h3 className="text-gray-900 font-medium text-base">Job Level</h3>
          <RadioGroup
            value={filters.jobLevel}
            onValueChange={handleJobLevelChange}
            className="space-y-3"
          >
            {FILTER_CONFIG.jobLevels.map((level) => (
              <div key={level.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={level.value}
                  id={`level-${level.value}`}
                  className="w-5 h-5"
                />
                <Label
                  htmlFor={`level-${level.value}`}
                  className={`text-sm font-normal ${getJobLevelLabelColor(
                    level.value
                  )}`}
                >
                  {level.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};

// Demo component to show usage
export default function AdvancedFilterModal() {
  const handleFilterChange = (filters: FilterState) => {
    console.log("Filters changed:", filters);
  };

  const handleApplyFilters = (filters: FilterState) => {
    console.log("Applying filters:", filters);
    // Implement your filter application logic here
  };

  return (
    <div className="bg-red-500 w-full">

    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline">Filter options <ChevronDown className="size-3" /> </Button>
        </DialogTrigger>
        <DialogContent className="!w-screen  max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <AdvancedJobFilter
            onFilterChange={handleFilterChange}
            onApplyFilters={handleApplyFilters}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
    </div>
  );
}
