import { requireOnboarding } from "@/lib/server-auth";
import type { Metadata } from "next";
import { HomeClient } from "./Home.tsx";
import { DashboardTab } from "@/types/index.js";

export const metadata: Metadata = {
  title: "Cverai Dashboard",
  description: "User dashboard",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab: DashboardTab, jobDescription: string }>;
}) {
  const { tab, jobDescription } = await searchParams;
  await requireOnboarding();
  return <HomeClient tab={tab} jobDescription={jobDescription} />;
}
