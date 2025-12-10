import * as z from "zod";
export const SignupValidation = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    fullName: z
      .string()
      .min(3, { message: "Minimum of 3 characters is required." }),
    photoURL: z.string().url().optional(),
    provider: z.string().optional(),
    phoneNumber: z.string().min(3, { message: "Enter a valid phone number" }),
    address: z.string().optional(),
    country: z.object({}).optional(),
    state: z.string().optional(),
    email: z.string().email(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwords do not match",
    path: ["confirmPassword"],
  });
export const SigninValidation = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z.string(),
});


export const onBoardingValidation = z.object({
  portfolio: z.string().optional(),
  linkedin: z.string().optional(),

  file: z
    .custom<FileList>(
      (value) =>
        typeof window !== "undefined" &&
        value instanceof FileList &&
        value.length > 0,
      "Please upload a file"
    )
    .superRefine((files, ctx) => {
      if (!files || files.length !== 1) {
        ctx.addIssue({
          code: "custom",
          message: "Please upload exactly one file",
        });
        return;
      }

      const file = files[0];

      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        ctx.addIssue({
          code: "custom",
          message: "File must be a PDF, DOC, or DOCX",
        });
      }

      if (file.size > 5 * 1024 * 1024) {
        ctx.addIssue({
          code: "custom",
          message: "File size must be less than 5MB",
        });
      }
    }),
});


export const userDetails = z.object({
  firstName: z
    .string()
    .min(3, { message: "You must enter at least 3 characters" }),
  lastName: z
    .string()
    .min(3, { message: "You must enter at least 3 characters" }),
  cvJobTitle: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
  country: z.string().optional(),
  state: z.string().min(1, { message: "Enter a valid state name" }),
  portfolio: z.string().optional(),
  email: z.string().email().optional(),
});

export const profileDetails = z.object({
  profile: z
    .string()
    .min(3, { message: "profile field requires a minimum of 3 characters" }),
});

export const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;


export const isValidEmail = (email?: string): boolean => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
