"use client";
import { useState, useEffect } from "react";
import { OnboardingFormProps } from "@/shared/types";
import { motion } from "framer-motion";

import Progress from "./Progress";
import { Button } from "@/components/ui/button";
import { creditCard } from "@/features/landing/constants";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  expireNextThreeDays,
  generateIdempotencyKey,
} from "@/lib/utils/helpers";
import { api } from "@/shared/api/client";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@features/user";
import { toast } from "sonner";
import { useUpdateOnboarding } from "@features/user";

type PaymentProvider = "paystack" | "stripe";

interface PaymentProviderResponse {
  status: string;
  data: {
    provider: PaymentProvider;
    currency: "NGN" | "USD";
    displayAmount: string;
  };
}

interface InitializePaymentResponse {
  status: string;
  data: {
    data: {
      authorization_url: string;
      reference: string;
    };
  };
}

interface CreateSessionResponse {
  status: string;
  data: {
    url: string;
    sessionId: string;
  };
}

export const OnBoardingForm7 = ({
  onNext,
  onPrev,
  children,
}: OnboardingFormProps) => {
  const [seletePlan, setSeletePlan] = useState("free");
  const [provider, setProvider] = useState<PaymentProvider | null>(null);
  const [displayAmount, setDisplayAmount] = useState<string>("...");
  const [providerLoading, setProviderLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const { data: user } = useQuery(userQueries.detail());
  const updateOnboarding = useUpdateOnboarding({
    userFirstName: user?.firstName,
  });
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    api
      .get<PaymentProviderResponse>("/payments/provider")
      .then((res) => {
        console.log("Payment provider response:", res);
        if (cancelled) return;
        setProvider(res.data.provider);
        setDisplayAmount(res.data.displayAmount);
      })
      .catch(() => {
        if (cancelled) return;
        // Default to Stripe on error — safe fallback for non-Nigerians
        setProvider("stripe");
        setDisplayAmount("$10");
      })
      .finally(() => {
        if (!cancelled) setProviderLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleComplete = async (plan: string) => {
    try {
      await updateOnboarding.mutateAsync({
        stepNumber: 6,
        plan: "basic",
        expiryTime: expireNextThreeDays,
        credit: 5,
      });

      if (plan === "free") {
        onNext();
        return;
      }

      setPaymentLoading(true);
      try {
        if (provider === "paystack") {
          const idempotencyKey = generateIdempotencyKey();
          const result = await api.post<InitializePaymentResponse>(
            "/paystack/payments/initialize",
            {
              // Email is also validated server-side from the auth token.
              // This is purely for pre-filling the Paystack checkout form.
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
                    value: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim(),
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
            },
            { headers: { "Idempotency-Key": idempotencyKey } },
          );

          const authorizationUrl = result?.data?.data?.authorization_url;
          if (!authorizationUrl) {
            throw new Error("Invalid response from payment server");
          }
          window.location.href = authorizationUrl;
        } else {
          // Stripe — server controls everything, empty body is correct
          const result = await api.post<CreateSessionResponse>(
            "/stripe/checkout/create-session",
            {},
          );
          const url = result?.data?.url;
          if (!url) throw new Error("No checkout URL returned from server");
          window.location.href = url;
        }
      } catch (err: any) {
        toast.error(
          err?.data?.error || "Payment initialization failed. Please try again.",
        );
        toast("Skip this process", {
          action: {
            label: "Skip",
            onClick: () => router.push("/dashboard/home"),
          },
        });
      } finally {
        setPaymentLoading(false);
      }
    } catch (error) {
      console.error("Onboarding completion failed:", error);
      toast("Skip this process", {
        action: {
          label: "Skip",
          onClick: () => router.push("/dashboard/home"),
        },
      });
    }
  };

  const isPaystack = provider === "paystack";
  const freeDisplayPrice = isPaystack ? "₦0" : "$0";
  const isButtonDisabled =
    updateOnboarding.isPending || providerLoading || paymentLoading;

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
        <div className="w-full sm:bg-white sm:p-4 md:p-8 lg:p-16 sm:shadow-[0px_5px_5px_rgba(0,0,0,0.2)] rounded-[10px] box-border">
          <div className="flex flex-col gap-y-8 items-start w-full">
            <h1 className="text-lg sm:text-2xl leading-9 font-medium text-black text-center w-full font-poppins">
              Unlock the full potential of{" "}
              <span className="text-primary">Cver</span>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              {creditCard.map((plan) => {
                const isPro = plan.tier.toLowerCase() === "pro";
                const priceDisplay = isPro ? displayAmount : freeDisplayPrice;

                return (
                  <div
                    key={plan.tier}
                    className="bg-[#FAFAFA] rounded-xl shadow-xl shadow-blue-50 p-8 flex flex-col justify-between"
                  >
                    <div>
                      <div className="mb-8">
                        <h3 className="text-2xl text-gray-900 mb-2">
                          {plan.tier} Tier
                        </h3>
                        <div className="flex items-baseline mb-4">
                          <p className="text-5xl text-gray-900">
                            {priceDisplay}
                            <span className="text-gray-400 text-[14px]">
                              / month
                            </span>
                          </p>
                        </div>
                      </div>
                      <ul className="space-y-4 px-8 mb-8 list-disc">
                        {plan.features.map((feature) => (
                          <li
                            key={feature}
                            className="items-center text-black text-xs"
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
                        seletePlan?.toLowerCase() ===
                          plan.tier.toLowerCase() && "border-2 border-blue-500",
                      )}
                      onClick={() => {
                        setSeletePlan(plan.tier.toLowerCase());
                        handleComplete(plan.tier.toLowerCase());
                      }}
                      disabled={isButtonDisabled}
                      type="button"
                    >
                      {paymentLoading &&
                      seletePlan === plan.tier.toLowerCase()
                        ? "Processing..."
                        : "Choose this plan"}
                    </Button>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-row items-center gap-4">
              <Button
                variant={"outline"}
                onClick={() => onPrev()}
              >
                Previous
              </Button>
              <Button
                disabled={isButtonDisabled}
                onClick={() => handleComplete("free")}
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
