"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { useRouter } from "next/navigation";
import InsufficientCreditsModal from "@/components/shared/InsufficientCreditsModal";
import { useAuth } from "@/hooks/use-auth";
import { ResumeTemplate } from "../[id]/components/resume";

function Resume({jobDescription}: {jobDescription: string}) {
  const { user: dbUser } = useAuth();

  const [selectedProfile, setSelectedProfile] = useState<any>(() => {
    if (!dbUser) return null;
    const first = dbUser?.dataSource?.[0];
    return first ? { key: first.key, data: first.data } : { key: "", data: "" };
  });
  useEffect(() => {
    if (dbUser?.dataSource?.[0]) {
      setSelectedProfile({
        key: dbUser.dataSource[0]?.key,
        data: dbUser.dataSource[0]?.data,
      });
    }
  }, [dbUser]);
  const router = useRouter();
  const [creditAlert, setCreditAlert] = useState(false);

  const onSubmit = async () => {
    const profile = selectedProfile.data;
    localStorage.removeItem("hasResumeAPICalled");
    if ((dbUser?.credit ?? 0) <= 0) {
      setCreditAlert(true);

      toast.error("You've used up your create. Top up here.");
      setTimeout(() => {
        router.push("/dashboard/credit");
      }, 4000);
      return;
    }

    const regex = /^(.)\1*$/;

    if (regex.test(jobDescription))
      return toast.error(
        "characters entered can't be consecutive. E.g ssssssssssssssss"
      );

    if (
      profile == undefined ||
      profile == "undefined" ||
      profile == "" ||
      profile == " "
    ) {
      toast.error(
        "You haven't created any profile yet, I'm redirecting you to the profile page."
      );
      setTimeout(() => {
        router.push("/dashboard/profile");
      }, 5000);
      return;
    }

    const resumeTitle = selectedProfile?.title ?? "";
    const docID = uuid();
    // TODO: Use the state object if you want to pass data via state
    // const state = {
    //   jobDesc: jobDescription,
    //   dataSrc: profile,
    //   resumeTitle,
    //   dataSrcObject: selectedProfile,
    //   docID,
    // };
    router.push(`/dashboard/resume/${docID}`);
  };

  return (
    <>
      <ResumeTemplate jobDescription={jobDescription} />
      {creditAlert ? <InsufficientCreditsModal /> : ""}
    </>
  );
}

export default Resume;
