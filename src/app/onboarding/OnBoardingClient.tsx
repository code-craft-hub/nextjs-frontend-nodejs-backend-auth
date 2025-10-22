"use client";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { apiService } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { OnBoardingForm0 } from "./onboarding-pages/OnBoardingForm0";
import { OnBoardingForm1 } from "./onboarding-pages/OnBoardingForm1";
import { OnBoardingForm2 } from "./onboarding-pages/OnBoardingForm2";
import { OnBoardingForm3 } from "./onboarding-pages/OnBoardingForm3";
import { OnBoardingForm4 } from "./onboarding-pages/OnBoardingForm4";
import { OnBoardingForm5 } from "./onboarding-pages/OnBoardingForm5";
import { OnBoardingForm6 } from "./onboarding-pages/OnBoardingForm6";
import { OnBoardingForm7 } from "./onboarding-pages/OnBoardingForm7";

export default function OnboardingClient() {
  useQuery({
    queryKey: ["auth", "user"],
    queryFn: apiService.getUser,
  });
  const [currentStep, setCurrentStep] = useState(0);
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
          onNext={nextStep}
          onPrev={prevStep}
        >
          <Button
            className="text-blue-500 lg:text-white"
            variant={"ghost"}
            onClick={async () => {
              await apiService.logout();
            }}
          >
            <X />
          </Button>
        </CurrentStepComponent>
      </AnimatePresence>
    </div>
  );
}
