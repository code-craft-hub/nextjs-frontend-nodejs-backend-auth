import type { Metadata } from "next";
import { LandingPageClient } from "@/features/landing/components/LandingPageClient";

export const metadata: Metadata = {
  title: "Cver AI - Never Miss a Job Again",
  description:
    "AI-powered job search platform. Auto-apply to jobs, tailor your resume and cover letter, and prepare for interviews — all in one place.",
  openGraph: {
    title: "Cver AI - Never Miss a Job Again",
    description:
      "AI-powered job search platform. Auto-apply to jobs, tailor your resume and cover letter, and prepare for interviews — all in one place.",
    images: [{ url: "/assets/images/dashboard.png", width: 1200, height: 630, alt: "Cver AI" }],
  },
};

export const dynamic = "force-dynamic";

const LandingPage = () => {
  return <LandingPageClient />;
};

export default LandingPage;
