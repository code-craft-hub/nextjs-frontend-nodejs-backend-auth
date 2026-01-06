import { useState } from "react";
import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";

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

export function UpdatePaymentPlan({
  handleStateChange,
}: {
  handleStateChange: any;
}) {
  const [selectedPlan, _setSelectedPlan] = useState("pro");

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

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted.slice(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    let cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      cleaned = cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    return cleaned.slice(0, 5);
  };

  const onSubmit = async () => {
    const ok = await confirm();

    if (ok) {
      handleStateChange(true);
      toast("Payment Successful!", {
        description: `You've successfully upgraded to the ${selectedPlan} plan.`,
      });
    }
  };

  const [ConfirmDialog, confirm] = useConfirm(
    "Cancel Subscription",
    "Are you sure you want to cancel your subscription?"
  );

  return (
    <div className="flex items-center justify-center">
      <ConfirmDialog />

      <div className="w-full">
        <div className="bg-white rounded-2xl p-8 shadow-lg relative">
          <div className="flex items-center justify-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Payment Details
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-gray-600 absolute top-2 right-2"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="1234 5678 9012 3456"
                          {...field}
                          onChange={(e) => {
                            const formatted = formatCardNumber(e.target.value);
                            field.onChange(formatted);
                          }}
                          maxLength={19}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cardholderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cardholder Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="MM/YY"
                          {...field}
                          onChange={(e) => {
                            const formatted = formatExpiryDate(e.target.value);
                            field.onChange(formatted);
                          }}
                          maxLength={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cvv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123"
                          {...field}
                          onChange={(e) => {
                            const cleaned = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 3);
                            field.onChange(cleaned);
                          }}
                          maxLength={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="12345"
                          {...field}
                          onChange={(e) => {
                            const cleaned = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 5);
                            field.onChange(cleaned);
                          }}
                          maxLength={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-[#F9FAFB] p-4 sm:p-6 rounded-lg">
                <div className="flex justify-between items-center border-gray-200">
                  <span className="text-gray-600">Selected Plan</span>
                  <span className="font-semibold text-gray-900 capitalize">
                    {selectedPlan}
                  </span>
                </div>
                <div className="flex justify-between items-center py-4">
                  <span className="text-gray-600">Billing Cycle</span>
                  <span className="font-semibold text-gray-900">Monthly</span>
                </div>

                <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                  <span className="text-lg font-semibold text-gray-900 font-inter">
                    Total Due Today
                  </span>
                  <span className="text-2xl font-medium text-blue-600 font-jakarta">
                    ₦{selectedPlan === "pro" ? "4,999" : "0"}/mo
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Complete Upgrade
                </Button>
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
