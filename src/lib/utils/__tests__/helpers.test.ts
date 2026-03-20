import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getDaysRemaining,
  daysFromToday,
  normalizeToDate,
  isValidDate,
  isSubscriptionActive,
  getDaysUntilProPlanExpiry,
  generateIdempotencyKey,
  expireNextThreeDays,
  postedDate,
  formatAppliedDate,
  createApiError,
  validateOrCreateDate,
  shuffleArray,
  humanDate,
  monthYear,
  formatFirestoreDate,
  formatDate,
  formatCurrencyUSA,
  formatCurrencyNG,
  coalesceString,
  normalize,
  normalizeToString,
  randomNumber,
} from "../helpers";

const FIXED_NOW = new Date("2026-03-20T12:00:00.000Z");

// ─── getDaysRemaining ───────────────────────────────────────────────────────

describe("getDaysRemaining", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 0 for null", () => {
    expect(getDaysRemaining(null)).toBe(0);
  });

  it("returns 0 for undefined", () => {
    expect(getDaysRemaining(undefined)).toBe(0);
  });

  it("returns 0 for empty string", () => {
    expect(getDaysRemaining("")).toBe(0);
  });

  it("returns correct days for a future ISO string (5 days ahead)", () => {
    expect(getDaysRemaining("2026-03-25T12:00:00.000Z")).toBe(5);
  });

  it("returns 0 for a past ISO date", () => {
    expect(getDaysRemaining("2026-03-01T12:00:00.000Z")).toBe(0);
  });

  it("returns 0 for today (same time)", () => {
    expect(getDaysRemaining("2026-03-20T12:00:00.000Z")).toBe(0);
  });

  it("handles a Firestore Timestamp with toDate()", () => {
    const futureDate = new Date("2026-03-25T12:00:00.000Z");
    const ts = { toDate: () => futureDate };
    expect(getDaysRemaining(ts)).toBe(5);
  });

  it("handles a Firestore raw Timestamp ({ seconds, nanoseconds })", () => {
    const futureSeconds = new Date("2026-03-25T12:00:00.000Z").getTime() / 1000;
    expect(getDaysRemaining({ seconds: futureSeconds, nanoseconds: 0 })).toBe(5);
  });

  it("handles epoch timestamp in milliseconds (> 1e12)", () => {
    const ms = new Date("2026-03-25T12:00:00.000Z").getTime();
    expect(getDaysRemaining(ms)).toBe(5);
  });

  it("handles epoch timestamp in seconds (< 1e12)", () => {
    const seconds = new Date("2026-03-25T12:00:00.000Z").getTime() / 1000;
    expect(getDaysRemaining(seconds)).toBe(5);
  });

  it("handles a native Date object", () => {
    expect(getDaysRemaining(new Date("2026-03-25T12:00:00.000Z"))).toBe(5);
  });

  it("returns 0 for invalid string", () => {
    expect(getDaysRemaining("invalid-date")).toBe(0);
  });

  it("returns 0 for empty object", () => {
    expect(getDaysRemaining({})).toBe(0);
  });
});

// ─── normalizeToDate ────────────────────────────────────────────────────────

describe("normalizeToDate", () => {
  it("returns null for null", () => {
    expect(normalizeToDate(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(normalizeToDate(undefined)).toBeNull();
  });

  it("converts a valid ISO string to Date", () => {
    const result = normalizeToDate("2026-03-20T12:00:00.000Z");
    expect(result).toBeInstanceOf(Date);
    expect(result!.toISOString()).toBe("2026-03-20T12:00:00.000Z");
  });

  it("converts epoch milliseconds to Date", () => {
    const ts = 1742472000000;
    const result = normalizeToDate(ts);
    expect(result).toBeInstanceOf(Date);
    expect(result!.getTime()).toBe(ts);
  });

  it("returns the same Date object when given a valid Date", () => {
    const d = new Date("2026-03-20");
    expect(normalizeToDate(d)).toBe(d);
  });

  it("converts Firestore Timestamp-like object ({ _seconds, _nanoseconds })", () => {
    const ts = { _seconds: 1742472000, _nanoseconds: 0 };
    const result = normalizeToDate(ts);
    expect(result).toBeInstanceOf(Date);
    expect(result!.getTime()).toBe(1742472000 * 1000);
  });

  it("returns null for an invalid date string", () => {
    expect(normalizeToDate("not-a-date")).toBeNull();
  });

  it("returns null for an invalid Date object", () => {
    expect(normalizeToDate(new Date("invalid"))).toBeNull();
  });
});

// ─── isValidDate ────────────────────────────────────────────────────────────

describe("isValidDate", () => {
  it("returns true for a valid ISO date string", () => {
    expect(isValidDate("2026-03-20")).toBe(true);
  });

  it("returns true for a valid datetime string", () => {
    expect(isValidDate("2026-03-20T12:00:00Z")).toBe(true);
  });

  it("returns false for an invalid string", () => {
    expect(isValidDate("not-a-date")).toBe(false);
  });

  it("returns false for a random word", () => {
    expect(isValidDate("hello world")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isValidDate(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isValidDate(undefined)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isValidDate("")).toBe(false);
  });

  it("returns false for a number", () => {
    expect(isValidDate(12345 as unknown as string)).toBe(false);
  });
});

// ─── isSubscriptionActive ───────────────────────────────────────────────────

describe("isSubscriptionActive", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns true for a future date", () => {
    expect(isSubscriptionActive("2026-12-31T00:00:00Z")).toBe(true);
  });

  it("returns false for a past date", () => {
    expect(isSubscriptionActive("2025-01-01T00:00:00Z")).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(isSubscriptionActive("")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isSubscriptionActive(null)).toBe(false);
  });

  it("returns false for an invalid string", () => {
    expect(isSubscriptionActive("invalid")).toBe(false);
  });
});

// ─── getDaysUntilProPlanExpiry ──────────────────────────────────────────────

describe("getDaysUntilProPlanExpiry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-20T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 0 for null", () => {
    expect(getDaysUntilProPlanExpiry(null)).toBe(0);
  });

  it("returns 0 for undefined", () => {
    expect(getDaysUntilProPlanExpiry(undefined)).toBe(0);
  });

  it("returns 7 days for a date 7 days ahead (string)", () => {
    expect(getDaysUntilProPlanExpiry("2026-03-27T00:00:00.000Z")).toBe(7);
  });

  it("returns 7 days for a date 7 days ahead (Date object)", () => {
    expect(
      getDaysUntilProPlanExpiry(new Date("2026-03-27T00:00:00.000Z")),
    ).toBe(7);
  });

  it("throws for an invalid date format", () => {
    expect(() => getDaysUntilProPlanExpiry("not-a-date")).toThrow(
      "Invalid expiry date format.",
    );
  });
});

// ─── generateIdempotencyKey ─────────────────────────────────────────────────

describe("generateIdempotencyKey", () => {
  it("returns a string", () => {
    expect(typeof generateIdempotencyKey()).toBe("string");
  });

  it("generates unique keys on successive calls", () => {
    const keys = new Set(Array.from({ length: 20 }, generateIdempotencyKey));
    expect(keys.size).toBe(20);
  });

  it("matches format <timestamp>_<alphanumeric>", () => {
    expect(generateIdempotencyKey()).toMatch(/^\d+_[a-z0-9]+$/);
  });
});

// ─── expireNextThreeDays ────────────────────────────────────────────────────

describe("expireNextThreeDays", () => {
  it("returns a Date instance", () => {
    expect(expireNextThreeDays()).toBeInstanceOf(Date);
  });

  it("is 3 calendar days ahead of today", () => {
    const now = new Date();
    const result = expireNextThreeDays();
    const expectedDay = new Date(now);
    expectedDay.setDate(now.getDate() + 3);
    expect(result.getDate()).toBe(expectedDay.getDate());
    expect(result.getMonth()).toBe(expectedDay.getMonth());
    expect(result.getFullYear()).toBe(expectedDay.getFullYear());
  });
});

// ─── postedDate ─────────────────────────────────────────────────────────────

describe("postedDate", () => {
  it("formats a valid ISO date string", () => {
    const result = postedDate("2026-03-20T00:00:00Z");
    expect(result).toMatch(/\b2026\b/);
    expect(result.toLowerCase()).toMatch(/mar/);
  });

  it("does not throw for undefined input", () => {
    expect(() => postedDate(undefined)).not.toThrow();
  });
});

// ─── formatAppliedDate ──────────────────────────────────────────────────────

describe("formatAppliedDate", () => {
  it("formats a valid date string", () => {
    const result = formatAppliedDate("2026-03-20T00:00:00Z");
    expect(typeof result).toBe("string");
    expect(result).toMatch(/\b2026\b/);
  });

  it("falls back to today's date for invalid input", () => {
    const result = formatAppliedDate("invalid-date");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("does not throw for undefined input", () => {
    expect(() => formatAppliedDate(undefined)).not.toThrow();
  });
});

// ─── daysFromToday ──────────────────────────────────────────────────────────

describe("daysFromToday", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null for null input", () => {
    expect(daysFromToday(null)).toBeNull();
  });

  it("returns null for an invalid date string", () => {
    expect(daysFromToday("invalid")).toBeNull();
  });

  it("returns a positive number for a future date", () => {
    const result = daysFromToday("2026-03-25T12:00:00.000Z");
    expect(result).toBeGreaterThan(0);
  });

  it("returns a negative number for a past date", () => {
    const result = daysFromToday("2026-03-15T12:00:00.000Z");
    expect(result).toBeLessThan(0);
  });

  it("returns approximately 0 for today", () => {
    const result = daysFromToday("2026-03-20T12:00:00.000Z");
    expect(result).toBe(0);
  });
});

// ─── createApiError ──────────────────────────────────────────────────────────

describe("createApiError", () => {
  it("creates an Error with the given message", () => {
    const err = createApiError("Something went wrong");
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe("Something went wrong");
  });

  it("attaches an optional status code", () => {
    const err = createApiError("Not Found", 404);
    expect(err.status).toBe(404);
  });

  it("status is undefined when not provided", () => {
    const err = createApiError("Oops");
    expect(err.status).toBeUndefined();
  });
});

// ─── validateOrCreateDate ────────────────────────────────────────────────────

describe("validateOrCreateDate", () => {
  it("returns the parsed Date for a valid ISO string", () => {
    const result = validateOrCreateDate("2026-03-20T12:00:00.000Z");
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe("2026-03-20T12:00:00.000Z");
  });

  it("returns the same Date when given a valid Date object", () => {
    const d = new Date("2026-06-15");
    expect(validateOrCreateDate(d)).toEqual(d);
  });

  it("returns today's date for an invalid string", () => {
    const before = Date.now();
    const result = validateOrCreateDate("not-a-date");
    const after = Date.now();
    expect(result.getTime()).toBeGreaterThanOrEqual(before);
    expect(result.getTime()).toBeLessThanOrEqual(after);
  });
});

// ─── shuffleArray ────────────────────────────────────────────────────────────

describe("shuffleArray", () => {
  it("returns an array of the same length", () => {
    const input = [1, 2, 3, 4, 5];
    expect(shuffleArray(input)).toHaveLength(5);
  });

  it("contains all original elements", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(result.sort()).toEqual([...input].sort());
  });

  it("does not mutate the original array", () => {
    const input = [1, 2, 3];
    const copy = [...input];
    shuffleArray(input);
    expect(input).toEqual(copy);
  });

  it("returns a new array reference", () => {
    const input = [1, 2, 3];
    expect(shuffleArray(input)).not.toBe(input);
  });

  it("handles empty array", () => {
    expect(shuffleArray([])).toEqual([]);
  });

  it("handles single-element array", () => {
    expect(shuffleArray(["only"])).toEqual(["only"]);
  });
});

// ─── humanDate ───────────────────────────────────────────────────────────────

describe("humanDate", () => {
  it("returns a string for a valid ISO date", () => {
    const result = humanDate("2026-01-01T00:00:00Z");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns a relative string (e.g. 'ago' or 'in …')", () => {
    const result = humanDate("2026-01-01T00:00:00Z");
    expect(result).toMatch(/ago|in /i);
  });

  it("returns a string for null/undefined input", () => {
    expect(typeof humanDate(null)).toBe("string");
    expect(typeof humanDate(undefined)).toBe("string");
  });

  it("handles a Date object", () => {
    const result = humanDate(new Date("2025-01-01"));
    expect(typeof result).toBe("string");
  });
});

// ─── monthYear ───────────────────────────────────────────────────────────────

describe("monthYear", () => {
  it("returns a 'Month Year' formatted string for a valid date string", () => {
    const result = monthYear("2026-03-20T00:00:00Z");
    expect(result).toMatch(/\b2026\b/);
    expect(result.toLowerCase()).toMatch(/mar/);
  });

  it("returns a 'Month Year' formatted string for a Date object", () => {
    const result = monthYear(new Date("2026-06-15T00:00:00Z"));
    expect(result).toMatch(/\b2026\b/);
    expect(result.toLowerCase()).toMatch(/jun/);
  });
});

// ─── formatFirestoreDate ─────────────────────────────────────────────────────

describe("formatFirestoreDate", () => {
  it("formats a Firestore Timestamp-like object", () => {
    const ts = { _seconds: 1742472000, _nanoseconds: 0 };
    const result = formatFirestoreDate(ts);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("formats a valid Date object", () => {
    const result = formatFirestoreDate(new Date("2026-03-20T00:00:00Z"));
    expect(result).toMatch(/\b2026\b/);
  });

  it("formats a valid ISO date string", () => {
    const result = formatFirestoreDate("2026-03-20");
    expect(result).toMatch(/\b2026\b/);
  });
});

// ─── formatDate ──────────────────────────────────────────────────────────────

describe("formatDate", () => {
  it("formats a Date object into 'Mon DD, YYYY' style", () => {
    const result = formatDate(new Date("2026-03-20T00:00:00Z"));
    expect(result).toMatch(/\b2026\b/);
  });

  it("formats an ISO string", () => {
    const result = formatDate("2026-06-15");
    expect(result).toMatch(/\b2026\b/);
  });

  it("formats an epoch timestamp", () => {
    const result = formatDate(1742472000000);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});

// ─── formatCurrencyUSA ───────────────────────────────────────────────────────

describe("formatCurrencyUSA", () => {
  it("formats an integer amount as USD", () => {
    expect(formatCurrencyUSA(1000)).toBe("$1,000.00");
  });

  it("formats a decimal amount", () => {
    expect(formatCurrencyUSA(9.99)).toBe("$9.99");
  });

  it("formats zero", () => {
    expect(formatCurrencyUSA(0)).toBe("$0.00");
  });
});

// ─── formatCurrencyNG ────────────────────────────────────────────────────────

describe("formatCurrencyNG", () => {
  it("formats an amount as NGN", () => {
    const result = formatCurrencyNG(1000);
    expect(result).toContain("1,000");
    // Currency symbol may differ by locale, just check the number is present
  });

  it("formats zero", () => {
    const result = formatCurrencyNG(0);
    expect(result).toContain("0");
  });
});

// ─── coalesceString ──────────────────────────────────────────────────────────

describe("coalesceString", () => {
  it("returns the first non-empty string", () => {
    expect(coalesceString(null, undefined, "", "first", "second")).toBe("first");
  });

  it("returns empty string when all values are empty/null/undefined", () => {
    expect(coalesceString(null, undefined, "")).toBe("");
  });

  it("ignores whitespace-only strings", () => {
    expect(coalesceString("   ", "hello")).toBe("hello");
  });

  it("returns the only value when one is given", () => {
    expect(coalesceString("only")).toBe("only");
  });
});

// ─── normalize ───────────────────────────────────────────────────────────────

describe("normalize", () => {
  it("returns undefined for undefined input", () => {
    expect(normalize(undefined)).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(normalize("")).toBeUndefined();
  });

  it("returns undefined for strings containing 'undefined'", () => {
    expect(normalize("undefined")).toBeUndefined();
  });

  it("returns the trimmed string for normal input", () => {
    expect(normalize("  hello  ")).toBe("hello");
  });

  it("returns undefined for whitespace-only string", () => {
    expect(normalize("   ")).toBeUndefined();
  });
});

// ─── normalizeToString ───────────────────────────────────────────────────────

describe("normalizeToString", () => {
  it("returns empty string for null", () => {
    expect(normalizeToString(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(normalizeToString(undefined)).toBe("");
  });

  it("returns a plain string as-is", () => {
    expect(normalizeToString("hello world")).toBe("hello world");
  });

  it("parses a JSON string and returns the content field", () => {
    const json = JSON.stringify({ content: "parsed content" });
    expect(normalizeToString(json)).toBe("parsed content");
  });

  it("extracts from nested summary field", () => {
    expect(normalizeToString({ summary: "my summary" })).toBe("my summary");
  });

  it("returns first element for an array input", () => {
    expect(normalizeToString(["first", "second"])).toBe("first");
  });

  it("returns empty string for an empty array", () => {
    expect(normalizeToString([])).toBe("");
  });

  it("returns empty string for an empty object", () => {
    expect(normalizeToString({})).toBe("");
  });
});

// ─── randomNumber ────────────────────────────────────────────────────────────

describe("randomNumber", () => {
  it("returns a number within [50, 100] by default", () => {
    const result = randomNumber();
    expect(result).toBeGreaterThanOrEqual(50);
    expect(result).toBeLessThanOrEqual(100);
  });

  it("returns a number within [50, custom_max]", () => {
    const result = randomNumber(200);
    expect(result).toBeGreaterThanOrEqual(50);
    expect(result).toBeLessThanOrEqual(200);
  });

  it("returns an integer", () => {
    expect(Number.isInteger(randomNumber())).toBe(true);
  });
});
