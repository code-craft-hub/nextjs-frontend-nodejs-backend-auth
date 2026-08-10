import { describe, it, expect } from "vitest";
import { certLabel, renderableCertifications } from "../helpers";

/**
 * Client-side mirror of server/src/utils/cert-label.test.ts.
 *
 * Every résumé view (ViewResume, EditableResume, the AI-apply preview and the
 * form preview) used to read `cert.title` alone — one of them substituting the
 * literal word "Certification" when it was null. These helpers are the single
 * definition of "what label does this row have", and "" is the contract that
 * tells a component to SKIP the entry rather than render a placeholder.
 */
describe("certLabel", () => {
  it("returns title when present", () => {
    expect(certLabel({ title: "AWS Solutions Architect" })).toBe(
      "AWS Solutions Architect",
    );
  });

  // The 7 rows behind the 2026-08-09 incident: label in the legacy column.
  it("falls back to the legacy `name` column when title is null", () => {
    expect(certLabel({ title: null, name: "HubSpot SEO Certification" })).toBe(
      "HubSpot SEO Certification",
    );
  });

  it("prefers title when both are set", () => {
    expect(certLabel({ title: "Canonical", name: "Legacy" })).toBe("Canonical");
  });

  it("treats a whitespace-only title as absent", () => {
    expect(certLabel({ title: "   ", name: "Google Ads" })).toBe("Google Ads");
  });

  it("trims the returned label", () => {
    expect(certLabel({ title: "  Scrum Master  " })).toBe("Scrum Master");
  });

  it("returns an empty string when neither column is usable", () => {
    expect(certLabel({ title: null, name: null })).toBe("");
    expect(certLabel({})).toBe("");
  });

  it("never returns placeholder text", () => {
    expect(certLabel({ title: null, name: null })).not.toBe("Certification");
  });

  it("tolerates null, undefined and non-object input", () => {
    expect(certLabel(null)).toBe("");
    expect(certLabel(undefined)).toBe("");
    expect(certLabel("a string")).toBe("");
  });

  it("tolerates non-string column values", () => {
    // A finite number renders, consistent with every other résumé field. Only
    // values with no sensible text form are treated as absent.
    expect(certLabel({ title: 42, name: "Fallback" })).toBe("42");
    expect(certLabel({ title: {}, name: [] })).toBe("");
    expect(certLabel({ title: NaN, name: "Fallback" })).toBe("Fallback");
  });
});

describe("renderableCertifications", () => {
  it("keeps entries labelled by either column, in order", () => {
    const out = renderableCertifications([
      { title: "First" },
      { title: null, name: "Second" },
      { title: "Third" },
    ]);

    expect(out.map(certLabel)).toEqual(["First", "Second", "Third"]);
  });

  it("filters out unlabelled entries", () => {
    const out = renderableCertifications([
      { title: null, name: null },
      { title: "Real" },
    ]);

    expect(out).toHaveLength(1);
    expect(certLabel(out[0])).toBe("Real");
  });

  // hasCertifications is derived from this, so an all-unlabelled list hides the
  // whole Certifications section instead of showing a heading over blank rows.
  it("returns empty when nothing is labelled, hiding the section", () => {
    expect(renderableCertifications([{ title: null }, { name: "" }])).toEqual(
      [],
    );
  });

  it("returns empty for non-array input", () => {
    expect(renderableCertifications(undefined)).toEqual([]);
    expect(renderableCertifications(null)).toEqual([]);
  });
});
