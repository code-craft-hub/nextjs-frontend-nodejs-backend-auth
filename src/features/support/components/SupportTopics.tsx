"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { SUPPORT_TOPICS } from "../constants";

export const SupportTopics = () => (
  <section
    id="topics"
    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
  >
    <div className="flex items-end justify-between mb-10">
      <div>
        <p className="text-sm text-[#4680EE] font-medium font-poppins mb-2">
          Help center
        </p>
        <h2 className="text-3xl font-semibold text-gray-900 font-poppins">
          Browse by topic
        </h2>
      </div>
      <Link
        href="/support/articles"
        className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-[#0A65CC] hover:underline"
      >
        See all 120 articles <ChevronRight size={14} />
      </Link>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {SUPPORT_TOPICS.map((t) => {
        const Icon = t.icon;
        return (
          <Link
            key={t.title}
            href={t.href}
            className="bg-white rounded-2xl p-6 border border-black/5 hover:border-[#4680EE]/30 hover:shadow-xl hover:shadow-blue-100/40 transition-all group"
          >
            <div
              className={
                "w-12 h-12 rounded-xl flex items-center justify-center mb-5 " +
                t.tint
              }
            >
              <Icon size={22} />
            </div>
            <h3 className="font-semibold text-gray-900 font-poppins mb-1">
              {t.title}
            </h3>
            <p className="text-sm text-gray-600 font-poppins">{t.desc}</p>
            <div className="mt-5 flex items-center justify-between text-sm font-poppins">
              <span className="text-gray-400">{t.count} articles</span>
              <span className="text-[#0A65CC] inline-flex items-center gap-1 group-hover:gap-2 transition-all font-medium">
                Explore <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  </section>
);
