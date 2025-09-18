"use client";
import { useEffect } from "react";
import { useState } from "react";
import ReactGA from "react-ga4";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { VscChecklist } from "react-icons/vsc";
import { useCreditInfo } from "@/lib/queries";
import { dashboardSliderContent } from "@/constants/jobs-data";
import { contextUser } from "@/lib/utils/constants";
import { useQueryClient } from "@tanstack/react-query";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import HorizontalCardSlider from "./components/HorizontalCardSlider";
import { AreaChartComponent } from "./components/chart/AreaChartComponent";
import Activities from "./components/Activities";

export default function Dashboard() {
  const { user: dbUser, isLoading } = useAuth();
  const queryClient = useQueryClient();
  queryClient.clear();
  auth.signOut();
  const { mutateAsync: creditUpdateMutation } = useCreditInfo();

  console.log("dbUser in dashboard", dbUser);
  // TODO: Replace with context user data

  useEffect(() => {
    ReactGA.send({
      hitType: "pageview",
      page: window.location.pathname + window.location.search,
      title: "Dashboard page",
    });
    ReactGA.event({
      category: "Dashboard page view",
      action: "Visit Dashboard page",
      label: "Dashboard page view",
    });
  }, []);

  const [userResumes, setUserResumes] = useState<userDocProps[]>([
    ...dashboardSliderContent,
  ]);
  const adminEmail = ["odafe25@gmail.com"];

  useEffect(() => {
    if (adminEmail?.includes(dbUser?.email!)) {
      if (dbUser && dbUser.credit < 1000) {
        const updateAdminCredit = async () =>
          await creditUpdateMutation({
            credits: 10000,
            expiryTime: new Date().toString().split("T")[0],
          });
        updateAdminCredit();
      }
    }
  }, [dbUser]);
  useEffect(() => {
    setUserResumes((prev) => [
      { ...prev[0], total: dbUser?.CV?.length ?? prev[0].total },
      {
        ...prev[1],
        total: dbUser?.coverLetterHistory?.length ?? prev[1].total,
      },
      { ...prev[2], total: dbUser?.questions?.length ?? prev[2].total },
    ]);
  }, [dbUser]);

  const AllDocs = dbUser?.CV.concat(
    dbUser?.coverLetterHistory,
    dbUser?.questions
  );
  const emailName = dbUser?.email?.split("@");

  return (
    <>
      <div key="showHiddenContent" className="overflow-x-hidden grid">
        <a
          href="https://docs.google.com/forms/d/1sAmzhJjgi7qoaMxgjFt8q1dwOxOoagHN30IC44LCQvQ/edit "
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 sm:px-8 flex w-full items-center justify-center"
        >
          <Alert
            variant="default"
            className="border-blue-300 flex gap-4 items-center"
          >
            <div className="">
              <VscChecklist className="size-8" />
            </div>
            <div className="">
              <AlertTitle>
                📢 We're building something better — be part of it.
              </AlertTitle>
              <AlertDescription>
                Take our quick survey and make your voice heard.{" "}
              </AlertDescription>
            </div>
          </Alert>
        </a>
        <div className="p-4 sm:p-8">
          <span className="text-3xl font-bold break-all line-clamp-1">
            Hello{" "}
            {dbUser?.firstName ||
              contextUser.firstName ||
              contextUser.lastName ||
              dbUser?.lastName ||
              (emailName && emailName[0])}
            !
          </span>
          <p className="sm:text-xl ">
            Here is a quick overview of your activity.
          </p>
        </div>
        <HorizontalCardSlider userResumes={userResumes} />
        <div className="px-4 md:px-8 pb-8">
          <AreaChartComponent dbUser={dbUser} isLoading={isLoading} />
        </div>
        <div className="px-4 md:px-8 pb-8">
          <Activities isLoading={isLoading} allDocuments={AllDocs} />
        </div>
      </div>
    </>
  );
}
