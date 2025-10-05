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