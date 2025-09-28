"use client";
import { ArrowUp, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useAuth } from "@/hooks/use-auth";
import { IUser } from "@/types";
import { DataTable } from "./components/dashboard-datatable";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const FORM_SCHEMA = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
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

const TAB_ITEMS = [
  {
    title: "AI Apply",
    icon: "/white-ai-apply.svg",
    value: "ai-apply",
  },
  {
    title: "Tailor Cv",
    icon: "/dashboard-tailor.svg",
    value: "tailor-cv",
  },
  {
    title: "Find Jobs",
    icon: "/findJob.svg",
    value: "find-jobs",
  },
] as const;

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
    value: string;
    onValueChange: (value: string) => void;
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
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
            >
              <div className="flex items-center gap-3 w-full">
                <img src={option.icon} alt={option.value} loading="lazy" />
                <span className="text-gray-900 font-medium">
                  {option.label}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
);

SelectOptions.displayName = "SelectOptions";

const RecentActivityCard = memo(
  ({ item, index }: { item: any; index: number }) => {
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
                {badgeIndex === 0 && (
                  <div className="bg-slate-500 w-[1px] h-7" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

RecentActivityCard.displayName = "RecentActivityCard";

interface DashboardClientProps {
  initialUser: Partial<IUser>;
}

export const DashboardClient = memo(({ initialUser }: DashboardClientProps) => {
  const [profileInput, setProfileInput] =
    useState<ActionValue>("select-profile");
  const [docsInput, setDocsInput] = useState<ActionValue>("tailor-resume");
  const [isOpen, setIsOpen] = useState(false);
  const [actionToggle, setActionToggle] = useState(false);
  const [hasTextValue, setHasTextValue] = useState(false);

  // Use ref to track current value without causing re-renders
  const textareaValueRef = useRef<string>("");

  const { user: dbUser, isLoading } = useAuth();

  const form = useForm<z.infer<typeof FORM_SCHEMA>>({
    resolver: zodResolver(FORM_SCHEMA),
    defaultValues: {
      username: "",
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
      toast.success(JSON.stringify({ profileInput, docsInput, data }, null, 2));
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
    <>
      <div
        className="absolute w-full h-64 top-0 pointer-events-none"
        style={{
          background: "url('/dashboard-gradient.svg')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      />

      <Tabs defaultValue="ai-apply" className="gap-y-13 w-full p-4">
        <TabsList className="gap-3 justify-center bg-transparent flex flex-row w-full mt-24">
          {TAB_ITEMS.map((item) => (
            <TabsTrigger
              key={item.value}
              className={cn(
                "data-[state=active]:bg-primary data-[state=active]:hover:shadow-sm data-[state=active]:shadow-md data-[state=active]:hover:bg-blue-400 data-[state=active]:text-white h-[3.4rem] xs5:max-w-[7.833rem] shadow-md hover:shadow-sm hover:cursor-pointer shadow-blue-200 flex-1 items-center justify-center xs5:gap-3 rounded-2xl border border-white px-3 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&[data-state=active]_img]:invert [&[data-state=active]_img]:brightness-200"
              )}
              value={item.value}
            >
              <img
                src={item.icon}
                alt={item.title}
                className="max-xs3:size-3.5"
                loading="lazy"
              />
              <span className="max-xs2:text-[0.7rem]">{item.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <h1 className="font-instrument text-3xl text-center tracking-tighter">
          AI Assist to Apply
        </h1>

        <TabsContent value="ai-apply" className="grid gap-y-16">
          <div className="!relative h-36">
            {/* Profile selector */}
            <div
              className={cn(
                !isOpen &&
                  "border-blue-500 border-[1px] w-fit rounded-full p-1",
                "absolute bottom-3 left-3 hover:cursor-pointer z-50"
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
                    name="username"
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
                      "absolute bottom-2 right-3 hover:cursor-pointer shrink-0", !hasTextValue && "hidden"
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
                "absolute bottom-4 hover:cursor-pointer",
                hasTextValue ? "right-11" : "right-3"
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
                <RecentActivityCard key={item.id} item={item} index={item.id} />
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="password">password</TabsContent>
      </Tabs>
    </>
  );
});

DashboardClient.displayName = "DashboardClient";
// const FormSchema = z.object({
//   username: z.string().min(2, {
//     message: "Username must be at least 2 characters.",
//   }),
// });

// interface ProfileOption {
//   value: string;
//   label: string;
//   icon: string;
// }
// type ActionValue =
//   | "select-profile"
//   | "upload-file"
//   | "upload-photo"
//   | "tailor-resume"
//   | "tailor-cover-letter"
//   | "generate-interview-questions";

// const profileOptions: ProfileOption[] = [
//   {
//     value: "select-profile",
//     label: "Select Profile",
//     icon: "/select-profile.svg",
//   },
//   {
//     value: "upload-file",
//     label: "Upload file or link",
//     icon: "/upload-dashboard.svg",
//   },
//   {
//     value: "upload-photo",
//     label: "Upload photo",
//     icon: "/camera.svg",
//   },
// ];
// const actionOptions: ProfileOption[] = [
//   {
//     value: "tailor-resume",
//     label: "Tailor Resume",
//     icon: "/tailor-resume.svg",
//   },
//   {
//     value: "tailor-cover-letter",
//     label: "Tailor Cover Letter",
//     icon: "/tailor-letter.svg",
//   },
//   {
//     value: "generate-interview-questions",
//     label: "Generate Interview Questions",
//     icon: "/tailor-question.svg",
//   },
// ];
// const data = [
//   {
//     id: 1,
//     jobTitle: "Product Management",
//     applicationDate: "July 15, 2026 12:49pm",
//     applicationMethod: ["Form", "Email"],
//     action: "Show Details",
//   },
//   {
//     id: 2,
//     jobTitle: "Product Management",
//     applicationDate: "July 15, 2026 12:49pm",
//     applicationMethod: ["Form", "Email"],
//     action: "Show Details",
//   },
//   {
//     id: 3,
//     jobTitle: "Product Management",
//     applicationDate: "July 15, 2026 12:49pm",
//     applicationMethod: ["Form", "Email"],
//     action: "Show Details",
//   },
//   {
//     id: 4,
//     jobTitle: "Product Management",
//     applicationDate: "July 15, 2026 12:49pm",
//     applicationMethod: ["Form", "Email"],
//     action: "Show Details",
//   },
//   {
//     id: 5,
//     jobTitle: "Product Management",
//     applicationDate: "July 15, 2026 12:49pm",
//     applicationMethod: ["Form", "Email"],
//     action: "Show Details",
//   },
// ];

// const tabItem = [
//   {
//     title: "AI Apply",
//     icon: "/white-ai-apply.svg",
//     value: "ai-apply",
//   },
//   {
//     title: "Tailor Cv",
//     icon: "/dashboard-tailor.svg",
//     value: "tailor-cv",
//   },
//   {
//     title: "Find Jobs",
//     icon: "/findJob.svg",
//     value: "find-jobs",
//   },
// ];

// export const DashboardClient = ({
//   initialUser,
// }: {
//   initialUser: Partial<IUser>;
// }) => {
//   const [profileInput, setProfileInput] = useState("select-profile");
//   const [docsInput, setDocsInput] = useState("tailor-resume");
//   const { user: dbUser, isLoading } = useAuth();
//   // console.log("INITIAL USER : ", initialUser);
//   console.log(dbUser, initialUser, isLoading);
//   const [isOpen, setIsOpen] = useState(false);
//   const [actionToggle, setActionToggle] = useState(false);
//   // const handleOptionSelect = (value: ActionValue) => {
//   //   setUserInput(value)
//   //   switch (value) {
//   //     case "select-profile":
//   //       toast.success(value);
//   //       break;
//   //     case "upload-file":
//   //       toast.success(value);
//   //       break;
//   //     case "upload-photo":
//   //       toast.success(value);
//   //       break;
//   //     case "tailor-resume":
//   //       toast.success(value);
//   //       break;
//   //     case "tailor-cover-letter":
//   //       toast.success(value);
//   //       break;
//   //     case "generate-interview-questions":
//   //       toast.success(value);
//   //   }
//   //   console.log("Clicked:", value);
//   // };

//   const actionSelectOptions = () => {
//     return (
//       <div className="w-full max-w-md mx-auto">
//         <Select value={docsInput} onValueChange={setDocsInput}>
//           <SelectTrigger className="w-full !h-8 px-4 border-2 border-primary/70 rounded-full text-cverai-blue bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 [&_svg]:!text-primary">
//             <SelectValue placeholder="Tailor Resume" />
//           </SelectTrigger>
//           <SelectContent className="w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
//             {actionOptions.map((option) => (
//               <SelectItem
//                 key={option.value}
//                 value={option.value}
//                 className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
//               >
//                 <div className="flex items-center gap-3 w-full">
//                   <img src={option.icon} alt={option.value} />

//                   <span className="text-gray-900 font-medium">
//                     {option.label}
//                   </span>
//                 </div>
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//     );
//   };
//   const profileSelectOptions = () => {
//     return (
//       <div className="w-full max-w-md mx-auto">
//         <Select value={profileInput} onValueChange={setProfileInput}>
//           <SelectTrigger className="w-full h-12 px-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
//             <SelectValue placeholder="Select Profile" />
//           </SelectTrigger>
//           <SelectContent className="w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
//             {profileOptions.map((option) => (
//               <SelectItem
//                 key={option.value}
//                 value={option.value}
//                 className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
//               >
//                 <div className="flex items-center gap-3 w-full">
//                   <img src={option.icon} alt={option.value} />

//                   <span className="text-gray-900 font-medium">
//                     {option.label}
//                   </span>
//                 </div>
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//     );
//   };

//   const handleEnterKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
//     if (event.key === "Enter" && !event.shiftKey) {
//       // Prevent default behavior (new line)
//       event.preventDefault();

//       // Your custom logic here
//       console.log("Enter key pressed!");
//       console.log("Textarea value:", event.currentTarget.value);

//       // Example: Clear the textarea after processing
//       // event.target.value = '';

//       // Example: Call another function
//       // processInput(event.target.value);
//     }
//   };
//   const form = useForm<z.infer<typeof FormSchema>>({
//     resolver: zodResolver(FormSchema),
//     defaultValues: {
//       username: "",
//     },
//   });
//   function onSubmit(data: z.infer<typeof FormSchema>) {
//     toast.success(JSON.stringify({ profileInput, docsInput, data }, null, 2));
//   }

//   const checkHasValue = () => {
//     const currentValue = form.getValues("username");
//     return currentValue.trim().length > 0;
//   };
//   return (
//     <>
//       <div
//         className="absolute w-full h-64 top-0 pointer-events-none"
//         style={{
//           background: "url('/dashboard-gradient.svg')",
//           backgroundRepeat: "no-repeat",
//           backgroundSize: "cover",
//           backgroundPosition: "center center",
//         }}
//       ></div>
//       {JSON.stringify(checkHasValue())}
//       {JSON.stringify(form.getValues("username"))}
//       <Tabs defaultValue="ai-apply" className="gap-y-13 w-full p-4 ">
//         <TabsList className="gap-3 justify-center bg-transparent flex flex-row w-full mt-24">
//           {tabItem.map((item) => (
//             <TabsTrigger
//               key={item.value}
//               className={cn(
//                 "data-[state=active]:bg-primary data-[state=active]:hover:shadow-sm data-[state=active]:shadow-md data-[state=active]:hover:bg-blue-400 data-[state=active]:text-white h-[3.4rem] xs5:max-w-[7.833rem] shadow-md hover:shadow-sm hover:cursor-pointer shadow-blue-200 flex-1 items-center justify-center xs5:gap-3 rounded-2xl border border-white px-3 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&[data-state=active]_img]:invert [&[data-state=active]_img]:brightness-200 "
//               )}
//               value={item.value}
//             >
//               <img
//                 src={item.icon}
//                 alt={item.title}
//                 className="max-xs3:size-3.5"
//               />
//               <span className="max-xs2:text-[0.7rem]">{item.title}</span>
//             </TabsTrigger>
//           ))}
//         </TabsList>
//         <h1 className="font-instrument text-3xl text-center tracking-tighter">
//           AI Assist to Appy
//         </h1>
//         <TabsContent value="ai-apply" className="grid gap-y-16 bg-">
//           <div className="!relative h-36">
//             <div
//               className={cn(
//                 !isOpen &&
//                   "border-blue-500 border-[1px] w-fit rounded-full p-1 ",
//                 "absolute bottom-3 left-3 hover:cursor-pointer z-50"
//               )}
//             >
//               {!isOpen && (
//                 <Plus
//                   className=" text-blue-400 size-3"
//                   onClick={() => setIsOpen(!isOpen)}
//                 />
//               )}
//               {isOpen && profileSelectOptions()}
//             </div>
//             <div className="relative shadow-blue-200 border-blue-500 rounded-2xl border-r shadow-xl h-34">
//               <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
//                   <FormField
//                     control={form.control}
//                     name="username"
//                     render={({ field }) => (
//                       <FormItem className=" w-full">
//                         <FormControl>
//                           <textarea
//                             placeholder="Let's get started"
//                             onKeyDown={(e) => handleEnterKey(e)}
//                             className="w-full outline-none focus:outline-none focus:border-none p-2 resize-none pl-4 pt-2 border-none placeholder:font-medium focus-visible:border-none h-26"
//                             onFocus={() => {
//                               setIsOpen(false);
//                               setActionToggle(false);
//                             }}
//                             {...field}
//                           ></textarea>
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <Button
//                     type="submit"
//                     variant={"outline"}
//                     className={cn(
//                       !actionToggle &&
//                         "border-blue-500 border-[1px] w-fit rounded-full !p-1",
//                       "absolute bottom-3 right-3 hover:cursor-pointer"
//                     )}
//                   >
//                     <RiAiGenerate />
//                   </Button>
//                 </form>
//               </Form>
//             </div>

//             <div
//               className={cn(
//                 !actionToggle &&
//                   "border-blue-500 border-[1px] w-fit rounded-full p-1 ",
//                 "absolute bottom-4 hover:cursor-pointer",
//                 checkHasValue() ? "right-3" : "right-20"
//               )}
//             >
//               {!actionToggle && (
//                 <ArrowUp
//                   className=" text-blue-400 size-3 "
//                   onClick={() => setActionToggle(!actionToggle)}
//                 />
//               )}
//               {actionToggle && actionSelectOptions()}
//             </div>
//           </div>{" "}

//           <DataTable data={data} />
//           <Card className="p-4 sm:p-7 gap-4">
//             <h1 className="font-bold text-xl ">Recent Activity</h1>
//             <div className="grid sm:grid-cols-2 gap-y-4 sm:gap-y-8 gap-x-13">
//               {Array.from({ length: 6 }).map((_) => (
//                 <div className="flex bg-slate-50 p-4 sm:p-6 rounded-xl gap-4 sm:gap-6 border border-[#cbd5e1]">
//                   <div className="shrink-0">
//                     <img src="./company.svg" alt="" />
//                   </div>
//                   <div className="flex flex-col gap-2">
//                     <h1 className="font-inter">Social Media Assistant</h1>
//                     <p className="font-poppins text-cverai-brown text-xs">
//                       Nomad ·{" "}
//                       <span className="font-inter">$2,000-5,000 / Monthly</span>
//                     </p>
//                     <div className="flex flex-wrap gap-2">
//                       {["Full-Time", "Lagos, Nigeria", "92% match"].map(
//                         (item, index) => (
//                           <>
//                             <Badge
//                               className={cn(
//                                 "rounded-full font-epilogue font-semibold",
//                                 index === 0
//                                   ? "bg-cverai-teal/10 text-cverai-teal"
//                                   : index === 1
//                                   ? "text-cverai-blue border-cverai-blue bg-white"
//                                   : "text-cverai-orange border-cverai-orange bg-white"
//                               )}
//                             >
//                               {item}
//                             </Badge>
//                             {index === 0 && (
//                               <div className="bg-slate-500 w-[1px] h-7" />
//                             )}
//                           </>
//                         )
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </Card>
//         </TabsContent>
//         <TabsContent value="password">passowrd</TabsContent>
//       </Tabs>
//     </>
//   );
// };
