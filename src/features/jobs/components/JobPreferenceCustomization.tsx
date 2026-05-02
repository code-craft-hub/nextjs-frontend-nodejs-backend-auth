import React from "react"
import { X, Bell, Plus } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function JobPreferenceCustomization() {
  return (
    <div className="min-h-screen w-full bg-[#f3f3f3] flex items-center justify-center p-10">
      <div className="w-[690px]">
        {/* Top Floating Bar */}
        <div className="relative w-full rounded-[40px] bg-white shadow-[0px_10px_25px_rgba(0,0,0,0.10)] px-8 py-5 flex items-center justify-center">
          <p className="text-[22px] font-medium text-black">
            <span className="font-semibold">12</span> jobs applied.
          </p>

          {/* Bell */}
          <div className="absolute right-[95px] top-1/2 -translate-y-1/2">
            <div className="w-[54px] h-[54px] rounded-full border border-[#e6e6e6] flex items-center justify-center bg-white">
              <Bell className="w-[22px] h-[22px] text-black" strokeWidth={2} />
            </div>
          </div>

          {/* Close */}
          <div className="absolute right-[20px] top-1/2 -translate-y-1/2">
            <X className="w-[34px] h-[34px] text-[#ff3b30]" strokeWidth={2.5} />
          </div>
        </div>

        {/* Main Card */}
        <Card className="mt-7 w-full rounded-[55px] border-0 bg-white shadow-[0px_18px_40px_rgba(0,0,0,0.08)] px-14 pt-14 pb-16">
          <h1 className="text-center text-[40px] font-black text-black tracking-[-0.5px]">
            Recommendation Preferences
          </h1>

          {/* Work arrangement */}
          <div className="mt-14">
            <h2 className="text-[26px] font-extrabold text-black">
              Work arrangement
            </h2>

            <div className="mt-7 space-y-7">
              <Row label="Remote" />
              <Row label="Onsite" />
              <Row label="Hybrid" />
            </div>
          </div>

          {/* Employment Type */}
          <div className="mt-14">
            <h2 className="text-[26px] font-extrabold text-black">
              Employment Type
            </h2>

            <div className="mt-7 space-y-7">
              <Row label="Full-time" />
              <Row label="Part-time" />
              <Row label="Contract / Freelance" />
              <Row label="Internship" />
            </div>
          </div>

          {/* Location Preferences */}
          <div className="mt-14">
            <h2 className="text-[26px] font-extrabold text-black">
              Location Preferences
            </h2>

            <div className="mt-8 flex items-center gap-4 text-[#8f8f8f] text-[22px] font-medium">
              <div className="w-[44px] h-[44px] rounded-full bg-[#f0f0f0] flex items-center justify-center">
                <Plus className="w-[22px] h-[22px]" strokeWidth={2.5} />
              </div>
              <span>Add target city or regions</span>
            </div>

            <div className="mt-8">
              <Row label="Open to relocation" />
            </div>
          </div>

          {/* Search Keywords */}
          <div className="mt-14">
            <h2 className="text-[26px] font-extrabold text-black">
              search Keywords
            </h2>

            <div className="mt-6">
              <Input
                placeholder='Enter job titles or description e.g “product designer”, “figma”'
                className="h-[68px] rounded-[14px] border border-[#e1e1e1] bg-white px-6 text-[18px] placeholder:text-[#b6b6b6] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function Row({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[22px] font-medium text-[#8c8c8c]">
        {label}
      </span>

      <Switch
        className="
          data-[state=unchecked]:bg-[#ededed]
          data-[state=checked]:bg-black
          w-[56px] h-[30px]
        "
      />
    </div>
  )
}