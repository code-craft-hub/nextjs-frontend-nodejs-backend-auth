"use client";
import Link from "next/link";
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
  FormMessage,
} from "@/components/ui/form";
import { useGoogleLogin } from "@react-oauth/google";
import { api, APIError } from "@/lib/api/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@/modules/user";
import { FloatingLabelInput } from "@/modules/auth";

const LoginSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

export const LoginClient = () => {
  const router = useRouter();
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const { data: user } = useQuery(userQueries.detail());
  console.log("LoginClient user query result", { user });
  // const { login, isLoginLoading } = useAuth();

  // Google OAuth — authorization-code flow.  The backend exchanges the
  // one-time code with Google server-side; the access token never touches the browser.
  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      try {
        setIsLoginLoading(true);
        const result = await api.post<{
          data: {
            user: { onboardingComplete: boolean; emailVerified: boolean };
          };
        }>(
          "/auth/google",
          { code: codeResponse.code },
          // skipRefresh: a 401 here means Google auth failed, not an expired
          // session. Attempting a token refresh would be wrong and misleading.
          { skipRefresh: true },
        );
        const user = result?.data?.user;
        if (user && !user.emailVerified) {
          router.push("/verify-email");
        } else if (user && !user.onboardingComplete) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard/home");
        }
      } catch (error) {
        console.error("Google login error:", error);
        toast.error("Google login failed. Please try again.");
      } finally {
        setIsLoginLoading(false);
      }
    },
    onError: () => toast.error("Google login failed. Please try again."),
  });

  const form = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    try {
      setIsLoginLoading(true);
      await api.post(
        "/auth/login",
        { email: values.email, password: values.password },
        // skipRefresh: a 401 here means wrong credentials, not an expired
        // session. Attempting a token refresh would be incorrect and would
        // produce a confusing second 401 in the console.
        { skipRefresh: true },
      );
      toast.success("Login successful!");
      router.push("/dashboard/home");
    } catch (error) {
      const message =
        error instanceof APIError
          ? APIError.extractMessage(
              error.data,
              "Login failed. Please try again.",
            )
          : "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const email = form.getValues("email");

    if (!email) {
      form.setError("email", { message: "Enter your email first." });
      return;
    }

    router.push(`/reset-password?email=${encodeURIComponent(email)}`);

    // {router.push("/reset-password")}
  };

  return (
    <div className=" flex font-poppins">
      <div className="flex-1 min-h-screen flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <img src="/cverai-logo.png" className="w-28 h-8" alt="" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
              <p className="text-gray-600">
                Let&#39;s get you all set up so you can access your personal
                account.
              </p>
            </div>
          </div>

          {/* Form */}
          <Form {...form}>
            <div className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-2">
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
                <div className="w-fit ml-auto ">
                  <Button
                    onClick={() => handlePasswordReset()}
                    className="w-fit"
                    variant={"link"}
                  >
                    Reset Password
                  </Button>
                </div>
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
                />{" "}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isLoginLoading}
              >
                Login
              </Button>

              {/* Login Link */}
              <div className="text-center">
                <span className="text-gray-600">
                  Don&#39;t have an account?{" "}
                </span>
                <Link
                  href="/register"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign up
                </Link>
              </div>

              {/* Social Login Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-gray-500">
                    Or Login with
                  </span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="w-full flex justify-center items-center">
                <button
                  type="button"
                  onClick={() => googleLogin()}
                  disabled={isLoginLoading}
                  className="flex items-center justify-center gap-3 w-full h-10 px-4 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="size-5"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    Sign in with Google
                  </span>
                </button>
              </div>
            </div>
          </Form>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative overflow-hidden  bg-blue-500 ">
        <img
          src="/auth-page.png"
          alt="Auth Image"
          className="inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
};
