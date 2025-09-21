"use client";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { OnBoardingForm0 } from "./components/OnboardingForm0";
import { OnBoardingForm1 } from "./components/OnboardingForm1";
import { OnBoardingForm2 } from "./components/OnboardingForm2";
import { OnBoardingForm3 } from "./components/OnboardingForm3";
import { OnBoardingForm4 } from "./components/OnboardingForm4";
import { OnBoardingForm5 } from "./components/OnboardingForm5";
import { OnBoardingForm6 } from "./components/OnboardingForm6";

export default function OnboardingClient() {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    OnBoardingForm0,
    OnBoardingForm1,
    OnBoardingForm2,
    OnBoardingForm3,
    OnBoardingForm4,
    OnBoardingForm5,
    OnBoardingForm6,
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
    <div className="grid grid-cols-1">
      <AnimatePresence mode="wait">
        <CurrentStepComponent
          key={currentStep}
          onNext={nextStep}
          onPrev={prevStep}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
      </AnimatePresence>
    </div>
  );
}
