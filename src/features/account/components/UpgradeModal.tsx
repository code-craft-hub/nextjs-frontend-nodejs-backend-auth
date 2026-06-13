import { useEffect, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaystackPaymentGateway } from "./Paystack";
import { StripeCheckoutGateway } from "./StripeCheckout";
import { api } from "@/shared/api/client";

type PaymentProvider = "paystack" | "stripe";

interface PaymentProviderResponse {
  status: string;
  data: {
    provider: PaymentProvider;
    currency: "NGN" | "USD";
    displayAmount: string;
  };
}

export function UpgradeModal({
  handleStateChange,
  trxReference,
  stripeSessionId,
  handleShowPlan,
}: {
  handleStateChange: (isPro: boolean) => void;
  trxReference?: string;
  stripeSessionId?: string;
  handleShowPlan: (show: boolean) => void;
}) {
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [provider, setProvider] = useState<PaymentProvider | null>(null);
  const [displayAmount, setDisplayAmount] = useState<string>("...");
  const [providerLoading, setProviderLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get<PaymentProviderResponse>("/payments/provider")
      .then((res) => {
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
    return () => { cancelled = true; };
  }, []);

  const isPaystack = provider === "paystack";
  const proPrice = isPaystack ? "₦4,999" : "$10";
  const freePrice = isPaystack ? "₦0" : "$0";

  return (
    <div className="flex items-center justify-center">
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Free Tier */}
          <div
            onClick={() => setSelectedPlan("free")}
            className={`bg-white rounded-2xl p-8 border-2 transition-all cursor-pointer ${
              selectedPlan === "free" ? "border-blue-500" : "border-gray-200"
            }`}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Free Tier</h3>
            <div className="flex items-baseline mb-6">
              <span className="text-4xl font-bold text-gray-900">{freePrice}</span>
              <span className="text-gray-500 ml-2">/month</span>
            </div>
            <div className="space-y-3">
              {["10 tailored documents monthly", "Access to tailoring tools", "Job board access", "Great for trying out"].map((f) => (
                <div key={f} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700 text-sm">{f}</span>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full font-bold font-inter mt-8 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-600"
            >
              Choose Plan
            </Button>
          </div>

          {/* Pro Tier */}
          <div
            onClick={() => setSelectedPlan("pro")}
            className={`rounded-2xl p-8 border-2 transition-all cursor-pointer relative overflow-hidden ${
              selectedPlan === "pro" ? "border-blue-400" : "border-transparent"
            }`}
            style={{
              background: "linear-gradient(135deg, #155DFC 0%, #9810FA 100%)",
              boxShadow:
                selectedPlan === "pro"
                  ? "0px 0px 0px 1.55947px #FFFFFF, 0px 0px 0px 4.67841px #51A2FF"
                  : "none",
            }}
          >
            <div
              className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
              style={{ background: "#FDC700" }}
            >
              <Sparkles className="w-3 h-3" />
              POPULAR
            </div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-white">Pro Tier</h3>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-baseline mb-6">
              <span className="text-4xl font-bold text-white">{proPrice}</span>
              <span className="text-white/80 ml-2">/month</span>
            </div>
            <div className="space-y-3">
              {[
                "Unlimited tailored documents",
                "40 auto-apply credits/month",
                "WhatsApp auto-apply",
                "Daily job recommendations",
                "Priority support",
              ].map((f) => (
                <div key={f} className="flex items-start gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "rgba(255, 255, 255, 0.2)" }}
                  >
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white text-sm">{f}</span>
                </div>
              ))}
            </div>
            <Button className="w-full font-bold font-inter mt-8 bg-white text-blue-600 hover:bg-gray-50 hover:text-blue-600">
              Choose Pro
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>

          <div className="space-y-0">
            <div className="flex justify-between items-center py-4 border-t border-b border-gray-200">
              <span className="text-gray-600">Selected Plan</span>
              <span className="font-semibold text-gray-900 capitalize">{selectedPlan}</span>
            </div>
            <div className="flex justify-between items-center py-4">
              <span className="text-gray-600">Billing Cycle</span>
              <span className="font-semibold text-gray-900">Monthly</span>
            </div>
            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-semibold text-gray-900">Total Due Today</span>
              <span className="text-2xl font-bold text-blue-600">
                {selectedPlan === "pro" ? displayAmount : freePrice}/mo
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Button
              onClick={() => handleShowPlan(false)}
              type="button"
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>

            {/* Render the correct gateway based on provider */}
            {providerLoading ? (
              <Button disabled className="w-full bg-blue-600">
                Loading...
              </Button>
            ) : isPaystack ? (
              <PaystackPaymentGateway
                active={selectedPlan !== "free"}
                trxReference={trxReference}
                handleStateChange={handleStateChange}
              />
            ) : (
              <StripeCheckoutGateway
                active={selectedPlan !== "free"}
                sessionId={stripeSessionId}
                handleStateChange={handleStateChange}
              />
            )}
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            By completing this purchase, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
