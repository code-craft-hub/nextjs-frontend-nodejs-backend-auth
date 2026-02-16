"use client";
import { Button } from "@/components/ui/button";
import { useUserLocation } from "@/hooks/geo-location/ip-geolocation.provider";
import { OnboardingFormProps } from "@/types";
import { motion } from "framer-motion";

export const OnBoardingForm0 = ({ onNext, children }: OnboardingFormProps) => {
  const handleStartOnboarding = () => {
    onNext();
  };

  useUserLocation();

  return (
    <motion.div
      // @ts-ignore
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex font-poppins h-screen relative"
    >
      <div className="flex-1 flex items-center justify-center p-8 bg-white ">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-6">
            <div className="space-y-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to Cver!
              </h1>
              <p className="text-gray-600">
                We&#39;d like to get to know you better so we can help you land
                your dream job. This will take less than 2 minutes.
              </p>
              <Button onClick={handleStartOnboarding}>Start Onboarding</Button>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute right-4 top-2 z-50">{children}</div>

      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-blue-500 min-h-screen">
        <img
          src="/auth-page.png"
          alt="Auth Image"
          className="inset-0 w-full h-full object-cover"
        />
      </div>
    </motion.div>
  );
};
