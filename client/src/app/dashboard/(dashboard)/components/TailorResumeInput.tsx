"use client";
import { InitialUser } from "@/types";

import { ArrowUp, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItemWithoutSVG,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  memo,
  useCallback,
  useState,
} from "react";
import { toast } from "sonner";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { ACTION_OPTIONS, ActionValue, PROFILE_OPTIONS } from "./constants";
import { SelectOptions } from "./SelectOptions";
import LockIcon from "@/components/icons/LockIcon";

const FORM_SCHEMA = z.object({
  jobDescription: z.string().min(2, {
    message: "job description must be at least 2 characters.",
  }),
});

export const TailorResumeInput = memo(({ initialUser }: InitialUser) => {
  console.log(initialUser);
  const [profileInput, setProfileInput] = useState<string>("profile1");
  const [docsInput, setDocsInput] = useState<ActionValue>("tailor-resume");

  const form = useForm<z.infer<typeof FORM_SCHEMA>>({
    resolver: zodResolver(FORM_SCHEMA),
    defaultValues: {
      jobDescription: "",
    },
  });

  const onSubmit = useCallback((data: z.infer<typeof FORM_SCHEMA>) => {
    console.log(data);
  }, []);

  const profile = ["profile1", "profile2", "profile3"];

  return (
    <div className="!relative h-36">
      <DropdownMenu>
        <DropdownMenuTrigger className="absolute data-[state=open]:!shadow-2xl  rounded-full bottom-5 left-3 border-blue-500 p-1 hover:cursor-pointer z-20 border-2">
          <Plus className="text-blue-400 size-4 font-bold" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-44 p-3 " align="start">
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2 hover:cursor-pointer [&_svg]:!text-primary">
                <div>
                  {(() => {
                    const { icon: Icon, label } = PROFILE_OPTIONS[0];
                    return (
                      <div className="flex gap-1 items-center justify-center text-primary hover:text-primary hover:cursor-pointer ">
                        {Icon && <Icon className="size-4 text-primary" />}
                        {label}
                      </div>
                    );
                  })()}
                </div>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={profileInput}
                    onValueChange={setProfileInput}
                  >
                    {profile.map((item) => (
                      <DropdownMenuRadioItemWithoutSVG
                        value={item}
                        key={item}
                        className="hover:text-primary hover:cursor-pointer data-[state=checked]:bg-primary data-[state=checked]:[&_svg]:text-white data-[state=checked]:text-white gap-2"
                      >
                        <LockIcon /> {item}
                      </DropdownMenuRadioItemWithoutSVG>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {PROFILE_OPTIONS.slice(1, 3).map(({ label, value, icon: Icon }) => (
              <DropdownMenuItem
                onSelect={() => {
                  toast.success("selected");
                }}
                key={value}
                className="gap-2 group hover:text-primary hover:cursor-pointer"
              >
                {Icon && <Icon className="size-4 group-hover:text-primary" />}
                <p className="group-hover:text-primary">{label}</p>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="absolute bottom-5 left-12 hover:cursor-pointer z-20">
        <SelectOptions
          options={ACTION_OPTIONS}
          value={docsInput}
          onValueChange={(value) => {
            setDocsInput(value);
            toast.success(JSON.stringify(docsInput));
          }}
          placeholder="Tailor Resume"
          triggerClassName={
            "w-full !h-7 border-2 border-primary/70 rounded-xl text-primary hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 [&_svg]:!text-primary  text-2xs"
          }
          contentClassName="text-xs"
        />
      </div>
      <div className="relative shadow-blue-200 border-blue-500 rounded-2xl border-r shadow-xl h-34 pointer-events-none">
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
                      className="w-full outline-none focus:outline-none focus:border-none p-2 resize-none pl-4 pt-2 border-none placeholder:font-medium focus-visible:border-none h-26"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
      <button className="absolute rounded-full bottom-5 right-3 border-blue-500 border p-1 hover:cursor-pointer z-20">
        <ArrowUp className="text-blue-400 size-4" />
      </button>
    </div>
  );
});

TailorResumeInput.displayName = "TailorResumeInput";
