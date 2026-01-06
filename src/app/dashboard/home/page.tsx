import type { Metadata } from "next";
import { HomeClient } from "./Home.tsx";
import { getCookiesToken } from "@/lib/auth.utils";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { userQueries } from "@/lib/queries/user.queries";
import { formatFirestoreDate } from "@/lib/utils/helpers";

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
  const token = (await getCookiesToken()) ?? "";
  const queryClient = createServerQueryClient();
  const user = await queryClient.fetchQuery(userQueries.detail(token));
  const isCreditExpired =
    new Date(formatFirestoreDate(user?.expiryTime)) < new Date();

  return (
    <HomeClient
      tab={tab}
      jobDescription={jobDescription}
      isCreditExpired={isCreditExpired}
    />
  );
}
