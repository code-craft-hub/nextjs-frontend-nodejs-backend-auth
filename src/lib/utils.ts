import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEmail(email: string) {
  const destinationEmail = decodeURIComponent(decodeURIComponent(email));
  return destinationEmail;
}


export function decodeHtml(html: string): string {
  return html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");
}

/**
 * Converts a raw (possibly plain-text) job description into readable HTML.
 * If the text already contains block-level HTML it is returned unchanged.
 * Otherwise it detects "Section header:" patterns and comma-separated action
 * lists and emits <h3> + <ul>/<p> blocks.
 */
export function formatJobDescription(raw: string): string {
  if (/<(p|ul|ol|h[1-6]|li|div)\b/i.test(raw)) return raw;

  // Split on "Capitalized phrase:" — these become section headers.
  const parts = raw.split(/\b([A-Z][A-Za-z &/(),''’-]{2,60}:)/);

  const renderBody = (text: string): string => {
    const trimmed = text.trim();
    if (!trimmed) return "";
    // Heuristic: if splitting on ", " (comma + space before lowercase) yields
    // ≥4 short items, treat as a bullet list.
    const items = trimmed
      .split(/,\s+(?=[a-z])/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (items.length >= 4 && items.every((s) => s.length < 140)) {
      return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
    }
    // Split into individual sentences then group every 2 into a <p> so the
    // reader gets a natural breathing point instead of one solid wall of text.
    const sentences = trimmed
      .split(/(?<=[.!?])\s+(?=[A-Z"'])/)
      .map((s) => s.trim())
      .filter(Boolean);
    const chunks: string[] = [];
    for (let i = 0; i < sentences.length; i += 2) {
      chunks.push(sentences.slice(i, i + 2).join(" "));
    }
    return (chunks.length ? chunks : [trimmed])
      .map((chunk) => `<p>${chunk}</p>`)
      .join("");
  };

  let html = "";
  if (parts[0].trim()) html += renderBody(parts[0]);
  for (let i = 1; i < parts.length - 1; i += 2) {
    html += `<h3>${parts[i]}</h3>`;
    html += renderBody(parts[i + 1] ?? "");
  }
  return html;
}