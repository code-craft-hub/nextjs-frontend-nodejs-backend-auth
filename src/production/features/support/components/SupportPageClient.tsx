"use client";

import { useState } from "react";
import { Footer } from "@/components/landing-page/Footer";
import { Header } from "@/features/landing/components/Header";
import { SupportHero } from "./SupportHero";
import { SupportQuickChannels } from "./SupportQuickChannels";
import { SupportTopics } from "./SupportTopics";
import { SupportFaq } from "./SupportFaq";
import { SupportStatusBar } from "./SupportStatusBar";
import { SupportContactSection } from "./SupportContactSection";

export const SupportPageClient = () => {
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-poppins">
      <Header />
      <SupportHero query={query} setQuery={setQuery} />
      <SupportQuickChannels />
      <SupportTopics />
      <SupportFaq query={query} />
      <SupportStatusBar />
      <SupportContactSection />
      <Footer />
    </div>
  );
};
