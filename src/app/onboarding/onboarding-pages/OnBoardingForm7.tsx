import { useState } from "react";
import { OnboardingFormProps } from "@/types";
import { motion } from "framer-motion";

import Progress from "./Progress";
import { Button } from "@/components/ui/button";
import { creditCard } from "@/app/(landing-page)/constants";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  expireNextThreeDays,
  generateIdempotencyKey,
} from "@/lib/utils/helpers";
import { BASEURL } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries/user.queries";
import { toast } from "sonner";
import { useUpdateOnboarding } from "@/hooks/mutations";

export const OnBoardingForm7 = ({ onPrev, children }: OnboardingFormProps) => {
  const [seletePlan, setSeletePlan] = useState("free");
  const { completeOnboarding, isOnboardingLoading } = useAuth();
  const { data: user } = useQuery(userQueries.detail());

  const updateOnboarding = useUpdateOnboarding({
    userFirstName: user?.firstName,
  });

  const router = useRouter();
  const handleComplete = async (plan: string) => {
    try {
      updateOnboarding.mutate({
        stepNumber: 6,
        plan: "basic",
        expiryTime: expireNextThreeDays,
        credit: 5,
      });

      await completeOnboarding();

      if (plan === "free") {
        router.push("/dashboard/home");
        return;
      }

      try {
        const idempotencyKey: string = generateIdempotencyKey();

        const response = await fetch(
          `${BASEURL}/paystack/payments/initialize`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Idempotency-Key": idempotencyKey,
            },
            credentials: "include",
            body: JSON.stringify({
              email: user?.email,
              amount: parseFloat(
                process.env.NEXT_PUBLIC_PAYSTACK_AMOUNT || "4999",
              ),
              currency: "NGN",
              metadata: {
                first_name: user?.firstName,
                last_name: user?.lastName,
                phone: user?.phoneNumber,
                custom_fields: [
                  {
                    display_name: "Customer Name",
                    variable_name: "customer_name",
                    value: `${user?.firstName} ${user?.lastName}`,
                  },
                ],
              },
              channels: [
                "card",
                "bank",
                "ussd",
                "qr",
                "mobile_money",
                "bank_transfer",
              ],
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Payment initialization failed");
        }

        const result = await response.json();

        if (result.status === "success" && result.data?.data) {
          const paymentData = result.data.data;
          window.location.href = paymentData.authorization_url;
        } else {
          throw new Error(result.message || "Payment initialization failed");
        }
      } catch (err: any) {
        console.error("Payment error:", err);
        toast("Skip this process", {
          action: {
            label: "Skip",
            onClick: () => {
              router.push(`/dashboard/home`);
            },
          },
        });
      } finally {
      }
    } catch (error) {
      console.error("Onboarding completion failed:", error);
      toast("Skip this process", {
        action: {
          label: "Skip",
          onClick: () => {
            router.push(`/dashboard/home`);
          },
        },
      });
    }
  };
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
      <div className="flex flex-col items-start gap-9 w-full max-w-screen-2xl">
        <div className="flex flex-row justify-between items-center w-full">
          <div className="flex col-span-2 items-center space-x-2">
            <img src="/cverai-logo.png" className="w-28 h-8" alt="" />
          </div>
          <Progress min={7} max={7} progress={100} />
        </div>
        <div className="w-full sm:bg-white sm:p-4 md:p-8 lg:p-16 sm:shadow-[0px_5px_5px_rgba(0,0,0,0.2)] rounded-[10px]  box-border">
          <div className="flex flex-col gap-y-8 items-start w-full">
            <h1 className="text-lg sm:text-2xl leading-9 font-medium text-black text-center w-full font-poppins">
              Unlock the full potential of{" "}
              <span className="text-primary">Cver</span>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              {creditCard.map((plan) => (
                <div
                  key={plan.tier}
                  className="bg-[#FAFAFA] rounded-xl shadow-xl shadow-blue-50 p-8 flex flex-col justify-between"
                >
                  <div className="">
                    <div className=" mb-8">
                      <h3 className="text-2xl  text-gray-900 mb-2">
                        {plan.tier} Tier
                      </h3>
                      <div className="flex items-baseline  mb-4">
                        <p className="text-5xl  text-gray-900">
                          {plan.price?.toLocaleString("en-NG", {
                            style: "currency",
                            currency: "NGN",
                            minimumFractionDigits: 0,
                          })}
                          <span className="text-gray-400 text-[14px]">
                            / month
                          </span>
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-4 px-8 mb-8 list-disc ">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className=" items-center text-black text-xs"
                        >
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    variant="outline"
                    className={cn(
                      "bg-primary/10 hover:bg-primary/30 h-12! text-blue-500 hover:text-blue-500",
                      seletePlan?.toLowerCase() === plan.tier.toLowerCase() &&
                        "border-2 border-blue-500",
                    )}
                    onClick={() => {
                      setSeletePlan(plan.tier.toLowerCase());
                      handleComplete(plan.tier.toLowerCase());
                    }}
                    disabled={isOnboardingLoading}
                    type="button"
                  >
                    Choose this plan
                  </Button>
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
                disabled={isOnboardingLoading}
                onClick={() => {
                  handleComplete("free");
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
