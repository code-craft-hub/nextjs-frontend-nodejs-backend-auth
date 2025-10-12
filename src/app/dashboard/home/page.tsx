import { requireOnboarding } from "@/lib/server-auth";
import type { Metadata } from "next";
import { HomeClient } from "./Home.tsx";
export const metadata: Metadata = {
  title: "Cverai Dashboard",
  description: "User dashboard",
};

export default async function HomePage() {
  const session = await requireOnboarding();
  return <HomeClient initialUser={session} />;
}
