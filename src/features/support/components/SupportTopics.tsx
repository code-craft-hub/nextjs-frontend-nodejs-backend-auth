"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SUPPORT_TOPICS, type SupportTopic } from "../constants";

function TopicDialog({
  topic,
  open,
  onClose,
}: {
  topic: SupportTopic;
  open: boolean;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState<number | null>(0);
  const Icon = topic.icon;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 gap-0 rounded-3xl border-black/5">
        {/* Header band */}
        <div
          className={
            "flex items-center gap-4 px-7 pt-7 pb-6 rounded-t-3xl " +
            topic.tint.split(" ")[0]
          }
        >
          <div
            className={
              "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-white/70 " +
              topic.tint.split(" ")[1]
            }
          >
            <Icon size={24} />
          </div>
          <DialogHeader className="gap-1 text-left">
            <DialogTitle className="text-xl font-semibold text-gray-900 font-poppins">
              {topic.title}
            </DialogTitle>
            <p className="text-sm text-gray-600 font-poppins">{topic.desc}</p>
          </DialogHeader>
        </div>

        {/* Overview */}
        <div className="px-7 pt-5 pb-3">
          <p className="text-gray-600 font-poppins text-sm leading-relaxed">
            {topic.overview}
          </p>
        </div>

        {/* Articles accordion */}
        <div className="px-7 pb-7 space-y-2 mt-2">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-poppins mb-3">
            {topic.count} articles in this topic
          </p>
          {topic.articles.map((article, i) => (
            <div
              key={article.title}
              className="border border-black/5 rounded-2xl overflow-hidden bg-white"
            >
              <button
                type="button"
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-[#F5F7FA] transition-colors"
              >
                <span className="font-medium text-gray-800 font-poppins text-sm">
                  {article.title}
                </span>
                <ChevronDown
                  size={16}
                  className={
                    "text-gray-400 shrink-0 transition-transform " +
                    (expanded === i ? "rotate-180" : "")
                  }
                />
              </button>
              {expanded === i && (
                <div className="px-5 pb-5 pt-1 border-t border-dashed border-gray-100">
                  <p className="text-sm text-gray-600 font-poppins leading-relaxed pt-3">
                    {article.body}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="border-t border-black/5 px-7 py-4 flex items-center justify-between bg-[#F8FAFC] rounded-b-3xl">
          <p className="text-sm text-gray-500 font-poppins">
            Still need help?
          </p>
          <a
            href="#contact"
            onClick={onClose}
            className="inline-flex items-center gap-1 text-sm font-medium text-[#0A65CC] hover:underline font-poppins"
          >
            Send us a message <ArrowRight size={14} />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const SupportTopics = () => {
  const [active, setActive] = useState<string | null>(null);

  const activeTopic = SUPPORT_TOPICS.find((t) => t.title === active) ?? null;

  return (
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
        <a
          href="#contact"
          className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-[#0A65CC] hover:underline font-poppins"
        >
          Contact support <ChevronRight size={14} />
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SUPPORT_TOPICS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.title}
              type="button"
              onClick={() => setActive(t.title)}
              className="bg-white rounded-2xl p-6 border border-black/5 hover:border-[#4680EE]/30 hover:shadow-xl hover:shadow-blue-100/40 transition-all group text-left w-full"
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
            </button>
          );
        })}
      </div>

      {activeTopic && (
        <TopicDialog
          topic={activeTopic}
          open={true}
          onClose={() => setActive(null)}
        />
      )}
    </section>
  );
};
