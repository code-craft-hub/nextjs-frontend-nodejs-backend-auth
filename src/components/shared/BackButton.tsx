"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  href: string;
  className?: string;
}

export function BackButton({ href, className }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(href)}
      className={cn(
        "flex items-center text-blue-600 font-medium hover:text-blue-700",
        className,
      )}
    >
      <ArrowLeft className="w-5 h-5 mr-2" />
      Back
    </button>
  );
}
