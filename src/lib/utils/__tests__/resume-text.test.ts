import { describe, it, expect } from "vitest";
import {
  dateRangeText,
  displayText,
  firstText,
  joinParts,
} from "../helpers";

/**
 * Client mirror of server/src/utils/resume-text.test.ts. The contract: "" means
 * "no data", and the component skips the element rather than rendering a
 * placeholder like "Position" or "Company".
 */
describe("displayText", () => {
  it("returns trimmed string content", () => {
    expect(displayText("  Senior Engineer  ")).toBe("Senior Engineer");
  });

  it("returns '' for absent values", () => {
    expect(displayText(null)).toBe("");
    expect(displayText(undefined)).toBe("");
    expect(displayText("   ")).toBe("");
  });

  it("returns '' for values with no sensible text form", () => {
    expect(displayText({})).toBe("");
    expect(displayText(NaN)).toBe("");
    expect(displayText(true)).toBe("");
  });
});

describe("firstText", () => {
  it("returns the first value with content", () => {
    expect(firstText(null, "", "Google")).toBe("Google");
  });

  it("returns '' when nothing has content", () => {
    expect(firstText(null, undefined, "")).toBe("");
  });
});

describe("joinParts", () => {
  it("joins present parts", () => {
    expect(joinParts(["Engineer", "Google"])).toBe("Engineer - Google");
  });

  it("drops missing parts instead of leaving a dangling separator", () => {
    expect(joinParts(["Engineer", null])).toBe("Engineer");
    expect(joinParts([null, "Google"])).toBe("Google");
    expect(joinParts([null, null])).toBe("");
  });

  it("honours a custom separator", () => {
    expect(joinParts(["Lagos", "Nigeria"], ", ")).toBe("Lagos, Nigeria");
  });
});

/**
 * Replaces `{s ?? "Present"} - {e ?? "Present"}`, which rendered
 * "Present - Present" when both dates were missing and claimed a role was
 * current whenever only the START date was missing.
 */
describe("dateRangeText", () => {
  it("renders a closed range", () => {
    expect(dateRangeText("Jan 2020", "Mar 2022")).toBe("Jan 2020 - Mar 2022");
  });

  // A start with no end genuinely means ongoing — inferred from data, not a
  // placeholder for missing data.
  it("infers Present from a start with no end", () => {
    expect(dateRangeText("Jan 2020", null)).toBe("Jan 2020 - Present");
  });

  // The bug: a missing START must not imply the role is current.
  it("renders only the end date when the start is missing", () => {
    expect(dateRangeText(null, "Mar 2022")).toBe("Mar 2022");
  });

  it("never renders 'Present - Present'", () => {
    expect(dateRangeText(null, null)).toBe("");
    expect(dateRangeText(undefined, undefined)).toBe("");
    expect(dateRangeText("", "")).toBe("");
  });
});
