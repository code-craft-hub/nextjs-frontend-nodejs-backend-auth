"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { SUPPORT_FAQS } from "../constants";

type Props = { query: string };

export const SupportFaq = ({ query }: Props) => {
  const [open, setOpen] = useState<number | null>(0);

  const filtered = useMemo(() => {
    if (!query) return SUPPORT_FAQS;
    const q = query.toLowerCase();
    return SUPPORT_FAQS.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.cat.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <section id="faq" className="bg-[#F8FAFC] border-y border-black/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <p className="text-sm text-[#4680EE] font-medium font-poppins mb-2">
            Frequently asked
          </p>
          <h2 className="text-3xl font-semibold text-gray-900 font-poppins">
            {query
              ? `Showing ${filtered.length} result${filtered.length === 1 ? "" : "s"}`
              : "Quick answers"}
          </h2>
        </div>
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-black/5">
              <p className="text-gray-700 font-poppins font-medium">
                No matching articles yet.
              </p>
              <p className="text-gray-500 font-poppins text-sm mt-1">
                Try a different keyword or message us directly below.
              </p>
            </div>
          ) : (
            filtered.map((item, i) => (
              <div
                key={item.question}
                className="bg-white rounded-2xl border border-black/5 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full px-6 py-5 flex items-start justify-between gap-4 text-left hover:bg-gray-50"
                >
                  <div className="min-w-0">
                    <span className="inline-block text-2xs uppercase tracking-wider text-[#4680EE] bg-[#E7F0FA] px-2 py-0.5 rounded-full font-poppins mb-2">
                      {item.cat}
                    </span>
                    <div className="font-medium text-[#030712] font-poppins">
                      {item.question}
                    </div>
                  </div>
                  <ChevronDown
                    className={
                      "text-gray-400 shrink-0 mt-1 transition-transform " +
                      (open === i ? "rotate-180" : "")
                    }
                  />
                </button>
                {open === i && (
                  <div className="px-6 pb-6 pt-1 text-gray-600 font-poppins border-t border-dashed border-gray-200">
                    <p className="pt-4">{item.answer}</p>
                    <div className="mt-4 flex items-center gap-4 text-sm">
                      <span className="text-gray-400">Was this helpful?</span>
                      <button
                        type="button"
                        className="px-3 py-1 rounded-full border border-black/10 hover:bg-[#F5F7FA] text-gray-700"
                      >
                        👍 Yes
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1 rounded-full border border-black/10 hover:bg-[#F5F7FA] text-gray-700"
                      >
                        👎 No
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
