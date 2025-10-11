"use client";
import { ArrowUp, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { memo, useState } from "react";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  ACTION_OPTIONS,
  ActionValue,
  PROFILE_OPTIONS,
} from "../../components/constants";
import { SelectOptions } from "../../components/SelectOptions";
import LockIcon from "@/components/icons/LockIcon";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const FORM_SCHEMA = z.object({
  jobDescription: z.string().min(2, {
    message: "job description must be at least 2 characters.",
  }),
});

export const AIJobCustomizationInput = memo(() => {
  const [dataSource, setDataSource] = useState<string>("select-profile");
  const [docsInput, setDocsInput] = useState<ActionValue>("tailor-resume");
  const [userProfile, setUserProfile] = useState<string>("profile1");
  const router = useRouter();

  const changeDataSource = (value: string) => {
    setDataSource(value);
    toast.success(`Selected: ${value}`);
  };

  const onDocumentChange = (value: ActionValue) => {
    toast.success(`Selected: ${value}`);

    setDocsInput(value);
  };

  const form = useForm<z.infer<typeof FORM_SCHEMA>>({
    // resolver: zodResolver(FORM_SCHEMA),
    defaultValues: {
      jobDescription: "",
    },
  });

  const onSubmit = ({ jobDescription }: z.infer<typeof FORM_SCHEMA>) => {
    toast.success(docsInput);

    router.push(`/dashboard/${docsInput}?dataSource=${dataSource}&profile=${userProfile}&jobDescription=${jobDescription}`);
  };

  const profiles = [
    { value: "profile1", label: "Base profile", icon: LockIcon },
    { value: "profile2", label: "Primary profile", icon: LockIcon },
    { value: "profile3", label: "Job profile", icon: LockIcon },
  ];

  return (
    <div className="!relative h-36">
      <div className="relative shadow-blue-200 border-blue-500 rounded-2xl border-r shadow-xl h-38">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <textarea
                      placeholder="Let's get started"
                      className="w-full outline-none focus:outline-none text-xs focus:border-none p-2 resize-none pl-4 pt-2 border-none placeholder:font-medium focus-visible:border-none h-26"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex  justify-between bg-yellow py-2">
              <div className="flex gap-2 px-3">
                <DropdownMenu>
                  <DropdownMenuTrigger className=" data-[state=open]:!shadow-2xl  rounded-full  border-blue-500 p-1 hover:cursor-pointer z-20 border-2">
                    <Plus className="text-blue-400 size-4 font-bold" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="p-1 " align="start">
                    <DropdownMenuGroup>
                      {PROFILE_OPTIONS.map(({ label, value, icon: Icon }) => (
                        <DropdownMenuItem
                          onSelect={() => changeDataSource(value)}
                          key={value}
                          className={cn(
                            "gap-2 group hover:text-primary hover:cursor-pointer mb-1",
                            value === dataSource && "bg-gray-100 text-blue-500"
                          )}
                        >
                          {Icon && (
                            <Icon className="size-3 group-hover:text-primary" />
                          )}
                          <p className="group-hover:text-primary text-xs">
                            {label}
                          </p>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="hover:cursor-pointer z-20">
                  <SelectOptions
                    options={ACTION_OPTIONS}
                    value={docsInput}
                    onValueChange={(value) => onDocumentChange(value)}
                    placeholder="Tailor Resume"
                    triggerClassName={
                      " border-2 border-primary/70 rounded-xl text-primary hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 [&_svg]:!text-primary  text-2xs"
                    }
                    contentClassName="text-xs"
                  />
                </div>
              </div>
              <div className="flex gap-2 px-3">
                <div className="hover:cursor-pointer ">
                  <SelectOptions
                    options={profiles}
                    value={userProfile}
                    onValueChange={(value) => {
                      setUserProfile(value);
                      toast.success(JSON.stringify(userProfile));
                    }}
                    placeholder="Tailor Resume"
                    triggerClassName={
                      " border-2 border-primary/70 rounded-xl text-primary hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 [&_svg]:!text-primary  text-2xs"
                    }
                    contentClassName="text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-full border-blue-500 border-2 p-1 hover:cursor-pointer "
                >
                  <ArrowUp className="text-blue-400 size-4" />
                </button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
});

AIJobCustomizationInput.displayName = "AIJobCustomizationInput";
