import { IUser } from "@/types";

export interface ProfileOption {
  value: string;
  label: string;
  icon: string;
}

export type ActionValue =
  | "select-profile"
  | "upload-file"
  | "upload-photo"
  | "tailor-resume"
  | "tailor-cover-letter"
  | "generate-interview-questions";

export const PROFILE_OPTIONS: readonly ProfileOption[] = [
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

export const ACTION_OPTIONS: readonly ProfileOption[] = [
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

export const MOCK_DATA_TAILOR_RESUME = [
  {
    id: 1,
    jobTitle: "Product Management",
    applicationDate: "July 15, 2026 12:49pm",
    applicationMethod: [
      {
        value: "resume",
        title: "Resume",
      },
    ],
    action: "Show Details",
  },
  {
    id: 2,
    jobTitle: "Product Management",
    applicationDate: "July 15, 2026 12:49pm",
    applicationMethod: [
      {
        value: "cover-letter",
        title: "Cover letter",
      },
    ],
    action: "Show Details",
  },
  {
    id: 3,
    jobTitle: "Product Management",
    applicationDate: "July 15, 2026 12:49pm",
    applicationMethod: [
      {
        value: "interview-question",
        title: "Interview Question",
      },
    ],
    action: "Show Details",
  },
  {
    id: 4,
    jobTitle: "Product Management",
    applicationDate: "July 15, 2026 12:49pm",
    applicationMethod: [
      {
        value: "resume",
        title: "Resume",
      },
    ],
    action: "Show Details",
  },
  {
    id: 5,
    jobTitle: "Product Management",
    applicationDate: "July 15, 2026 12:49pm",
    applicationMethod: [
      {
        value: "cover-letter",
        title: "Cover letter",
      },
    ],
    action: "Show Details",
  },
];

export const MOCK_DATA = [
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

export interface OnboardingFormProps {
  onNext: () => void;
  onPrev: () => void;
  initialUser: Partial<IUser>;
  children?: React.ReactNode;
}
