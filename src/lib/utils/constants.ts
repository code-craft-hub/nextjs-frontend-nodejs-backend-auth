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
    backgroundColor: "#F5F7FA",
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
