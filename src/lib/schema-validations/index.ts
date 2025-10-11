import { z } from "zod";
import { E164_PHONE_REGEX, normalizePhoneNumber } from "@/lib/utils/index";

export const emailSchema = z
  .email("Please provide a valid email address")
  .min(1, "Email is required")
  .max(254, "Email must be less than 254 characters");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Password must be less than 128 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/,
    "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
  );

export const firstNameSchema = z
  .string()
  .min(1, "First name is required")
  .max(50, "First name must be less than 50 characters")
  .regex(
    /^[a-zA-Z\s'-]+$/,
    "First name can only contain letters, spaces, hyphens, and apostrophes"
  )
  .transform((val) => val.trim());

export const lastNameSchema = z
  .string()
  .min(1, "Last name is required")
  .max(50, "Last name must be less than 50 characters")
  .regex(
    /^[a-zA-Z\s'-]+$/,
    "Last name can only contain letters, spaces, hyphens, and apostrophes"
  )
  .transform((val) => val.trim());

export const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .transform((val) => normalizePhoneNumber(val))
  .refine((val) => E164_PHONE_REGEX.test(val), {
    message:
      "Phone number must be a valid E.164 format (e.g., +1234567890, +44207123456, +81312345678)",
  });

export const registerUserSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    confirmPassword: passwordSchema,
    agreeToTerms: z.boolean().refine((value) => value === true, {
      message: "You must agree to the terms and privacy policies.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
export type LoginSchema = z.infer<typeof loginSchema>;

export type RegisterUserSchema = z.infer<typeof registerUserSchema>;
