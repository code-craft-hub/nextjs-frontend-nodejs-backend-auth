"use client";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  registerUserSchema,
  RegisterUserSchema,
} from "@/lib/schema-validations";
import { cn } from "@/lib/utils";
import { inputField } from "@/lib/utils/constants";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {axiosApiClient} from "@/lib/axios/auth-api";

export default function RegisterClient({ referral }: { referral?: string }) {
  const [loading, setLoading] = useState(false);
  // const { register, isRegisterLoading } = useAuth();

  const router = useRouter();

  const handleLogin = async (response: any) => {
    try {
      setLoading(true);
      const credentials = jwtDecode(response.credential) as { email: string };
      const data: any = await axiosApiClient.post("/google-login-register", credentials);
      if (data?.success) {
        router.push("/dashboard/home");
      }
    } catch (error) {
      console.error("Google registeration Error:", error);
      toast.error("Google registeration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const form = useForm<RegisterUserSchema>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      confirmPassword: "",
      referralCode: referral || "",
      agreeToTerms: false,
    },
  });

  const onSubmit = async (values: RegisterUserSchema) => {
    try {
      setLoading(true);
      const response = await axiosApiClient.post("/register", {
        email: values.email,
        password: values.password,
      });
      if (response?.data?.success) {
        toast.success("Registration successful! Please check your email.");
        router.push("/verify-email");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(
        error?.response?.data?.message ||
          "Registration failed. Please try again."
      );
      return;
    } finally {
      setLoading(false);
    }
  };

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const toggleVisibility = () => setIsVisible((prevState) => !prevState);
  const toggleConfirmPasswordVisibility = () =>
    setConfirmPasswordVisible((prevState) => !prevState);
  return (
    <div className="min-h-screen flex font-poppins">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Header */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <img src="/cverai-logo.png" className="w-28 h-8" alt="" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign up</h1>
              <p className="text-gray-600">
                Let&#39;s get you all set up so you can access your personal
                account.
              </p>
            </div>
          </div>

          {/* Form */}
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="group relative">
                          <label
                            htmlFor={field.name}
                            className={cn(inputField)}
                          >
                            <span className="inline-flex px-2">First Name</span>
                          </label>
                          <Input
                            id={field.name}
                            placeholder=" "
                            {...field}
                            className="h-12 !rounded-sm"
                          />
                        </div>
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
                        <div className="group relative">
                          <label
                            htmlFor={field.name}
                            className={cn(inputField)}
                          >
                            <span className="inline-flex px-2">Last Name</span>
                          </label>
                          <Input
                            id={field.name}
                            placeholder=" "
                            {...field}
                            className="h-12 !rounded-sm"
                          />
                        </div>
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
                      <div className="group relative">
                        <label htmlFor={field.name} className={cn(inputField)}>
                          <span className="inline-flex px-2">Email</span>
                        </label>
                        <Input
                          id={field.name}
                          placeholder=" "
                          type="email"
                          {...field}
                          className="h-12 !rounded-sm"
                        />
                      </div>
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
                      {/* <div className="*:not-first:mt-2">
                        <Label htmlFor={field.name}>Show/hide password input</Label>
                        <div className="relative">
                          <Input
                            id={field.name}
                            className="pe-9"
                            placeholder="Password"
                            
                          />
                          
                        </div>
                      </div> */}
                      <div className="group relative">
                        <label htmlFor={field.name} className={cn(inputField)}>
                          <span className="inline-flex px-2">Password</span>
                        </label>
                        <Input
                          id={field.name}
                          placeholder=" "
                          type={isVisible ? "text" : "password"}
                          {...field}
                          className="h-12 !rounded-sm"
                        />
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
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <div className="group relative">
                  <label htmlFor={field.name} className={cn(inputField)}>
                    <span className="inline-flex px-2">Password</span>
                  </label>
                  <Input
                    id={field.name}
                    placeholder=" "
                    type="password"
                    {...field}
                    className="h-12 !rounded-sm"
                  />
                </div> */}

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="group relative">
                        <label htmlFor={field.name} className={cn(inputField)}>
                          <span className="inline-flex px-2">
                            Confirm Password
                          </span>
                        </label>
                        <Input
                          id={field.name}
                          placeholder=" "
                          type={confirmPasswordVisible ? "text" : "password"}
                          {...field}
                          className="h-12 !rounded-sm"
                        />
                        <button
                          className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 transition-[color,box-shadow] outline-none hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                          type="button"
                          onClick={toggleConfirmPasswordVisibility}
                          aria-label={
                            confirmPasswordVisible
                              ? "Hide password"
                              : "Show password"
                          }
                          aria-pressed={confirmPasswordVisible}
                          aria-controls="password"
                        >
                          {confirmPasswordVisible ? (
                            <EyeOffIcon size={16} aria-hidden="true" />
                          ) : (
                            <EyeIcon size={16} aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="referralCode"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="group relative">
                        <label htmlFor={field.name} className={cn(inputField)}>
                          <span className="inline-flex px-2">
                            Input referral code
                          </span>
                        </label>
                        <Input
                          id={field.name}
                          placeholder=" "
                          {...field}
                          className="h-12 !rounded-sm"
                        />
                      </div>
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
                        <Link
                          href="/terms"
                          className="text-blue-600 hover:underline"
                        >
                          Terms
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/policy"
                          className="text-blue-600 hover:underline"
                        >
                          Privacy Policies
                        </Link>
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
                disabled={loading}
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
            </form>
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
}
