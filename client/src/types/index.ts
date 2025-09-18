export interface IUser {
  uid?: string;
  providerId?: string;
  emailVerified?: boolean;
  isAnonymous?: boolean;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  cvJobTitle?: string;
  cvTitle?: string;
  key?: string;
  address?: string;
  country?: string;
  state?: string;
  phoneNumber?: string;
  website?: string;
  portfolio?: string;
  email?: string;
  profile?: string;
  dataSource?: IDataSource[];
  credit?: number;
  maxCredit?: number;
  photoURL?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  softSkills?: ISkill[];
  hardSkills?: ISkill[];
  workExperiences?: IWorkExperience[];
  educations?: IEducation[];
}

export interface IResume {}
export interface ICoverLetter {}
export interface IInterviewQuestions {}

export interface IEducation {
  schoolName: string;
  schoolLocation: string;
  degree: string;
  fieldOfStudy: string;
  educationStart: string | Date;
  educationEnd: string | Date;
  acceptTerms: boolean;
  EduID?: string | number;
}

export interface IWorkExperience {
  jobTitle?: string;
  companyName?: string;
  location?: string;
  workDescription?: string;
  responsibilities?: string | string[];
  jobStart: string | Date;
  jobEnd: string | Date;
  workID?: string | number;
}

export interface ISkill {
  value: string;
  label: string;
}

export interface IDataSource  {
  data: string;
  key: string;
  genTableId: string;
};
// import { LucideIcon } from "lucide-react";
// import { IconType } from "react-icons";
// import { z } from "zod";
// import { User, Auth } from "firebase/auth";

// import {
//   userDetails,
//   profileDetails,
//   educationType,
//   experienceType,
//   SigninValidation,
//   SignupValidation,
// } from "@/lib/validation";
// import { _ToObjectUnit } from "luxon";

// export type ISkills = {
//   skills: {
//     skills: string;
//   }[];
// };
// export type ISocials = {
//   socials: {
//     socials: string;
//   }[];
// };
// export type IVoluteering = {
//   volunteering: {
//     volunteering: string;
//   }[];
// };
// export type ICertificates = {
//   certifications: {
//     certifications: string;
//   }[];
// };

// export type FirstSectionTypes = {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   address: string;
//   website: string;
//   Profile: string;
//   cvJobTitle: string;
// };

// export type IResumeSample = {
//   resumeSample: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   address: string;
//   website: string;
//   Profile: string;
//   cvJobTitle: string;
// };

// export type IWorkExperience = {
//   workExperiences: {
//     company: string;
//     jobTitle: string;
//     jobDescription: string;
//     jobStartDate: string;
//     jobEndDate: string;
//   }[];
// };
// export type IProject = {
//   projects: {
//     title: string;
//     description: string;
//     projectEndDate: Date;
//     projectStartDate: Date;
//   }[];
// };
// export type IEducation = {
//   educations: {
//     institution: string;
//     degree: string;
//     educationEndDate: string;
//     educationStartDate: string;
//   }[];
// };

// export type INavLink = {
//   imgURL: string;
//   route: string;
//   label: string;
// };

// export type IUpdateUser = {
//   // [key: string]: string;
//   email?: string;
//   firstName?: string;
//   lastName?: string;
//   phoneNumber?: string;
//   provider?: string;
//   address?: string;
//   state?: any;
//   country?: {
//     capital: string;
//     currency: string;
//     currency_name: string;
//     currency_symbol: string;
//     latitude: string;
//     longitude: string;
//     name: string;
//     phone_code: string;
//     region: string;
//     subregion: string;
//   };
// };
// export type IpassWordChange = {
//   confirmPassword: string;
//   newPassword: string;
//   currentPassword: string;
// };

// export type IUpdateUserProfile = {
//   [key: string]: string | string[] | any[];
//   email: string;
//   firstName: string;
//   lastName: string;
//   phoneNumber: string;
//   address: string;
//   website: string;
//   Profile: string;
//   cvJobTitle: string;
//   educations: any[];
//   socials: any[];
//   certifications: any[];
//   projects: any[];
//   volunteering: any[];
//   skills: any[];
//   workExperiences: any[];
// };

// export type IUser = {
//   id: string;
//   name: string;
//   username: string;
//   email: string;
//   imageUrl: string;
//   bio: string;
// };

// export type INewUser = {
//   email: string;
//   password: string;
// };

// export type UserDb = {
//   uid: string;
//   firstName: string | null;
//   lastName: string | null;
//   email: string | null;
//   phoneNumber: string | null;
//   photoURL: string | null;
//   resumeSample: string | null;
// };

// export type IContextType = {
//   sidebarExpand: boolean;
//   setSidebarExpand: React.Dispatch<React.SetStateAction<boolean>>;
//   contextUser: UserDb;
//   isLoading: boolean;
//   setContextUser: React.Dispatch<React.SetStateAction<UserDb>>;
//   isAuthenticated: boolean;
//   setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
//   checkAuthUser: () => Promise<boolean>;
//   auth: Auth;
//   authUser: User | null | undefined;
// };

// export type StoreUser = {
//   Profile: string;
//   address: string;
//   certifications: any[];
//   credit: number;
//   cvJobTitle: string;
//   educations: any[];
//   email: string;
//   firstName: string;
//   lastName: string;
//   maxCredit: number;
//   phoneNumber: string;
//   skills: any[];
//   website: string;
//   workExperiences: any[];
// };

// export type WorkExperiences = {
//   company: string;
//   jobDescription: string;
//   jobEndDate: string;
//   jobStartDate: string;
//   jobTitle: string;
// };

// export type TWorkExperiences = {
//   jobTitle?: string | undefined;
//   companyName?: string;
//   location?: string;
//   workDescription?: string;
//   responsibilities?: string | string[] | undefined;
//   jobStart: string;
//   jobEnd: string;
//   workID?: string | number | undefined;
// };

// export type TEducations = {
//   schoolName: string;
//   schoolLocation: string;
//   degree: string;
//   fieldOfStudy: string;
//   educationStart: string;
//   acceptTerms: boolean;
//   EduID?: string | number | undefined;
//   educationEnd: string;
// };
// export type SocialType = {
//   index: string;
//   value: string;
// };
// export type CertificateType = {
//   index: string;
//   certifications: string;
// };
// export type SkillType = {
//   index: number;
//   skill: string;
// };
// export type VoluntaryType = {
//   index: string;
//   volunteering: string;
// };

// export type ProjectType = {
//   description: string;
//   endDate: string;
//   startDate: string;
//   title: string;
// };

// export type NewResumeTemplate = {
//   [key: string]: any;
//   resumeSample: string;
//   uniqueUserObjects: any[];
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   address: string;
//   website: string;
//   Profile: string;
//   cvJobTitle: string;
//   portfolio: string;
//   educations: any[];
//   coverLetterHistory: any[];
//   questions: any[];
//   resumeHistory: any[];
//   skills: any[];
//   workExperiences: any[];
// };

// export type createUser = {
//   resumeSample: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   address: string;
//   website: string;
//   Profile: string;
//   cvJobTitle: string;
//   photoURL: string;
//   portfolio: string;
//   uniqueUserObjects: any[];
//   coverLetterHistory: any[];
//   resumeHistory: any[];
//   questions: any[];
//   educations: any[];
//   skills: string[];
//   workExperiences: any[];
//   password: string;
//   confirmPassword: string;
// };

// export type AccountUser = {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phoneNumber: string;
//   password: string;
//   address: string;
// };

// export type ActionProps = {
//   documentType: string;
//   documentName: string;
//   baseLink: string;
//   genTableId: string;
//   documentIndex: number;
// };

// export type SelectProps = {
//   value: string;
//   label: string;
// };

// export type childChartType = {
//   chartData?: {
//     name: string;
//     resume: number;
//     letter: number;
//     question: number;
//   }[];
// };

// export type signUpT = z.infer<typeof SignupValidation>;
// export type signInT = z.infer<typeof SigninValidation>;
// export type educationT = z.infer<typeof educationType>;
// export type userDetailsT = z.infer<typeof userDetails>;
// export type profileDetailsT = z.infer<typeof profileDetails>;
// export type experienceT = z.infer<typeof experienceType>;

// export type ApprovedT = {
//   duration: string;
//   message: string;
//   paidAt: string;
//   plan: string;
//   redirecturl: string;
//   reference: string;
//   price: number;
//   status: string;
//   transaction: string;
//   trxref: string;
// };

// export type cancelledT = {
//   message: string;
//   paidAt: string;
//   plan: string;
//   price: number;
//   status: string;
// };

// export type TableDataT = {
//   id?: string;
//   text?: string;
//   key?: string;
//   category?: string;
//   genTableId?: string;
//   letterID?: string;
//   createdDateTime: {
//     currentDate: string;
//     currentTime: string;
//   };
// };

// export type userDocProps = {
//   img: string;
//   title: string;
//   total: string;
//   link: string;
// };

// export type menuItemsT = {
//   title?: string;
//   icon: LucideIcon | IconType;
//   link?: string;
//   last?: boolean | undefined;
// };

// export type LetterType = {
//   key?: string | null | undefined;
//   data?: string;
//   firstName?: string;
//   lastName?: string;
//   email?: string;
//   country?: string;
//   state?: string;
//   phoneNumber?: string;
//   address?: string;
//   website?: string;
//   portfolio?: string;
//   category?: string;
//   letterID?: Date | string | number;
//   genTableId?: string;
//   imgIcon?: string;
//   salutation?: string;
//   closing?: string;
//   createdAt?: any;
//   createdDateTime?: any;
//   statue?: string;
// };

// export type LetterProps = {
//   children?: React.ReactNode;
//   nameOfDoc?: string;
//   documentType?: string;
//   allData?: LetterType | undefined;
//   setAllData?: React.Dispatch<React.SetStateAction<LetterType | undefined>>;
//   AILoading?: boolean;
//   onSubmit?: () => Promise<string | number>;
//   setValueQuill?: React.Dispatch<React.SetStateAction<string>>;
//   valueQuill?: string;
//   isPending?: boolean;
//   deletePro?: (id: number | string) => Promise<void> | undefined;
//   deleteDialog?: boolean;
//   handleAlertDialog?: () => void;
//   alertDialog?: boolean;
//   handleDeleteDialog?: () => void;
// };
// export type QuestionProps = {
//   children?: React.ReactNode;
//   nameOfDoc?: string;
//   documentType?: string;

//   allData?: QuestionType | undefined;
//   setAllData?: React.Dispatch<React.SetStateAction<QuestionType | undefined>>;
//   AILoading?: boolean;
//   onSubmit?: () => Promise<string | undefined>;
//   setValueQuill?: React.Dispatch<React.SetStateAction<string>>;
//   valueQuill?: string;
//   isPending?: boolean;
//   deletePro?: (id: number | string) => Promise<void> | undefined;
//   deleteDialog?: boolean;
//   handleAlertDialog?: () => void;
//   alertDialog?: boolean;
//   handleDeleteDialog?: () => void;
// };

// export type QuestionType = {
//   key?: string;
//   data?:
//     | {
//         [x: string]: string | number;
//         id: number;
//       }[]
//     | string
//     | string[];
//   category?: string;
//   questionID?: number | string;
//   genTableId?: string | number;
//   imgIcon?: string;
//   QA?: string[];
//   createdAt?: string;
//   createdDateTime?: {
//     currentDate?: string;
//     currentTime?: string;
//   };
//   statue?: string;
// };

// export type dbAddressT = {
//   apartment: string;
//   state: any;
//   country: {
//     capital: string;
//     currency: string;
//     currency_name: string;
//     currency_symbol: string;
//     latitude: string;
//     longitude: string;
//     name: string;
//     phone_code: string;
//     region: string;
//     continent: string;
//     subregion: string;
//   };
// };

// export type GoogleUser = {
//   email: string;
//   name: string;
//   given_name: string;
//   family_name: string;
//   picture: string;
// };

// export interface ApiResponse<T> {
//   data: T;
//   meta: {
//     pagination?: {
//       page: number;
//       pageSize: number;
//       pageCount: number;
//       total: number;
//     };
//   };
// }

// export interface Media {
//   id: number;
//   name: string;
//   url: string;
//   alternativeText?: string | null;
//   caption?: string | null;
// }

// export interface Author {
//   name: string;
//   avatar?: string | null;
// }

// export interface Category {
//   id: number;
//   name: string;
//   slug: string;
//   description?: string;
// }

// export interface Blocks {
//   id: number;
//   title?: string;
//   body: string;
//   __component: "shared.rich-text" | "shared.quote";
// }

// export interface Article {
//   id: string;
//   title: string;
//   author_comment: string;
//   summary: string;
//   subtitle: string;
//   author?: Author | null;
//   cover?: string | null;
//   big_thumbnail?: string | null;
//   category?: string | null;
//   createdAt?: Date;
//   author_avatar: string;
//   author_name: string;
//   blog_cover: string;
//   createdBy?: string;
//   description_html: string;
//   description_json: string;
//   description_text: string;
//   related: [];
//   status: string;
//   uid: string;
// }

// export interface ArticleData {
//   data: Article;
//   id: string;
// }

// export interface ArticleResponse {
//   documents: ArticleData[];
// }

// export interface ArticleState {
//   cover: string;
//   big_thumbnail: string;
//   updatedAt: string;
//   title: string;
//   description: string;
//   avatar: string;
//   author: string;
//   blog_content: string;
// }

// // Represents API Error structure
// export interface ApiError {
//   error: {
//     status: number;
//     name: string;
//     message: string;
//     details?: Record<string, any>;
//   };
// }

// export interface UserProfile {
//   uid: string;
//   email: string | null;
//   displayName: string | null;
//   photoURL: string | null;
//   role: "admin" | "user";
//   createdAt: string;
//   lastLoginAt: string;
//   isEmailVerified: boolean;
//   customClaims?: Record<string, any>;
// }

// export interface AuthProviderProps {
//   children: React.ReactNode;
// }
// export interface AuthContextType {
//   user: User | null;
// }
