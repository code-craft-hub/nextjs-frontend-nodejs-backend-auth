"use client";

import { Book, CheckCircle, Clock, Sparkles, type LucideIcon } from "lucide-react";

type Stat = {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: string;
};

const STATS: Stat[] = [
  { label: "Median first reply", value: "6 min", icon: Clock, tone: "text-[#388B12]" },
  { label: "Tickets solved this week", value: "1,284", icon: CheckCircle, tone: "text-[#0A65CC]" },
  { label: "Help articles", value: "120+", icon: Book, tone: "text-[#FA8F21]" },
  { label: "Customer satisfaction", value: "98%", icon: Sparkles, tone: "text-[#4640DE]" },
];

export const SupportStatusBar = () => (
  <section className="bg-white border-y border-black/5">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
      {STATS.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="flex items-center gap-4">
            <div
              className={
                "w-10 h-10 rounded-xl bg-[#F5F7FA] flex items-center justify-center " +
                s.tone
              }
            >
              <Icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900 font-poppins leading-tight">
                {s.value}
              </p>
              <p className="text-sm text-gray-500 font-poppins">{s.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  </section>
);
