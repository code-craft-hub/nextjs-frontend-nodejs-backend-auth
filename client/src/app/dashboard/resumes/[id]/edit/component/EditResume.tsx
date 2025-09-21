"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { IoTrashOutline } from "react-icons/io5";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { v4 as uuid } from "uuid";
import { FaPlus } from "react-icons/fa6";
import { useEffect, useRef } from "react";

import {
  SelectProps,
  educationT,
  userDetailsT,
  profileDetailsT,
  DBUserT,
  experienceT,
} from "@/types";

import CreatableSelect from "react-select/creatable";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import {
  educationType,
  experienceType,
  profileDetails,
  userDetails,
} from "@/validation";
import { Button } from "@/components/ui/button";
import { resumeTabs } from "@/constants/jobs-data";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseCV, useGetCurrentUser } from "@/lib/queries";
import { useRouter } from "next/navigation";
import { monthYear, validateOrCreateDate } from "@/lib/utils/helpers";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export const EditResume = () => {
  const { user:dbUser } = useAuth();
  // TODO
  const pathname = "";
  const cvId = useRef<number>(0);
  const pathSegments = pathname?.split("/");
  const slugID = pathSegments[3];
  const { mutateAsync: CVMutation, isPending } = UseCV();
  const dataRef = useRef<DBUserT>(undefined);
  const [userDataDB, setUserDataDB] = useState<DBUserT | undefined>();
  const router = useRouter();
  //* STATES
  const [switchEdCard, setSwitchEdCard] = useState<boolean>(true);
  const workIDRef = useRef<number | string | undefined>(undefined);
  const EduIDRef = useRef<number | string | undefined>(undefined);
  const EduDeleteIDRef = useRef<number | string | undefined>(undefined);
  const workDeleteIDRef = useRef<number | string | undefined>(undefined);
  const [switchExpCard, setSwitchExpCard] = useState<boolean>(true);
  const {
    register: experienceRegister,
    handleSubmit: experienceHandleSubmit,
    reset: resetexperienceForm,
    setValue: setexperienceForm,
    control: experienceControl,
    formState: { errors: experienceErrors },
  } = useForm<experienceT>({
    resolver: zodResolver(experienceType),
    defaultValues: {
      workID: "",
      jobTitle: "",
      companyName: "",
      location: "",
      responsibilities: "",
      jobStart: new Date(),
      jobEnd: new Date(),
    },
    mode: "onBlur",
  });
  const {
    register: educationRegister,
    handleSubmit: educationHandleSubmit,
    reset: reseteducationForm,
    setValue: seteducationForm,
    control: educationControl,
    formState: { errors: educationErrors },
  } = useForm<educationT>({
    resolver: zodResolver(educationType),
    defaultValues: {
      EduID: "",
      schoolName: "",
      schoolLocation: "",
      degree: "",
      fieldOfStudy: "",
      educationStart: new Date(),
      educationEnd: new Date(),
      acceptTerms: false,
    },
    mode: "all",
  });

  const {
    register: firstSectionRegister,
    handleSubmit: firstSectionHandleSubmit,
    setValue: setFirstSectionForm,
    formState: { errors: firstSectionErrors },
  } = useForm<userDetailsT>({
    resolver: zodResolver(userDetails),
    mode: "onBlur",
  });

  const {
    register: profileRegister,
    handleSubmit: profileHandleSubmit,
    setValue: setprofileForm,
    formState: { errors: profileErrors },
  } = useForm<profileDetailsT>({
    resolver: zodResolver(profileDetails),
    mode: "onBlur",
  });

  // * USEEFFECT

  useEffect(() => {
    if (!dbUser) return;
    cvId.current = dbUser?.CV?.findIndex(
      (item: any) => item?.genTableId === slugID
    );

    // const userData = dbUser?.CV?.find((item: any) => item?.genTableId === slugID);

    if (cvId.current == -1 || cvId.current == undefined) return;

    const data = dbUser?.CV[cvId.current];
    dataRef.current = data;

    setUserDataDB(data);

    setFirstSectionForm(
      "firstName",
      data?.firstName || dbUser?.firstName || ""
    );
    setFirstSectionForm("lastName", data?.lastName || dbUser?.lastName || "");
    setFirstSectionForm("email", data?.email || "");
    setFirstSectionForm("phoneNumber", data?.phoneNumber || "");
    setFirstSectionForm("address", data?.address || "");
    setFirstSectionForm("website", data?.website || "");
    setFirstSectionForm("country", data?.country || "");
    setFirstSectionForm("state", data?.state || "");
    setFirstSectionForm("website", data?.website || "");
    setFirstSectionForm("portfolio", data?.portfolio || "");
    setFirstSectionForm("cvJobTitle", data?.cvJobTitle || "");
    setprofileForm("profile", data?.profile || "");
  }, [dbUser]);

  const experienceOnSubmit: SubmitHandler<experienceT> = async (data) => {
    const reg = /,/;
    const startEdu = new Date(validateOrCreateDate(data.jobStart!))
      .toISOString()
      .split("T")[0];
    const endEdu = new Date(validateOrCreateDate(data.jobEnd!))
      .toISOString()
      .split("T")[0];
    let resp = data?.responsibilities;
    if (!reg.test(resp as string)) resp = resp + ",";

    toast.success(`${data.jobTitle} successfully saved!`);
    if (!dbUser) return;

    if (workIDRef.current) {
      const newWorkExperience = {
        ...data,
        workID: workIDRef.current,
        jobStart: startEdu,
        jobEnd: endEdu,
        responsibilities: resp,
      };

      setUserDataDB((prev) => {
        const otherExperiences = prev?.workExperiences?.filter(
          (work) => work.workID !== workIDRef.current
        );
        const updatedWorkExperience = [
          newWorkExperience,
          ...(otherExperiences || []),
        ];
        dbUser.CV[cvId.current].workExperiences = updatedWorkExperience;
        return { ...prev, workExperiences: updatedWorkExperience };
      });
    } else {
      const workID = uuid();
      const newWorkExperience = {
        ...data,
        workID,
        jobStart: startEdu,
        jobEnd: endEdu,
        responsibilities: resp,
      };

      setUserDataDB((prev) => {
        const updatedWorkExperiences = [
          newWorkExperience,
          ...(prev?.workExperiences || []),
        ];
        dbUser.CV[cvId.current].workExperiences = updatedWorkExperiences;
        return {
          ...prev,
          workExperiences: updatedWorkExperiences,
        };
      });
    }
    await CVMutation(dbUser?.CV);
    workIDRef.current = undefined;
    setSwitchExpCard(true);
    resetexperienceForm();
  };

  const educationOnSubmit: SubmitHandler<educationT> = async (formData) => {
    if (!dbUser?.CV) return;
    const startEdu = new Date(validateOrCreateDate(formData.educationStart!))
      .toISOString()
      .split("T")[0];
    const endEdu = new Date(validateOrCreateDate(formData.educationEnd!))
      .toISOString()
      .split("T")[0];
    toast.success(`${formData.schoolName} successfully saved!`);
    if (EduIDRef.current) {
      const newEducation = {
        ...formData,
        EduID: EduIDRef.current,
        educationStart: startEdu,
        educationEnd: endEdu,
      };
      setUserDataDB((prev) => {
        const otherEducations = prev?.educations?.filter(
          (edu) => edu.EduID !== EduIDRef.current
        );
        const updatedEducations = [newEducation, ...(otherEducations || [])];
        dbUser.CV[cvId.current].educations = updatedEducations;
        return { ...prev, educations: updatedEducations };
      });
    } else {
      const EduID = uuid();
      const newEducation = {
        ...formData,
        educationStart: startEdu,
        educationEnd: endEdu,
        EduID,
      };
      setUserDataDB((prev) => {
        const updatedEducations = [newEducation, ...(prev?.educations || [])];
        dbUser.CV[cvId.current].educations = updatedEducations;
        return { ...prev, educations: updatedEducations };
      });
    }
    await CVMutation(dbUser?.CV);
    EduIDRef.current = undefined;
    setSwitchEdCard(true);
    reseteducationForm();
  };

  const profileDetailsOnSubmit = async (profile: profileDetailsT) => {
    if (!dataRef.current) return;
    if (userDataDB?.softSkills?.length === 0)
      return toast.error("Please select a soft skill or create a new one.");
    if (userDataDB?.hardSkills?.length === 0)
      return toast.error("Please select a hard skill or create a new one.");

    toast.success("profile details saved!");
    if (!dbUser) return;
    const details: any = dbUser?.CV[cvId.current];
    details.profile = profile?.profile;
    details.softSkills = userDataDB?.softSkills?.map(({ label, value }) => ({
      label: label,
      value: value,
    }));
    details.hardSkills = userDataDB?.hardSkills?.map(({ label, value }) => ({
      label: label,
      value: value,
    }));
    dbUser.CV[cvId.current] = details;
    setUserDataDB((prev) => ({
      ...prev,
      Profile: profile?.profile,
      hardSkills: details.hardSkills,
      softSkills: details.softSkills,
    }));
    await CVMutation(dbUser?.CV);
  };
  const firstSectionOnSubmit = async (data: userDetailsT) => {
    if (!dbUser) return;
    const details: userDetailsT = dbUser?.CV[cvId.current];
    details.firstName = data?.firstName;
    details.lastName = data?.lastName;
    details.cvJobTitle = data?.cvJobTitle;
    details.portfolio = data?.portfolio;
    details.email = data?.email;
    details.phoneNumber = data?.phoneNumber;
    details.portfolio = data?.portfolio;
    details.website = data?.website;
    details.state = data?.state;
    details.country = data?.country;
    details.address = data?.address;
    dbUser.CV[cvId.current] = details;
    toast.success(
      details.firstName + " " + details.lastName + " details saved!"
    );
    await CVMutation(dbUser?.CV);
  };

  const educationEdit = (item: educationT) => {
    EduIDRef.current = item.EduID;
    seteducationForm("schoolName", item.schoolName);
    seteducationForm("schoolLocation", item.schoolLocation);
    seteducationForm("degree", item.degree);
    seteducationForm("fieldOfStudy", item.fieldOfStudy);
    seteducationForm("educationStart", item.educationStart);
    seteducationForm("educationEnd", item.educationEnd);
    seteducationForm("acceptTerms", item.acceptTerms);
    setSwitchEdCard(false);
  };

  const workEdit = (item: experienceT) => {
    workIDRef.current = item.workID;
    setexperienceForm("companyName", item.companyName);
    setexperienceForm("jobTitle", item.jobTitle);
    setexperienceForm("location", item.location);
    setexperienceForm("workDescription", item.workDescription);
    setexperienceForm("responsibilities", item.responsibilities);
    setexperienceForm("jobStart", item.jobStart);
    setexperienceForm("jobEnd", item.jobEnd);
    setSwitchExpCard(false);
  };

  const educationDelete = async (EduID?: string | number) => {
    if (!dbUser?.CV) return;
    EduDeleteIDRef.current = EduID;
    const newEduState = userDataDB?.educations?.filter(
      (edu) => edu.EduID !== EduID
    );
    dbUser.CV[cvId.current].educations = newEduState;
    toast.error(`Education history deleted!`);
    await CVMutation(dbUser?.CV);
    EduDeleteIDRef.current = undefined;
    setUserDataDB((prev) => ({
      ...prev,
      educations: newEduState,
    }));
  };

  const workDelete = async (workID?: string | number) => {
    if (!dbUser?.CV) return;
    workDeleteIDRef.current = workID;
    const newWorkState = userDataDB?.workExperiences?.filter(
      (work) => work.workID !== workID
    );
    toast.error(`Work experience deleted!`);
    dbUser.CV[cvId.current].workExperiences = newWorkState;
    await CVMutation(dbUser?.CV);
    workDeleteIDRef.current = undefined;
    setUserDataDB((prev) => ({
      ...prev,
      workExperiences: newWorkState || [],
    }));
  };

  return (
    <>
      <div className="flex flex-col sm:px-8 px-4 max-sm:gap-4 ">
        <Tabs
          defaultValue="details"
          className="max-w-screen-lg gap-4 flex flex-col mb-8 "
        >
          <div className="w-full justify-end flex">
            <Button
              className="max-sm:text-xs max-sm:p-2"
              onClick={() => {
                router.push(`/dashboard/resume/${pathSegments[3]}`);
              }}
            >
              View Resume
            </Button>
          </div>
          <TabsList className="grid w-full grid-cols-4 rounded-2xl ">
            {resumeTabs?.map((item, index) => (
              <TabsTrigger
                className="rounded-xl max-sm:text-xs"
                key={index}
                value={item?.id}
              >
                {item?.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Information</CardTitle>
                <CardDescription>
                  Update your personal information here.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <form
                  onSubmit={firstSectionHandleSubmit(firstSectionOnSubmit)}
                  className=""
                  autoComplete="on"
                >
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-2 w-full mb-2 ">
                      <label className="">First Name</label>
                      <Input
                        className=""
                        {...firstSectionRegister("firstName")}
                      />
                      {firstSectionErrors.firstName && (
                        <p className="text-red-500 mt-2 pb-2">
                          {firstSectionErrors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 w-full mb-2">
                      <label className=""> Last Name </label>
                      <Input
                        className=""
                        {...firstSectionRegister("lastName")}
                      />
                      {firstSectionErrors.lastName && (
                        <p className="text-red-500 mt-2 pb-2">
                          {firstSectionErrors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-full mb-2">
                    <label className="">Job Title </label>
                    <Input
                      className=""
                      type="text"
                      {...firstSectionRegister("cvJobTitle")}
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full mb-2">
                    <label className="">Email </label>
                    <Input
                      className=""
                      type="email"
                      {...firstSectionRegister("email")}
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full mb-2">
                    <label className="">Phone Number </label>
                    <Input
                      className=""
                      type="tel"
                      {...firstSectionRegister("phoneNumber")}
                    />
                  </div>
                  {firstSectionErrors.phoneNumber && (
                    <p className="text-red-500 mt-2 pb-2">
                      {firstSectionErrors.phoneNumber.message}
                    </p>
                  )}
                  <div className="flex flex-col gap-2 w-full mb-2">
                    <label className="">LinkedIn (optional)</label>
                    <Input
                      className=""
                      {...firstSectionRegister("portfolio")}
                    />
                  </div>
                  {firstSectionErrors.portfolio && (
                    <p className="text-red-500 mt-2 pb-2">
                      {firstSectionErrors.portfolio.message}
                    </p>
                  )}
                  <div className="flex flex-col gap-2 w-full mb-2">
                    <label className="">website (optional) </label>
                    <Input className="" {...firstSectionRegister("website")} />
                  </div>
                  {firstSectionErrors.website && (
                    <p className="text-red-500 mt-2 pb-2">
                      {firstSectionErrors.website.message}
                    </p>
                  )}
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-2 w-full mb-2 ">
                      <label className="">Country</label>
                      <Input
                        className=""
                        {...firstSectionRegister("country")}
                      />
                      {firstSectionErrors.country && (
                        <p className="text-red-500 mt-2 pb-2">
                          {firstSectionErrors.country.message}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 w-full mb-2">
                      <label className="">State </label>
                      <Input className="" {...firstSectionRegister("state")} />
                      {firstSectionErrors.state && (
                        <p className="text-red-500 mt-2 pb-2">
                          {firstSectionErrors.state.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-full mb-2">
                    <label className="">Address</label>
                    <Input className="" {...firstSectionRegister("address")} />
                  </div>
                  {firstSectionErrors.address && (
                    <p className="text-red-500 mt-2 pb-2">
                      {firstSectionErrors.address.message}
                    </p>
                  )}
                  <div className="flex gap-4 py-4">
                    <Button type="submit" className="px-8" disabled={isPending}>
                      <span className="hidden md:flex text-white">
                        Save and Continue
                      </span>
                      <span className=" md:hidden text-white">Save</span>
                      {isPending && <Loader className="ml-2 animate-spin" />}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardDescription>
                  update your profile and skills here.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <form
                  onSubmit={profileHandleSubmit(profileDetailsOnSubmit)}
                  className="gap-4  flex flex-col"
                >
                  <div className="flex flex-col ">
                    <p className="py-2"> Profile</p>
                    <Textarea
                      className="resize-none"
                      rows={6}
                      {...profileRegister("profile")}
                    />
                    {profileErrors.profile && (
                      <p className="text-red-500 mt-2 pb-2">
                        {profileErrors.profile.message}
                      </p>
                    )}
                  </div>

                  <p className="font-semibold text-xl">Skills</p>
                  <div className="">
                    <p className="text-mild py-1">Soft Skills</p>
                    <CreatableSelect
                      closeMenuOnSelect={false}
                      value={userDataDB?.softSkills}
                      isMulti
                      options={userDataDB?.softSkills}
                      onChange={(value) =>
                        setUserDataDB((prevState) => ({
                          ...prevState,
                          softSkills: value as SelectProps[],
                        }))
                      }
                      placeholder="Select or create a soft skill"
                    />
                  </div>
                  <div className="">
                    <p className="text-textBlind py-1">Hard Skills</p>
                    <CreatableSelect
                      closeMenuOnSelect={false}
                      value={userDataDB?.hardSkills}
                      isMulti
                      options={userDataDB?.hardSkills}
                      onChange={(value) =>
                        setUserDataDB((prevState) => ({
                          ...prevState,
                          hardSkills: value as SelectProps[],
                        }))
                      }
                      placeholder="Select or create a hard skill"
                    />
                  </div>
                  <div className="flex gap-4 py-4">
                    <Button type="submit" className="px-8" disabled={isPending}>
                      <span className="hidden md:flex text-white">
                        Save and Continue
                      </span>
                      <span className=" md:hidden text-white">Save</span>
                      {isPending && <Loader className="ml-2 animate-spin" />}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="education">
            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
                <CardDescription>
                  Update your education history here.
                </CardDescription>
              </CardHeader>
              <CardContent
                className={`space-y-2 ${!switchEdCard ? "p-6" : "p-0"} sm:p-6`}
              >
                <AnimatePresence mode="wait">
                  {switchEdCard ? (
                    <motion.div
                      key="showEdCard"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="overflow-hidden "
                    >
                      <div className="overflow-hidden">
                        <div className="flex-wrap w-full ">
                          {userDataDB?.educations?.map((edu, index) => {
                            return (
                              <section
                                onClick={() => educationEdit(edu)}
                                key={index}
                                className="invertinsetphism rounded-md p-4 my-6 m-2"
                              >
                                <div className="">
                                  <div className="">
                                    <div className="flex justify-between">
                                      <p className="font-bold h-full line-clamp-1">
                                        {edu?.degree}
                                      </p>
                                      <div className="flex gap-2">
                                        <Button
                                          className="h-8 text-red-500 !p-2 sm:!p-4"
                                          variant="outline"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            educationDelete(edu?.EduID);
                                          }}
                                        >
                                          {isPending ? (
                                            <Loader className=" animate-spin" />
                                          ) : (
                                            <IoTrashOutline className="sm:!h-6 sm:!w-6 h-4 w-4" />
                                          )}
                                        </Button>
                                        <Button
                                          className="h-8 text-blueColor !p-2 sm:!p-4 text-xs sm:text-[14px]"
                                          variant="outline"
                                          onClick={() => educationEdit(edu)}
                                        >
                                          Edit
                                        </Button>
                                      </div>
                                    </div>
                                    <div className=" mt-4">
                                      <p className=" text-textBlind h-full line-clamp-1">
                                        {edu?.schoolName}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="">
                                    <p className="text-mild h-full line-clamp-1 italic">
                                      Graduated - {monthYear(edu.educationEnd)}
                                    </p>
                                  </div>
                                </div>
                              </section>
                            );
                          })}
                          <section
                            className="m-2 rounded-md my-8 border-2 border-dashed p-4 flex items-center justify-center gap-2 hover:cursor-pointer hover:bg-blind hover:border-solid"
                            onClick={() => setSwitchEdCard(false)}
                          >
                            <FaPlus />
                            <p>Add Education</p>
                          </section>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="hideEdCard"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="overflow-hidden sm:p-4 p-1"
                    >
                      <form
                        autoComplete="on"
                        onSubmit={educationHandleSubmit(educationOnSubmit)}
                      >
                        <div>
                          <section className="flex flex-col gap-4 ">
                            <div className="flex flex-col gap-2 w-full mb-2">
                              <label className="">School Name </label>
                              <div className="flex flex-col">
                                <Input
                                  className=""
                                  type="text"
                                  {...educationRegister(`schoolName`)}
                                />
                                {educationErrors?.schoolName && (
                                  <p className="text-red-500 mt-1">
                                    {educationErrors?.schoolName.message}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 w-full mb-2">
                              <label className="">School Location</label>
                              <div className="flex flex-col">
                                <Input
                                  className=""
                                  type="text"
                                  {...educationRegister(`schoolLocation`)}
                                />
                                {educationErrors?.schoolLocation && (
                                  <p className="text-red-500 mt-1">
                                    {educationErrors?.schoolLocation.message}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col w-full mb-2 ">
                              <label className="">Degree</label>
                              <div className="flex flex-col">
                                <Input
                                  className=""
                                  type="text"
                                  {...educationRegister(`degree`)}
                                />
                              </div>
                              {educationErrors?.degree && (
                                <p className="text-red-500 mt-1">
                                  {educationErrors?.degree?.message}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 w-full mb-2">
                              <label className="">Field Of Study</label>
                              <div className="flex flex-col">
                                <Input
                                  className=""
                                  type="text"
                                  {...educationRegister(`fieldOfStudy`)}
                                />
                              </div>
                              {educationErrors?.fieldOfStudy && (
                                <p className="text-red-500 mt-1">
                                  {educationErrors?.fieldOfStudy.message}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                              <div className="flex flex-col gap-2 w-full mb-2">
                                <label className="">Education Start Date</label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-[280px] justify-start text-left font-normal"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      <Controller
                                        name="educationStart"
                                        control={educationControl}
                                        render={({ field }) => {
                                          const { value } = field;
                                          return (
                                            <span>
                                              {value
                                                ? format(value, "PPP")
                                                : "Pick a date"}
                                            </span>
                                          );
                                        }}
                                      />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Controller
                                      name="educationStart"
                                      control={educationControl}
                                      render={({ field }) => (
                                        <Calendar
                                          captionLayout="dropdown"
                                          mode="single"
                                          selected={field.value as Date}
                                          onSelect={field.onChange}
                                          initialFocus
                                        />
                                      )}
                                    />
                                  </PopoverContent>
                                </Popover>
                                {educationErrors?.educationStart && (
                                  <p className="text-red-500 mt-1">
                                    {educationErrors?.educationStart.message}
                                  </p>
                                )}
                              </div>

                              <div className="flex flex-col gap-2 w-full mb-2">
                                <label className="">Graduation Date</label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-[280px] justify-start text-left font-normal"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      <Controller
                                        name="educationEnd"
                                        control={educationControl}
                                        render={({ field }) => {
                                          const { value } = field;
                                          return (
                                            <span>
                                              {value
                                                ? format(value, "PPP")
                                                : "Pick a date"}
                                            </span>
                                          );
                                        }}
                                      />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Controller
                                      name="educationEnd"
                                      control={educationControl}
                                      render={({ field }) => (
                                        <Calendar
                                          captionLayout="dropdown"
                                          mode="single"
                                          selected={field.value as Date}
                                          onSelect={field.onChange}
                                          initialFocus
                                        />
                                      )}
                                    />
                                  </PopoverContent>
                                </Popover>
                                {educationErrors?.educationEnd && (
                                  <p className="text-red-500 mt-1">
                                    {educationErrors?.educationEnd.message}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="checkbox"
                                {...educationRegister("acceptTerms")}
                                id="acceptTerms"
                              />
                              <label htmlFor="acceptTerms">
                                Still in School
                              </label>
                            </div>

                            <div className="flex gap-4">
                              {EduIDRef.current ? (
                                <Button
                                  type="submit"
                                  className="px-8"
                                  disabled={isPending}
                                >
                                  <span className="hidden md:flex text-white">
                                    Update and Continue
                                  </span>
                                  <span className=" md:hidden text-white">
                                    Update
                                  </span>
                                  {isPending && (
                                    <Loader className="ml-2 animate-spin" />
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  type="submit"
                                  className="px-8"
                                  disabled={isPending}
                                >
                                  <span className="hidden md:flex text-white">
                                    Save and Continue
                                  </span>
                                  <span className=" md:hidden text-white">
                                    Save
                                  </span>
                                  {isPending && (
                                    <Loader className="ml-2 animate-spin" />
                                  )}
                                </Button>
                              )}

                              <Button
                                type="button"
                                onClick={() => {
                                  reseteducationForm();
                                  setSwitchEdCard(true);
                                }}
                                className="self-start px-8 md:px-16"
                                variant={"outline"}
                              >
                                Cancel
                              </Button>
                            </div>
                          </section>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="experience">
            <Card>
              <CardHeader>
                <CardTitle>Experience</CardTitle>
                <CardDescription>
                  Update your work history here.
                </CardDescription>
              </CardHeader>
              <CardContent
                className={`space-y-2 ${!switchExpCard ? "p-6" : "p-0"} sm:p-6`}
              >
                <AnimatePresence mode="wait">
                  {switchExpCard ? (
                    <motion.div
                      key="showEdCard"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="overflow-hidden "
                    >
                      <div className="flex-wrap w-full p-2 gap-6 flex flex-col">
                        {userDataDB?.workExperiences?.map((work, index) => {
                          return (
                            <section
                              onClick={() => workEdit(work)}
                              key={index}
                              className="invertinsetphism rounded-md p-4"
                            >
                              <div className="">
                                <div className="">
                                  <div className="flex justify-between">
                                    <p className="h-full line-clamp-2 font-bold">
                                      {work?.jobTitle}
                                    </p>
                                    <div className="flex gap-2">
                                      <Button
                                        className="h-8 text-red-500 !p-2 sm:!p-4"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          workDelete(work?.workID);
                                        }}
                                      >
                                        {isPending ? (
                                          <Loader className=" animate-spin" />
                                        ) : (
                                          <IoTrashOutline className="sm:!h-6 sm:!w-6 h-4 w-4" />
                                        )}
                                      </Button>
                                      <Button
                                        className="h-8 text-blueColor !p-2 sm:!p-4 text-xs sm:text-[14px]"
                                        variant="outline"
                                        onClick={() => workEdit(work)}
                                      >
                                        Edit
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="mt-4">
                                    <p className=" text-textBlind h-full line-clamp-1">
                                      {work?.companyName}, {work?.location}
                                    </p>
                                  </div>
                                </div>
                                <div className="">
                                  <p className="text-mild h-full line-clamp-1 italic py-2">
                                    {monthYear(new Date(work?.jobStart))} -{" "}
                                    {monthYear(new Date(work?.jobEnd))}
                                  </p>
                                </div>
                              </div>
                            </section>
                          );
                        })}
                        <section
                          className="rounded-md my-8 border-2 border-dashed p-4 flex items-center justify-center gap-2 hover:cursor-pointer hover:bg-blind hover:border-solid"
                          onClick={() => setSwitchExpCard(false)}
                        >
                          <FaPlus />
                          <p>Add Experience</p>
                        </section>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="hideEdCard"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className=" overflow-hidden  p-4"
                    >
                      <form
                        autoComplete="on"
                        onSubmit={experienceHandleSubmit(experienceOnSubmit)}
                        className=""
                      >
                        <div className="flex flex-col gap-2 w-full mb-2">
                          <label className="">Job Title</label>
                          <Input
                            className=""
                            type="text"
                            {...experienceRegister("jobTitle")}
                          />
                        </div>
                        {experienceErrors.jobTitle && (
                          <p className="text-red-500 mt-2 pb-2">
                            {experienceErrors.jobTitle.message}
                          </p>
                        )}
                        <div className="flex flex-col gap-2 w-full mb-2">
                          <label className="">Company Name</label>
                          <Input
                            className=""
                            type="text"
                            {...experienceRegister("companyName")}
                          />
                        </div>
                        {experienceErrors.companyName && (
                          <p className="text-red-500 mt-2 pb-2">
                            {experienceErrors.companyName.message}
                          </p>
                        )}
                        <div className="flex flex-col gap-2 w-full mb-2">
                          <label className="">Location</label>
                          <Input
                            className=""
                            type="text"
                            {...experienceRegister("location")}
                          />
                        </div>
                        {experienceErrors.location && (
                          <p className="text-red-500 mt-2 pb-2">
                            {experienceErrors.location.message}
                          </p>
                        )}
                        <div className="flex flex-col gap-2 w-full mb-2">
                          <label className="">Description (outline)</label>
                          <Textarea
                            rows={6}
                            className="resize-none"
                            {...experienceRegister("workDescription")}
                          />
                        </div>
                        {experienceErrors.workDescription && (
                          <p className="text-red-500 mt-2 pb-2">
                            {experienceErrors.workDescription.message}
                          </p>
                        )}

                        <div className="flex flex-col gap-2 w-full mb-2">
                          <label className="">Responsibilities</label>
                          <Textarea
                            rows={6}
                            className="resize-none"
                            {...experienceRegister("responsibilities")}
                          />
                        </div>
                        {experienceErrors.responsibilities && (
                          <p className="text-red-500 mt-2 pb-2">
                            {experienceErrors.responsibilities.message}
                          </p>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex flex-col gap-2 w-full mb-2">
                            <label className="">Start Date</label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-[280px] justify-start text-left font-normal"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  <Controller
                                    name="jobStart"
                                    control={experienceControl}
                                    render={({ field }) => {
                                      const { value } = field;
                                      return (
                                        <span>
                                          {value
                                            ? format(value, "PPP")
                                            : "Pick a date"}
                                        </span>
                                      );
                                    }}
                                  />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Controller
                                  name="jobStart"
                                  control={experienceControl}
                                  render={({ field }) => (
                                    <Calendar
                                      captionLayout="dropdown"
                                      mode="single"
                                      selected={field.value as Date}
                                      onSelect={field.onChange}
                                      initialFocus
                                    />
                                  )}
                                />
                              </PopoverContent>
                            </Popover>
                            {experienceErrors?.jobStart && (
                              <p className="text-red-500 mt-1">
                                {experienceErrors?.jobStart.message}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 w-full mb-2">
                            <label className="">End Date</label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-[280px] justify-start text-left font-normal"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  <Controller
                                    name="jobEnd"
                                    control={experienceControl}
                                    render={({ field }) => {
                                      const { value } = field;
                                      return (
                                        <span>
                                          {value
                                            ? format(
                                                validateOrCreateDate(value),
                                                "PPP"
                                              )
                                            : "Pick a date"}
                                        </span>
                                      );
                                    }}
                                  />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Controller
                                  name="jobEnd"
                                  control={experienceControl}
                                  render={({ field }) => (
                                    <Calendar
                                      captionLayout="dropdown"
                                      mode="single"
                                      selected={field.value as Date}
                                      onSelect={field.onChange}
                                      initialFocus
                                    />
                                  )}
                                />
                              </PopoverContent>
                            </Popover>

                            {experienceErrors?.jobEnd && (
                              <p className="text-red-500 mt-1">
                                {experienceErrors?.jobEnd.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-4 py-4">
                          <Button
                            type="submit"
                            className="flex px-8 "
                            disabled={isPending}
                          >
                            {workIDRef.current ? (
                              <div className="flex gap-2">
                                <span className="hidden md:flex text-white">
                                  Update and Continue
                                </span>
                                <span className=" md:hidden text-white">
                                  Update
                                </span>
                                {isPending && (
                                  <Loader className="ml-2 animate-spin" />
                                )}
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <span className="hidden md:flex text-white">
                                  Save and Continue
                                </span>
                                <span className=" md:hidden text-white">
                                  Save
                                </span>
                                {isPending && (
                                  <Loader className="ml-2 animate-spin" />
                                )}
                              </div>
                            )}{" "}
                          </Button>
                          <Button
                            variant="outline"
                            type="button"
                            className="px-8 md:px-16"
                            onClick={() => {
                              resetexperienceForm();
                              setSwitchExpCard(true);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};
