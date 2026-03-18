"use client";
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff, Check } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useChangePasswordMutation } from "@/modules/auth";
import { userQueries } from "@/modules/user";
import { APIError } from "@/lib/api/client";

// ─── Password requirement checker ────────────────────────────────────────────

const usePasswordValidation = (password: string) => ({
  minLength: password.length >= 8,
  hasUppercase: /[A-Z]/.test(password),
  hasDigit: /\d/.test(password),
  hasSpecialChar: /[^a-zA-Z0-9]/.test(password),
});

const newPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/\d/, "Password must contain at least one digit")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

// ─── Component ───────────────────────────────────────────────────────────────

export const PasswordUpdateForm: React.FC = () => {
  const { data: user } = useQuery(userQueries.detail());
  const changePassword = useChangePasswordMutation();

  // Google-only users have provider === "google" and no password set.
  // For them, currentPassword is irrelevant — they're adding one for the first time.
  const isGoogleOnly = user?.provider === "google";

  // Build a schema that conditionally requires currentPassword
  const schema = useMemo(
    () =>
      z
        .object({
          currentPassword: isGoogleOnly
            ? z.string().optional()
            : z.string().min(1, "Current password is required"),
          newPassword: newPasswordSchema,
          confirmPassword: z.string(),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
          message: "Passwords don't match",
          path: ["confirmPassword"],
        }),
    [isGoogleOnly],
  );

  type FormData = z.infer<typeof schema>;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const watchedPassword = form.watch("newPassword");
  const passwordValidation = usePasswordValidation(watchedPassword ?? "");

  const onSubmit = async (data: FormData) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: isGoogleOnly ? undefined : data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password updated successfully.");
      form.reset();
    } catch (err) {
      const apiErr = err as APIError;
      const message =
        apiErr?.data
          ? APIError.extractMessage(apiErr.data, "Failed to update password")
          : "Failed to update password";
      toast.error(message);
    }
  };

  const RequirementItem: React.FC<{ met: boolean; text: string }> = ({
    met,
    text,
  }) => (
    <div className="flex items-center gap-2">
      <div
        className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center ${
          met ? "bg-green-500" : "bg-gray-200"
        }`}
      >
        {met && <Check className="w-3 h-3 text-white" />}
      </div>
      <span className={`text-sm ${met ? "text-gray-900" : "text-gray-600"}`}>
        {text}
      </span>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 bg-white rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        {isGoogleOnly ? "Add Password" : "Change Password"}
      </h3>

      <Form {...form}>
        <div className="space-y-6">
          {/* Current Password — only shown for email/password accounts */}
          {!isGoogleOnly && (
            <PasswordField
              control={form.control}
              name="currentPassword"
              label="Current Password"
              placeholder="Current password"
            />
          )}

          {/* New Password */}
          <PasswordField
            control={form.control}
            name="newPassword"
            label={isGoogleOnly ? "Password" : "New Password"}
            placeholder="Password"
          />

          {/* Password Requirements */}
          <div className="space-y-3">
            <RequirementItem
              met={passwordValidation.minLength}
              text="Minimum of 8 characters"
            />
            <RequirementItem
              met={passwordValidation.hasUppercase}
              text="Minimum of one upper case character"
            />
            <RequirementItem
              met={passwordValidation.hasDigit}
              text="Minimum of one digit"
            />
            <RequirementItem
              met={passwordValidation.hasSpecialChar}
              text="Minimum of one unique character"
            />
          </div>

          {/* Confirm Password */}
          <PasswordField
            control={form.control}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm password"
          />

          <div className="flex justify-center">
            <Button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={changePassword.isPending}
              className="bg-blue-500 max-sm:w-full hover:bg-blue-600 text-white px-8 py-3 rounded-lg text-base font-medium transition-colors"
            >
              {changePassword.isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};

// ─── Reusable password input with show/hide toggle ────────────────────────────

function PasswordField({
  control,
  name,
  label,
  placeholder,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  name: string;
  label: string;
  placeholder: string;
}) {
  const [show, setShow] = React.useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base font-medium text-gray-700 mb-2 block">
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type={show ? "text" : "password"}
                placeholder={placeholder}
                {...field}
                className="w-full px-4 py-3 pr-12 text-base border border-gray-300 rounded-lg bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {show ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
