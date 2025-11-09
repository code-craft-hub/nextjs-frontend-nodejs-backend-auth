import { randomNumber } from "./helpers";

export const contextUser = {
  uid: "",
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  photoURL: "",
  resumeSample: "",
};

export const leftMenuItems = [
  {
    id: "overview",
    label: "Overview",
    icon: "/overview.svg",
    url: `/dashboard/jobs`,
    isActive: true,
  },
  {
    id: "ai-recommendations",
    label: "AI Recommendations",
    icon: "/ai-recommendation.svg",
    url: `/dashboard/jobs/category?tab=ai-recommendations`,
  },
  {
    id: "saved-jobs",
    label: "Saved Jobs",
    icon: "/saved-job.svg",
    url: `/dashboard/jobs/category?tab=saved-jobs`,
  },
  {
    id: "application-history",
    label: "Application history",
    icon: "/application-history.svg",
    url: `/dashboard/jobs/category?tab=application-history`,
  },
];

export const onBoardingTabs = [
  {
    title: "Basic Information",
    url: "",
    key: "basic-information",
  },
  {
    title: "CV Handling",
    url: "",
    active: false,
    key: "cv-handling",
  },
  {
    title: "Job Preference",
    url: "",
    key: "job-preference",
  },
  {
    title: "Identify Challenges",
    url: "",
    key: "identify-challenges",
  },
];

export type TOnboardingTab = (typeof onBoardingTabs)[number];

export const COLLECTIONS = {
  USERS: "users",
  RESUME: "resume",
  COVER_LETTER: "cover_letter",
  JOBS: "jobs",
  INTERVIEW_QUESTION: "interview_question",
  AI_APPLY: "ai_apply",
};

export const customStyles = {
  control: (base: any) => ({
    ...base,
    minHeight: "20px",
    borderRadius: "10px",
    border: "2px solid #4680EE",
    backgroundColor: "white",
    // boxShadow:
    //   "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    padding: "2px 0px",
    fontSize: "16px",
    // transition: "all 0.3s ease",
    // "&:hover": {
    //   border: "2px solid #3b82f6",
    //   boxShadow:
    //     "0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -2px rgba(59, 130, 246, 0.1)",
    // },
    // "&:focus-within": {
    //   border: "2px solid #3b82f6",
    //   boxShadow: "0 0 0 4px rgba(59, 130, 246, 0.1)",
    // },
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: "#4680EE",
    borderRadius: "12px",
    padding: "2px 8px",
    margin: "4px",
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "500",
    padding: "2px 6px",
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: "#ffffff",
    borderRadius: "0 10px 10px 0",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#4680EE",
      color: "#ffffff",
    },
  }),
  input: (base: any) => ({
    ...base,
    color: "#1f2937",
    fontSize: "16px",
  }),
  placeholder: (base: any) => ({
    ...base,
    color: "#9ca3af",
    fontSize: "16px",
  }),
  clearIndicator: (base: any) => ({
    ...base,
    color: "#6b7280",
    padding: "8px",
    cursor: "pointer",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    "&:hover": {
      color: "#ef4444",
      backgroundColor: "#fee2e2",
    },
  }),
};

export const menuItems = [
  {
    id: "ai-recommendations",
    count: randomNumber(10),
    label: "AI Recommendations",
    icon: "/bell.svg",
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
    countColor: "text-green-800",
    labelColor: "text-green-700",
    url: "/dashboard/jobs/category?tab=ai-recommendations",
  },
  {
    id: "saved-jobs",
    count: "0",
    label: "Saved Jobs",
    icon: "/save.svg",
    bgColor: "bg-yellow-100",
    iconColor: "text-yellow-600",
    countColor: "text-yellow-800",
    labelColor: "text-yellow-700",
    url: "/dashboard/jobs/category?tab=saved-jobs",
  },
  {
    id: "application-history",
    count: "0",
    label: "Application history",
    icon: "/briefcase-dasboard.svg",
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
    countColor: "text-blue-800",
    labelColor: "text-blue-700",
    url: "/dashboard/jobs/category?tab=application-history",
  },
];


export const jobExamples = [
  "Software Engineer",
  "Data Scientist",
  "Product Manager",
  "Nurse",
  "Marketing Specialist",
  "Sales Manager",
  "Graphic Designer",
  "Financial Analyst",
];

// Array of color variants for badges
export const badgeColors = [
  "bg-blue-50 text-blue-500 border-blue-300",
  "bg-green-50 text-green-500 border-green-300",
  "bg-purple-50 text-purple-500 border-purple-300",
  "bg-pink-50 text-pink-500 border-pink-300",
  "bg-yellow-50 text-yellow-500 border-yellow-300",
  "bg-indigo-50 text-indigo-500 border-indigo-300",
  "bg-red-50 text-red-500 border-red-300",
  "bg-orange-50 text-orange-500 border-orange-300",
  "bg-teal-50 text-teal-500 border-teal-300",
  "bg-cyan-50 text-cyan-500 border-cyan-300",
  "bg-lime-50 text-lime-500 border-lime-300",
  "bg-emerald-50 text-emerald-500 border-emerald-300",
  "bg-violet-50 text-violet-500 border-violet-300",
  "bg-fuchsia-50 text-fuchsia-500 border-fuchsia-300",
  "bg-rose-50 text-rose-500 border-rose-300",
];