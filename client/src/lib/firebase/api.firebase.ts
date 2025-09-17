import {
  createUserWithEmailAndPassword,
  setPersistence,
  signInWithEmailAndPassword,
  browserLocalPersistence,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { addDays } from "date-fns";
import { DocumentData } from "firebase/firestore";


import { auth, db } from "./index";
import { googleLogout } from "@react-oauth/google";
import { toast } from "sonner";
import {
  IUpdateUser,
  IUpdateUserProfile,
  ApprovedT,
  NewResumeTemplate,
  userDetailsT,
  signUpT,
  cancelledT,
  Article,
} from "@/types";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  runTransaction,
  getFirestore,
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy,
  collection,
} from "firebase/firestore";
import { createdAt, parseUntilObjectOrArray } from "../utils/helpers";
import { create } from "zustand";
import { EachUserT } from "@/types";

export interface FirestoreDocument extends DocumentData {
  id: string;
}

interface JobState<T extends FirestoreDocument> {
  jobs: T[];
  setJobs: (newJobs: T[]) => void;
  clearJobs: () => void;
}

export async function createUserAccount(user: signUpT) {
  try {
    const createdUser = await createUserWithEmailAndPassword(
      auth,
      user.email,
      user.password
    );
    const uid = createdUser.user.uid;
    const { email, password } = user;
    await signInAccount({ email, password });
    if (user && user.email) {
      const userCollection = doc(db, "users", user.email);
      setDoc(
        userCollection,
        {
          uid,
          CV: [],
          phoneNumber: user.phoneNumber || "",
          email: user.email || "",
          photoURL: user.photoURL || "",
          address: user.address || "",
          credit: 5,
          maxCredit: 50,
          firestoreImage: "",
          provider: user.provider,
          expiryTime: addDays(new Date(), 1),
          firestoreProfileImage: "",
          dataSource: [], 
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          coverLetterHistory: [],
          state: user?.state || "",
          country: user?.country || "",
          questions: [],
          portfolio: "",
          linkedin: "",
          password: user.password || "",
          onBoarding: {
            firstTimeProfileUpdate: false,
          },
          emailVerified: false,
          defaultPassword: false,
          createdAt: createdAt(),
        },
        { merge: true }
      );

      const docRef = doc(db, "users", user.email);
      const docSnap = await getDoc(docRef);
      const returnedData = docSnap.data();
      return returnedData;
    }
  } catch (error: any) {
    console.error(error.code);
    if (error.code == "auth/user-not-found") {
      toast.error("Unregistered email address. Register an account");
      return null;
    } else if (error.code == "auth/wrong-password") {
      toast.error(
        "Wrong password, you change your password by clicking the forgotten password button."
      );
      return null;
    } else if (error.code == "auth/too-many-requests") {
      toast.error("Too many trials, check back in later.");
      return null;
    } else if (error.code == "auth/email-already-in-use") {
      toast.error("Your email address is registered. Signin");
      return null;
    }
  }
}

export async function deleteUserAccount() {
  const { user } = useAuth();
  const email = user?.email;
  try {
    if (email) {
      localStorage?.clear();
      setTimeout(() => {
        localStorage?.removeItem("array");
        localStorage?.clear();
      }, 500);
      return true;
    }
  } catch (error: any) {
    console.error(error.code);
    if (error.code == "auth/user-not-found") {
      toast.error("Unregistered email address. Register an account");
      return null;
    } else if (error.code == "auth/wrong-password") {
      toast.error(
        "Wrong password, you change your password by clicking the forgotten password button."
      );
      return null;
    } else if (error.code == "auth/too-many-requests") {
      toast.error("Too many trials, check back in later.");
      return null;
    } else if (error.code == "auth/email-already-in-use") {
      toast.error("Your email address is registered. Signin");
      return null;
    }
  }
}

export async function signInAccount(inputUser: {
  email: string;
  password: string;
}) {
  console.log("Signing in user:", inputUser);
  try {
    await setPersistence(auth, browserLocalPersistence);
    await signInWithEmailAndPassword(auth, inputUser.email, inputUser.password);
    const docRef = doc(db, "users", inputUser.email);
    const docSnap = await getDoc(docRef);
    const returnedData = docSnap.data();
    return returnedData;
  } catch (error: any) {
    console.error("Error during sign-in:", error);
    console.error(error.code);
    if (error.code == "auth/user-not-found") {
      toast.error("Unregistered email address. Register an account");
      return null;
    } else if (error.code == "auth/wrong-password") {
      toast.error(
        "Wrong password, you change your password by clicking the forgotten password button."
      );
      return null;
    } else if (error.code == "auth/too-many-requests") {
      toast.error("Too many trials, check back in later.");
      return null;
    } else if (error.code == "auth/email-already-in-use") {
      toast.error("Your email address is registered. Signin");
      return null;
    }
    return null;
  }
}

export async function signOutAccount() {
  try {
    googleLogout();
    localStorage?.removeItem("array");
    localStorage?.clear();
    await signOut(auth);
    setTimeout(() => {
      localStorage?.removeItem("array");
      localStorage?.clear();
    }, 500);
  } catch (error) {
    console.error(error);
  }
}

export async function getCurrentUser(user: any) {
  const email = user?.email;
  try {
    if (!email) return null;

    if (email) {
      const docRef = doc(db, "users", email);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        return userData;
      } else {
        return null;
      }
    }
    return null;
  } catch (_) {
    return null;
  }
}

export const checkUserInDb = async (userEmail: string) => {
  const docRef = doc(db, "users", userEmail);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return data;
  }
  return false;
};
export const defaultGooglePassword = async (password: string) => {
  const { user } = useAuth();
  const email = user?.email;
  try {
    if (email) {
      const userCollection = doc(db, "users", email);
      updateDoc(userCollection, {
        password,
        defaultPassword: true,
        provider: "firebase",
      });
      return true;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const updateOnboarding = async (onBoarding: string, user:User) => {
  const email = user?.email;
  try {
    if (email) {
      const userCollection = doc(db, "users", email);
      updateDoc(userCollection, { onBoarding });
      return true;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

export async function updateQHistory(updateQuestion: { [k: string]: any }) {
  const { user } = useAuth();
  const email = user?.email;
  try {
    if (email) {
      const userCollection = doc(db, "users", email);
      updateDoc(userCollection, { questions: updateQuestion });
      return true;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

export const verifyEmail = async (user:User) => {
  const email = user?.email;
  try {
    if (email) {
      const userCollection = doc(db, "users", email);
      updateDoc(userCollection, { emailVerified: true });
      return true;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};
export async function updateCLHistory(updateCLH: { [k: string]: any }) {
  try {
    const { user } = useAuth();
    const email = user?.email;
    if (email) {
      const userCollection = doc(db, "users", email);
      updateDoc(userCollection, { coverLetterHistory: updateCLH });
      const docSnap = await getDoc(userCollection);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        return userData.coverLetterHistory;
      }
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}
export async function updateCV(CV: { [k: string]: any }) {
  try {
    const { user } = useAuth();
    const email = user?.email;
    if (email) {
      const userCollection = doc(db, "users", email);
      await updateDoc(userCollection, { CV: CV });
      return true;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function updateFirstSection(user: NewResumeTemplate) {
  const userObject = user.resumeSample;

  try {
    const { user } = useAuth();
    const email = user?.email;
    if (email) {
      const userCollection = doc(db, "users", email);
      updateDoc(userCollection, { [`Resume_${userObject}`]: user });
      return true;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function setCV(user: userDetailsT) {
  try {
    const { user: authUser } = useAuth();
    const email = authUser?.email;
    if (email) {
      const userCollection = doc(db, "users", email);
      setDoc(userCollection, { CV: user }, { merge: true });
      const raw = await triggerBackendRefresh();
      return raw;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function triggerBackendRefresh() {
  const firestore = getFirestore();
  return setDoc(doc(firestore, "refreshTrigger", "trigger"), {
    timestamp: serverTimestamp(),
  })
    .then(() => {
      const { user } = useAuth();
      const email = user?.email;
      if (email) {
        const userCollection = doc(db, "users", email);

        return getDoc(userCollection)
          .then((docSnap) => {
            if (docSnap.exists()) {
              return docSnap.data();
            } else {
              return null;
            }
          })
          .catch((error) => {
            console.error(error);
            return false;
          });
      }
    })
    .catch((error) => {
      console.error("Error triggering backend refresh:", error);
    });
}

export async function updateUserAccount(user: IUpdateUser) {
  try {
    if (user) {
      const userCollection = doc(db, "users", user.email!);
      updateDoc(userCollection, {
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        address: user.address,
        state: user.state,
        country: user.country,
      });
      return true;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function updateUserInfo(user: {
  phoneNumber: string;
  address: string;
  portfolio: string;
  linkedin: string;
  state: string;
  country: string;
  provider: "google" | "firebase";
},) {
  const { user: authUser } = useAuth();
  const email = authUser?.email;
  try {
    if (user) {
      const userCollection = doc(db, "users", email!);
      if (user.provider === "google") {
        updateDoc(userCollection, {
          phoneNumber: user.phoneNumber,
          address: user.address,
          portfolio: user.portfolio,
          linkedin: user.linkedin,
          state: user.state,
          country: user.country,
        });
      }
      if (user.provider === "firebase") {
        updateDoc(userCollection, {
          portfolio: user.portfolio,
          linkedin: user.linkedin,
        });
      }
      return true;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function updateUserProfile(resume1: IUpdateUserProfile) {
  try {
    if (resume1) {
      const userCollection = doc(db, "users", resume1.email);
      setDoc(userCollection, { resume1 }, { merge: true });
      return true;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function updateDisplayName({
  displayName,
  phoneNumber,
}: {
  displayName: string;
  phoneNumber: string;
}) {
  const { user } = useAuth();
  const email = user?.email;
  if (displayName) {
    while (!auth.currentUser) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName,
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  if (phoneNumber && email) {
    const userCollection = doc(db, "users", email);
    setDoc(userCollection, { phoneNumber }, { merge: true });
  }
}

export async function incrementCredit(incrementAmount: number) {
  const { user } = useAuth();
  const email = user?.email;
  if (!email) return;
  const userDocRef = doc(db, "users", email);

  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists()) {
        console.error("User document does not exist!");
      }

      if (!userDoc.data() && !userDoc) return;
      let currentCredit = userDoc?.data()?.credit || 0;
      const currentMaxCredit = userDoc?.data()?.maxCredit || 0;
      const newCredit = currentCredit + incrementAmount;
      transaction.update(userDocRef, { credit: newCredit });
      if (newCredit >= currentMaxCredit) {
        transaction.update(userDocRef, { maxCredit: newCredit });
      } else {
        transaction.update(userDocRef, { maxCredit: currentMaxCredit });
      }
    });
  } catch (error) {
    console.error("Error incrementing credit:", error);
  }
}

export const apiKeys = async () => {
  try {
    const keySnap = await getDoc(doc(db, "GlobalData", "chatGptKey"));
    if (keySnap.exists()) return keySnap.data();
  } catch (error) {
    console.error(error);
  }
};

export const subtractCredit = async () => {
  const { user } = useAuth();
  const email = user?.email;
  try {
    if (!email) return null;

    if (email) {
      const docRef = doc(db, "users", email);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const snapData = docSnap.data();
        const currentCredit = snapData?.credit;
        const updatedCredit = currentCredit - 1;
        await updateDoc(docRef, { credit: updatedCredit });
      }
    }
  } catch (error) {
    if (error) {
      console.error(error);
    }
  }
};

export const welcomeUserInfo = async (user: NewResumeTemplate) => {
  const userObject = user.resumeSample;
  const uniqueUserObjects = user.uniqueUserObjects;
  const { user: userEmail } = useAuth();
  const email = userEmail?.email;
  try {
    if (email) {
      const userCollection = doc(db, "users", email);
      setDoc(
        userCollection,
        {
          [`Resume_${userObject}`]: user,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
        },
        { merge: true }
      );
      updateDoc(userCollection, { uniqueUserObjects: uniqueUserObjects });
      // const raw = await triggerBackendRefresh();
      // return raw;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

export async function setQuestions(questions: any) {
  const { user } = useAuth();
  const email = user?.email;
  try {
    if (email) {
      const userCollection = doc(db, "users", email);
      updateDoc(userCollection, { questions: questions });

      const raw = await triggerBackendRefresh();
      return raw;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}
export async function setCoverLetter(coverLetter: any) {
  const { user } = useAuth();
  const email = user?.email;
  try {
    if (email) {
      const userCollection = doc(db, "users", email);
      updateDoc(userCollection, { coverLetterHistory: coverLetter });

      const raw = await triggerBackendRefresh();
      return raw;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}
export async function getContent() {
  const { user } = useAuth();
  const email = user?.email;
  try {
    if (!email) return null;

    if (email) {
      const docRef = doc(db, "users", email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        return userData;
      } else {
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function setDataSource(dataSource: any) {
  const { user } = useAuth();
  const email = user?.email;
  try {
    if (email) {
      const userCollection = doc(db, "users", email);
      updateDoc(userCollection, { dataSource: dataSource });

      const raw = await triggerBackendRefresh();
      return raw;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}
export async function setCreditInfo(creditInfo: any, user: User) {
  const email = user?.email;
  try {
    if (email) {
      const userCollection = doc(db, "users", email);
      updateDoc(userCollection, {
        credit: creditInfo.credits,
        expiryTime: creditInfo.expiryTime,
      });
      const raw = await triggerBackendRefresh();
      return raw;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function setFirstTime(firstTime: any) {
  const { user } = useAuth();
  const email = user?.email;
  try {
    if (email) {
      const userCollection = doc(db, "users", email);
      updateDoc(userCollection, { firstTime: firstTime });

      const raw = await triggerBackendRefresh();
      return raw;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}
export async function approvedPayment({
  payment,
  plans,
}: {
  payment: ApprovedT;
  plans: any;
}) {
  const { user } = useAuth();
  const email = user?.email;
  try {
    if (email) {
      updateDoc(doc(db, "users", email), { approved: payment });
      updateDoc(doc(db, "users", email), { plans: plans });
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}
export async function cancelledPayment({ payment }: { payment: cancelledT }) {
  const { user } = useAuth();
  const email = user?.email;
  try {
    if (email) {
      updateDoc(doc(db, "users", email), { cancelled: payment });
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

// allUsersByDate, allPaidUser

export const allUsersByDate = async (date: any) => {
  let q = query(
    collection(db, "users"),
    where("createdAt", ">=", date?.from?.toISOString()?.split("T")[0]),
    where("createdAt", "<=", date?.to?.toISOString()?.split("T")[0]),
    orderBy("createdAt")
  );
  const querySnapshot = await getDocs(q);
  const dbData = querySnapshot.docs.map((doc) => doc.data());
  return dbData;
};

export const allPaidUser = async () => {
  let q = query(
    collection(db, "users"),
    where("plans", "array-contains-any", ["pro", "basic", "enterprise"]),
    orderBy("createdAt")
  );
  const querySnapshot = await getDocs(q);
  const dbData = querySnapshot.docs.map((doc) => doc.data());
  return dbData;
};

export async function fetchCareerDoc(id: string) {
  const docRef = doc(db, "career_docs", id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error("Document not found");
  }

  return docSnap.data();
}

// export async function getOneBlogPost(id: string) {
//   const docRef = doc(db, "blogs", id);
//   const docSnap = await getDoc(docRef);

//   if (!docSnap.exists()) {
//     throw new Error("Document not found");
//   }

//   return docSnap.data();
// }

export const syncPhoneNumber = async ({
  email,
  phoneParam,
}: {
  email: string;
  phoneParam: string;
}) => {
  try {
    const userDocRef = doc(db, "users", email);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      console.warn(`User document not found for email: ${email}`);
      return "user not found";
    }

    const userData = userDocSnap.data();
    const currentPhone = userData.phoneNumber;

    if (currentPhone !== phoneParam) {
      return await updateDoc(userDocRef, { phoneNumber: phoneParam });
    }
  } catch (error) {
    console.error(error);
  }
};

export const sendOrSaveEmailToDraft = async ({
  email,
  emailOption,
}: {
  email: string;
  emailOption: boolean;
}) => {
  try {
    const userDocRef = doc(db, "users", email);
    return await updateDoc(userDocRef, { emailOption: emailOption });
  } catch (error) {
    console.error(error);
  }
};

export async function getBlogPostWithRelated(id: string): Promise<{
  main: Article;
  related: Article[];
}> {
  try {
    const mainDocRef = doc(db, "blogs", id);

    const mainDocSnap = await getDoc(mainDocRef);
    if (!mainDocSnap.exists()) {
      console.error("Document not found for ID:", id);
      throw new Error(`Document not found for ID: ${id}`);
    }

    const mainData = mainDocSnap.data();

    const relatedArray = parseUntilObjectOrArray(mainData?.related || "");

    if (!relatedArray || relatedArray.length === 0) {
      return { main: mainData as Article, related: [] };
    }

    const relatedIds = relatedArray.map(
      (item: { value: string }) => item.value
    );

    // Query for related documents
    const blogsRef = collection(db, "blogs");
    const q = query(blogsRef, where("__name__", "in", relatedIds));
    const querySnapshot = await getDocs(q);

    const relatedData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      main: mainData as Article,
      related: relatedData as Article[],
    };
  } catch (error) {
    console.error("Error in getBlogPostWithRelated:", error);
    // Re-throw the error so React Query can handle it properly
    throw error;
  }
}

export const useJobStore = create<JobState<FirestoreDocument>>((set) => ({
  jobs: [],
  setJobs: (newJobs) =>
    set((state) => ({
      jobs: [...state.jobs, ...newJobs] as FirestoreDocument[], // Ensure proper typing
    })),
  clearJobs: () => set({ jobs: [] }),
}));

interface AppState {
  data: EachUserT[];
  timeRange: number;
  totalUserCount: number;
  setTotalUserCount: (totalUserCount: number) => void;
  setTimeRange: (range: number) => void;
  setData: (data: EachUserT[]) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  data: [],
  timeRange: 7,
  totalUserCount: 0,
  setTotalUserCount: (totalUserCount) => set({ totalUserCount }),
  setTimeRange: (range) => set({ timeRange: range }),
  setData: (data) => set({ data }),
}));
