"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface CloseEditButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
}

export function CloseEditButton({
  onClick,
  ariaLabel = "Close",
  className,
}: CloseEditButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("absolute ", className)}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <X />
    </Button>
  );
}
