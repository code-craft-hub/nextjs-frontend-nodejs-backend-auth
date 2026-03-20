import { describe, it, expect } from "vitest";
import { cn } from "../cn";

describe("cn", () => {
  it("merges basic class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes with false", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("handles undefined and null values", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });

  it("resolves tailwind conflicting classes (last wins)", () => {
    expect(cn("p-4", "p-6")).toBe("p-6");
  });

  it("resolves conflicting text color classes", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("returns empty string for no arguments", () => {
    expect(cn()).toBe("");
  });

  it("handles array input", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  it("handles object input with boolean values", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });

  it("handles mixed input types", () => {
    expect(cn("base", { active: true, disabled: false }, ["extra"])).toBe(
      "base active extra",
    );
  });

  it("deduplicates merged tailwind padding utilities", () => {
    expect(cn("px-4", "px-2")).toBe("px-2");
  });

  it("preserves non-conflicting tailwind classes", () => {
    const result = cn("flex", "items-center", "justify-between");
    expect(result).toBe("flex items-center justify-between");
  });
});
