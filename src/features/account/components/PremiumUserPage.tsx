"use client";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { userQueries } from "@features/user";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { daysFromToday, formatAppliedDate } from "@/lib/utils/helpers";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/shared/hooks/use-confirm";
import { toast } from "sonner";
import { api } from "@/shared/api/client";

export function PremiumUserPage() {
  const { data: user } = useQuery(userQueries.detail());
  const qc = useQueryClient();

  const isStripeUser = !!user?.stripeCustomerId;

  // cancelAtPeriodEnd=true → user has cancelled; still active until period end
  const isCancelled = !!user?.cancelAtPeriodEnd;

  // Force-refetch on every mount — catches state changes made via Stripe/Paystack
  // portal while the user was away (e.g. cancelled from Stripe billing portal).
  useEffect(() => {
    qc.invalidateQueries({ queryKey: userQueries.detail().queryKey });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Derived from server: cancelAtPeriodEnd=true means renewal is OFF
  const [autoRenewal, setAutoRenewal] = useState(true);
  useEffect(() => {
    if (user?.cancelAtPeriodEnd !== undefined && user.cancelAtPeriodEnd !== null) {
      setAutoRenewal(!user.cancelAtPeriodEnd);
    }
  }, [user?.cancelAtPeriodEnd]);

  const [loading, setLoading] = useState<"cancel" | "portal" | "autoRenewal" | "reactivate" | null>(null);

  const displayAmount = isStripeUser ? "$10.00/month" : "₦4,999.00/month";

  const [ConfirmDialog, confirm] = useConfirm(
    "Cancel Subscription",
    `Are you sure you want to cancel? You'll keep access until ${formatAppliedDate(user?.currentPeriodEnd as any)}, then lose Pro features.`,
  );

  const handleCancelSubscription = async () => {
    const confirmed = await confirm();
    if (!confirmed) return;

    if (!isStripeUser) {
      toast.info("Contact support to cancel your Paystack subscription.", {
        description: "Email us at support@cverai.com",
      });
      return;
    }

    setLoading("cancel");
    try {
      await api.post("/stripe/checkout/cancel");
      toast.success("Subscription cancelled", {
        description: `You'll retain access until ${formatAppliedDate(user?.currentPeriodEnd as any)}.`,
      });
      await qc.invalidateQueries({ queryKey: userQueries.detail().queryKey });
    } catch {
      toast.error("Failed to cancel subscription. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    if (!isStripeUser) {
      toast.info("Contact support to update your payment method.", {
        description: "Email us at support@cverai.com",
      });
      return;
    }

    setLoading("portal");
    try {
      const data = await api.post<{ data: { url: string } }>(
        "/stripe/checkout/portal",
      );
      if (data?.data?.url) {
        window.location.href = data.data.url;
      }
    } catch {
      toast.error("Failed to open billing portal. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleAutoRenewalToggle = async (enabled: boolean) => {
    if (!isStripeUser) {
      setAutoRenewal(enabled);
      toast.info("Auto-renewal management is available for Stripe subscriptions only.");
      return;
    }

    setLoading("autoRenewal");
    const previous = autoRenewal;
    setAutoRenewal(enabled);
    try {
      await api.post("/stripe/checkout/auto-renewal", { enabled });
      await qc.invalidateQueries({ queryKey: userQueries.detail().queryKey });
      toast.success(
        enabled ? "Auto-renewal enabled" : "Auto-renewal disabled",
        {
          description: enabled
            ? "Your subscription will renew automatically."
            : `Your subscription will end on ${formatAppliedDate(user?.currentPeriodEnd as any)}.`,
        },
      );
    } catch {
      setAutoRenewal(previous);
      toast.error("Failed to update auto-renewal. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleReactivate = async () => {
    if (!isStripeUser) {
      toast.info("Contact support to reactivate your Paystack subscription.", {
        description: "Email us at support@cverai.com",
      });
      return;
    }

    setLoading("reactivate");
    setAutoRenewal(true);
    try {
      await api.post("/stripe/checkout/auto-renewal", { enabled: true });
      await qc.invalidateQueries({ queryKey: userQueries.detail().queryKey });
      toast.success("Subscription reactivated", {
        description: "Your subscription will now renew automatically.",
      });
    } catch {
      setAutoRenewal(false);
      toast.error("Failed to reactivate subscription. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <ConfirmDialog />
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Pro Plan Card */}
        <div
          className={cn(
            "rounded-2xl p-4 sm:p-8 text-white shadow-lg",
            isCancelled ? "bg-[#92400E]" : "bg-[#2D60FF]",
          )}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">Pro Plan</h1>
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium",
                      isCancelled
                        ? "bg-amber-200/30 text-amber-100"
                        : "bg-white/20",
                    )}
                  >
                    {isCancelled ? "Cancelling" : "Active"}
                  </span>
                </div>
                <p className="text-white/80 text-sm">
                  {isCancelled
                    ? "Access remains until the end of your billing period"
                    : "Full access to all features"}
                </p>
                <div className="pt-4 space-y-0.5">
                  <p className="font-semibold">
                    {isCancelled ? "Access ends: " : "Next billing date: "}
                    {formatAppliedDate(user?.currentPeriodEnd as any)}
                  </p>
                  <p className="text-white/70 text-sm">
                    {isCancelled
                      ? "Your subscription will not renew — toggle Auto-Renewal to reactivate"
                      : "Your subscription will automatically renew"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/20 rounded-xl px-6 py-4 text-center sm:min-w-35">
              <div className="text-4xl font-bold">
                {daysFromToday(user?.currentPeriodEnd)}
              </div>
              <div className="text-sm text-white/80 mt-1">
                {isCancelled ? "days remaining" : "days until renewal"}
              </div>
            </div>
          </div>
        </div>

        {/* Billing Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-[#344054] mb-6">
              Billing Details
            </h2>

            <div className="space-y-0">
              <div className="flex items-center justify-between py-5 border-b border-gray-200">
                <span className="text-[#667085] font-medium">Plan Type</span>
                <span className="text-[#344054] font-semibold">Pro Plan</span>
              </div>

              <div className="flex items-center justify-between py-5 border-b border-gray-200">
                <span className="text-[#667085] font-medium">Billing Cycle</span>
                <span className="text-[#344054] font-semibold">Monthly</span>
              </div>

              <div className="flex items-center justify-between py-5 border-b border-gray-200">
                <span className="text-[#667085] font-medium">Amount</span>
                <span className="text-[#344054] font-semibold">{displayAmount}</span>
              </div>

              <div className="flex items-center justify-between py-5 border-b border-gray-200">
                <span className="text-[#667085] font-medium">Payment Method</span>
                <span className="text-[#344054] font-semibold">
                  {isStripeUser ? "•••• •••• •••• ••••" : "Paystack"}
                </span>
              </div>

              <div className="flex items-center justify-between py-5">
                <span className="text-[#667085] font-medium">Auto-Renewal</span>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={autoRenewal}
                    onCheckedChange={handleAutoRenewalToggle}
                    disabled={loading === "autoRenewal"}
                    className="data-[state=checked]:bg-[#2D60FF]"
                  />
                  <span
                    className={cn(
                      autoRenewal ? "text-green-500" : "text-[#DC2626]",
                      "font-semibold",
                    )}
                  >
                    {autoRenewal ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 sm:p-8 pt-0">
            {isCancelled ? (
              /* Cancelled state: full-width reactivate, no payment update */
              <button
                onClick={handleReactivate}
                disabled={loading === "reactivate"}
                className="col-span-1 sm:col-span-2 px-6 py-3 rounded-lg bg-[#2D60FF] text-white font-semibold hover:bg-[#2451d6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === "reactivate" ? "Reactivating…" : "Reactivate Subscription"}
              </button>
            ) : (
              <>
                <button
                  onClick={handleUpdatePaymentMethod}
                  disabled={loading === "portal"}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg text-[#344054] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === "portal" ? "Opening portal…" : "Update Payment Method"}
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={loading === "cancel"}
                  className="px-6 py-3 border-2 border-[#FECACA] rounded-lg text-[#DC2626] font-semibold hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === "cancel" ? "Cancelling…" : "Cancel Subscription"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="bg-[#FFFBEB] border border-[#FEE685] rounded-xl p-5 flex gap-4">
          <div className="shrink-0">
            <div className="w-6 h-6 rounded-full bg-[#F59E0B] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-[#92400E] font-semibold mb-1">Cancellation Policy</h3>
            <p className="text-[#92400E] text-sm leading-relaxed">
              If you cancel your subscription, you&apos;ll continue to have access until{" "}
              {formatAppliedDate(user?.currentPeriodEnd as any)}. No refunds are provided for partial months.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
