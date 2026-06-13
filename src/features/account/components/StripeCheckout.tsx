"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userQueries } from "@features/user";
import { api } from "@/shared/api/client";
import { toast } from "sonner";
import { Analytics } from "@/lib/analytics";

interface CreateSessionResponse {
  status: string;
  data: {
    url: string;
    sessionId: string;
  };
}

interface VerifySessionResponse {
  status: string;
  data: {
    isProUser: boolean;
    currentPeriodEnd?: string | null;
    status: string;
  };
}

export const StripeCheckoutGateway = ({
  active,
  sessionId,
  handleStateChange,
}: {
  active: boolean;
  sessionId?: string;
  handleStateChange: (isPro: boolean) => void;
}) => {
  useQuery(userQueries.detail());
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const hasVerified = useRef(false);

  const initializeCheckout = async () => {
    setLoading(true);
    try {
      const result = await api.post<CreateSessionResponse>(
        "/stripe/checkout/create-session",
        {},
      );

      const url = result?.data?.url;
      if (!url) throw new Error("No checkout URL returned from server");

      window.location.href = url;
    } catch (err: any) {
      toast.error(
        err?.data?.error instanceof Object
          ? err?.data?.error.message
          : err?.data?.error ||
              "Checkout initialization failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const verifySession = async (sid: string) => {
    try {
      const result = await api.get<VerifySessionResponse>(
        `/stripe/checkout/verify/${sid}`,
      );

      if (result?.data?.isProUser) {
        Analytics.paymentSuccess("pro", 10, "USD");
        handleStateChange(true);
        queryClient.invalidateQueries({
          queryKey: userQueries.detail().queryKey,
        });
      }
    } catch {
      // Verification failed — webhook will process payment. Non-fatal.
    }
  };

  useEffect(() => {
    if (!sessionId || hasVerified.current) return;
    hasVerified.current = true;
    verifySession(sessionId);
  }, [sessionId]);

  return (
    <Button
      onClick={initializeCheckout}
      type="button"
      disabled={!active || loading}
      className="w-full bg-blue-600 hover:bg-blue-700"
    >
      {loading ? "Redirecting to Stripe..." : "Complete Upgrade"}
    </Button>
  );
};
