"use client";

import { memo } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { JobCardDropdownProps } from "./types";

export const JobCardDropdown = memo(function JobCardDropdown({
  onAutoApply,
  onPreview,
}: JobCardDropdownProps) {
  return (
    <div onClick={(e) => e.stopPropagation()}>
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="absolute top-4 right-4">
        <Button variant="ghost">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuItem onClick={onAutoApply}>
          <img src="/cube.svg" className="size-4" alt="" />
          Auto apply
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onPreview}>
          <img src="/preview.svg" className="size-4" alt="" />
          Preview
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  );
});
