import { cn } from "@/lib/utils";
import React from "react";

/**
 * Detects and formats plain text into structured React elements.
 * Handles: headings (ALL CAPS lines, lines ending with ":"), bold (**text**),
 * bullet lists (-, *, •), numbered lists, blank-line paragraphs, and horizontal rules.
 */
export function formatPlainText(
  text: string,
  className?: string,
): React.ReactNode {
  if (!text) return null;

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();

    // Skip blank lines (they just add spacing between blocks)
    if (!trimmed) {
      i++;
      continue;
    }

    // Horizontal rule: --- or ===
    if (/^(-{3,}|={3,})$/.test(trimmed)) {
      elements.push(<hr key={i} className="my-4 border-slate-200" />);
      i++;
      continue;
    }

    // Markdown-style headings: # ## ###
    const mdHeading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (mdHeading) {
      const level = mdHeading[1].length;
      const headingText = mdHeading[2];
      const headingClass = [
        "font-semibold text-slate-800",
        level === 1 ? "text-xl mt-4 mb-2" : level === 2 ? "text-lg mt-3 mb-1" : "text-base mt-2 mb-1",
      ].join(" ");
      elements.push(
        <p key={i} className={headingClass}>
          {headingText}
        </p>,
      );
      i++;
      continue;
    }

    // ALL CAPS heading (≥3 chars, no lowercase)
    if (trimmed.length >= 3 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) {
      elements.push(
        <p key={i} className="font-bold text-slate-800 uppercase tracking-wide text-sm mt-4 mb-1">
          {trimmed}
        </p>,
      );
      i++;
      continue;
    }

    // Section label: line ending with ":" (short, ≤60 chars)
    if (trimmed.endsWith(":") && trimmed.length <= 60 && !trimmed.includes(".")) {
      elements.push(
        <p key={i} className="font-semibold text-slate-700 mt-3 mb-1">
          {trimmed}
        </p>,
      );
      i++;
      continue;
    }

    // Numbered list item: "1." "2)" etc.
    if (/^\d+[.)]\s/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+[.)]\s/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+[.)]\s/, ""));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal list-inside space-y-1 my-2 pl-2">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-slate-700 text-sm leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    // Bullet list item: -, *, •
    if (/^[-*•]\s/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^[-*•]\s/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^[-*•]\s/, ""));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc list-inside space-y-1 my-2 pl-2">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-slate-700 text-sm leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-slate-700 text-sm leading-relaxed">
        {renderInline(trimmed)}
      </p>,
    );
    i++;
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      {elements}
    </div>
  );
}

/** Renders inline markdown: **bold**, *italic*, `code` */
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  if (parts.length === 1) return text;

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-semibold text-slate-800">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return <code key={i} className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
        }
        return part;
      })}
    </>
  );
}
