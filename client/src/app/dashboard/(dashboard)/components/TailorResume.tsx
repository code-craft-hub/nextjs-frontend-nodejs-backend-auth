"use client";
import { InitialUser } from "@/types";

import { ArrowUp, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { RiAiGenerate } from "react-icons/ri";

import {
  KeyboardEvent,
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
// import { useAuth } from "@/hooks/use-auth";

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
import { useRouter } from "next/navigation";
import { SelectOptions } from "./SelectOptions";
import { RecentActivityCard } from "./RecentActivityCard";
import { ACTION_OPTIONS, ActionValue, MOCK_DATA_TAILOR_RESUME, PROFILE_OPTIONS } from "./constants";
import { TailorResumeDatatable } from "./TailorResumeDatatable";

const FORM_SCHEMA = z.object({
  jobDescription: z.string().min(2, {
    message: "job description must be at least 2 characters.",
  }),
});

export const TailorResume = memo(({ initialUser }: InitialUser) => {
  console.log(initialUser);
  const [profileInput, setProfileInput] =
    useState<ActionValue>("select-profile");
  const router = useRouter();
  const [docsInput, setDocsInput] = useState<ActionValue>("tailor-resume");
  const [isOpen, setIsOpen] = useState(false);
  const [actionToggle, setActionToggle] = useState(false);
  const [hasTextValue, setHasTextValue] = useState(false);

  // Use ref to track current value without causing re-renders
  const textareaValueRef = useRef<string>("");

  // const { user: dbUser, isLoading } = useAuth();

  const form = useForm<z.infer<typeof FORM_SCHEMA>>({
    resolver: zodResolver(FORM_SCHEMA),
    defaultValues: {
      jobDescription: "",
    },
  });

  // Optimized callbacks with useCallback
  const handleEnterKey = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        console.log("Enter key pressed!");
        console.log("Textarea value:", event.currentTarget.value);
      }
    },
    []
  );

  const onSubmit = useCallback(
    (data: z.infer<typeof FORM_SCHEMA>) => {
      const params = new URLSearchParams();
      params.set("jobDescription", JSON.stringify(data));
      toast.success(JSON.stringify({ profileInput, docsInput, data }, null, 2));
      if (docsInput === "tailor-resume") {
        router.push(`/dashboard/resumes?${params}`);
      } else if (docsInput === "tailor-cover-letter") {
        router.push("");
      }
    },
    [profileInput, docsInput]
  );

  // Handle text input changes without form re-renders
  const handleTextareaChange = useCallback(
    (value: string) => {
      textareaValueRef.current = value;
      const newHasValue = value.trim().length > 0;

      // Only update state if the empty/non-empty status changes
      if (newHasValue !== hasTextValue) {
        setHasTextValue(newHasValue);
      }
    },
    [hasTextValue]
  );

  const handleFocus = useCallback(() => {
    setIsOpen(false);
    setActionToggle(false);
  }, []);

  const handleOpenToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleActionToggle = useCallback(() => {
    setActionToggle((prev) => !prev);
  }, []);

  const recentActivityItems = useMemo(
    () => Array.from({ length: 6 }, (_, index) => ({ id: index })),
    []
  );

  return (
    <div
   
      className="flex flex-col font-poppins h-screen relative"
    >
      <h1 className="font-instrument text-3xl text-center tracking-tighter mb-12">
        AI Job Document Customization
      </h1>

      <div className="grid gap-y-16">
        <div className="!relative h-36">
          <div
            className={cn(
              !isOpen && "border-blue-500 border-[1px] w-fit rounded-full p-1",
              "absolute left-3 hover:cursor-pointer z-50",
              isOpen ? "bottom-5" : "bottom-4"
            )}
          >
            {!isOpen && (
              <Plus
                className="text-blue-400 size-3"
                onClick={handleOpenToggle}
              />
            )}
            {isOpen && (
              <SelectOptions
                options={PROFILE_OPTIONS}
                value={profileInput}
                onValueChange={setProfileInput}
                placeholder="Select Profile"
                triggerClassName={
                  "w-full !h-8 px-4 border-2 border-primary/70 rounded-full text-cverai-blue bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 [&_svg]:!text-primary"
                }
              />
            )}
          </div>

          {/* Main form area */}
          <div className="relative shadow-blue-200 border-blue-500 rounded-2xl border-r shadow-xl h-34">
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
                          onKeyDown={handleEnterKey}
                          className="w-full outline-none focus:outline-none focus:border-none p-2 resize-none pl-4 pt-2 border-none placeholder:font-medium focus-visible:border-none h-26"
                          onFocus={handleFocus}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e); // Keep react-hook-form in sync
                            handleTextareaChange(e.target.value); // Track empty/non-empty state
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <button
                  type="submit"
                  className={cn(
                    !actionToggle &&
                      "border-blue-500 border-[1px] w-fit rounded-full p-1",
                    "absolute bottom-2 right-3 hover:cursor-pointer shrink-0",
                    !hasTextValue && "hidden"
                  )}
                >
                  <RiAiGenerate className="text-blue-400 size-3" />
                </button>
              </form>
            </Form>
          </div>

          {/* Action selector */}
          <div
            className={cn(
              !actionToggle &&
                "border-blue-500 border-[1px] w-fit rounded-full p-1 ",
              "absolute  hover:cursor-pointer",
              hasTextValue ? "right-11" : "right-3",
              actionToggle ? "bottom-5" : "bottom-4"
            )}
          >
            {!actionToggle && (
              <ArrowUp
                className="text-blue-400 size-3"
                onClick={handleActionToggle}
              />
            )}
            {actionToggle && (
              <SelectOptions
                options={ACTION_OPTIONS}
                value={docsInput}
                onValueChange={setDocsInput}
                placeholder="Tailor Resume"
                triggerClassName={
                  "w-full !h-8 px-4 border-2 border-primary/70 rounded-full text-cverai-blue bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 [&_svg]:!text-primary"
                }
              />
            )}
          </div>
        </div>
        <TailorResumeDatatable data={MOCK_DATA_TAILOR_RESUME} />
        <Card className="p-4 sm:p-7 gap-4">
          <h1 className="font-bold text-xl">Recent Activity</h1>
          <div className="grid sm:grid-cols-2 gap-y-4 sm:gap-y-8 gap-x-13">
            {recentActivityItems.map((item) => (
              <RecentActivityCard
                key={item.id}
                // item={item} index={item.id}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
});

TailorResume.displayName = "TailorResume";
