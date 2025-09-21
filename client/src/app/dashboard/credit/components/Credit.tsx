"use client";

import {
  getAuthenticatedUser,
  lemonSqueezySetup,
} from "@lemonsqueezy/lemonsqueezy.js";

import { useEffect } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { plans as UserPlans } from "@/constants/jobs-data";

import PaystackPop from "@paystack/inline-js";
import { useRef } from "react";
import { addDays, addMonths, addWeeks, formatISO } from "date-fns";
import { IoIosInfinite } from "react-icons/io";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApprovedT } from "@/types";
import { DocumentData } from "firebase/firestore";
import ReactGA from "react-ga4";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { useUserLocation } from "@/hooks/get-user-location";
import { formatCurrencyNG, formatCurrencyUSA } from "@/lib/utils/helpers";
import {
  useApiKeys,
  useApprovedPayment,
  useCreditInfo,
  useGetCurrentUser,
} from "@/lib/queries";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export const Credit = () => {
  const { user:dbUser } = useAuth();
  const params = new URLSearchParams(window.location.search);
  const { lemon, price } = Object.fromEntries(params.entries());

  const apiKey = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_API_KEY;
  const { continent_code } = useUserLocation();

  lemonSqueezySetup({
    apiKey,
    onError: (error) => console.error("Error!", error),
  });
  useEffect(() => {
    const fetchUser = async () => {
      const { error } = await getAuthenticatedUser();

      if (error) {
        console.error(error);
      }
    };
    fetchUser();
    if (lemon) {
      toast.success("Thank you for completing your payment. 😊");

      const completePayement = async () => {
        try {
          const paymentTransaction = {
            message: "Payment from Lemon Squeezy",
            paidAt: formatISO(new Date()),
            price: price ?? 10,
            plan: "Pro",
            duration: "Month",
            redirecturl: "",
            reference: "",
            status: "",
            transaction: "",
            trxref: "",
            email: dbUser?.email ?? "",
          };

          dbUser?.approved.push(paymentTransaction);
          if (!plans.includes("Pro")) {
            plans.push("Pro");
          }

          await approvePaymentMutation({
            payment: dbUser?.approved,
            plans,
          });

          let newExpiryTime: string;
          const aMonths = addMonths(new Date(), 1);
          newExpiryTime = formatISO(aMonths);
          await creditUpdateMutation({
            credits: 10000,
            expiryTime: newExpiryTime,
          }).then(() => {
            router.push(`/dashboard/credit`);
          });
        } catch (error) {
          console.error("Error updating credits:", error);
        }
      };
      completePayement();
    }
  }, []);

  useEffect(() => {
    ReactGA.send({
      hitType: "pageview",
      page: window.location.pathname + window.location.search,
      title: "Credit page",
    });
    ReactGA.event({
      category: "Credit page view",
      action: "Visit Credit page",
      label: "Credit page view",
    });
  }, []);
  const initialOptions = {
    clientId:
      "ATL1xuwDZlEkQoL82TYykncXDdpqb9X5j8G6gDbZt4WYbaqhx-KZehO-Ll4YG-QTN6B065r7luZN-80V",
    currency: dbUser?.country?.currency || "USD",
    intent: "capture",
  };
  const APIKeyRef = useRef<DocumentData>(undefined);
  const { data: apiKeys } = useApiKeys();
  const [paypalDialog, setPaypalDialog] = useState(false);
  const handlePayPalDialog = () => {
    setPaypalDialog(!paypalDialog);
  };
  useEffect(() => {
    if (!dbUser || APIKeyRef?.current) return;
    APIKeyRef.current = apiKeys;
    if ( !dbUser?.cancelled) {
      dbUser.cancelled = [];
    }
    if ( !dbUser?.approved) {
      dbUser.approved = [];
    }
  }, [dbUser]);

  const { mutateAsync: creditUpdateMutation } = useCreditInfo();
  const { mutateAsync: approvePaymentMutation } = useApprovedPayment();
  const email = dbUser?.email;

  const plans: string[] = dbUser?.plans || [];
  const router = useRouter();

  const handlePayment = async ({
    price,
    duration,
    plan,
  }: {
    price: number;
    duration: string;
    plan: string;
  }) => {
    try {
      if (continent_code !== "AF" && !lemon) {
        router.push(`/dashboard/credit/checkout`);
        // await handleCheckout({dbUser, price: price * 2.5});
        return;
      }

      if (Number(price) < 1000) return;
      const paystack = PaystackPop.setup({
        key: APIKeyRef?.current?.pk!,
        // pk
        // payStackPublicTestKey
        email: email!,
        amount: price * 100,
        callback: async (transaction: ApprovedT) => {
          const paymentTransaction = {
            message: transaction.message,
            paidAt: formatISO(new Date()),
            price,
            plan,
            duration,
            redirecturl: transaction.redirecturl ?? "",
            reference: transaction.reference ?? "",
            status: transaction.status ?? "",
            transaction: transaction.transaction ?? "",
            trxref: transaction.trxref ?? "",
            email,
          };
          dbUser?.approved.push(paymentTransaction);
          if (!plans.includes(plan)) {
            plans.push(plan);
          }
          await approvePaymentMutation({
            payment: dbUser?.approved,
            plans,
          });
          let newExpiryTime: string;
          if (duration === "month") {
            const aMonths = addMonths(new Date(), 1);
            newExpiryTime = formatISO(aMonths);
          } else if (duration === "week") {
            const aWeeks = addWeeks(new Date(), 1);
            newExpiryTime = formatISO(aWeeks);
          } else if (duration === "day") {
            const aDays = addDays(new Date(), 1);
            newExpiryTime = formatISO(aDays);
          } else {
            console.error("Invalid duration selected.");
            return;
          }
          try {
            await creditUpdateMutation({
              credits: 10000,
              expiryTime: newExpiryTime,
            });
          } catch (error) {
            console.error("Error updating credits:", error);
          }
        },
        onClose: async () => {
          const transaction = {
            message: "Cancelled",
            paidAt: formatISO(new Date()),
            plan,
            duration,
            price,
            email,
            status: "Cancelled",
          };
          dbUser?.cancelled.push(transaction);
          // await cancelPaymentMutation({
          //   payment: dbUser?.cancelled,
          // });
        },
      });
      paystack.openIframe();
    } catch (error) {
      console.error("PAYSTACK ERROR : ", error);
    }
  };
  return (
    <div className=" w-full">
      <div id="pricing" className="mb-8">
        <div className="">
          <div className="flex flex-col pt-10">
            <div className="flex flex-col justify-center items-center">
              <h2 className="section-title text-black ">Buy Credits</h2>
              <p className=" pb-2">
                Choose the best credit plan to suit your needs
              </p>
              <div className="text-blueColor flex items-center justify-center">
                Credit Balance ={" "}
                {dbUser?.credit <= 5 ? (
                  <>{dbUser?.credit}</>
                ) : (
                  <span className="px-1 font-robotoBold text-blue-500">
                    <IoIosInfinite className="w-5 h-5 mx-2" />
                  </span>
                )}
              </div>
            </div>
            <section>
              <ul className="flex flex-wrap gap-8 mt-8 items-center justify-center px-4 sm:px-8">
                {UserPlans?.map((plan, index) => {
                  let price = formatCurrencyNG(plan.price);
                  if (continent_code !== "AF") {
                    price = formatCurrencyUSA(plan.price / 100);
                  }

                  return (
                    <Card
                      key={plan?.name}
                      className="credits-item max-w-[310px] md:w-[310px] h-[320px]"
                    >
                      <div className="flex-center flex-col gap-8 py-2 justify-between ">
                        <div className="p-20-semibold mt-2 ">
                          {" "}
                          {index === 0 ? "" : <p>{plan?.name}</p>}
                        </div>
                        <div className="h2-bold text-dark-600 text-blueColor ">
                          {index === 0 ? "Free" : <div>{price}</div>}
                        </div>
                      </div>

                      <div className="" key={index}>
                        <div className="flex items-center gap-4 ">
                          <FiCheckCircle className="" />
                          <p className="p-16-regular ">{plan?.row1}</p>
                        </div>
                        <div className="flex items-center gap-4 ">
                          <FiCheckCircle className="" />
                          <p className="p-16-regular">{plan?.row2}</p>
                        </div>
                        <div className="flex items-center gap-4 ">
                          <FiCheckCircle className="" />
                          <p className="p-16-regular ">{plan?.row3}</p>
                        </div>
                        <div className="flex items-center gap-4 ">
                          <FiCheckCircle className="" />
                          <p className="p-16-regular">{plan?.row4}</p>
                        </div>
                      </div>
                      <div>
                        <section className="flex items-center justify-center mt-4">
                          <Button
                            onClick={() =>
                              handlePayment({
                                price: plan.price,
                                duration: plan.duration!,
                                plan: plan.plan!,
                              })
                            }
                            type="button"
                            role="link"
                            // disabled={isIncrementCredit}
                            className="rounded-xl h-8 px-12 !bg-blueColor bg-cover"
                          >
                            {plan._id === 1 ? "Free" : "Buy"}
                          </Button>
                          <Dialog
                            open={paypalDialog}
                            onOpenChange={handlePayPalDialog}
                          >
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Select one payment options
                                </DialogTitle>
                                <DialogDescription>
                                  Please pay exactly the amount specified on the
                                  plan you selected.
                                </DialogDescription>
                                <div>
                                  <PayPalScriptProvider
                                    options={initialOptions}
                                  >
                                    <PayPalButtons
                                      style={{ layout: "horizontal" }}
                                    />
                                  </PayPalScriptProvider>
                                </div>
                              </DialogHeader>
                            </DialogContent>
                          </Dialog>
                        </section>
                      </div>
                    </Card>
                  );
                })}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
