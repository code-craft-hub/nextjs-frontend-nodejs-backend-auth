import { cn } from "@/lib/utils";
import Link from "next/link";
import { memo, useState } from "react";
import { ActionOption } from "../constants";

export const ActionButton = memo(
  ({ option }: { option: ActionOption }) => {
    const [hovered, setHovered] = useState<string | null>(null);

    return (
      <div>
        <Link
          onMouseEnter={() => setHovered(option.name)}
          onMouseLeave={() => setHovered(null)}
          href={option.url}
          className={cn(
            hovered === option.name
              ? "bg-primary/14 flex gap-2 rounded-xl items-center justify-center"
              : "glass-button",
            "!text-black sm:w-32 gap-2 p-3"
          )}
        >
          <img
            src={option.icon}
            alt={option.name}
            className="max-xs4:size-3 size-4"
          />
          <span className="max-xs4:text-[0.6rem] text-xs text-nowrap">
            {option.name}
          </span>
        </Link>
      </div>
    );
  }
);

ActionButton.displayName = "ActionButton";
