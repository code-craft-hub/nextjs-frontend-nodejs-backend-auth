// import Settings from "./Settings";
// import { createServerQueryClient } from "@/lib/query/prefetch";
// import { userQueries } from "@/lib/queries/user.queries";
// import { dehydrate } from "@tanstack/react-query";
// import { HydrationBoundary } from "@/components/hydration-boundary";

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ tab: string }>;
}) => {
  const { tab } = await searchParams;
  console.log("Settings page tab:", tab);
  // const queryClient = createServerQueryClient();

  //  await queryClient.prefetchQuery(
  //   userQueries.detail()
  // );

  // const dehydratedState = dehydrate(queryClient);

  return (
    <div className="p-4 sm:p-8">
        Settings Page
      {/* <HydrationBoundary state={dehydratedState}>
        <Settings tab={tab} />
      </HydrationBoundary> */}
    </div>
  );
};

export default page;
