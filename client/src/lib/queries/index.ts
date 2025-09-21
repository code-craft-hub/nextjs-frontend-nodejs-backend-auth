import { QUERY_KEYS } from "./queryKeys";
import { useQuery, useMutation, keepPreviousData } from "@tanstack/react-query";
import {
  updateQHistory,
  updateCLHistory,
  createUserAccount,
  getCurrentUser,
  signInAccount,
  approvedPayment,
  cancelledPayment,
  signOutAccount,
  updateUserAccount,
  updateUserProfile,
  setCV,
  setCreditInfo,
  updateFirstSection,
  updateDisplayName,
  incrementCredit,
  apiKeys,
  subtractCredit,
  welcomeUserInfo,
  deleteUserAccount,
  updateCV,
  setQuestions,
  setCoverLetter,
  verifyEmail,
  setDataSource,
  updateOnboarding,
  defaultGooglePassword,
  updateUserInfo,
  allPaidUser,
  allUsersByDate,
  fetchCareerDoc,
  getBlogPostWithRelated,
} from "../firebase/api.firebase";
import {
  IUpdateUser,
  IUpdateUserProfile,
  NewResumeTemplate,
  IUser,
  ApprovedT,
  cancelledT,
} from "@/types";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "../firebase/index";
import { fetchArticles, healthCheck } from "../api/queries";
import { User } from "firebase/auth";
import { queryClient } from "./QueryProvider";

export const useUpdateOnboarding = (user: User) => {
  return useMutation({
    mutationFn: (onBoarding: any) => updateOnboarding(onBoarding, user),
  });
};
export const useUpdateUserInfo = () => {
  return useMutation({
    mutationFn: (updateUser: any) => updateUserInfo(updateUser),
  });
};

export const useVerifyEmail = (user: User) => {
  return useMutation({
    mutationFn: () => verifyEmail(user),
  });
};
export const useCreateUserAccount = () => {
  return useMutation({
    mutationFn: (user: IUser) => createUserAccount(user),
  });
};
export const useDeleteUserAccount = () => {
  return useMutation({
    mutationFn: deleteUserAccount,
  });
};

export const useUpdateDisplayName = () => {
  return useMutation({
    mutationFn: ({
      displayName,
      phoneNumber,
    }: {
      displayName: string;
      phoneNumber: string;
    }) => updateDisplayName({ displayName, phoneNumber }),
  });
};

export const useSignInAccount = () => {
  return useMutation({
    mutationFn: (user: IUser) => signInAccount(user),
  });
};

export const useSignOutAccount = () => {
  return useMutation({
    mutationFn: signOutAccount,
  });
};

export const useGetCurrentUser = (user: User | null) => {
  console.log("useGetCurrentUser called with user:", user);
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER, user?.uid],
    queryFn: () => getCurrentUser(user),
    refetchOnWindowFocus: true,
    enabled: !!user,
    placeholderData: keepPreviousData,
  });
};

export const prefetchCurrentUser = async (user: User) => {
  console.log("Prefetching current user for:", user.uid);
  await queryClient.prefetchQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER, user.uid],
    queryFn: () => getCurrentUser(user),
  });
};

export const useGetUser3Secs = (user: User) => {
  const uid = user?.email;
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER, uid],
    queryFn: () => getCurrentUser(user),
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });
};

export const useApiKeys = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_API_KEYS],
    queryFn: apiKeys,
  });
};
export const UseUpdateCLHistory = () => {
  return useMutation({
    mutationFn: (clHistory: { [k: string]: any }) => updateCLHistory(clHistory),
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      await queryClient.refetchQueries();
    },
  });
};
export const UseDefaultGooglePassword = () => {
  return useMutation({
    mutationFn: (password: string) => defaultGooglePassword(password),
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      await queryClient.refetchQueries();
    },
  });
};
export const UseUpdateCV = () => {
  return useMutation({
    mutationFn: (resumeHistory: { [k: string]: any }) =>
      updateCV(resumeHistory),
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      await queryClient.refetchQueries();
    },
  });
};
export const UseUpdateQHistory = () => {
  return useMutation({
    mutationFn: (clHistory: { [k: string]: any }) => updateQHistory(clHistory),
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      await queryClient.refetchQueries();
    },
  });
};

export const UseCV = () => {
  return useMutation({
    mutationFn: (user: IUser) => setCV(user),
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      await queryClient.refetchQueries();
    },
  });
};
export const useCreditInfo = (user: User | null) => {
  return useMutation({
    mutationFn: (creditInfo: {
      credits: number;
      expiryTime: Date | null | string;
    }) => {
      if (!user) throw new Error("No user available for credit update");
      return setCreditInfo(creditInfo, user);
    },

    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      await queryClient.refetchQueries();
    },
  });
};

export const useWelcomeUserInfo = () => {
  return useMutation({
    mutationFn: (user: NewResumeTemplate) => welcomeUserInfo(user),
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      await queryClient.refetchQueries();
    },
  });
};
export const updateFirstSectionQuery = () => {
  return useMutation({
    mutationFn: (user: NewResumeTemplate) => updateFirstSection(user),
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      await queryClient.refetchQueries();
    },
  });
};

export const useUpdateUserAccount = () => {
  return useMutation({
    mutationFn: (user: IUpdateUser) => updateUserAccount(user),
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      await queryClient.refetchQueries();
    },
  });
};
export const useApprovedPayment = () => {
  return useMutation({
    mutationFn: ({ payment, plans }: { payment: ApprovedT; plans: any }) =>
      approvedPayment({ payment, plans }),
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      await queryClient.refetchQueries();
    },
  });
};
export const useCancelledPayment = () => {
  return useMutation({
    mutationFn: ({ payment }: { payment: cancelledT }) =>
      cancelledPayment({
        payment,
      }),
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      await queryClient.refetchQueries();
    },
  });
};
export const useIncrementCredit = () => {
  return useMutation({
    mutationFn: (increaseCredit: number) => incrementCredit(increaseCredit),
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      await queryClient.refetchQueries();
    },
  });
};
export const useUpdateUserProfile = () => {
  return useMutation({
    mutationFn: (user: IUpdateUserProfile) => updateUserProfile(user),
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      await queryClient.refetchQueries();
    },
  });
};

export const useSubstract = () => {
  return useMutation({
    mutationFn: subtractCredit,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      await queryClient.refetchQueries();
    },
  });
};
export const useQuestions = () => {
  return useMutation({
    mutationFn: (questions: any) => setQuestions(questions),
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      await queryClient.refetchQueries();
    },
  });
};
export const useCoverLetter = () => {
  return useMutation({
    mutationFn: (coverLetter: any) => setCoverLetter(coverLetter),
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      await queryClient.refetchQueries();
    },
  });
};

export const useDataSource = () => {
  return useMutation({
    mutationFn: (dataSource: any) => setDataSource(dataSource),
    onSuccess: async () => {
      // await queryClient.resetQueries({
      //   queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      //   exact: true,
      // });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      await queryClient.refetchQueries();
    },
  });
};

export const useAllPaidUser = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ALL_PAID_USER],
    queryFn: allPaidUser,
    enabled: false,
    // staleTime: Infinity,
  });
};
export const useAllUsersByDate = (range: { from: Date; to: Date } | null) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_ALL_USERS_BY_DATE, range],
    queryFn: async () => {
      if (!range) return [];
      return await allUsersByDate(range);
    },
    // staleTime: Infinity,
  });
};

export const getJobsInDB = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_JOBS_IN_DB],
    queryFn: async () => {
      const allDocs: any[] = [];
      const q = query(collection(db, "jobs"), limit(50));
      const qs = await getDocs(q);
      qs.forEach((doc) => {
        allDocs.push({ ...doc.data() });
      });

      return allDocs;
    },
  });
};

export const fetchArticlesQuery = () => {
  return useQuery({
    queryKey: ["fetchArticles"],
    queryFn: async () => fetchArticles(),
  });
};

const intervalMs = 5 * 60 * 1000; // 5 minutes

export const useHealthCheckQuery = () => {
  return useQuery({
    queryKey: ["healthCheck"],
    queryFn: async () => healthCheck(),
    refetchInterval: intervalMs, // <--- built-in polling
    refetchOnWindowFocus: false, // don’t spam when tabbing in/out
    refetchOnReconnect: true, // safe retry if network drops
    refetchOnMount: false, // don’t fire again if already cached
    retry: 2, // retry a couple times on failure
    staleTime: Infinity,
  });
};

export const fetchCareerDocQuery = (id: string) => {
  return useQuery({
    queryKey: ["career_doc", id],
    queryFn: () => fetchCareerDoc(id),
    enabled: !!id,
  });
};

export const getBlogPostWithRelatedQuery = (id: string) => {
  return useQuery({
    queryKey: ["getBlogPostWithRelated", id],
    queryFn: () => getBlogPostWithRelated(id),
    enabled: !!id,
    // staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once on failure
  });
};
