"use client";

import parse, {
  domToReact,
  Element,
  DOMNode,
  HTMLReactParserOptions,
} from "html-react-parser";

/**
 * JobDescriptionRenderer
 * ------------------------------------------------------------------
 * Parses messy scraped/CMS job-description HTML (the kind that mixes
 * <div class="job-details">, raw <ul>/<li>, <h2>, stray duplicate tags,
 * and inconsistent <strong>/<b> usage) into clean, consistently styled
 * React markup.
 *
 * Handles, specifically:
 *  - <p><strong>SECTION TITLE:</strong></p>  -> styled section heading
 *  - <h2 id="...">...</h2>                  -> styled section heading
 *  - <ul><li>...</li></ul>                  -> styled bullet list
 *  - <strong>/<b> inline                    -> consistent bold styling
 *  - <a href="...">                          -> styled link, opens new tab
 *  - duplicate / orphaned content            -> de-duplicated, dropped
 *
 * Usage:
 *   <JobDescriptionRenderer html={job?.descriptionHtml ?? ""} />
 * ------------------------------------------------------------------
 */

interface JobDescriptionRendererProps {
  html: string;
  className?: string;
}

/** Tracks text we've already rendered once, so exact duplicate stray
 *  siblings (a known artifact in this CMS export) don't render twice. */
function createDedupeTracker() {
  const seen = new Set<string>();
  return (key: string) => {
    const normalized = key.trim().replace(/\s+/g, " ");
    if (!normalized) return false;
    if (seen.has(normalized)) return true;
    seen.add(normalized);
    return false;
  };
}

function getText(node: DOMNode | Element["children"][number]): string {
  if (!node) return "";
  if (node.type === "text") return (node as any).data ?? "";
  if ((node as Element).children) {
    return (node as Element).children.map(getText).join("");
  }
  return "";
}

export default function JobDescriptionRenderer({
  html,
  className,
}: JobDescriptionRendererProps) {
  if (!html || !html.trim()) {
    return (
      <p className="text-sm italic text-slate-400">
        No description provided for this role.
      </p>
    );
  }

  const isDuplicate = createDedupeTracker();

  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (!(domNode instanceof Element)) return undefined;

      const { name, children, attribs } = domNode;

      switch (name) {
        // ---------------------------------------------------------
        // Section headings: <h2>, <h3> (including the "Method of
        // Application" h2 with an inline style attr in the source)
        // ---------------------------------------------------------
        case "h2":
        case "h3": {
          const text = getText(domNode);
          if (isDuplicate(`heading:${text}`)) return <></>;

          const Tag = name as "h2" | "h3";
          const sizeClass = name === "h2" ? "text-xl" : "text-lg";

          return (
            <Tag
              id={attribs.id}
              className={`${sizeClass} font-semibold text-slate-900 mt-8 mb-3 pb-2 border-b border-slate-200 scroll-mt-24`}
            >
              {domToReact(children as DOMNode[], options)}
            </Tag>
          );
        }

        // ---------------------------------------------------------
        // <p><strong>LABEL:</strong></p> acts as a de-facto section
        // heading in this CMS's export. Detect that pattern and
        // promote it visually; otherwise render as a normal paragraph.
        // ---------------------------------------------------------
        case "p": {
          const text = getText(domNode).trim();
          if (!text) return <></>;

          if (isDuplicate(`p:${text}`)) return <></>;

          const onlyChild =
            children.length === 1 && children[0] instanceof Element
              ? (children[0] as Element)
              : null;
          const isWholeLineBold =
            onlyChild && (onlyChild.name === "strong" || onlyChild.name === "b");

          // A short, fully-bold paragraph (e.g. "POSITION SUMMARY:",
          // "Requirements", "Key Skills") -> treat as a sub-heading.
          if (isWholeLineBold && text.length < 60) {
            return (
              <h4 className="text-base font-semibold uppercase tracking-wide text-slate-700 mt-6 mb-2">
                {domToReact(children as DOMNode[], options)}
              </h4>
            );
          }

          return (
            <p className="text-sm leading-relaxed text-slate-700 mb-3">
              {domToReact(children as DOMNode[], options)}
            </p>
          );
        }

        // ---------------------------------------------------------
        // Lists
        // ---------------------------------------------------------
        case "ul":
          return (
            <ul className="list-disc pl-5 space-y-1.5 text-sm leading-relaxed text-slate-700 mb-4 marker:text-slate-400">
              {domToReact(children as DOMNode[], options)}
            </ul>
          );

        case "ol":
          return (
            <ol className="list-decimal pl-5 space-y-1.5 text-sm leading-relaxed text-slate-700 mb-4 marker:text-slate-400">
              {domToReact(children as DOMNode[], options)}
            </ol>
          );

        case "li": {
          const text = getText(domNode).trim();
          if (!text) return <></>;
          return (
            <li className="pl-1">{domToReact(children as DOMNode[], options)}</li>
          );
        }

        // ---------------------------------------------------------
        // Inline emphasis — normalize <b> and <strong> to one style.
        // A bare <b>/<strong> whose exact text was already rendered
        // inside a heading or paragraph (a known artifact in this
        // source HTML, e.g. an h2 followed by a duplicate bare <b>)
        // is dropped rather than rendered a second time.
        // ---------------------------------------------------------
        case "strong":
        case "b": {
          const text = getText(domNode).trim();
          const key = `bold:${text}`;
          const parent = domNode.parent as Element | null;
          const isInsideHeadingOrParagraph =
            parent && (parent.name === "h2" || parent.name === "h3" || parent.name === "p");

          if (isInsideHeadingOrParagraph) {
            // This is the "original" occurrence — register it so any
            // later bare duplicate of the same text gets dropped, but
            // never drop this one itself.
            isDuplicate(key);
          } else if (isDuplicate(key)) {
            // Bare/orphaned <b> or <strong> repeating text already
            // shown in a heading/paragraph above — skip it.
            return <></>;
          }

          return (
            <strong className="font-semibold text-slate-900">
              {domToReact(children as DOMNode[], options)}
            </strong>
          );
        }

        // ---------------------------------------------------------
        // Links — normalize target/rel, style consistently, and drop
        // exact-duplicate stray link siblings
        // ---------------------------------------------------------
        case "a": {
          const text = getText(domNode).trim();
          const href = attribs.href ?? "#";

          if (isDuplicate(`link:${href}:${text}`)) return <></>;

          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="font-medium text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors"
            >
              {domToReact(children as DOMNode[], options)}
            </a>
          );
        }

        // ---------------------------------------------------------
        // Top-level wrapper divs — strip the class, just pass children
        // through our pipeline so nested elements still get styled
        // ---------------------------------------------------------
        case "div": {
          return (
            <div className="job-description-block">
              {domToReact(children as DOMNode[], options)}
            </div>
          );
        }

        default:
          return undefined;
      }
    },
  };

  return (
    <div className={`job-description prose-slate max-w-none ${className ?? ""}`}>
      {parse(html, options)}
    </div>
  );
}