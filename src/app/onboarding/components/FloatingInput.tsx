import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FloatingLabelInputProps } from "@/types";
import { ChevronDownIcon } from "lucide-react";
import { useId } from "react";

export function FloatingLabelInput({
  id,
  label,
  className = "",
  showPasswordToggle = false,
  isUpdatingUserLoading,
  ...props
}: FloatingLabelInputProps) {
  const inputId = useId();
  const actualId = id || inputId;

  return (
    <div className="group relative">
      <label
        htmlFor={actualId}
        className={cn(
          "absolute left-3 z-10 px-2 font-medium bg-background transition-all duration-200 ease-in-out pointer-events-none font-poppins max-sm:-top-1.5 -top-2.5 max-sm:text-2xs text-xs text-muted-foreground"
        )}
      >
        {label}
      </label>
      <div className="relative">
        <Input
          id={actualId}
          disabled={isUpdatingUserLoading}
          className={`
              sm:h-12 max-sm:text-2xs px-3 pr-${showPasswordToggle ? "12" : "3"}
              transition-colors duration-200 font-poppins
              border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-[4px]
              ${className}
            `}
          {...props}
        />

        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 max-sm:size-3" />
      </div>
    </div>
  );
}
