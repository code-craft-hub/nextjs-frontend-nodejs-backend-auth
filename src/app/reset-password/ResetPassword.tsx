"use client";

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
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { api } from "@/lib/api/client";

// Mirror the server-side password policy (auth.validator.ts → passwordSchema).
const formSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const ResetPassword = ({
  email,
  otp,
}: {
  email: string;
  /** 6-digit OTP collected and validated in the previous step. */
  otp: string;
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible((prev) => !prev);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "" },
  });

  async function onSubmit({ password }: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      // Server expects: { email, otp, newPassword }  (auth.validator.ts → resetPasswordSchema)
      await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword: password,
      });

      toast.success("Password reset successfully. Please log in again.");
      router.push("/login");
    } catch (error: any) {
      toast.error(
        error?.data?.error ??
          error?.message ??
          "Reset failed. The code may have expired — please request a new one.",
      );
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="flex items-center justify-center flex-1">
        <div className="flex-1 flex items-center justify-center bg-white max-w-3xl shadow-2xl rounded-lg p-8 sm:p-16">
          <div className="w-full max-w-2xl space-y-8">
            {/* Logo and Header */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <img src="/cverai-logo.png" className="w-28 h-8" alt="" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Set New Password
                </h1>
                <p className="text-gray-600">
                  Choose a strong password for your account.
                </p>
              </div>
            </div>

            <Form {...form}>
              <div className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel
                        htmlFor="new-password"
                        className={cn(
                          "absolute left-3 z-10 px-1 text-sm font-medium bg-background text-muted-foreground pointer-events-none font-poppins",
                          "-top-2.5 text-xs",
                        )}
                      >
                        New Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="new-password"
                          type={isVisible ? "text" : "password"}
                          className="h-12"
                          {...field}
                        />
                      </FormControl>
                      <button
                        className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 transition-[color,box-shadow] outline-none hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                        type="button"
                        onClick={toggleVisibility}
                        aria-label={isVisible ? "Hide password" : "Show password"}
                        aria-pressed={isVisible}
                      >
                        {isVisible ? (
                          <EyeOffIcon size={16} aria-hidden="true" />
                        ) : (
                          <EyeIcon size={16} aria-hidden="true" />
                        )}
                      </button>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                  onClick={form.handleSubmit(onSubmit)}
                >
                  {isSubmitting ? "Resetting…" : "Reset Password"}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};
