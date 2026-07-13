import React from "react";
import { cn, decodeHtml } from "@/lib/utils";
import { formatPlainText } from "./format-plain-text";

/**
 * FormattedBlockText
 * ------------------------------------------------------------------
 * Renders an unstructured wall of plain text (e.g. a scraped job
 * description captured with NO line breaks) as readable, scannable
 * markup — headings, paragraphs, and lists.
 *
 * Scraped `descriptionText` often arrives as one 3,000-char run-on with
 * zero "\n". `formatPlainText` alone can't help it (it splits on "\n"),
 * so we first REBUILD structure — promote embedded section headings and
 * break the prose into sentence-grouped paragraphs — then hand the
 * newline-delimited result to `formatPlainText` for the actual styling.
 *
 * Text that already carries real line breaks is trusted as-is and passed
 * straight through, so well-formatted descriptions are never mangled.
 * ------------------------------------------------------------------
 */

/**
 * Section labels commonly embedded in job descriptions. Kept deliberately
 * specific — generic single words ("experience", "skills", "note") are
 * omitted because they appear mid-prose and would be promoted by mistake.
 */
const SECTION_HEADINGS = [
  "about the role",
  "about the company",
  "about us",
  "about the job",
  "role overview",
  "position summary",
  "job summary",
  "job description",
  "the opportunity",
  "responsibilities",
  "key responsibilities",
  "core responsibilities",
  "what you'll do",
  "what you will do",
  "day-to-day",
  "day to day",
  "requirements",
  "qualifications",
  "minimum qualifications",
  "required qualifications",
  "preferred qualifications",
  "who you are",
  "about you",
  "what we're looking for",
  "what we are looking for",
  "nice to have",
  "good to have",
  "bonus points",
  "benefits",
  "perks",
  "perks & benefits",
  "what we offer",
  "compensation",
  "remuneration",
  "how to apply",
  "application process",
  "hiring process",
  "recruitment process",
  "selection process",
  "interview process",
  "method of application",
  "privacy",
  "equal opportunity",
  "disclaimer",
];

function escapeRegExp(s: string): string {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}

/** Turn a numeric char reference into its character, ignoring invalid ones. */
function fromCharRef(code: number): string {
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return "";
  try {
    return String.fromCodePoint(code);
  } catch {
    return "";
  }
}

/**
 * Decode HTML entities and neutralize stray tags left in scraped text.
 * Scraped `descriptionText` frequently keeps entities encoded ("R&amp;D",
 * "5 &lt; 10", "&nbsp;") and occasionally leaks tags ("<br>", "<p>"), which
 * would otherwise render as literal "&amp;" / "<br>". Reuses the shared
 * `decodeHtml` for the common named entities, then covers numeric refs,
 * smart quotes/dashes, and block tags this formatter cares about.
 */
function cleanScrapedText(raw: string): string {
  let s = raw;

  // Block-level tags → line breaks BEFORE stripping, so encoded structure
  // (e.g. "&lt;br&gt;", "<p>…</p>") becomes real paragraph breaks. Decode the
  // angle-bracket entities first so both encoded and literal tags are caught.
  s = s.replace(/&lt;/gi, "<").replace(/&gt;/gi, ">");
  s = s
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\/\s*(?:p|div|li|ul|ol|h[1-6]|tr|section)\s*>/gi, "\n\n");
  // Strip any remaining real tags — but only "<tagname …>" forms (a letter
  // must follow "<"), so arithmetic like "a < b > c" is left intact.
  s = s.replace(/<\/?[a-zA-Z][a-zA-Z0-9]*(?:\s[^<>]*)?\/?>/g, "");

  // Named entities (shared util) + a few common extras + numeric refs.
  s = decodeHtml(s)
    .replace(/&rsquo;|&lsquo;|&apos;|&#0?39;|&#x27;/gi, "'")
    .replace(/&ldquo;|&rdquo;|&#8220;|&#8221;/gi, '"')
    .replace(/&ndash;|&#8211;/gi, "–")
    .replace(/&mdash;|&#8212;/gi, "—")
    .replace(/&hellip;|&#8230;/gi, "…")
    .replace(/&bull;|&#8226;/gi, "•")
    .replace(/&trade;/gi, "™")
    .replace(/&reg;/gi, "®")
    .replace(/&copy;/gi, "©")
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, hex) => fromCharRef(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_m, dec) => fromCharRef(parseInt(dec, 10)));

  return s;
}

/** Capitalize the first letter only — "hiring process" -> "Hiring process". */
function sentenceCase(s: string): string {
  const t = s.trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/**
 * Split a run of prose into sentence-grouped paragraphs so no single block
 * is an unbroken wall. Groups sentences until a target length is reached.
 */
function paragraphize(text: string, targetChars = 280): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];

  const sentences =
    clean.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) ??
    [clean];

  const paragraphs: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    current = current ? `${current} ${sentence}` : sentence;
    if (current.length >= targetChars) {
      paragraphs.push(current);
      current = "";
    }
  }
  if (current) paragraphs.push(current);
  return paragraphs;
}

/**
 * Rebuild structure in a newline-less wall of text: emit a `## Heading`
 * marker before each recognized section label, then paragraph-break the
 * body of every section. Returns a newline-delimited string that
 * `formatPlainText` knows how to style.
 */
function structureBlockText(raw: string): string {
  const text = (raw ?? "").replace(/\r\n?/g, "\n").trim();
  if (!text) return "";

  // If the text already has real structure, trust it — don't re-segment.
  const newlineCount = (text.match(/\n/g) ?? []).length;
  if (newlineCount >= 4) return text;

  // Collapse whatever little whitespace exists into a single run.
  let s = text.replace(/\s+/g, " ").trim();

  // Promote embedded section headings that sit at a sentence boundary.
  // Longest-first so "preferred qualifications" beats "qualifications".
  const alternation = [...SECTION_HEADINGS]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|");

  // Heading = keyword after start/sentence-end, followed by either ":" or a
  // space then an uppercase letter / digit (the section body). The
  // uppercase/digit guard keeps mid-prose words from being promoted.
  const headingRe = new RegExp(
    `(^|[.!?]\\s+)(${alternation})(?::\\s+|\\s+(?=[A-Z0-9]))`,
    "gi",
  );

  s = s.replace(headingRe, (_match, pre: string, keyword: string) => {
    const boundary = pre.replace(/\s+$/, ""); // keep the preceding "."
    return `${boundary}\n\n## ${sentenceCase(keyword)}\n`;
  });

  // Paragraph-break each block (heading bodies and the intro alike).
  const blocks = s.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  const out: string[] = [];
  for (const block of blocks) {
    if (block.startsWith("## ")) {
      const newlineIdx = block.indexOf("\n");
      const heading = newlineIdx === -1 ? block : block.slice(0, newlineIdx);
      let body = newlineIdx === -1 ? "" : block.slice(newlineIdx + 1);
      // Scrapes sometimes repeat the label into the body
      // ("Method of Application Method of Application …") — drop the echo.
      const label = heading.replace(/^##\s*/, "").trim();
      body = body
        .replace(new RegExp(`^${escapeRegExp(label)}[:\\s]+`, "i"), "")
        .trim();
      out.push(heading);
      out.push(...paragraphize(body));
    } else {
      out.push(...paragraphize(block));
    }
  }

  return out.join("\n\n");
}

export function FormattedBlockText({
  text,
  className,
}: {
  text?: string | null;
  className?: string;
}): React.ReactNode {
  // Decode entities / strip tags first, so "&amp;" and "<br>" never reach the
  // rendered output and a whitespace-only decoded value still shows the
  // fallback below.
  const cleaned = cleanScrapedText(text ?? "");
  if (!cleaned.trim()) {
    return (
      <p className="text-sm italic text-slate-400">
        No description provided for this role.
      </p>
    );
  }
  return formatPlainText(structureBlockText(cleaned), cn("space-y-3", className));
}

export default FormattedBlockText;
