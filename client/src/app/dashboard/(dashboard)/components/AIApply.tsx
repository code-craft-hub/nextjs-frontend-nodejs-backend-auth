"use client";
import { InitialUser, IUser } from "@/types";

import { ArrowUp, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiAiGenerate } from "react-icons/ri";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { DataTable } from "../../components/dashboard-datatable";

const FORM_SCHEMA = z.object({
  jobDescription: z.string().min(2, {
    message: "job description must be at least 2 characters.",
  }),
});

interface ProfileOption {
  value: string;
  label: string;
  icon: string;
}

type ActionValue =
  | "select-profile"
  | "upload-file"
  | "upload-photo"
  | "tailor-resume"
  | "tailor-cover-letter"
  | "generate-interview-questions";

const PROFILE_OPTIONS: readonly ProfileOption[] = [
  {
    value: "select-profile",
    label: "Select Profile",
    icon: "/select-profile.svg",
  },
  {
    value: "upload-file",
    label: "Upload file or link",
    icon: "/upload-dashboard.svg",
  },
  {
    value: "upload-photo",
    label: "Upload photo",
    icon: "/camera.svg",
  },
] as const;

const ACTION_OPTIONS: readonly ProfileOption[] = [
  {
    value: "tailor-resume",
    label: "Tailor Resume",
    icon: "/tailor-resume.svg",
  },
  {
    value: "tailor-cover-letter",
    label: "Tailor Cover Letter",
    icon: "/tailor-letter.svg",
  },
  {
    value: "generate-interview-questions",
    label: "Generate Interview Questions",
    icon: "/tailor-question.svg",
  },
] as const;

const MOCK_DATA = [
  {
    id: 1,
    jobTitle: "Product Management",
    applicationDate: "July 15, 2026 12:49pm",
    applicationMethod: ["Form", "Email"],
    action: "Show Details",
  },
  {
    id: 2,
    jobTitle: "Product Management",
    applicationDate: "July 15, 2026 12:49pm",
    applicationMethod: ["Form", "Email"],
    action: "Show Details",
  },
  {
    id: 3,
    jobTitle: "Product Management",
    applicationDate: "July 15, 2026 12:49pm",
    applicationMethod: ["Form", "Email"],
    action: "Show Details",
  },
  {
    id: 4,
    jobTitle: "Product Management",
    applicationDate: "July 15, 2026 12:49pm",
    applicationMethod: ["Form", "Email"],
    action: "Show Details",
  },
  {
    id: 5,
    jobTitle: "Product Management",
    applicationDate: "July 15, 2026 12:49pm",
    applicationMethod: ["Form", "Email"],
    action: "Show Details",
  },
];


const SelectOptions = memo(
  ({
    options,
    value,
    onValueChange,
    placeholder,
    className = "",
    triggerClassName = "",
  }: {
    options: readonly ProfileOption[];
    value: ActionValue;
    onValueChange: (value: ActionValue) => void;
    placeholder: string;
    className?: string;
    triggerClassName?: string;
  }) => (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={cn("w-full", triggerClassName)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
          {options.map(({ value, label, icon }) => (
            <SelectItem
              key={value}
              value={value}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
            >
              <div className="flex items-center gap-3 w-full">
                <img src={icon} alt={value} loading="lazy" />
                {/* {icon} */}
                {/* <Icon /> */}
                <span className="text-gray-900 font-medium">{label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
);

SelectOptions.displayName = "SelectOptions";

const RecentActivityCard = memo(() => {
  const badgeData = useMemo(
    () => [
      { text: "Full-Time", variant: "teal" as const },
      { text: "Lagos, Nigeria", variant: "blue" as const },
      { text: "92% match", variant: "orange" as const },
    ],
    []
  );

  return (
    <div className="flex bg-slate-50 p-4 sm:p-6 rounded-xl gap-4 sm:gap-6 border border-[#cbd5e1]">
      <div className="shrink-0">
        <img src="./company.svg" alt="" loading="lazy" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-inter">Social Media Assistant</h1>
        <p className="font-poppins text-cverai-brown text-xs">
          Nomad · <span className="font-inter">$2,000-5,000 / Monthly</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {badgeData.map((badge, badgeIndex) => (
            <div key={badgeIndex} className="flex items-center gap-2">
              <Badge
                className={cn(
                  "rounded-full font-epilogue font-semibold",
                  badge.variant === "teal"
                    ? "bg-cverai-teal/10 text-cverai-teal"
                    : badge.variant === "blue"
                    ? "text-cverai-blue border-cverai-blue bg-white"
                    : "text-cverai-orange border-cverai-orange bg-white"
                )}
              >
                {badge.text}
              </Badge>
              {badgeIndex === 0 && <div className="bg-slate-500 w-[1px] h-7" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

RecentActivityCard.displayName = "RecentActivityCard";
export interface OnboardingFormProps {
  onNext: () => void;
  onPrev: () => void;
  initialUser: Partial<IUser>;
  children?: React.ReactNode;
}

export const AIApply = memo(
  ({ initialUser }: InitialUser) => {
    
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
        toast.success(
          JSON.stringify({ profileInput, docsInput, data }, null, 2)
        );
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
       
        className="flex flex-col font-poppins relative"
      >
        <h1 className="font-instrument text-3xl text-center tracking-tighter mb-12">
          AI Assist to Apply
        </h1>

        <div className="grid gap-y-16">
          <div className="!relative h-36">
            {/* Profile selector */}
            <div
              className={cn(
                !isOpen &&
                  "border-blue-500 border-[1px] w-fit rounded-full p-1",
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
          <DataTable data={MOCK_DATA} />
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
  }
);

AIApply.displayName = "AIApply";
