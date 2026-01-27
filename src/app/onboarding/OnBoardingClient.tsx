"use client";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";

import { X } from "lucide-react";
import { OnBoardingForm0 } from "./onboarding-pages/OnBoardingForm0";
import { OnBoardingForm1 } from "./onboarding-pages/OnBoardingForm1";
import { OnBoardingForm2 } from "./onboarding-pages/OnBoardingForm2";
import { OnBoardingForm3 } from "./onboarding-pages/OnBoardingForm3";
import { OnBoardingForm4 } from "./onboarding-pages/OnBoardingForm4";
import { OnBoardingForm5 } from "./onboarding-pages/OnBoardingForm5";
import { OnBoardingForm6 } from "./onboarding-pages/OnBoardingForm6";
import { OnBoardingForm7 } from "./onboarding-pages/OnBoardingForm7";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { userQueries } from "@/lib/queries/user.queries";
import { useQuery } from "@tanstack/react-query";
import { useSSE } from "@/hooks/resume/resume-sse";

// Types
type JobStatus = "waiting" | "active" | "completed" | "failed";



export default function OnboardingClient() {
  const [currentStep, setCurrentStep] = useState(0);
  const { data: user } = useQuery(userQueries.detail());


  const steps = [
    OnBoardingForm0,
    OnBoardingForm1,
    OnBoardingForm2,
    OnBoardingForm3,
    OnBoardingForm4,
    OnBoardingForm5,
    OnBoardingForm6,
    OnBoardingForm7,
  ];
  const totalSteps = steps.length;

  const router = useRouter();
  const deleteAccount = async () => {
    await api.delete("/delete");
    // await api.post("/logout");
    router.push("/login");
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const fromDataSourceStep = () => {
    setCurrentStep(3);
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep];

  console.log(user?.userId);
  const {  jobs } = useSSE();


  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case "waiting":
        return "#64748b";
      case "active":
        return "#3b82f6";
      case "completed":
        return "#4680EE";
      case "failed":
        return "#ef4444";
      default:
        return "#64748b";
    }
  };

  const jobList = Array.from(jobs.values()).sort(
    (a, b) => b.createdAt - a.createdAt,
  );
  return (
    <div className="grid grid-cols-1 overflow-hidden">
      <AnimatePresence mode="wait">
        <CurrentStepComponent
          key={currentStep}
          onNext={nextStep}
          onPrev={prevStep}
          fromDataSourceStep={fromDataSourceStep}
        >
          <div className="">
            <Button className="" variant={"ghost"} onClick={deleteAccount}>
              <X />
            </Button>
          </div>
        </CurrentStepComponent>
      </AnimatePresence>{" "}
      <div className="">
        {jobList.map((job) => (
          <div key={job.id}>
            {/* Progress Bar */}
            {(job.status === "active" || job.status === "completed") && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Generating your resume</span>
                  <span className="font-semibold">{job.progress}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${job.progress}%`,
                      backgroundColor: getStatusColor(job.status),
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
