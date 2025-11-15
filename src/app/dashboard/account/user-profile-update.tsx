"use client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { userQueries } from "@/lib/queries/user.queries";
import { useQuery } from "@tanstack/react-query";
import { useUserLocation } from "@/hooks/get-user-location";
import { useUpdateUserMutation } from "@/lib/mutations/user.mutations";

// Zod validation schema
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  countryCode: z.string().min(1, "Country code is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  emailAddress: z.string().email("Invalid email address"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const countryCodes = [
  { value: "NG", label: "NG" },
  { value: "US", label: "US" },
  { value: "UK", label: "UK" },
];

export const UserProfileForm: React.FC = () => {
  const { data: user } = useQuery(userQueries.detail());
  const { continent_code } = useUserLocation();
  const updateUser = useUpdateUserMutation();
  const form = useForm<ProfileFormData>({
    // resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      country: "",
      state: "",
      countryCode: "",
      phoneNumber: "",
      emailAddress: "",
    },
  });

  useEffect(() => {
    form.setValue("firstName", user?.firstName || "");
    form.setValue("lastName", user?.lastName || "");
    form.setValue("emailAddress", user?.email || "");
    form.setValue("country", user?.country || "");
    form.setValue("state", user?.state || "");
    form.setValue("countryCode", user?.countryCode || continent_code || "");
    form.setValue("phoneNumber", user?.phoneNumber || "");
  }, [form, user]);

  const onSubmit = (value: z.infer<typeof profileSchema>) => {
    updateUser.mutate({ data: value });
    toast.success("Profile updated successfully!");
  };

  return (
    <div className="flex flex-col items-start p-4 sm:p-8 gap-2.5 bg-white rounded-lg">
      <div className="flex flex-col items-center gap-11 w-full h-full">
        {/* Header with profile info */}
        <div className="flex flex-col sm:flex-row justify-between items-center w-full">
          <div className="w-full">
            <div className="flex flex-row items-center gap-4">
              <Avatar className="size-12 sm:size-16">
                <AvatarImage src={user?.photoURL as string} alt="@avatar" />
                <AvatarFallback>
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}{" "}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-medium text-[17.32px] leading-[21px] text-black">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="font-normal text-[13.85px] leading-[17px] text-black opacity-50">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="flex items-center max-sm:hidden justify-center px-4 py-2 bg-[#4182F9] text-white text-[13.85px] rounded-[6.93px] font-normal"
            onClick={() => {
              form.handleSubmit(onSubmit)();
            }}
          >
            Update
          </button>
        </div>

        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col items-start gap-5 w-full"
          >
            {/* First row */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-7 w-full">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start gap-1.5 w-full">
                    <FormLabel className="text-sm font-medium text-[#344054] leading-5">
                      First Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter first name"
                        {...field}
                        className="box-border flex flex-row items-start w-full h-11 px-3.5 py-2.5 bg-[#F9FAFB] border border-[#D0D5DD] rounded-lg text-xs leading-6 text-[#667085] placeholder:text-[#667085] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start gap-1.5 w-full">
                    <FormLabel className="text-sm font-medium text-[#344054] leading-5">
                      Last Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter last name"
                        {...field}
                        className="box-border flex flex-row items-start w-full h-11 px-3.5 py-2.5 bg-[#F9FAFB] border border-[#D0D5DD] rounded-lg text-xs leading-6 text-[#667085] placeholder:text-[#667085] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            {/* Second row */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-7 w-full">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start gap-1.5 w-full">
                    <FormLabel className="text-sm font-medium text-[#344054] leading-5">
                      Country
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter last name"
                        {...field}
                        className="box-border flex flex-row items-start w-full h-11 px-3.5 py-2.5 bg-[#F9FAFB] border border-[#D0D5DD] rounded-lg text-xs leading-6 text-[#667085] placeholder:text-[#667085] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start gap-1.5 w-full">
                    <FormLabel className="text-sm font-medium text-[#344054] leading-5">
                      State
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter last name"
                        {...field}
                        className="box-border flex flex-row items-start w-full h-11 px-3.5 py-2.5 bg-[#F9FAFB] border border-[#D0D5DD] rounded-lg text-xs leading-6 text-[#667085] placeholder:text-[#667085] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            {/* Third row */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-7 w-full">
              {/* Phone number with country code */}
              <div className="flex flex-col items-start gap-1.5 w-full">
                <label className="text-sm font-medium text-[#344054] leading-5">
                  Phone number
                </label>
                <div className="flex flex-row items-start w-full h-11 bg-[#F9FAFB] border border-[#D0D5DD] rounded-lg">
                  <FormField
                    control={form.control}
                    name="countryCode"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="flex flex-row justify-between items-center px-3.5 py-2.5 h-11 gap-1 border-0 bg-transparent">
                              <SelectValue className="text-xs leading-6 text-[#101828]" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countryCodes.map((country) => (
                              <SelectItem
                                key={country.value}
                                value={country.value}
                              >
                                {country.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs text-red-500 absolute" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+234 812 345 6789"
                            {...field}
                            className="flex-1 px-3.5 py-2.5 bg-transparent border-0 text-xs leading-6 text-[#667085] placeholder:text-[#667085] focus:outline-none focus:ring-0 shadow-none"
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="emailAddress"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start gap-1.5 w-full">
                    <FormLabel className="text-sm font-medium text-[#344054] leading-5">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        disabled={true}
                        placeholder="Enter email address"
                        {...field}
                        className="box-border flex flex-row items-start w-full h-11 px-3.5 py-2.5 bg-[#F9FAFB] border border-[#D0D5DD] rounded-lg text-xs leading-6 text-[#667085] placeholder:text-[#667085] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            <button
              type="submit"
              className="items-center hidden max-sm:flex w-full mt-4 justify-center px-4 py-2 bg-[#4182F9] text-white text-[13.85px] rounded-[6.93px] font-normal"
            >
              Update
            </button>
          </form>
        </Form>
      </div>
    </div>
  );
};
