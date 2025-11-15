import React from "react";
import { Switch } from "@/components/ui/switch";
import { SegmentedProgress } from "./SegmentedProgress";

export function ProModal() {
  const [autoRenewal, setAutoRenewal] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Pro Plan Card */}
        <div className="bg-[#2D60FF] rounded-2xl p-4 sm:p-8 text-white shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <SegmentedProgress
                percentage={40}
                size={64}
                bgColor="bg-blue-600"
                segmentColor="white"
                textColor="text-white"
                fontSize="text-lg"
              />

              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">Pro Plan</h1>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>
                <p className="text-white/80 text-sm">
                  Full access to all features
                </p>

                <div className="pt-4 space-y-0.5">
                  <p className="font-semibold">
                    Next billing date: Nov 23, 2025
                  </p>
                  <p className="text-white/70 text-sm">
                    Your subscription will automatically renew
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section - Days Counter */}
            <div className="bg-white/20 rounded-xl px-6 py-4 text-center sm:min-w-[140px]">
              <div className="text-4xl font-bold">12</div>
              <div className="text-sm text-white/80 mt-1">
                days until renewal
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
              {/* Plan Type */}
              <div className="flex items-center justify-between py-5 border-b border-gray-200">
                <span className="text-[#667085] font-medium">Plan Type</span>
                <span className="text-[#344054] font-semibold">Pro Plan</span>
              </div>

              {/* Billing Cycle */}
              <div className="flex items-center justify-between py-5 border-b border-gray-200">
                <span className="text-[#667085] font-medium">
                  Billing Cycle
                </span>
                <span className="text-[#344054] font-semibold">Monthly</span>
              </div>

              {/* Amount */}
              <div className="flex items-center justify-between py-5 border-b border-gray-200">
                <span className="text-[#667085] font-medium">Amount</span>
                <span className="text-[#344054] font-semibold">
                  N4,999.00/month
                </span>
              </div>

              {/* Payment Method */}
              <div className="flex items-center justify-between py-5 border-b border-gray-200">
                <span className="text-[#667085] font-medium">
                  Payment Method
                </span>
                <span className="text-[#344054] font-semibold">
                  •••• •••• •••• 4242
                </span>
              </div>

              {/* Auto-Renewal */}
              <div className="flex items-center justify-between py-5">
                <span className="text-[#667085] font-medium">Auto-Renewal</span>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={autoRenewal}
                    onCheckedChange={setAutoRenewal}
                    className="data-[state=checked]:bg-[#2D60FF]"
                  />
                  <span className="text-[#DC2626] font-semibold">Disabled</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 sm:p-8 pt-0">
            <button className="px-6 py-3 border-2 border-gray-300 rounded-lg text-[#344054] font-semibold hover:bg-gray-50 transition-colors">
              Update Payment Method
            </button>
            <button className="px-6 py-3 border-2 border-[#FECACA] rounded-lg text-[#DC2626] font-semibold hover:bg-red-50 transition-colors">
              Cancel Subscription
            </button>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="bg-[#FFFBEB] border border-[#FEE685] rounded-xl p-5 flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 rounded-full bg-[#F59E0B] flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-[#92400E] font-semibold mb-1">
              Cancellation Policy
            </h3>
            <p className="text-[#92400E] text-sm leading-relaxed">
              If you cancel your subscription, you'll continue to have access
              until the end of your current billing period (Nov 23, 2025). No
              refunds are provided for partial months.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
