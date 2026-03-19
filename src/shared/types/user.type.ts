export interface FirestoreTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

export interface LabelValue {
  label: string;
  value: string;
}

export interface UserNeed {
  tailoringIssue: boolean;
  coverLetterIssue: boolean;
  aiJobIssue: boolean;
  jobTrackingIssue: boolean;
  findingJobIssue: boolean;
  aiPersonalizationIssue: boolean;
  others: string;
}

export interface Discovery {
  type: string;
  others: string;
}

export interface Education {
  educationId: string;
  degree: string;
  fieldOfStudy: string;
  schoolName: string;
  educationStart: string | null;
  educationEnd: string | null;
  schoolLocation: string | null;
}

export interface WorkExperience {
  workExperienceId: string;
  jobTitle: string;
  companyName: string;
  location: string | null;
  workDescription: string | null;
  jobStart: string;
  jobEnd: string;
  responsibilities: string[];
}

export interface Recommendation {
  jobId: string;
  score: number;
}

export interface JobPreferences {
  title: string;
  partTime: boolean;
  fullTime: boolean;
  intership: boolean;
  contract: boolean;
  hybrid: boolean;
  remote: boolean;
  onsite: boolean;
  jobLevelPreference: string;
  jobTypePreference: string;
  remoteWorkPreference: string;
  relocationWillingness: string;
  location: string;
  salaryExpectation: string;
  availabilityToStart: string;
  description: string;
}

export interface DataSource {
  id: string;
  profile: string;
  education: Education[];
  workExperience: WorkExperience[];
  certification: unknown[];
  project: unknown[];
  softSkill: LabelValue[];
  hardSkill: LabelValue[];
  rolesOfInterest: LabelValue[];
  extractedContent: string;

  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  gcsPath: string;
  uploadedAt: string;
  url: string;

  title: string;
  defaultDataSource: boolean;
  email: string;

}

export interface AiApplyPreferences {
  useMasterCV: boolean;
  autoSendApplications: boolean;
  enableAutoApply: boolean;
  generateTailoredCV: boolean;
  saveAsDrafts: boolean;
}

export interface Analytics {
  totalResumes: number;
  totalApplications: number;
  totalCoverLetters: number;
  totalInterviewQuestions: number;
}

export interface UserProfile {
  uid: string;
  id: string;

  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phoneNumber: string;

  address: string;
  country: string;
  state: string;
  countryCode: string;

  photoURL: string;
  firestoreProfileImage: string;

  userAPIkey: string;
  password: string;
  emailVerified: boolean;

  referralCode: string;
  referralCount: number;
  usersReferred: string[];

  isPro: boolean;
  credit: number;

  onboardingComplete: boolean;
  defaultDataSource: string;

  userNeed: UserNeed;
  discovery: Discovery;

  aiApplyPreferences: AiApplyPreferences;
  analytics: Analytics;

  dataSource: DataSource[];
  recommendationsData: Recommendation[];

  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  expiryTime: string;

  modifiedBy: string;
}