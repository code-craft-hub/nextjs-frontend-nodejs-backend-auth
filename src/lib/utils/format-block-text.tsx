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
  "the opportunity",
  "responsibilities",
  "key responsibilities",
  "core responsibilities",
  "what you'll do",
  "what you will do",
  "day-to-day",
  "day to day",
  "requirements",
  "other requirements",
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
  "key skills",
  "skills",
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

// A section heading = a curated keyword, optionally wrapped in Title-Case /
// "& / and / of / the" connectors so compound labels are caught too
// ("Education & Experience Requirements", "Remuneration & Benefits").
const HEADING_ALTERNATION = [...SECTION_HEADINGS]
  .sort((a, b) => b.length - a.length)
  .map(escapeRegExp)
  .join("|");
const HEADING_RE = new RegExp(
  `^((?:(?:[A-Z][A-Za-z']+|&|and|of|the|for|to)\\s+){0,4}(?:${HEADING_ALTERNATION})(?:\\s+(?:&|and)\\s+[A-Z][A-Za-z']+)*)(?=$|:|\\s+[A-Z0-9])`,
  "i",
);
// An inline "Short Label: content" lead (e.g. "Curriculum Delivery: Plan …").
const LABEL_RE = /^([A-Z][A-Za-z][^:.!?]{0,40}):\s+(\S.*)$/;
// A bare dangling label with no content ("Note:").
const BARE_LABEL_RE = /^[A-Za-z0-9 &/'-]{1,45}:$/;
const SENTENCE_SEP = String.fromCharCode(1);

/**
 * Split prose into sentences WITHOUT losing any text. Uses a sentinel after
 * sentence-ending punctuation that is followed by whitespace + a capital /
 * digit / opener — so abbreviations ("B.Ed.", "B.Tech.") and emails
 * ("hr@x.org") are never split on, and (critically) no characters are dropped
 * the way a `.match()`-based splitter silently drops period-heavy runs.
 */
function splitSentences(text: string): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  return clean
    .replace(/([.!?])\s+(?=[A-Z0-9("])/g, `$1${SENTENCE_SEP}`)
    .split(SENTENCE_SEP)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Drop a leading "Job Description" label — the page already renders that title. */
function stripLeadingJobDescription(s: string): string {
  return s.replace(/^\s*job\s+description\s*[:\-]?\s*/i, "");
}

/**
 * Rebuild structure in a newline-less wall of scraped text:
 *  - promote embedded section labels to `## Headings` (incl. "&" compounds),
 *  - turn "Label: content" leads into **bold**-led items,
 *  - group remaining prose into paragraphs,
 *  - drop duplicated blocks (scrapes repeat instructions verbatim).
 * Returns a newline-delimited string for `formatPlainText` to style. Text that
 * already has real line breaks is trusted as-is and passed straight through.
 */
function structureBlockText(raw: string): string {
  const text = (raw ?? "").replace(/\r\n?/g, "\n").trim();
  if (!text) return "";

  const newlineCount = (text.match(/\n/g) ?? []).length;
  if (newlineCount >= 4) return text;

  const collapsed = stripLeadingJobDescription(
    text.replace(/\s+/g, " ").trim(),
  );
  const sentences = splitSentences(collapsed);

  const seen = new Set<string>();
  const seenLong: string[] = [];
  const out: string[] = [];
  let paraBuf: string[] = [];

  const flush = () => {
    if (!paraBuf.length) return;
    let current = "";
    for (const s of paraBuf) {
      current = current ? `${current} ${s}` : s;
      if (current.length >= 280) {
        out.push(current);
        current = "";
      }
    }
    if (current) out.push(current);
    paraBuf = [];
  };

  const isDuplicate = (norm: string): boolean => {
    if (seen.has(norm)) return true;
    // Scraped pages repeat whole instruction blocks — also drop a long
    // sentence that contains, or is contained by, one already emitted.
    if (norm.length >= 60) {
      for (const s of seenLong) {
        if (s.includes(norm) || norm.includes(s)) return true;
      }
    }
    return false;
  };

  for (let sentence of sentences) {
    let heading: string | null = null;
    const hm = sentence.match(HEADING_RE);
    if (hm) {
      heading = hm[1].trim().replace(/^(.+?)\s+\1$/i, "$1").trim(); // collapse "X X"
      sentence = sentence.slice(hm[0].length).replace(/^[:\s]+/, "").trim();
      // Strip the heading if the scrape echoed it into the body.
      sentence = sentence
        .replace(new RegExp(`^(?:${escapeRegExp(heading)}[:\\s]+)+`, "i"), "")
        .trim();
    }

    if (heading) {
      const key = `h:${heading.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        flush();
        out.push(`## ${heading}`);
      }
    }

    if (!sentence) continue;
    if (BARE_LABEL_RE.test(sentence)) continue; // dangling label with no body

    const norm = sentence.toLowerCase().replace(/\s+/g, " ").trim();
    if (isDuplicate(norm)) continue;
    seen.add(norm);
    if (norm.length >= 60) seenLong.push(norm);

    const lm = sentence.match(LABEL_RE);
    if (lm) {
      flush();
      out.push(`**${lm[1].trim()}:** ${lm[2].trim()}`);
    } else {
      paraBuf.push(sentence);
    }
  }
  flush();

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
