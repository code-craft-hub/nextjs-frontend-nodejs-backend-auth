import React, { Suspense } from "react";
import { getQueryClient } from "@/lib/query-client";
import { getServerSession } from "@/lib/server-auth";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getUser } from "@/lib/server-fetch.utils";
import { LandingPageClient } from "./landing-page";

const LandingPage = async () => {
  async function prefetchUserData() {
    const queryClient = getQueryClient();
    const user = await getServerSession();
  
    console.log("User in layout:", user);
    const userPromise = queryClient.prefetchQuery({
      queryKey: ["getCurrentUser"],
      queryFn: () => getUser(),
      // staleTime: 5 * 60 * 1000, // 5 minutes
    });
  
    userPromise.catch(console.error);
  
    return queryClient;
  }
  
  const queryClient = await prefetchUserData();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="dashboard-layout">
        <Suspense fallback={<div>Loading ...</div>}>
          <LandingPageClient />
        </Suspense>
      </div>
    </HydrationBoundary>
  );
};

export default LandingPage;
