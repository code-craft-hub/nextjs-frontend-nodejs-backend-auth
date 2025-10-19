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
  JOB_APPLICATION: "job_application",
  INTERVIEW_QUESTION: "interview_question",
  AI_APPLY: "ai_apply",
};
