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


type ActionValue =
  | "select-profile"
  | "upload-file"
  | "upload-photo"
  | "tailor-resume"
  | "tailor-cover-letter"
  | "generate-interview-questions";

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
    value: ActionValue;
    onValueChange: (value: ActionValue) => void;
    placeholder: string;
    className?: string;
    contentClassName?: string;
    triggerClassName?: string;
  }) => (
    <div className={cn("", className)}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={cn(triggerClassName)}>
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
              <div className="flex items-center  gap-3 w-full">
                {Icon && <Icon className="size-3 group-hover:text-primary" />}
                <span className="font-medium group-hover:text-primary" >{label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
);

SelectOptions.displayName = "SelectOptions";
