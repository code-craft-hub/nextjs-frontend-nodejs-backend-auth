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
  searchParams: Promise<{ tab: DashboardTab }>;
}) {
  const { tab } = await searchParams;
  const session = await requireOnboarding();
  return <HomeClient initialUser={session} tab={tab} />;
}
