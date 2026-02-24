
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";


interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  label: string;
  type?: string;
  className?: string;
  showPasswordToggle?: boolean;
}

export function FloatingLabelInput({
  id,
  label,
  type = "text",
  className = "",
  showPasswordToggle = false,
  ...props
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputId = useId();
  const actualId = id || inputId;

  const handleFocus = () => setIsFocused(true);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasValue(e.target.value.length > 0);
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0);
    props.onChange?.(e);
  };

  const isLabelFloated = isFocused || hasValue;
  const inputType = showPasswordToggle
    ? showPassword
      ? "text"
      : "password"
    : type;

  return (
    <div className="group relative">
      <label
        htmlFor={actualId}
        className={`
          absolute left-3 z-10 px-2 text-sm font-medium
          bg-background text-muted-foreground
          transition-all duration-200 ease-in-out
          pointer-events-none font-poppins
          ${isLabelFloated ? "-top-2.5 text-xs text-foreground" : "top-3"}
        `}
      >
        {label}
      </label>
      <div className="relative">
        <Input
          id={actualId}
          type={inputType}
          className={`
            h-12  px-3 pr-${showPasswordToggle ? "12" : "3"}
            transition-colors duration-200 font-poppins
            border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg
            ${className}
          `}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors "
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
}