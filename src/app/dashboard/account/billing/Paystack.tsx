"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userQueries } from "@module/user";
import { api, BACKEND_API_VERSION } from "@/lib/api/client";
import { generateIdempotencyKey } from "@/lib/utils/helpers";
import { toast } from "sonner";

interface InitializePaymentResponse {
  status: string;
  data: {
    data: {
      authorization_url: string;
      reference: string;
    };
  };
}

interface VerifyPaymentResponse {
  status: string;
  data: {
    isProUser: boolean;
    currentPeriodEnd?: string | null;
    status: string;
  };
}

export const PaystackPaymentGateway = ({
  active,
  trxReference,
  handleStateChange,
}: {
  active: boolean;
  trxReference?: string;
  handleStateChange: (isPro: boolean) => void;
}) => {
  const { data: user } = useQuery(userQueries.detail());
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  // Use a ref to track if verification has already run for this reference
  const hasVerified = useRef(false);

  const initializePayment = async () => {
    if (!user?.email) {
      toast.error("Unable to retrieve your account details. Please refresh and try again.");
      return;
    }

    setLoading(true);
    try {
      const idempotencyKey = generateIdempotencyKey();

      const result = await api.post<InitializePaymentResponse>(
        `/${BACKEND_API_VERSION}/paystack/payments/initialize`,
        {
          // Email is also validated server-side from the auth token.
          // This is purely for pre-filling the Paystack checkout form.
          email: user.email,
          amount: parseFloat(process.env.NEXT_PUBLIC_PAYSTACK_AMOUNT || "4999"),
          currency: "NGN",
          metadata: {
            first_name: user.firstName,
            last_name: user.lastName,
            phone: user.phoneNumber,
            custom_fields: [
              {
                display_name: "Customer Name",
                variable_name: "customer_name",
                value: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
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
        {
          headers: { "Idempotency-Key": idempotencyKey },
        }
      );

      const authorizationUrl = result?.data?.data?.authorization_url;
      if (!authorizationUrl) {
        throw new Error("Invalid response from payment server");
      }

      window.location.href = authorizationUrl;
    } catch (err: any) {
      toast.error(err?.data?.error || "Payment initialization failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (reference: string) => {
    try {
      const result = await api.get<VerifyPaymentResponse>(
        `/${BACKEND_API_VERSION}/paystack/payments/verify/${reference}`,
      );

      if (result?.data?.isProUser) {
        handleStateChange(true);
        // Refresh user data to reflect new pro status
        queryClient.invalidateQueries({ queryKey: userQueries.detail().queryKey });
      }
    } catch (err: any) {
      // Verification failed — the webhook will still process the payment.
      // Don't surface an error here; the UI will update on next data refresh.
    }
  };

  useEffect(() => {
    // Only verify once per reference, and only if we have a valid one.
    if (!trxReference || hasVerified.current) return;
    hasVerified.current = true;
    verifyPayment(trxReference);
  }, [trxReference]);

  return (
    <Button
      onClick={initializePayment}
      type="button"
      disabled={!active || loading}
      className="w-full bg-blue-600 hover:bg-blue-700"
    >
      {loading ? "Processing..." : "Complete Upgrade"}
    </Button>
  );
};
