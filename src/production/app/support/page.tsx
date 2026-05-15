import type { Metadata } from "next";
import { SupportPageClient } from "@/features/support/components/SupportPageClient";

export const metadata: Metadata = {
  title: "Support · Cver AI",
  description:
    "Get help with Cver AI — AI Apply, resume tailoring, billing, and account questions. Search articles, chat on WhatsApp, or send us a message.",
  openGraph: {
    title: "Support · Cver AI",
    description:
      "Get help with Cver AI — AI Apply, resume tailoring, billing, and account questions.",
  },
};

export const dynamic = "force-dynamic";

const SupportPage = () => {
  return <SupportPageClient />;
};

export default SupportPage;
