import React, { useState } from "react";
import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check,Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PaystackPaymentGateway } from "./Paystack";

const paymentFormSchema = z.object({
  cardNumber: z
    .string()
    .min(1, "Card number is required")
    .regex(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/, "Invalid card number format"),
  cardholderName: z
    .string()
    .min(1, "Cardholder name is required")
    .min(3, "Name must be at least 3 characters"),
  expiryDate: z
    .string()
    .min(1, "Expiry date is required")
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiry date (MM/YY)"),
  cvv: z
    .string()
    .min(1, "CVV is required")
    .regex(/^\d{3}$/, "CVV must be 3 digits"),
  zipCode: z
    .string()
    .min(1, "ZIP code is required")
    .regex(/^\d{5}$/, "ZIP code must be 5 digits"),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export function UpgradeModal({
  handleStateChange,
  trxReference,
  handleShowPlan,
}: any) {
  const [selectedPlan, setSelectedPlan] = useState("pro");

  const form = useForm<PaymentFormValues>({
    // resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      cardNumber: "",
      cardholderName: "",
      expiryDate: "",
      cvv: "",
      zipCode: "",
    },
  });

  return (
    <div className="flex items-center justify-center">
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div
            onClick={() => setSelectedPlan("free")}
            className={`bg-white rounded-2xl p-8 border-2 transition-all cursor-pointer ${
              selectedPlan === "free" ? "border-blue-500" : "border-gray-200"
            }`}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Free Tier
            </h3>
            <div className="flex items-baseline mb-6">
              <span className="text-4xl font-bold text-gray-900">₦0</span>
              <span className="text-gray-500 ml-2">/month</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-gray-700 text-sm">
                  10 tailored documents monthly
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-gray-700 text-sm">
                  Access to tailoring tools
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-gray-700 text-sm">Job board access</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-gray-700 text-sm">
                  Great for trying out
                </span>
              </div>
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
              <span className="text-4xl font-bold text-white">₦4,999</span>
              <span className="text-white/80 ml-2">/month</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(255, 255, 255, 0.2)" }}
                >
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-white text-sm">
                  Unlimited tailored documents
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(255, 255, 255, 0.2)" }}
                >
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-white text-sm">
                  40 auto-apply credits/month
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(255, 255, 255, 0.2)" }}
                >
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-white text-sm">WhatsApp auto-apply</span>
              </div>
              <div className="flex items-start gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(255, 255, 255, 0.2)" }}
                >
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-white text-sm">
                  Daily job recommendations
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(255, 255, 255, 0.2)" }}
                >
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-white text-sm">Priority support</span>
              </div>
            </div>

            <Button className="w-full font-bold font-inter mt-8 bg-white text-blue-600 hover:bg-gray-50 hover:text-blue-600">
              Choose Pro
            </Button>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Payment Details
            </h2>
           
          </div>

          <Form {...form}>
            <form
              className="space-y-6"
            >
            
              <div className="flex justify-between items-center py-4 border-t border-b border-gray-200">
                <span className="text-gray-600">Selected Plan</span>
                <span className="font-semibold text-gray-900 capitalize">
                  {selectedPlan}
                </span>
              </div>
              <div className="flex justify-between items-center py-4">
                <span className="text-gray-600">Billing Cycle</span>
                <span className="font-semibold text-gray-900">Monthly</span>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-semibold text-gray-900">
                  Total Due Today
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  ₦{selectedPlan === "pro" ? "4,999" : "0"}/mo
                </span>
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
                {/* <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Complete Upgrade
                </Button> */}
                <PaystackPaymentGateway
                  active={selectedPlan !== "free"}
                  trxReference={trxReference}
                  handleStateChange={handleStateChange}
                />
              </div>
            </form>
          </Form>

          <p className="text-center text-sm text-gray-500 mt-4">
            By completing this purchase, you agree to our Terms of Service and
            Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
