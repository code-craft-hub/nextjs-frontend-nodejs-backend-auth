import type { Metadata } from "next";
import { HomeClient } from "./Home.tsx";

export const metadata: Metadata = {
  title: "Cver AI - Never Miss a Job Again",
  description: "Manage your career documents and interview prep",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab: any; jobDescription: string }>;
}) {
  const { tab, jobDescription } = await searchParams;

  return <HomeClient tab={tab} jobDescription={jobDescription} />;
}
