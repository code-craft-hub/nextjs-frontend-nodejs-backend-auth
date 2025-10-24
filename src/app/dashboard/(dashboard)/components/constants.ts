
import SelectProfileIcon from "@/components/icons/SelectProfileIcon";
import CameraIcon from "@/components/icons/cameraIcon";
import TailorCoverLetterIcon from "@/components/icons/TailorCoverLetterIcon";
import TailorInterviewQuestionIcon from "@/components/icons/TailorInterviewQuestionIcon";
import TailorResumeIcon from "@/components/icons/TailorResumeIcon";
import { IUser } from "@/types";
import UploadCloudIcon from "@/components/icons/UploadCloudIcon";

export interface ProfileOption {
  value: string;
  label: string;
  image?: string;
  icon?: React.ComponentType<{ className: string }>;
}

export type ActionValue =
  | "select-profile"
  | "upload-file"
  | "upload-photo"
  | "tailor-resume"
  | "tailor-cover-letter"
  | "tailor-interview-question";


  
  export const PROFILE_OPTIONS: readonly ProfileOption[] = [
    {
      value: "select-profile",
      label: "Select Profile",
      icon: SelectProfileIcon,
    },
    {
      value: "upload",
      label: "Upload file or link",
      icon: UploadCloudIcon,
    },
    {
      value: "upload-photo",
      label: "Upload image",
      icon: CameraIcon,
    },
  ] as const;

export const ACTION_OPTIONS: readonly ProfileOption[] = [
  {
    value: "tailor-resume",
    label: "Tailor Resume",
    icon: TailorResumeIcon,
  },
  {
    value: "tailor-cover-letter",
    label: "Tailor Cover Letter",
    icon: TailorCoverLetterIcon,
  },
  {
    value: "tailor-interview-question",
    label: "Generate Interview Questions",
    icon: TailorInterviewQuestionIcon,
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
