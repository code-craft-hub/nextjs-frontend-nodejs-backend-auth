"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FiCheckCircle } from "react-icons/fi";
import { FaRegCircle } from "react-icons/fa";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { FiEye } from "react-icons/fi";
import { FiEyeOff } from "react-icons/fi";
import parsePhoneNumber from "libphonenumber-js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LuPencil } from "react-icons/lu";

import { Loader } from "lucide-react";
import { storage, db, auth } from "@/lib/firebase/index";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { useState } from "react";
import { useEffect, useRef } from "react";
import { IoHomeOutline } from "react-icons/io5";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getAuth,
  deleteUser,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signInWithEmailAndPassword,
  User,
} from "firebase/auth";
import { IUpdateUser } from "@/types";
import { SubmitHandler, useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { dbAddressT } from "@/types";

import { MdOutlineCancel } from "react-icons/md";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useUserLocation } from "@/hooks/get-user-location";
import { Card } from "@/components/ui/card";
import {
  UseDefaultGooglePassword,
  useGetCurrentUser,
  useUpdateUserAccount,
} from "@/lib/queries";
import { contextUser } from "@/lib/utils/constants";
import { useRouter } from "next/navigation";
import AccountIntegration from "./AccountIntegration";
import { useAuth } from "@/hooks/use-auth";
const deleteUserAccountType = z.object({
  authValue: z.optional(
    z.string().min(8, {
      message: "password is expected to be more than seven characters.",
    })
  ),
});
const IpassWordChange = z
  .object({
    confirmPassword: z.string().min(8, {
      message: "password is expected to be more than seven characters.",
    }),
    newPassword: z.string().min(8, {
      message: "password is expected to be more than seven characters.",
    }),
    currentPassword: z.string().optional(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "passwords do not match",
    path: ["confirmPassword"],
  });

type deleteUserAccountT = z.infer<typeof deleteUserAccountType>;
type IpassWordChangeT = z.infer<typeof IpassWordChange>;

export const Account = () => {
  const { user } = useAuth();
  const dbUser = user;
  const queryClient = useQueryClient();
  const {
    region,
    currency,
    country,
    currency_name,
    region_code,
    latitude,
    longitude,
    city,
    calling_code,
    capital,
  } = useUserLocation();
  const userRef = useRef<User | null | undefined>(undefined);
  const { mutateAsync: updateUserAccount } = useUpdateUserAccount();
  const { mutateAsync: updatePasswordMutation } = UseDefaultGooglePassword();
  const [imgDialog, setImgDialog] = useState(false);
  const handleImgDialog = () => {
    setImgDialog(!imgDialog);
  };

  const [homeAddress, setHomeAddress] = useState<dbAddressT>({
    apartment: "",
    state: "",
    country: {
      capital: "",
      currency: "",
      continent: "",
      currency_name: "",
      currency_symbol: "",
      latitude: "",
      longitude: "",
      name: "",
      phone_code: "",
      region: "",
      subregion: "",
    },
  });

  const {
    register: authRegister,
    reset: deleteReset,
    handleSubmit: handleDeleteUserAccount,
    formState: { errors: authError },
  } = useForm<deleteUserAccountT>({
    resolver: zodResolver(deleteUserAccountType),
  });
  const [signUploading, setSignupLoading] = useState(false);
  const [imageUpload, setImageUpload] = useState<File | null>(null);
  const [imageUrls, setImageUrls] = useState(dbUser?.firestoreProfileImage);
  const [imgLoader, setImgLoader] = useState(false);

  const uploadFile = async () => {
    if (imageUpload == null) {
      return toast.error("Upload an image");
    }
    setImgDialog(false);
    const getImage = await getImg();
    if (getImage !== "") {
      setImgLoader(true);
      const imagesdeleteRef = ref(storage, getImage);
      await deleteObject(imagesdeleteRef)
        .then(async () => {})
        .catch((error) => {
          console.error(error);
        });
    }
    const imageTrack = `${user?.email}/${
      user?.email + "_" + imageUpload?.name
    }`;
    const imageRef = ref(
      storage,
      `${user?.email}/${user?.email + "_" + imageUpload?.name}`
    );
    uploadBytes(imageRef, imageUpload).then((snapshot) => {
      getDownloadURL(snapshot.ref).then(async (url) => {
        const newImage = await setImage({ imageTrack, url });
        setImageUrls(newImage);
        setTimeout(() => {
          setImgLoader(false);
        }, 2000);
      });
    });

    return;
  };

  async function setImage({
    imageTrack,
    url,
  }: {
    imageTrack: string;
    url: string;
  }) {
    try {
      if (user?.email && imageTrack && url) {
        const userCollection = doc(db, "users", user?.email);
        updateDoc(userCollection, { firestoreProfileImage: url });
        updateDoc(userCollection, { firestoreImage: imageTrack });

        const docSnap = await getDoc(userCollection);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const userImage = data.firestoreProfileImage;
          return userImage;
        }
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  const getImg = async () => {
    const userCollection = doc(db, "users", user?.email!);
    const docSnap = await getDoc(userCollection);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const userImage = data.firestoreImage;
      await queryClient.refetchQueries();
      return userImage;
    }
    return null;
  };

  const {
    register,
    handleSubmit,
    reset: displayNameReset,
    setValue,
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      address: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    register: passwordRegister,
    handleSubmit: passwordSubmit,
    getValues: passwordGetValues,
    formState: { errors },
    reset: passwordReset,
  } = useForm<IpassWordChangeT>({
    resolver: zodResolver(IpassWordChange),
    defaultValues: {
      confirmPassword: "",
      newPassword: "",
      currentPassword: "",
    },
  });

  const formatPhoneNumberIntl = (phoneNumber: any) => {
    try {
      const parsedNumber = parsePhoneNumber(phoneNumber);
      return parsedNumber?.formatInternational();
    } catch (error) {
      return phoneNumber;
    }
  };
  const defaultGPassword = useRef(false);
  useEffect(() => {
    if (!dbUser) return;
    if (!contextUser || !dbUser) return;
    setValue("firstName", dbUser?.firstName || contextUser?.firstName || "");
    setValue("lastName", dbUser?.lastName || contextUser?.lastName || "");
    setValue("email", dbUser?.email || contextUser?.email || "");
    setValue("address", dbUser?.address || "");
    setValue(
      "phoneNumber",
      dbUser?.phoneNumber || contextUser?.phoneNumber || ""
    );
    setphoneIntl(dbUser?.phoneNumber || contextUser?.phoneNumber || "");
    formatPhoneNumberIntl(dbUser?.phoneNumber || contextUser?.phoneNumber);

    setHomeAddress((prev) => ({
      ...prev,
      apartment: dbUser?.address,
    }));
  }, [contextUser, dbUser]);
  const router = useRouter();
  const [delState, setDelState] = useState(false);
  const deleteUserAccount = async ({ authValue }: deleteUserAccountT) => {
    setDelState(true);
    try {
      if (authValue === undefined) {
        const authUser = await signInWithEmailAndPassword(
          auth,
          user?.email!,
          "googlePassword"
        );
        userRef.current = authUser.user;
      } else {
        const user = await signInWithEmailAndPassword(auth, email!, authValue);
        userRef.current = user.user;
      }
    } catch (error) {
      console.error(error);
      toast.error(`${error}`);
      setDelState(false);
      return;
    }
    if (!userRef.current) {
      toast.error("Please log out and login back.");
      setDelState(false);
      return;
    }
    const credential = EmailAuthProvider.credential(
      email!,
      authValue === undefined ? "googlePassword" : authValue
    );
    deleteReset();
    try {
      await reauthenticateWithCredential(userRef.current!, credential);
      try {
        await deleteUser(userRef.current!);
        await deleteDoc(doc(db, "users", email!));
        setDelState(false);
        setDeleteDialog(false);
        localStorage.clear();
        setAlertDialog(true);
        router.push(`/sign-up`);
        setTimeout(() => {
          setAlertDialog(false);
        }, 1000);
      } catch (deleteError) {
        console.error("Error deleting user or document: ", deleteError);
        setErrorAlert(true);
        setTimeout(() => {
          setErrorAlert(false);
        }, 2000);
      }
    } catch (reauthError) {
      console.error("Error during re-authentication: ", reauthError);
      setErrorAlert(true);
      setTimeout(() => {
        setErrorAlert(false);
      }, 2000);
    }
  };

  const [deleteDialog, setDeleteDialog] = useState(false);
  const handleDeleteDialog = () => {
    setDeleteDialog(!deleteDialog);
  };
  const [alertDialog, setAlertDialog] = useState(false);
  const handleAlertDialog = () => {
    setAlertDialog(!alertDialog);
  };

  const [errorAlert, setErrorAlert] = useState(false);
  const handleErrorAlert = () => {
    setErrorAlert(!errorAlert);
  };

  const phoneNumberRef = useRef("");

  const passWordChange: SubmitHandler<IpassWordChangeT> = async (data) => {
    const googlePass = "googlePassword";

    // if(dbUser?.provider !== "google")
    setSignupLoading(true);
    const credential = EmailAuthProvider.credential(
      email!,
      data.currentPassword === "" || data.currentPassword === undefined
        ? googlePass
        : data.currentPassword
        ? googlePass
        : data.currentPassword
    );
    const auth = getAuth();
    const user = auth.currentUser;

    try {
      await reauthenticateWithCredential(user!, credential);
    } catch (error: any) {
      console.error(error);
      toast.error(
        `The current password field is wrong. Provide the password that you logged in with.`
      );
      setSignupLoading(false);
      return;
    }

    if (
      lowerValidated &&
      upperValidated &&
      numberValidated &&
      specialValidated &&
      lengthValidated
    ) {
      if (dbUser?.provider !== "google") {
        if (
          passwordGetValues("newPassword") !==
          passwordGetValues("confirmPassword")
        ) {
          setSignupLoading(false);
          return toast.error("New password doesn't match confirm password");
        }
      }
      updatePassword(user!, data.newPassword)
        .then(async () => {
          if (dbUser?.provider === "google")
            await updatePasswordMutation(data.newPassword);
          defaultGPassword.current = true;
          setSignupLoading(false);
          passwordReset();
          return toast.success("Your password have been updated");
        })
        .catch((error) => {
          console.error(error.code);
          setSignupLoading(false);
          if (error.code == "auth/weak-password") {
            return toast.error(
              "Password must meet all the criteria listed below."
            );
          }
        });
    } else {
      setSignupLoading(false);
      return toast.error(
        "New password must meet all the criteria listed below."
      );
    }
  };

  const updateAccount: SubmitHandler<IUpdateUser> = async (user) => {
    try {
      setSignupLoading(true);
      const User: IUpdateUser = {
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email?.trim() || "",
        phoneNumber: user?.phoneNumber || "",
        provider: "firebase",
        address: user?.address || city,
        state: homeAddress?.state?.name || region,
        country: {
          capital: homeAddress?.country?.capital || capital,
          currency: homeAddress?.country?.currency || currency,
          currency_name: homeAddress?.country?.currency_name || currency_name,
          currency_symbol: homeAddress?.country?.currency_symbol || currency,
          latitude: homeAddress?.country?.latitude || latitude,
          longitude: homeAddress?.country?.longitude || longitude,
          name: homeAddress?.country?.name || country,
          phone_code: homeAddress?.country?.phone_code || calling_code,
          region: homeAddress?.country?.region || region,
          subregion: homeAddress?.country?.subregion || region_code,
        },
      };
      await updateUserAccount(User);
      displayNameReset();
      toast.success(user.firstName + " " + user.lastName + " Data Submitted!");
      setShowHiddenContent(true);
      setSignupLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const [phoneIntl, setphoneIntl] = useState("");
  const [currentEye, setCurrentEye] = useState(false);
  const [newEye, setNewEye] = useState(false);
  const [confirmEye, setConfirmEye] = useState(false);

  const handleCurrentEye = () => {
    setCurrentEye(!currentEye);
  };
  const handleNewEye = () => {
    setNewEye(!newEye);
  };
  const handleConfirmEye = () => {
    setConfirmEye(!confirmEye);
  };
  const [showHiddenContent, setShowHiddenContent] = useState(true);
  const [lowerValidated, setLowerValidated] = useState(false);
  const [upperValidated, setUpperValidated] = useState(false);
  const [numberValidated, setNumberValidated] = useState(false);
  const [specialValidated, setSpecialValidated] = useState(false);
  const [lengthValidated, setLengthValidated] = useState(false);

  const handlePasswordTest = (value: string) => {
    const lower = new RegExp("(?=.*[a-z])");
    const upper = new RegExp("(?=.*[A-Z])");
    const number = new RegExp("(?=.*[0-9])");
    const special = new RegExp("(?=.*[!@#$%^&*])");
    const length = new RegExp("(?=.{8,})");

    if (lower.test(value)) {
      setLowerValidated(true);
    } else {
      setLowerValidated(false);
    }

    if (upper.test(value)) {
      setUpperValidated(true);
    } else {
      setUpperValidated(false);
    }
    if (number.test(value)) {
      setNumberValidated(true);
    } else {
      setNumberValidated(false);
    }
    if (special.test(value)) {
      setSpecialValidated(true);
    } else {
      setSpecialValidated(false);
    }
    if (length.test(value)) {
      setLengthValidated(true);
    } else {
      setLengthValidated(false);
    }
  };
  const email = user?.email;
  const Email = email?.split("@");
  const firstName = dbUser?.firstName?.substring(0, 1);

  return (
    <>
      <div className="bg-[#FBFBFB] overflow-hidden max-w-screen-md w-full ">
        <div className="p-4 sm:p-8  w-full ">
          <div className="">
            <main className="space-y-4">
              {/* <Test dbUser={dbUser}/> */}
              <Tabs defaultValue="account" className="w-full ">
                <TabsList className="flex w-full rounded-xl">
                  <TabsTrigger value="account" className="w-full rounded-lg">
                    My Account
                  </TabsTrigger>
                  <TabsTrigger value="password" className="w-full rounded-lg">
                    Password
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                  <div className="mt-4 space-y-4">
                    <section className="bg-white flex  items-center w-full gap-8 p-4 dashCard relative rounded-md">
                      <div className="w-full flex items-center flex-col sm:flex-row gap-2">
                        <div className="">
                          <Dialog
                            onOpenChange={handleImgDialog}
                            open={imgDialog}
                          >
                            <DialogTrigger asChild>
                              <div className="size-20">
                                <Avatar className="size-full">
                                  <AvatarImage
                                    src={
                                      imageUrls ||
                                      dbUser?.firestoreProfileImage ||
                                      dbUser?.photoURL
                                    }
                                    className=" flex flex-1 w-full h-full  "
                                  />
                                  <AvatarFallback className=" flex flex-1 ">
                                    {firstName}
                                  </AvatarFallback>
                                </Avatar>
                                {imgLoader && (
                                  <div className="absolute top-[15px] right-[15px]">
                                    <Loader className="animate-spin text-sky-400 h-16 w-16" />
                                  </div>
                                )}
                              </div>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] bg-white">
                              <DialogHeader>
                                <DialogTitle>
                                  {" "}
                                  Upload your profile image
                                </DialogTitle>
                              </DialogHeader>
                              <div>
                                <div className={cn("grid items-start gap-4")}>
                                  <div className="grid gap-2">
                                    <Label htmlFor="image">Image</Label>
                                    <Input
                                      type="file"
                                      onChange={(event) => {
                                        if (
                                          event?.target?.files &&
                                          event.target.files.length > 0
                                        ) {
                                          setImageUpload(event.target.files[0]);
                                        }
                                      }}
                                      id="image"
                                    />
                                  </div>
                                  <Button onClick={uploadFile} type="button">
                                    Upload Image
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <div className=" px-4 w-full max-w-[400px] sm:mr-[50px] flex justify-center flex-col items-center sm:items-start text-center sm:text-start">
                          <p className="font-bold line-clamp-2 text-center sm:text-nowrap overflow-hidden max-w-[155px]">
                            {dbUser?.firstName} {dbUser?.lastName}
                          </p>
                          <p className="text-gray-400 line-clamp-1 break-all">
                            {Email}
                          </p>
                          <p className="text-gray-400 line-clamp-1 break-all">
                            {dbUser?.country?.name}.
                          </p>
                        </div>
                      </div>
                    </section>
                    <AnimatePresence mode="wait">
                      {showHiddenContent ? (
                        <motion.div
                          key="showHiddenContent"
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -10, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card className="relative ">
                            <div className="bg-gray-100 p-4">
                              <h1 className="font-bold text-[24px]">
                                Personal information
                              </h1>
                            </div>
                            <div className="px-4">
                              <div className="flex items-center ">
                                <div
                                  onClick={() => {
                                    setShowHiddenContent(false);
                                  }}
                                  className="absolute top-2 right-1 flex gap-2 hover:cursor-pointer rounded-md text-white px-4 p-2 items-center justify-center bg-[var(--buttonColor)] "
                                >
                                  <LuPencil className="text-blueColor h-6 w-6 md:hdden" />
                                  <p className="text-blueColor">Edit</p>
                                </div>
                              </div>
                              <div className="w-full gap-4 flex-col flex py-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="">
                                    <div className="text-sm text-muted-foreground">
                                      First Name:
                                    </div>
                                    <Label>{dbUser?.firstName}</Label>
                                  </div>
                                  <div className="">
                                    <div className="text-sm text-muted-foreground">
                                      Last Name:
                                    </div>
                                    <Label>{dbUser?.lastName}</Label>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="">
                                    <div className="text-sm text-muted-foreground">
                                      Email Address:
                                    </div>
                                    <Label>{dbUser?.email}</Label>
                                  </div>
                                  <div className="">
                                    <div className="text-sm text-muted-foreground">
                                      Phone Number:
                                    </div>
                                    <Label>{dbUser?.phoneNumber}</Label>
                                  </div>
                                </div>
                                <div className="max-w-sm gap-4 w-full">
                                  <div className="text-sm text-muted-foreground">
                                    Home Address:
                                  </div>
                                  <Label>
                                    {dbUser?.address} {dbUser?.state}{" "}
                                    {dbUser?.state && ","}{" "}
                                    {dbUser?.country?.name}
                                  </Label>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="hideHiddenContent"
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -10, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <section className=" relative gap-8 p-4 sm:p-8 my-4 bg-white dashCard rounded-md">
                            <div className="flex items-center ">
                              <p className="font-bold text-[24px] py-4 flex flex-col sm:flex-row gap-2">
                                <span>Personal</span> <span>information</span>
                              </p>
                            </div>
                            <form
                              className={cn("grid items-start gap-4")}
                              onSubmit={handleSubmit(updateAccount)}
                            >
                              <div className="grid gap-2">
                                <Label htmlFor="username">FirstName</Label>
                                <Input type="text" {...register("firstName")} />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="username">LastName</Label>
                                <Input type="text" {...register("lastName")} />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                  type="email"
                                  {...register("email")}
                                  disabled
                                />
                              </div>
                              <div className="grid gap-2">
                                <div className=" sm:space-y-2 w-full">
                                  <label
                                    htmlFor="address"
                                    className="text-xs sm:text-sm font-medium "
                                  >
                                    Address
                                  </label>
                                  <div className="relative ">
                                    <Input
                                      id="address"
                                      type="text"
                                      {...register("address")}
                                      className="w-full pl-10"
                                      placeholder="14 queens str. ontario CA."
                                    />
                                    <IoHomeOutline
                                      className={` absolute left-3 -translate-y-1/2  opacity-70 top-1/2`}
                                      size={18}
                                    />
                                  </div>
                                  {/* {errors.address && (
                                    <div className="text-red-400 text-xs">
                                      ? {errors.address.message}
                                    </div>
                                  )} */}
                                </div>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="username">Phone Number</Label>

                                <PhoneInput
                                  country={"us"}
                                  value={phoneIntl}
                                  onChange={(phone) => {
                                    phoneNumberRef.current = phone;
                                    setphoneIntl(phone);
                                    setValue("phoneNumber", phone);
                                  }}
                                />
                                <Input
                                  type="hidden"
                                  {...register("phoneNumber")}
                                />
                              </div>
                              <div className=" flex  items-center justify-center">
                                <Button type="submit" className="w-[150px]">
                                  Save changes
                                </Button>
                              </div>
                            </form>
                          </section>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </TabsContent>
                <TabsContent value="password">
                  <section className="bg-white relative rounded-md dashCard gap-8 p-4 my-4">
                    <div className="flex items-center">
                      <p className="font-bold text-[24px] py-4 flex flex-col sm:flex-row gap-2">
                        <span>Change</span> <span>password</span>{" "}
                      </p>
                    </div>
                    <form
                      className={cn("grid items-start gap-4")}
                      onSubmit={passwordSubmit(passWordChange)}
                    >
                      {dbUser?.provider !== "google" && (
                        <div className="grid gap-2">
                          <div className=" flex items-center">
                            <Label
                              className="flex items-center"
                              htmlFor="currentPassword"
                            >
                              Current Password{" "}
                            </Label>
                            <div className="mx-1"></div>
                          </div>
                          <div className="flex w-full bg-white px-2 border-2 border-gray-100 rounded-md">
                            <div className="flex flex-1 w-full">
                              <input
                                className="border-none outline-none ring-0 focus:border-none focus:outline-none focus:ring-none focus:ring-offset-0 flex-1 h-10 py-4 "
                                placeholder={"current password"}
                                type={`${currentEye ? "text" : "password"}`}
                                {...passwordRegister("currentPassword")}
                              />
                            </div>
                            <div
                              onClick={handleCurrentEye}
                              className="w-8 flex items-center justify-center h-full  hover:cursor-pointer"
                            >
                              {currentEye ? <FiEye /> : <FiEyeOff />}
                            </div>
                          </div>
                          {errors.currentPassword && (
                            <div className="text-red-500">
                              {errors.currentPassword.message}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="grid gap-2 ">
                        <Label htmlFor="username">New Password</Label>
                        <div className="flex w-full bg-white px-2 border-2 border-gray-100 rounded-md">
                          <div className="flex flex-1 w-full">
                            <input
                              className="border-none outline-none ring-0 focus:border-none focus:outline-none focus:ring-none focus:ring-offset-0 flex-1 h-10 py-4 "
                              type={`${newEye ? "text" : "password"}`}
                              placeholder="new password"
                              {...passwordRegister("newPassword", {
                                onChange: (e) =>
                                  handlePasswordTest(e.target.value),
                              })}
                            />
                          </div>
                          <div
                            onClick={handleNewEye}
                            className="w-8 flex items-center justify-center h-full  hover:cursor-pointer"
                          >
                            {newEye ? <FiEye /> : <FiEyeOff />}
                          </div>
                        </div>
                        <div className="w-full py-2 sm:p-2">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4">
                              {lengthValidated ? (
                                <FiCheckCircle className="text-green-500" />
                              ) : (
                                <FaRegCircle />
                              )}
                            </div>
                            <p>Minimum of 8 characters</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4">
                              {upperValidated ? (
                                <FiCheckCircle className="text-green-500" />
                              ) : (
                                <FaRegCircle />
                              )}
                            </div>
                            <p>Minimum of one upper case character</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4">
                              {numberValidated ? (
                                <FiCheckCircle className="text-green-500" />
                              ) : (
                                <FaRegCircle />
                              )}
                            </div>
                            <p>Minimu of one digit</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4">
                              {specialValidated ? (
                                <FiCheckCircle className="text-green-500" />
                              ) : (
                                <FaRegCircle />
                              )}
                            </div>
                            Minimum of one unique character
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4">
                              {lowerValidated ? (
                                <FiCheckCircle className="text-green-500" />
                              ) : (
                                <FaRegCircle />
                              )}
                            </div>
                            <p>Minimum of one lower case character</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="text">Confirm Password</Label>
                        <div className="flex w-full bg-white px-2 border-2 border-gray-100 rounded-md">
                          <div className="flex flex-1 w-full">
                            <input
                              className="border-none outline-none ring-0 focus:border-none focus:outline-none focus:ring-none focus:ring-offset-0 flex-1 h-10 py-4 "
                              type={`${confirmEye ? "text" : "password"}`}
                              placeholder="confirm password"
                              {...passwordRegister("confirmPassword", {
                                onBlur: (e) => {
                                  if (
                                    e.target.value !==
                                    passwordGetValues("newPassword")
                                  ) {
                                    toast.error(
                                      "New Password and Confirm Password do not match."
                                    );
                                  }
                                },
                              })}
                            />
                          </div>
                          <div
                            onClick={handleConfirmEye}
                            className="w-8 flex items-center justify-center h-full  hover:cursor-pointer"
                          >
                            {confirmEye ? <FiEye /> : <FiEyeOff />}
                          </div>
                        </div>
                        {errors.newPassword && (
                          <div className="text-red-500">
                            {errors.newPassword.message}
                          </div>
                        )}
                      </div>
                      <div className=" flex  items-center justify-center">
                        <Button
                          type="submit"
                          className="w-[150px]"
                          disabled={signUploading}
                        >
                          {signUploading && (
                            <Loader className="ml-2 animate-spin" />
                          )}{" "}
                          Reset
                        </Button>
                      </div>
                    </form>
                  </section>
                </TabsContent>
              </Tabs>
              <section>
                <AccountIntegration dbUser={dbUser} />
              </section>
              <section className=" flex flex-col justify-center py-2 ">
                <Dialog open={deleteDialog} onOpenChange={handleDeleteDialog}>
                  <DialogTrigger asChild>
                    <div className="flex font-bold">
                      <Button className="flex" variant={"destructive"}>
                        Delete Account
                      </Button>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-white">
                    <form onSubmit={handleDeleteUserAccount(deleteUserAccount)}>
                      <DialogHeader>
                        <DialogTitle className="text-center mb-5">
                          Delete Account
                        </DialogTitle>
                        <DialogDescription className="text-sm">
                          {dbUser?.provider === "google" &&
                            "Click the delete button to proceed."}
                        </DialogDescription>
                      </DialogHeader>
                      {dbUser?.provider !== "google" && (
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Input
                              id="name"
                              type="password"
                              placeholder="password"
                              className="col-span-4"
                              {...authRegister("authValue")}
                            />
                          </div>
                          {authError.authValue && (
                            <div className="w-full text-sm text-red-300 -mt-3">
                              {authError.authValue.message}
                            </div>
                          )}
                        </div>
                      )}
                      <DialogFooter>
                        <Button
                          type="submit"
                          variant={"destructive"}
                          disabled={delState}
                        >
                          Continue{" "}
                          {delState && <Loader className="ml-2 animate-spin" />}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                <AlertDialog
                  open={alertDialog}
                  onOpenChange={handleAlertDialog}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-center flex items-center my-6 justify-center">
                        <img
                          title="check"
                          src="/assets/icons/BigCheckCircle.svg"
                        />
                      </AlertDialogTitle>
                      <div>
                        <div className="text-green-500 text-[22px] text-center mb-2">
                          Action Successful!
                        </div>
                        <div className="text-center mt-4">
                          Account deleted successfully.
                        </div>
                      </div>
                    </AlertDialogHeader>
                  </AlertDialogContent>
                </AlertDialog>
                <AlertDialog open={errorAlert} onOpenChange={handleErrorAlert}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-center flex items-center my-6 justify-center">
                        <MdOutlineCancel className="text-[100px] text-red-500" />
                      </AlertDialogTitle>
                      <div>
                        <div className="text-red-500 text-[22px] text-center mb-2">
                          Action Denied!
                        </div>
                        <div className="text-center mt-4">
                          Please logout and Login back again for authentication
                          purposes.
                        </div>
                      </div>
                    </AlertDialogHeader>
                  </AlertDialogContent>
                </AlertDialog>
              </section>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};
