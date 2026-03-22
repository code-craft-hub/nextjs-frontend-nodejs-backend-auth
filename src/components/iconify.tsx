"use client";

import { Icon, IconProps } from "@iconify/react";
import { cn } from "@/lib/utils"; // shadcn utility if you have it

type Props = IconProps & {
  className?: string;
};

export function Iconify({ className, ...props }: Props) {
  return <Icon {...props} className={cn("inline-block shrink-0", className)} />;
}
