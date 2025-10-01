import { cn } from "@/lib/utils";
import { forwardRef, KeyboardEventHandler } from "react";

interface FormTextareaProps {
  w?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  defaultValue?: string;
  onBlur?: () => void;
  onChange?: () => void;
  onClick?: () => void;
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement> | undefined;
}

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      w,
      placeholder,
      required,
      disabled,
      className,
      defaultValue = "",
      onBlur,
      onChange,
      onClick,
      onKeyDown,
    },
    ref
  ) => {
    function autoResizeTextarea() {
      const textarea = document.getElementById("user-input");
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }

    document
      ?.getElementById("user-input")
      ?.addEventListener("input", function () {
        autoResizeTextarea();
      });

    autoResizeTextarea();
    return (
      <div>
        <textarea
          onBlur={onBlur}
          onChange={onChange}
          defaultValue={defaultValue}
          ref={ref}
          required={required}
          onKeyDown={onKeyDown}
          onClick={onClick}
          placeholder={placeholder}
          // disabled={pending || disabled}
          disabled={disabled}
          id="user-input"
          className={cn(
            "py-[12px] font-[16px] border-none resize-none outline-none overflow-hidden",
            w ? w : "w-[620px]",
            className
          )}
          rows={1}
        ></textarea>
      </div>
    );
  }
);

export default FormTextarea;

FormTextarea.displayName = "FormTextarea";
