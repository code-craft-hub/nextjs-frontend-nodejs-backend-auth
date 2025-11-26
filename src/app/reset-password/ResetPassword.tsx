"use client";

import { useEffect } from "react";
import authClient from "@/lib/axios/auth-api";
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
import { EyeIcon, EyeOffIcon, X } from "lucide-react";

const formSchema = z.object({
  password: z
    .string()
    .min(5, "Please enter your new password"),
});

export const ResetPassword = ({email}: {email: string}) => {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

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
      // sendVerificationCode();
    }
  }, [emailSent]);

  const sendVerificationCode = async () => {
    setIsVerifying(true);
    setIsSending(true);

    try {
      await authClient.post("/send-verification");

      toast.success(`Verification code sent to your email!`);
      setCanResend(false);
      setTimeLeft(60); // 1 minute cooldown
    } catch (error: any) {
      console.error(error);
      if (error.response.status === 401) {
        router.replace("/login");
        return;
      }
      toast.error(
        typeof error.message === "string"
          ? error.message
          : JSON.stringify(error.message)
      );
    } finally {
      setIsSending(false);
      setIsVerifying(false);
    }
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  async function onSubmit({ password }: z.infer<typeof formSchema>) {
    setIsVerifying(true);

    try {
      await authClient.post("/update-user-password", { password, email });

      toast.success(
        `${email?.split("@")[0]}, We've updated your password, redirect to the login page now.`
      );
      router.push("/login")
      // setCompletedEmailVerification(true);

    } catch (error: any) {
      // toast.error(
      //   error?.response?.data
      //     ? error?.response?.data?.error
      //     : JSON.stringify(error.response?.data) || "Verification failed"
      // );
      // toast.error(
      //   typeof error.message === "string"
      //     ? error.message
      //     : error.response.data || JSON.stringify(error.message)
      // );
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
              <Form {...form}>
                <div className="space-" onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel
                          htmlFor={"email-verification-email"}
                          className={cn(
                            "absolute left-3 z-10 px-1 text-sm font-medium  bg-background text-muted-foreground pointer-events-none font-poppins",
                            true ? "-top-2.5 text-xs " : "top-3"
                          )}
                        >
                          Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="email-verification-email"
                            // label="Enter email"
                            // type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                 
                  <Button
                    type="submit"
                    disabled={isVerifying || isSending}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                    onClick={form.handleSubmit(onSubmit)}
                  >
                    Reset Password
                  </Button>
                </div>
              </Form>

              <div className="text-center space-y-2">
                <h2 className="font-bold">Password Reset</h2>
                <p className="text-gray-400 text-xs">
                  Your password has been reset
                </p>
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                onClick={() => {
                  router.push("/login");
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
                  Password Reset
                </h1>
                <p className="text-gray-600">Enter your new password.</p>
              </div>
            </div>
            <Button
              variant={"ghost"}
              className="absolute top-4 right-5"
              onClick={async () => {
                await authClient.delete("/delete");
                router.push("/register");
              }}
            >
              <X className="size-4" />
            </Button>
            <Form {...form}>
              <div className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel
                        htmlFor={"email-verification-email"}
                        className={cn(
                          "absolute left-3 z-10 px-1 text-sm font-medium  bg-background text-muted-foreground pointer-events-none font-poppins",
                          true ? "-top-2.5 text-xs " : "top-3"
                        )}
                      >
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="email-verification-email"
                          // label="Enter email"
                          type={isVisible ? "text" : "password"}
                          className="h-12"
                          {...field}
                        />
                      </FormControl>
                      <button
                        className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 transition-[color,box-shadow] outline-none hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                        type="button"
                        onClick={toggleVisibility}
                        aria-label={
                          isVisible ? "Hide password" : "Show password"
                        }
                        aria-pressed={isVisible}
                        aria-controls="password"
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
                  disabled={isVerifying || isSending}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                  onClick={form.handleSubmit(onSubmit)}
                >
                  Reset Password
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};
