"use client";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { OnboardingFormProps } from "@/types";

export const OnBoardingForm6 = ({ initialUser }: OnboardingFormProps) => {
  const { user } = useAuth();
  console.log(user, initialUser);
  const {
    completeOnboarding,
    // isOnboardingLoading,
  } = useAuth();

  const handleComplete = async () => {
    try {
      await completeOnboarding();
    } catch (error) {
      console.error("Onboarding completion failed:", error);
    }
  };
  const options = [
    {
      title: "Tailor your Cv",
      description: "AI powered CV optimization for each job application",
      img: "/docs.svg",
    },
    {
      title: "Generate Cover Letters",
      description: "Create compelling, personalized cover letters instantly",
      img: "/docs.svg",
    },
    {
      title: "Track Applications",
      description:
        "Organize and monitor all your job applications in one place",
      img: "/docs.svg",
    },
    {
      title: "Discover Opportunities",
      description: "Find relevant job openings that match your profile",
      img: "/docs.svg",
    },
    {
      title: "AI-Powered Applications",
      description: "Automate and optimize your entire application process",
      img: "/docs.svg",
    },
    {
      title: "Personalized Recommendations",
      description: "Get tailored career advice based on your goals",
      img: "/docs.svg",
    },
    {
      title: "Network Insights",
      description: "Connect with the right people in your industry",
      img: "/docs.svg",
    },
    {
      title: "Interview Preparation",
      description: "Practice with AI-generated interview questions",
      img: "/docs.svg",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="min-h-screen flex flex-col font-poppins"
    >
      <div
        className="h-32 w-full fixed"
        style={{
          background: "url('/landing-page-menu-gradient.svg')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      />
      <div className="grid grid-cols-3 gap-4 justify-between w-full max-w-[763px] mx-auto mb-8 mt-16 px-4">
        <div className="flex col-span-2 items-center space-x-2">
          <img src="/logo.svg" alt="" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <p className="">Progress</p>
            <p className="">6/6</p>
          </div>
          <Progress value={100} className="w-full " />
        </div>
      </div>
      <div className="flex items-center justify-center flex-1 mb-16">
        <div className="flex-1 flex items-center justify-center bg-white max-w-3xl shadow-2xl rounded-[4px] p-8 sm:p-16">
          <div className="w-full max-w-2xl space-y-8">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-medium text-center text-gray-900 mb-2">
                  Here is how <span className="text-blue-500">Cver</span> can
                  help you!
                </h1>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {options.map((option) => (
                <div
                  onClick={handleComplete}
                  // disabled={isOnboardingLoading}
                  key={option.title}
                  className="flex flex-col items-center gap-2 p-4 sm:p-8 border rounded-sm hover:shadow-xl duration-500 hover:cursor-pointer"
                >
                  <img src={option.img} alt={option.title} className="size-8" />
                  <h1 className="font-bold font-roboto text-center">
                    {option.title}
                  </h1>
                  <p className="text-xs text-center ">{option.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
