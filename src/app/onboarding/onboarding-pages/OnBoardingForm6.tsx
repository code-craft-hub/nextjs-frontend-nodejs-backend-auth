import { OnboardingFormProps } from "@/types";
import Progress from "./Progress";
import { Button } from "@/components/ui/button";
import { features } from "./constants";
import { motion } from "framer-motion";

export const OnBoardingForm6 = ({ onNext, onPrev, children }: OnboardingFormProps) => {
  return (
    <motion.div
    // @ts-ignore
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative w-full min-h-screen flex items-center justify-center p-4 sm:p-16"
      style={{
        background:
          "linear-gradient(117.28deg, rgba(130, 172, 241, 0.55) -78.15%, #FFFFFF 36.71%, #FFFFFF 67.82%)",
      }}
    >
      <div className="absolute right-4 top-2 z-50">{children}</div>
      <div className="flex flex-col items-start gap-9 w-full max-w-[1114px]">
        <div className="flex flex-row justify-between items-center w-full">
          <div className="flex col-span-2 items-center space-x-2">
            <img src="/cverai-logo.png" className="w-28 h-8" alt="" />
          </div>
          <Progress min={6} max={7} progress={90} />
        </div>
        <div className="w-full bg-white p-4 sm:p-16 shadow-[0px_5px_5px_rgba(0,0,0,0.2)] rounded-[10px]  box-border">
          <div className="flex flex-col gap-y-8 items-start w-full">
            <h1 className="text-lg sm:text-2xl leading-9 font-medium text-black text-center w-full font-poppins">
              Here is how <span className="text-primary">Cver</span> can help
              you!
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
              {features.map((item) => (
                <div
                  onClick={() => {
                    onNext();
                  }}
                  className="flex items-center justify-between bg-[#FAFAFA] border-[#C4CDD5] border p-4 rounded-md w-full hover:shadow-xl duration-500 hover:cursor-pointer"
                  key={item.title}
                >
                  <div className="">
                    <h1 className="font-poppins font-medium text-lg mb-2">
                      {item.title}
                    </h1>
                    <p className="opacity-60 text-xs">{item.description}</p>
                  </div>
                  <div className="shrink-0">
                    <img src={item.icon ?? ""} alt="" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-row items-center gap-4">
              <Button
                variant={"outline"}
                onClick={() => {
                  onPrev();
                }}
              >
                Previous
              </Button>
              <Button
                onClick={() => {
                  onNext();
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
