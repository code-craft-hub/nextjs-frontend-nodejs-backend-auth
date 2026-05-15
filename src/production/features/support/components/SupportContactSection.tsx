"use client";

import { Clock, Mail, Phone, type LucideIcon } from "lucide-react";
import { SupportContactForm } from "./SupportContactForm";

type ContactRow = {
  icon: LucideIcon;
  label: string;
  value: string;
};

const ROWS: ContactRow[] = [
  { icon: Mail, label: "Email", value: "info@cverai.com" },
  { icon: Phone, label: "WhatsApp", value: "+234 000 000 0000" },
  { icon: Clock, label: "Hours", value: "Mon–Fri · 9am–6pm WAT" },
];

export const SupportContactSection = () => (
  <section
    id="contact"
    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
  >
    <div className="grid lg:grid-cols-5 gap-10 items-start">
      <div className="lg:col-span-2 lg:sticky lg:top-24">
        <p className="text-sm text-[#4680EE] font-medium font-poppins mb-2">
          Still stuck?
        </p>
        <h2 className="text-3xl font-semibold text-gray-900 font-poppins mb-4">
          Send us a message — we read every one.
        </h2>
        <p className="text-gray-600 font-poppins mb-8">
          Tell us what’s going on and we’ll route you to the right person. Most
          replies come back the same working day.
        </p>
        <div className="space-y-4">
          {ROWS.map((row) => {
            const Icon = row.icon;
            return (
              <div
                key={row.label}
                className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-black/5"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E7F0FA] text-[#0A65CC] flex items-center justify-center">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-2xs uppercase tracking-wider text-gray-400 font-poppins">
                    {row.label}
                  </p>
                  <p className="font-medium text-gray-900 font-poppins">
                    {row.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-8 rounded-2xl bg-gradient-to-br from-[#4640DE] to-[#0A65CC] text-white p-6 overflow-hidden relative">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-12 -left-8 w-32 h-32 bg-white/5 rounded-full" />
          <p className="text-2xs uppercase tracking-wider text-white/70 font-poppins relative">
            Pro tip
          </p>
          <p className="font-medium mt-2 font-poppins relative">
            Include the URL of the job you were applying to — it speeds up
            debugging by a lot.
          </p>
        </div>
      </div>
      <div className="lg:col-span-3">
        <SupportContactForm />
      </div>
    </div>
  </section>
);
