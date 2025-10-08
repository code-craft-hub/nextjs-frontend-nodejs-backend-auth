"use client";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { OnBoardingForm0 } from "./components/OnBoardingForm0";
import { OnBoardingForm1 } from "./components/OnBoardingForm1";
import { OnBoardingForm2 } from "./components/OnBoardingForm2";
import { OnBoardingForm3 } from "./components/OnBoardingForm3";
import { OnBoardingForm4 } from "./components/OnBoardingForm4";
import { OnBoardingForm5 } from "./components/OnBoardingForm5";
import { IUser } from "@/types";
import { apiService } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { OnBoardingForm6 } from "./components/OnBoardingForm6";
import { OnBoardingForm7 } from "./components/OnBoardingForm7";
// import { DocumentTextExtractor } from "./components/AnyFormatToText";
// import { AnyFormatToTextTalksToBackend } from "./components/AnyFormatToTextTalksToBackend";

export default function OnboardingClient({
  initialUser,
}: {
  initialUser: Partial<IUser>;
}) {
  useQuery({
    queryKey: ["auth", "user"],
    queryFn: apiService.getUser,
  });
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    // AnyFormatToTextTalksToBackend,
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

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep];

  return (
    <div className="grid grid-cols-1 overflow-hidden">
      <AnimatePresence mode="wait">
        <CurrentStepComponent
          key={currentStep}
          initialUser={initialUser}
          onNext={nextStep}
          onPrev={prevStep}
        >
          <Button
            className="text-blue-500 lg:text-white"
            variant={"ghost"}
            onClick={async () => {
              await apiService.deleteUser();
            }}
          >
            <X />
          </Button>
        </CurrentStepComponent>
      </AnimatePresence>
    </div>
  );
}
