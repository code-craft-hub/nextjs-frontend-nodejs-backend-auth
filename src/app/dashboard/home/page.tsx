import { requireOnboarding } from "@/lib/server-auth";
import type { Metadata } from "next";
import { HomeClient } from "./Home.tsx";
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
