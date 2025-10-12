import { requireOnboarding } from "@/lib/server-auth";
import type { Metadata } from "next";
import { HomeClient } from "./Home.tsx";
// import { getQueryClient } from "@/lib/query-client.js";
// import { apiService } from "@/hooks/use-auth.js";
// import { COLLECTIONS } from "@/lib/utils/constants.js";
export const metadata: Metadata = {
  title: "Cverai Dashboard",
  description: "User dashboard",
};

export default async function HomePage() {
  const session = await requireOnboarding();
  // const queryClient = getQueryClient();
  // queryClient.prefetchQuery({
  //   queryKey: ["auth", "careerDoc"],
  //   queryFn: () => {
  //     apiService.getAllDoc(COLLECTIONS.COVER_LETTER);
  //     apiService.getAllDoc(COLLECTIONS.RESUME);
  //     apiService.getAllDoc(COLLECTIONS.INTERVIEW_QUESTION);
  //   },
  // });
  return <HomeClient initialUser={session} />;
}
