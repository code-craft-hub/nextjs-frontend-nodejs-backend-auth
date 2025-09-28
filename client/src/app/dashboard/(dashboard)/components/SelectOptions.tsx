import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface ProfileOption {
  value: string;
  label: string;
  icon: string;
}

type ActionValue =
  | "select-profile"
  | "upload-file"
  | "upload-photo"
  | "tailor-resume"
  | "tailor-cover-letter"
  | "generate-interview-questions";

const PROFILE_OPTIONS: readonly ProfileOption[] = [
  {
    value: "select-profile",
    label: "Select Profile",
    icon: "/select-profile.svg",
  },
  {
    value: "upload-file",
    label: "Upload file or link",
    icon: "/upload-dashboard.svg",
  },
  {
    value: "upload-photo",
    label: "Upload photo",
    icon: "/camera.svg",
  },
] as const;

const ACTION_OPTIONS: readonly ProfileOption[] = [
  {
    value: "tailor-resume",
    label: "Tailor Resume",
    icon: "/tailor-resume.svg",
  },
  {
    value: "tailor-cover-letter",
    label: "Tailor Cover Letter",
    icon: "/tailor-letter.svg",
  },
  {
    value: "generate-interview-questions",
    label: "Generate Interview Questions",
    icon: "/tailor-question.svg",
  },
] as const;

export const SelectOptions = memo(
  ({
    options,
    value,
    onValueChange,
    placeholder,
    className = "",
    triggerClassName = "",
  }: {
    options: readonly ProfileOption[];
    value: ActionValue;
    onValueChange: (value: ActionValue) => void;
    placeholder: string;
    className?: string;
    triggerClassName?: string;
  }) => (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={cn("w-full", triggerClassName)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
          {options.map(({ value, label, icon }) => (
            <SelectItem
              key={value}
              value={value}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
            >
              <div className="flex items-center gap-3 w-full">
                <img src={icon} alt={value} loading="lazy" />
                {/* {icon} */}
                {/* <Icon /> */}
                <span className="text-gray-900 font-medium">{label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
);

SelectOptions.displayName = "SelectOptions";