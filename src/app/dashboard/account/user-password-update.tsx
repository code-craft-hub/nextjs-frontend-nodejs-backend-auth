"use client";
import React, { useState } from "react";
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

// Zod validation schema with password requirements
const passwordSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/\d/, "Password must contain at least one digit")
      .regex(
        /[^a-zA-Z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

// Password requirement checker
const usePasswordValidation = (password: string) => {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasDigit: /\d/.test(password),
    hasSpecialChar: /[^a-zA-Z0-9]/.test(password),
  };
};

export const PasswordUpdateForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const watchedPassword = form.watch("password");
  const passwordValidation = usePasswordValidation(watchedPassword || "");

  const onSubmit = () => {
    toast.success("Account info updated!");
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
      {/* flex flex-col items-start p-10 gap-2.5 bg-white */}
      <Form {...form}>
        <div className="space-y-6">
          {/* Email Address Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium text-gray-700 mb-2 block">
                  Enter Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Email Address"
                    {...field}
                    className="w-full  px-4 py-3 text-base border border-gray-300 rounded-lg bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium text-gray-700 mb-2 block">
                  Enter Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      {...field}
                      className="w-full  px-4 py-3 pr-12 text-base border border-gray-300 rounded-lg bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
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

          {/* Password Requirements */}
          <div className="space-y-3 mt-4">
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

          {/* Confirm Password Field */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium text-gray-700 mb-2 block">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Password"
                      {...field}
                      className="w-full  px-4 py-3 pr-12 text-base border border-gray-300 rounded-lg bg-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
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

          {/* Update Button */}
          <div className="flex justify-center">
            <Button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              className="bg-blue-500 max-sm:w-full hover:bg-blue-600 text-white px-8 py-3 rounded-lg text-base font-medium transition-colors"
            >
              Update
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};
