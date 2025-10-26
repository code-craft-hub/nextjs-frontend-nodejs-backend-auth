import { userQueries } from "@/lib/queries/user.queries";
import { AccountPage } from "./Account";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { dehydrate } from "@tanstack/react-query";
import { HydrationBoundary } from "@/components/hydration-boundary";

const ProfilePage = async ({ searchParams }: any) => {
  const tab = (await searchParams)?.tab;
  const queryClient = createServerQueryClient();
  await queryClient.prefetchQuery(userQueries.detail());

  return (
    <div className="p-4 sm:p-8">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AccountPage tab={tab} />
      </HydrationBoundary>
    </div>
  );
};

export default ProfilePage;
