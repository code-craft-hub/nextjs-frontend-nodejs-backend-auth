"use client";

import { useEffect } from "react";
import authClient from "@/lib/axios/auth-api";
import { useState, useId } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { FloatingLabelInputProps } from "@/types";





const formSchema = z.object({
  code: z.string({ message: "Please enter a valid verification code." }),
});

export default function VerifyEmailClient() {
  const [_code, setCode] = useState("");
  const [_isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [_error, setError] = useState("");
  const [_success, setSuccess] = useState("");
  const [completedEmailVerification, setCompletedEmailVerification] =
    useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);


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
     formatCode(e.target.value);
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

 
  // Countdown timer for resend
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  useEffect(() => {
    sendVerificationCode();
  }, []);

  const sendVerificationCode = async () => {
    setIsSending(true);
    setError("");
    setSuccess("");

    try {
      const { data } = await authClient.post("/send-verification");

      console.log("sendVerificationCode response:", data);

      setSuccess("Verification code sent to your email!");
      setCanResend(false);
      setTimeLeft(60); // 1 minute cooldown
    } catch (error: any) {
      console.log(error.response.status);
      if (error.response.status === 401) {
        window.location.href = "/login";
        return;
      }
      setError(error.message);
    } finally {
      setIsSending(false);
    }
  };


  const formatCode = (value: string) => {
    // Only allow digits and limit to 5 characters
    const digits = value.replace(/\D/g, "").slice(0, 5);
    setCode(digits);
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmit({ code }: z.infer<typeof formSchema>) {
    if (!code || code.length !== 5) {
      setError("Please enter the 5-digit verification code");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const { data } = await authClient.post("/verify-email", { code });

      console.log("verifyCode response:", data);
      // window.location.href = "/onboarding";
      setCompletedEmailVerification(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsVerifying(false);
    }
  }

  if (completedEmailVerification) {
    return (
      <div className="min-h-screen flex flex-col font-poppins">
        <div
          className="h-32 w-full fixed"
          style={{
            background: "url('/landing-page-menu-gradient.svg')",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center center",
          }}
        />
        <div className="flex items-center justify-center flex-1 ">
          <div className="flex-1 flex items-center justify-center bg-white max-w-3xl shadow-2xl rounded-lg p-8 sm:p-16">
            <div className="w-full max-w-2xl space-y-8">
              {/* Logo and Header */}
              <div className="space-y-6">
                <div className="flex flex-col space-y-8 items-center justify-center">
                  <img src="/logo.svg" alt="Logo" />
                  <img src="success-icon.svg" alt="success" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <h2 className="font-bold">Email Verification</h2>
                <p className="text-gray-400 text-xs">
                  Your email has been verified!
                </p>
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                onClick={() => {
                  window.location.href = "/onboarding";
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-poppins">
      <div
        className="h-32 w-full fixed"
        style={{
          background: "url('/landing-page-menu-gradient.svg')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      />
      <div className="flex items-center justify-center flex-1 ">
        <div className="flex-1 flex items-center justify-center bg-white max-w-3xl shadow-2xl rounded-lg p-8 sm:p-16">
          <div className="w-full max-w-2xl space-y-8">
            {/* Logo and Header */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <img src="/logo.svg" alt="" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Email Verification
                </h1>
                <p className="text-gray-600">
                  A verification code has been sent to your email address
                </p>
              </div>
            </div>

            <Form {...form}>
              <div className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FloatingLabelInput
                          label="Enter Code"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="">
                  <p className="text-xs">
                    Haven't received an OTP?
                    <Button
                      variant={"link"}
                      onClick={sendVerificationCode}
                      disabled={!canResend || isSending}
                      className="text-gray-400 text-xs p-0 px-1 hover:cursor-pointer"
                    >
                      {isSending
                        ? "Sending..."
                        : canResend
                        ? "Resend verification code"
                        : `Resend in ${timeLeft}s`}
                    </Button>{" "}
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                  onClick={form.handleSubmit(onSubmit)}
                >
                  Verify
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

{
  /* 
     <form onSubmit={verifyCode}>
        <div style={{ marginBottom: "25px" }}>
          <input
            type="text"
            value={code}
            onChange={(e) => formatCode(e.target.value)}
            placeholder="93745"
            style={{
              width: "100%",
              padding: "15px",
              fontSize: "24px",
              textAlign: "center",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              letterSpacing: "8px",
              fontFamily: "Monaco, Consolas, monospace",
              fontWeight: "600",
              outline: "none",
              transition: "border-color 0.2s",
              marginBottom: "15px",
            }}
            maxLength={5}
            autoComplete="one-time-code"
            onFocus={(e) => {
              e.target.style.borderColor = "#667eea";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e5e7eb";
            }}
          />
          <p
            style={{
              color: "#6b7280",
              fontSize: "14px",
              margin: "0",
              textAlign: "center",
            }}
          >
            Enter the 5-digit code from your email
          </p>
        </div>

        <button
          type="submit"
          disabled={isVerifying || code.length !== 5}
          style={{
            width: "100%",
            padding: "15px",
            backgroundColor:
              isVerifying || code.length !== 5 ? "#9ca3af" : "#667eea",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            cursor:
              isVerifying || code.length !== 5 ? "not-allowed" : "pointer",
            marginBottom: "20px",
            transition: "background-color 0.2s",
          }}
        >
          {isVerifying ? "Verifying..." : "Verify Email"}
        </button>
      </form>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={sendVerificationCode}
          disabled={!canResend || isSending}
          style={{
            background: "none",
            border: "none",
            color: canResend && !isSending ? "#667eea" : "#9ca3af",
            cursor: canResend && !isSending ? "pointer" : "not-allowed",
            textDecoration: "underline",
            fontSize: "14px",
          }}
        >
          {isSending
            ? "Sending..."
            : canResend
            ? "Resend verification code"
            : `Resend in ${timeLeft}s`}
        </button>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "6px",
            padding: "12px",
            marginBottom: "20px",
          }}
        >
          <p style={{ color: "#dc2626", fontSize: "14px", margin: "0" }}>
            {error}
          </p>
        </div>
      )}

      {success && (
        <div
          style={{
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "6px",
            padding: "12px",
            marginBottom: "20px",
          }}
        >
          <p style={{ color: "#16a34a", fontSize: "14px", margin: "0" }}>
            {success}
          </p>
        </div>
      )}

  */
}
