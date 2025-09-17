"use client";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
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
import { registerUserSchema, RegisterUserSchema } from "@/lib/schema-validations";

export default function RegisterClient() {
  const { register, isRegisterLoading } = useAuth();

  const form = useForm<RegisterUserSchema>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
    },
  });

  const onSubmit = async (values: RegisterUserSchema) => {
    await register(values);
  };

  return (
    <div>
      <h1>Register</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>FirstName</FormLabel>
                <FormControl>
                  <Input
                    disabled={isRegisterLoading}
                    placeholder="John"
                    {...field}
                  />
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
                <FormLabel>LastName</FormLabel>
                <FormControl>
                  <Input
                    disabled={isRegisterLoading}
                    placeholder="lastName"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PhoneNumber</FormLabel>
                <FormControl>
                  <Input
                    disabled={isRegisterLoading}
                    placeholder="+2349071234567"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />{" "}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    disabled={isRegisterLoading}
                    placeholder="john@gmail.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    disabled={isRegisterLoading}
                    type="password"
                    placeholder="************"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={isRegisterLoading} type="submit">
            Submit
          </Button>
        </form>
      </Form>
      <p>
        Already have an account? <Link href="/login">Login</Link>
      </p>
    </div>
  );
}
