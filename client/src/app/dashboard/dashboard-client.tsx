"use client";
import { useEffect } from "react";
import { useState } from "react";
import ReactGA from "react-ga4";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { VscChecklist } from "react-icons/vsc";
import {
  dashboardSliderContent,
  IDashboardSliderContent,
} from "@/constants/jobs-data";
import { useAuth } from "@/hooks/use-auth";
import HorizontalCardSlider from "./components/HorizontalCardSlider";
import { AreaChartComponent } from "./components/chart/AreaChartComponent";
import Activities from "./components/Activities";
import { IUser } from "@/types";

export const DashboardClient = ({
  initialUser,
}: {
  initialUser: Partial<IUser>;
}) => {
  console.log("INITIAL USER : ", initialUser);
  const { user: dbUser, isLoading } = useAuth();
  const [userResumes] = useState<IDashboardSliderContent>([
    ...dashboardSliderContent,
  ]);
  const AllDocs = dbUser?.CV?.concat(
    dbUser?.coverLetterHistory,
    dbUser?.questions
  );
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
            Hello {dbUser?.firstName || dbUser?.lastName}
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
          <Activities isLoading={isLoading} allDocuments={AllDocs!} />
        </div>
      </div>
    </>
  );
};
