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
import { api } from "@/lib/api/client";

// Server validates exactly 6 numeric digits (auth.validator.ts → otpSchema).
const formSchema = z.object({
  code: z
    .string()
    .length(6, "Please enter the 6-digit reset code")
    .regex(/^\d{6}$/, "Reset code must contain digits only"),
});

export const PasswordResetVerifyEmail = ({
  email,
  handleStateChange,
}: {
  email: string;
  /** Called with the validated OTP so the parent can pass it to ResetPassword. */
  handleStateChange: (otp: string) => void;
}) => {
  const router = useRouter();
  const username = email?.split("@")[0];
  const [isVerifying, setIsVerifying] = useState(false);

  const [emailSent, setEmailSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
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
      // /auth/forgot-password sends the reset OTP to the user's inbox.
      // It always returns 200 regardless of whether the email exists (prevents enumeration).
      await api.post("/auth/forgot-password", { email });

      toast.success(`Reset code sent to ${email}!`);
      setCanResend(false);
      setTimeLeft(60); // 1-minute cooldown
    } catch (error: any) {
      console.error(error);
      toast.error(error?.data?.error ?? error?.message ?? "Failed to send reset code");
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
    // We do NOT call verify-email here — that endpoint is for account email
    // verification, not password reset.  The OTP itself is only consumed server-side
    // when /auth/reset-password is called with { email, otp, newPassword }.
    // We simply pass the validated code to the parent so it can provide it to
    // the ResetPassword component.
    handleStateChange(code);
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
              onClick={() => router.push("/login")}
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
