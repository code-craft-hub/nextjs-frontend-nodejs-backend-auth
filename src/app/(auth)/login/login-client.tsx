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
import { api, APIError } from "@/lib/api/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FloatingLabelInput, GoogleButton } from "@/modules/auth";

const LoginSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

export const LoginClient = () => {
  const router = useRouter();
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const handleLoading = (loading: boolean) => {
    setIsLoginLoading(loading);
  }
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
                <GoogleButton handleLoading={handleLoading} />
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
