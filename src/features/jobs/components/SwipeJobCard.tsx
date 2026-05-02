import React from "react"
import { Card } from "@/components/ui/card"
import { Clock, ExternalLink, MapPin, X, Check } from "lucide-react"

export default function SwipeJobCard() {
  return (
      <Card className="w-[980px] rounded-[60px] bg-white shadow-2xl border-0 px-[70px] pt-[55px] pb-[70px]">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h1 className="text-[56px] leading-[1.05] font-black text-black tracking-[-1px]">
            Senior Product Designer
          </h1>

          <div className="flex items-center gap-6 pt-3">
            <div className="flex items-center gap-3 text-[#7a7a7a] font-medium text-[30px]">
              <Clock className="w-[34px] h-[34px]" strokeWidth={2} />
              <span>13h</span>
            </div>

            <ExternalLink
              className="w-[34px] h-[34px] text-[#7a7a7a]"
              strokeWidth={2}
            />
          </div>
        </div>

        {/* Pills */}
        <div className="mt-10 flex items-center gap-6">
          <div className="rounded-full bg-[#f2f2f2] px-10 py-5 text-[28px] font-semibold text-black">
            £85k–£110k/yr
          </div>

          <div className="rounded-full bg-[#f2f2f2] px-10 py-5 text-[28px] font-semibold text-black">
            Remote
          </div>

          <div className="rounded-full bg-[#f2f2f2] px-10 py-5 text-[28px] font-semibold text-black">
            Full-time
          </div>
        </div>

        {/* Company */}
        <div className="mt-12 flex items-center gap-7">
          <div className="w-[78px] h-[78px] rounded-full overflow-hidden bg-gray-200">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=200&q=80"
              alt="Stripe"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col">
            <div className="text-[44px] font-normal text-black leading-none">
              Stripe
            </div>

            <div className="mt-3 flex items-center gap-3 text-[#8a8a8a] text-[26px] font-medium">
              <MapPin className="w-[28px] h-[28px]" strokeWidth={2} />
              <span>United Kingdom, Europe</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-14">
          <div className="text-[#9a9a9a] text-[26px] font-medium">
            Description
          </div>

          <p className="mt-6 text-[26px] leading-[1.8] text-[#2b2b2b] font-medium max-w-[860px]">
            We’re looking for a Product Designer who can turn ideas into
            intuitive, engaging digital experiences. Someone who understands
            users, simplifies complexity, and designs products that are not just
            visually appealing but actually....
          </p>

          <button className="mt-8 text-[28px] font-semibold text-[#2f6df6]">
            See full description
          </button>
        </div>

        {/* Actions */}
        <div className="mt-20 flex items-end justify-between px-[60px]">
          {/* Ignore */}
          <div className="flex flex-col items-center gap-6">
            <div className="w-[120px] h-[120px] rounded-full bg-white shadow-[0px_18px_40px_rgba(0,0,0,0.12)] flex items-center justify-center">
              <X className="w-[54px] h-[54px] text-[#ef4444]" strokeWidth={3} />
            </div>
            <div className="text-[40px] font-black text-black">Ignore</div>
          </div>

          {/* Auto Apply */}
          <div className="flex flex-col items-center gap-6">
            <div className="w-[120px] h-[120px] rounded-full bg-white shadow-[0px_18px_40px_rgba(0,0,0,0.12)] flex items-center justify-center">
              <Check
                className="w-[54px] h-[54px] text-[#22c55e]"
                strokeWidth={3}
              />
            </div>
            <div className="text-[40px] font-black text-black">
              Auto-Apply
            </div>
          </div>
        </div>
      </Card>
  )
}