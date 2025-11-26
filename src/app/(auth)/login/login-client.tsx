"use client";
import Link from "next/link";
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
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const LoginSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

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
            h-12  px-3 pr-${showPasswordToggle ? "12" : "3"}
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

export const LoginClient = () => {
  const router = useRouter();
  const { login, isLoginLoading } = useAuth();

  const handleLogin = async (response: any) => {
    try {
      const credentials = jwtDecode(response.credential) as { email: string };
      const data: any = await api.post("/google-login-register", credentials);
      if (data?.success) {
        router.push("/dashboard/home");
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      toast.error("Google login failed. Please try again.");
    }
  };

  const form = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    await login(values);
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
                <GoogleLogin
                  size="large"
                  onSuccess={handleLogin}
                  onError={() => {
                    console.warn("Login Failed");
                  }}
                  useOneTap
                />
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
