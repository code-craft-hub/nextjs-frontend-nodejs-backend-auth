"use client";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useState, useId, JSX } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  registerUserSchema,
  RegisterUserSchema,
} from "@/lib/schema-validations";

export default function RegisterClient() {
  const { register, isRegisterLoading } = useAuth();
  interface FloatingLabelInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    id?: string;
    label: string;
    type?: string;
    className?: string;
    showPasswordToggle?: boolean;
  }

  function FloatingLabelInput({
    id,
    label,
    type = "text",
    className = "",
    showPasswordToggle = false,
    ...props
  }: FloatingLabelInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const inputId = useId();
    const actualId = id || inputId;

    const handleFocus = () => setIsFocused(true);

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(e.target.value.length > 0);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      props.onChange?.(e);
    };

    const isLabelFloated = isFocused || hasValue;
    const inputType = showPasswordToggle
      ? showPassword
        ? "text"
        : "password"
      : type;

    return (
      <div className="group relative">
        <label
          htmlFor={actualId}
          className={`
          absolute left-3 z-10 px-2 text-sm font-medium
          bg-background text-muted-foreground
          transition-all duration-200 ease-in-out
          pointer-events-none font-poppins
          ${isLabelFloated ? "-top-2.5 text-xs text-foreground" : "top-3"}
        `}
        >
          {label}
        </label>
        <div className="relative">
          <Input
            id={actualId}
            type={inputType}
            className={`
            h-12 pt-4 pb-2 px-3 pr-${showPasswordToggle ? "12" : "3"}
            transition-colors duration-200 font-poppins
            border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-[4px]
            ${className}
          `}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
          {showPasswordToggle && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors "
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Social Login Button Component
  function SocialButton({
    icon,
    className = "",
    provider,
  }: {
    icon: JSX.Element;
    className?: string;
    provider: string;
  }) {
    console.log(provider);
    return (
      <Button
        type="button"
        variant="outline"
        className={`h-12 flex items-center justify-center border-gray-300 hover:bg-gray-50 transition-colors ${className}`}
      >
        {icon}
      </Button>
    );
  }

  const form = useForm<RegisterUserSchema>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  const onSubmit = async (values: RegisterUserSchema) => {
    await register(values);
  };

 return (
    <div className="min-h-screen flex font-poppins">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Header */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <img src="/logo.svg" alt="" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign up</h1>
              <p className="text-gray-600">
                Let's get you all set up so you can access your personal
                account.
              </p>
            </div>
          </div>

          {/* Form */}
          <Form {...form}>
            <div className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelInput label="First Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelInput label="Last Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FloatingLabelInput
                        label="Email"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Fields */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FloatingLabelInput
                        label="Password"
                        type="password"
                        showPasswordToggle
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FloatingLabelInput
                        label="Confirm Password"
                        type="password"
                        showPasswordToggle
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Terms Checkbox */}
              <FormField
                control={form.control}
                name="agreeToTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        I agree to all the{" "}
                        <a href="#" className="text-blue-600 hover:underline">
                          Terms
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-blue-600 hover:underline">
                          Privacy Policies
                        </a>
                      </label>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                disabled={isRegisterLoading}
                onClick={form.handleSubmit(onSubmit)}
              >
                Create account
              </Button>

              {/* Login Link */}
              <div className="text-center">
                <span className="text-gray-600">Already have an account? </span>
                <Link
                  href="/login"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Login
                </Link>
              </div>

              {/* Social Login Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-gray-500">
                    Or Sign up with
                  </span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-3 gap-4">
                <SocialButton
                  icon={
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#1877F2"
                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                      />
                    </svg>
                  }
                  provider="Facebook"
                />
                <SocialButton
                  icon={
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  }
                  provider="Google"
                />
                <SocialButton
                  icon={
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                  }
                  provider="Apple"
                />
              </div>
            </div>
          </Form>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-blue-500 min-h-screen">
        <img
          src="/auth-page.png"
          alt="Auth Image"
          className="inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
};