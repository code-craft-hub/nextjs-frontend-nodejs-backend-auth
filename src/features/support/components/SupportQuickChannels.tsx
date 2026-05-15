"use client";

import { ArrowRight } from "lucide-react";
import { SUPPORT_CHANNELS } from "../constants";

export const SupportQuickChannels = () => (
  <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {SUPPORT_CHANNELS.map((c) => {
        const Icon = c.icon;
        return (
          <a
            key={c.title}
            href={c.href}
            className="group bg-white rounded-2xl p-6 shadow-xl shadow-blue-100/40 hover:-translate-y-1 transition-all border border-black/5 flex flex-col"
          >
            <div
              className={
                "w-12 h-12 rounded-xl flex items-center justify-center text-white mb-5 " +
                c.bg
              }
            >
              <Icon size={22} />
            </div>
            <h3 className="font-semibold text-gray-900 font-poppins">
              {c.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1 font-poppins">{c.desc}</p>
            <div className="mt-auto pt-5 flex items-center justify-between">
              <span className="text-2xs uppercase tracking-wider text-gray-400 font-poppins">
                {c.meta}
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-[#0A65CC] group-hover:gap-2 transition-all">
                {c.cta} <ArrowRight size={14} />
              </span>
            </div>
          </a>
        );
      })}
    </div>
  </section>
);
