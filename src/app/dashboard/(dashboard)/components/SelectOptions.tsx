import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { memo } from "react";
import { ProfileOption } from "./constants";
import LockIcon from "@/components/icons/LockIcon";

// type ActionValue =
//   | "select-profile"
//   | "upload-file"
//   | "upload-photo"
//   | "tailor-resume"
//   | "tailor-cover-letter"
//   | "generate-interview-questions";

export const SelectOptions = memo(
  ({
    options,
    value,
    onValueChange,
    placeholder,
    className = "",
    contentClassName = "",
    triggerClassName = "",
  }: {
    options: readonly ProfileOption[];
    value: any;
    onValueChange: (value: any) => void;
    placeholder: string;
    className?: string;
    contentClassName?: string;
    triggerClassName?: string;
  }) => (
    <div className={cn("", className)}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={cn(triggerClassName, "w-full max-sm:!w-22 !h-7")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-lg shadow-lg mt-1">
          {options.map(({ value, label, icon: Icon }) => (
            <SelectItem
              key={value}
              value={value}
              className={cn(
                "flex items-center cursor-pointer gap-1 group transition-colors duration-150",
                "data-[state=checked]:text-primary",
                contentClassName
              )}
            >
              <div className="flex items-center max-sm:gap-0.5 gap-3 w-full">
                {Icon && <Icon className="max-sm:size-2 size-3 group-hover:text-primary" />}
                <span className="font-medium group-hover:text-primary max-sm:text-3xs">
                  {label}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
);

SelectOptions.displayName = "SelectOptions";


export const SelectProfile = memo(
  ({
    options,
    value,
    onValueChange,
    placeholder,
    className = "",
    contentClassName = "",
    triggerClassName = "",
  }: {
    options: any[];
    value: any;
    onValueChange: (value: any) => void;
    placeholder: string;
    className?: string;
    contentClassName?: string;
    triggerClassName?: string;
  }) => {
    console.log(options);
    return (
      <div className={cn("", className)}>
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger
            className={cn(triggerClassName, "w-full max-sm:!w-22 !h-7")}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="rounded-lg shadow-lg mt-1">
            {options.map((profile) => (
              <SelectItem
                key={profile?.id}
                value={profile?.id}
                className={cn(
                  "flex items-center cursor-pointer gap-1 group transition-colors duration-150",
                  "data-[state=checked]:text-primary",
                  contentClassName
                )}
              >
                <div className="flex items-center max-sm:gap-0.5 gap-3 w-full">
                  <LockIcon className="max-sm:size-2 size-3 group-hover:text-primary" />
                  <span className="font-medium group-hover:text-primary max-sm:text-3xs">
                    {profile?.title}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
);

SelectProfile.displayName = "SelectProfile";