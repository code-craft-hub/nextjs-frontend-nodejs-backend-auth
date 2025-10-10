import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface EditDialogProps {
  asChild?: boolean;
  trigger: React.ReactNode;
  title: string;
  description?: string;
  children: (onClose: () => void) => React.ReactNode;
  className?: string;
}

export const EditDialog: React.FC<EditDialogProps> = ({
  asChild=false,
  trigger,
  title,
  description,
  className,
  children,
}) => {
  const [open, setOpen] = useState(false);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild={asChild} className={cn("text-start w-full", className)}>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto max-sm:!p-2">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children(handleClose)}
      </DialogContent>
    </Dialog>
  );
};

