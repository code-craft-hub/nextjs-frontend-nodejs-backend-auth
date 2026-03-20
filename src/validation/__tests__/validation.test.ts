import { describe, it, expect } from "vitest";
import {
  SignupValidation,
  SigninValidation,
  onBoardingValidation,
  userDetails,
  profileDetails,
  isValidEmail,
} from "../index";

// ─── SignupValidation ───────────────────────────────────────────────────────

describe("SignupValidation", () => {
  const valid = {
    fullName: "John Doe",
    phoneNumber: "+1234567890",
    email: "john@example.com",
    password: "password123",
    confirmPassword: "password123",
  };

  it("passes with all required fields", () => {
    expect(SignupValidation.safeParse(valid).success).toBe(true);
  });

  it("fails when fullName is less than 3 chars", () => {
    const result = SignupValidation.safeParse({ ...valid, fullName: "Jo" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("3 characters");
    }
  });

  it("fails with an invalid email address", () => {
    const result = SignupValidation.safeParse({
      ...valid,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("fails when password is shorter than 8 characters", () => {
    const result = SignupValidation.safeParse({
      ...valid,
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("8 characters");
    }
  });

  it("fails when passwords do not match", () => {
    const result = SignupValidation.safeParse({
      ...valid,
      confirmPassword: "differentPassword",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("do not match");
    }
  });

  it("accepts optional fields being undefined", () => {
    const result = SignupValidation.safeParse({
      ...valid,
      firstName: undefined,
      lastName: undefined,
      photoURL: undefined,
      provider: undefined,
    });
    expect(result.success).toBe(true);
  });

  it("fails when phoneNumber is missing", () => {
    const { phoneNumber: _omit, ...rest } = valid;
    const result = SignupValidation.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

// ─── SigninValidation ───────────────────────────────────────────────────────

describe("SigninValidation", () => {
  it("passes with a valid email and any password", () => {
    const result = SigninValidation.safeParse({
      email: "user@example.com",
      password: "anypassword",
    });
    expect(result.success).toBe(true);
  });

  it("fails with an invalid email", () => {
    const result = SigninValidation.safeParse({
      email: "invalid-email",
      password: "password",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Invalid email");
    }
  });

  it("fails when email is missing", () => {
    const result = SigninValidation.safeParse({ password: "password" });
    expect(result.success).toBe(false);
  });

  it("fails when password is missing", () => {
    const result = SigninValidation.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(false);
  });
});

// ─── userDetails ────────────────────────────────────────────────────────────

describe("userDetails", () => {
  const valid = {
    firstName: "John",
    lastName: "Doe",
    state: "California",
  };

  it("passes with required fields only", () => {
    expect(userDetails.safeParse(valid).success).toBe(true);
  });

  it("fails when firstName is less than 3 chars", () => {
    const result = userDetails.safeParse({ ...valid, firstName: "Jo" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("3 characters");
    }
  });

  it("fails when lastName is less than 3 chars", () => {
    const result = userDetails.safeParse({ ...valid, lastName: "D" });
    expect(result.success).toBe(false);
  });

  it("fails when state is an empty string", () => {
    const result = userDetails.safeParse({ ...valid, state: "" });
    expect(result.success).toBe(false);
  });

  it("passes with all optional fields populated", () => {
    const result = userDetails.safeParse({
      ...valid,
      cvJobTitle: "Software Engineer",
      phoneNumber: "+123456",
      address: "123 Main St",
      website: "https://example.com",
      country: "US",
      portfolio: "https://portfolio.example.com",
      email: "john@example.com",
    });
    expect(result.success).toBe(true);
  });
});

// ─── profileDetails ─────────────────────────────────────────────────────────

describe("profileDetails", () => {
  it("passes with a profile string of 3+ chars", () => {
    expect(
      profileDetails.safeParse({
        profile: "Senior software engineer with 10 years of experience",
      }).success,
    ).toBe(true);
  });

  it("fails when profile is too short (< 3 chars)", () => {
    const result = profileDetails.safeParse({ profile: "AB" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("3 characters");
    }
  });

  it("fails when profile is missing", () => {
    expect(profileDetails.safeParse({}).success).toBe(false);
  });
});

// ─── isValidEmail ────────────────────────────────────────────────────────────

describe("isValidEmail", () => {
  it("returns true for a standard email", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  it("returns true for email with plus addressing", () => {
    expect(isValidEmail("user+tag@domain.co.uk")).toBe(true);
  });

  it("returns true for subdomain email", () => {
    expect(isValidEmail("user@mail.example.org")).toBe(true);
  });

  it("returns false for missing @", () => {
    expect(isValidEmail("notanemail")).toBe(false);
  });

  it("returns false for missing domain", () => {
    expect(isValidEmail("user@")).toBe(false);
  });

  it("returns false for missing TLD", () => {
    expect(isValidEmail("user@domain")).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isValidEmail(undefined)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });

  it("returns false for leading @", () => {
    expect(isValidEmail("@domain.com")).toBe(false);
  });
});

// ─── onBoardingValidation ────────────────────────────────────────────────────
//
// The file field uses z.custom that checks `value instanceof FileList`.
// FileList is not directly constructable in jsdom, so we test the
// failure paths (no file / wrong type) which are always reachable.

describe("onBoardingValidation", () => {
  it("fails when file field is missing", () => {
    const result = onBoardingValidation.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });

  it("fails when file is a plain object (not a FileList)", () => {
    const result = onBoardingValidation.safeParse({ file: {} });
    expect(result.success).toBe(false);
  });

  it("fails when file is null", () => {
    const result = onBoardingValidation.safeParse({ file: null });
    expect(result.success).toBe(false);
  });

  it("fails when file is an empty array", () => {
    const result = onBoardingValidation.safeParse({ file: [] });
    expect(result.success).toBe(false);
  });

  it("schema exposes portfolio, linkedin, and file fields", () => {
    const shape = onBoardingValidation.shape;
    expect(shape.portfolio).toBeDefined();
    expect(shape.linkedin).toBeDefined();
    expect(shape.file).toBeDefined();
  });

  it("accepts portfolio and linkedin as undefined", () => {
    // Test shape-level: optional fields do not cause extra errors when absent
    const result = onBoardingValidation.safeParse({
      file: null,
      portfolio: undefined,
      linkedin: undefined,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      // Only the file error should be present, not portfolio/linkedin
      const nonFileErrors = result.error.issues.filter(
        (i) => i.path[0] !== "file",
      );
      expect(nonFileErrors).toHaveLength(0);
    }
  });

});
