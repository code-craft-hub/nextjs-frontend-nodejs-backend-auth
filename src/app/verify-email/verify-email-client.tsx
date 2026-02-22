"use client";

import { useEffect } from "react";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@module/user";
import { api } from "@/lib/api/client";

// Server validates exactly 6 numeric digits (auth.validator.ts → otpSchema).
const formSchema = z.object({
  code: z
    .string()
    .length(6, "Please enter the 6-digit verification code")
    .regex(/^\d{6}$/, "Verification code must contain digits only"),
});

export const VerifyEmailClient = () => {
  const { data: user } = useQuery(userQueries.detail());
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);

  const [emailSent, setEmailSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [completedEmailVerification, setCompletedEmailVerification] =
    useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (!emailSent) {
      setEmailSent(true);      
      sendVerificationCode();
    }
  }, [emailSent]);
  const sendVerificationCode = async () => {
    setIsVerifying(true);
    setIsSending(true);

    try {
      await api.post("/v1/auth/resend-verification");

      toast.success(
        `${user?.firstName}, verification code sent to your email!`
      );
      setCanResend(false);
      setTimeLeft(60); // 1-minute cooldown matches the server-side rate limiter
    } catch (error: any) {
      console.error(error);
      // APIError (from client.ts) exposes `.status` directly, not `.response.status`.
    
      toast.error(error?.data?.error ?? error?.message ?? "Failed to send code");
    } finally {
      setIsSending(false);
      setIsVerifying(false);
    }
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmit({ code }: z.infer<typeof formSchema>) {
    setIsVerifying(true);

    try {
      // Server expects the field name `otp`, not `code`.
      await api.post("/v1/auth/verify-email", { otp: code });

      // The access token still carries emailVerified: false from registration.
      // Rotate it immediately so the middleware sees the updated claim and
      // allows navigation to /onboarding without redirecting back here.
      await api.post("/v1/auth/refresh");

      toast.success(
        `${user?.firstName}, your email has been verified successfully!`
      );
      setCompletedEmailVerification(true);
    } catch (error: any) {
      toast.error(error?.data?.error ?? error?.message ?? "Verification failed");
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
                  <img src="/cverai-logo.png" className="w-28 h-8" alt="Logo" />
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
                  router.push("/onboarding");
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
                <img src="/cverai-logo.png" className="w-28 h-8" alt="" />
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
            <Button
              variant={"ghost"}
              className="absolute top-4 right-5"
              onClick={async () => {
                await api.delete("/v1/users");
                router.push("/register");
              }}
            >
              <X className="size-4" />
            </Button>
            <Form {...form}>
              <div className="space-" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel
                        htmlFor={"email-verification-code"}
                        className={cn(
                          "absolute left-3 z-10 px-1 text-sm font-medium  bg-background text-muted-foreground pointer-events-none font-poppins",
                          true ? "-top-2.5 text-xs " : "top-3"
                        )}
                      >
                        Verification Code
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="email-verification-code"
                          // label="Enter Code"
                          // type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="text-xs mb-4">
                  Haven&#39;t received an OTP?
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
                <Button
                  type="submit"
                  disabled={isVerifying || isSending}
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
};
