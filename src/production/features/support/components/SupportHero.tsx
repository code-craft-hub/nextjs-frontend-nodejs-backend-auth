"use client";

import { useMemo, useState } from "react";
import { Activity, ArrowRight, Search, X } from "lucide-react";
import { SUPPORT_SEARCH_SUGGESTIONS } from "../constants";

type Props = {
  query: string;
  setQuery: (q: string) => void;
};

const POPULAR = [
  "AI Apply credits",
  "Cancel plan",
  "Reset password",
  "Refund",
  "WhatsApp alerts",
];

export const SupportHero = ({ query, setQuery }: Props) => {
  const [focus, setFocus] = useState(false);

  const filtered = useMemo(() => {
    if (!query) return SUPPORT_SEARCH_SUGGESTIONS.slice(0, 5);
    const q = query.toLowerCase();
    return SUPPORT_SEARCH_SUGGESTIONS.filter((s) =>
      s.toLowerCase().includes(q),
    ).slice(0, 5);
  }, [query]);

  return (
    <section
      id="home"
      style={{
        background: "url('/landing-page-menu-gradient.svg')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center center",
      }}
      className="pt-32 pb-20"
    >
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-white/80 border border-black/5 px-3 py-1.5 rounded-full text-sm text-[#4640DE] mb-6">
          <Activity size={14} className="text-[#388B12]" />
          <span className="font-medium">
            All systems normal · Avg. reply under 6 min
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl text-gray-900 mb-4 font-instrument!">
          How can we help?
        </h1>
        <p className="text-gray-600 mb-10 max-w-xl mx-auto font-poppins">
          Search articles, chat with us, or send a message. Our team replies
          fast — most questions take less than a day.
        </p>

        <div className="relative max-w-2xl mx-auto">
          <div
            className={
              "flex items-center gap-3 bg-white rounded-2xl px-5 py-4 shadow-xl shadow-blue-200/40 border " +
              (focus ? "border-[#4680EE]" : "border-transparent")
            }
          >
            <Search size={20} className="text-gray-400 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocus(true)}
              onBlur={() => setTimeout(() => setFocus(false), 150)}
              placeholder="Try ‘cancel subscription’ or ‘auto‑apply credits’"
              className="flex-1 bg-transparent outline-none font-poppins text-gray-900 placeholder:text-gray-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="button"
              className="hidden sm:inline-flex items-center gap-1 bg-[#0A65CC] hover:bg-[#085bb8] text-white text-sm font-medium px-4 py-2 rounded-xl"
            >
              Search
            </button>
          </div>
          {focus && filtered.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-black/5 overflow-hidden text-left z-20">
              <div className="px-5 py-2 text-2xs uppercase tracking-wider text-gray-400 font-poppins">
                {query ? "Matching questions" : "Popular searches"}
              </div>
              {filtered.map((s) => (
                <button
                  type="button"
                  key={s}
                  onMouseDown={() => setQuery(s)}
                  className="w-full flex items-center justify-between px-5 py-3 hover:bg-[#F5F7FA] text-sm text-gray-700 font-poppins border-t border-black/5"
                >
                  <span className="flex items-center gap-3">
                    <Search size={14} className="text-gray-400" />
                    {s}
                  </span>
                  <ArrowRight size={14} className="text-gray-400" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="text-gray-500 font-poppins">Popular:</span>
          {POPULAR.map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => setQuery(p.toLowerCase())}
              className="px-3 py-1.5 rounded-full bg-white/70 hover:bg-white border border-black/5 text-gray-700 font-poppins"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
