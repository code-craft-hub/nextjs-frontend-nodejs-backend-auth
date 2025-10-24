"use client";
import { motion } from "framer-motion";

const ProgressIcon = ({ progress }: { progress: number }) => (
  <svg
    className="w-[42px] h-[42px]"
    viewBox="0 0 42 42"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="0.8125"
      y="0.625"
      width="40.5"
      height="40.5"
      rx="20.25"
      fill={`rgba(70,128,238,${progress})`}
    />
    <motion.path
      d="M15.8918 26.0457C15.2446 25.3986 15.6739 24.0399 15.3445 23.2438C15.003 22.4185 13.75 21.7543 13.75 20.875C13.75 19.9957 15.003 19.3315 15.3445 18.5062C15.6739 17.7101 15.2446 16.3514 15.8918 15.7043C16.5389 15.0571 17.8976 15.4864 18.6937 15.157C19.519 14.8155 20.1832 13.5625 21.0625 13.5625C21.9418 13.5625 22.606 14.8155 23.4313 15.157C24.2274 15.4864 25.5861 15.0571 26.2332 15.7043C26.8804 16.3514 26.4511 17.7101 26.7805 18.5062C27.122 19.3315 28.375 19.9957 28.375 20.875C28.375 21.7543 27.122 22.4185 26.7805 23.2438C26.4511 24.0399 26.8804 25.3986 26.2332 26.0457C25.5861 26.6929 24.2274 26.2636 23.4313 26.593C22.606 26.9345 21.9418 28.1875 21.0625 28.1875C20.1832 28.1875 19.519 26.9345 18.6937 26.593C17.8976 26.2636 16.5389 26.6929 15.8918 26.0457Z"
      stroke="white"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <motion.path
      d="M24.1562 19.1875L20.0312 23.125L17.9688 21.1562"
      stroke="white"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: progress }}
      transition={{ duration: 0.6 }}
    />
  </svg>
);

export const ProgressIndicator = ({
  activeStep,
  setActiveStep,
  handleSubmit,
}: {
  activeStep: number;
  handleSubmit?: () => void;
  setActiveStep?: (step: number) => void;
}) => {
  const stages = [
    "Job Captured",
    "Email Drafted",
    "CV Tailored",
    "Review",
    "Application Sent",
  ];

  const handleSetActiveStep = (step: number) => {
    if (step <= activeStep) {
      if (step === 0) return;
      setActiveStep && setActiveStep(step);
      if (step === 4) handleSubmit && handleSubmit();
    }
  };

  return (
    <div className="">
      <div className="relative flex flex-row justify-between w-full items-center">
        <div className="bg-gray-50 absolute top-1/2 left-[12%] w-[78%] h-[2px] -translate-y-1/2">
          <motion.div
            className="h-full bg-[#4680EE] origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: (activeStep + 1) / stages.length }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        </div>

        {stages.map((_, i) => (
          <div
            key={i}
            className="flex flex-row items-center justify-evenly z-10 w-full"
          >
            <motion.button
              onClick={() => handleSetActiveStep(i)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ProgressIcon progress={i <= activeStep ? 1 : 0.3} />
            </motion.button>
          </div>
        ))}
      </div>

      <div className="flex">
        {stages.map((label, i) => (
          <div
            key={i}
            onClick={() => handleSetActiveStep(i)}
            className="flex flex-row items-center justify-evenly z-10 w-full"
          >
            <span
              className={`text-2xs font-medium text-center transition-colors duration-300 ${
                i <= activeStep ? "text-[#4680EE]" : "text-[#18191C] opacity-60"
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
