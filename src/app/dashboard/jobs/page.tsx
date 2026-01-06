import { createServerQueryClient } from "@/lib/query/prefetch";
import { userQueries } from "@/lib/queries/user.queries";
import Overview from "./components/Overview";
import { getCookiesToken } from "@/lib/auth.utils";
import { formatFirestoreDate } from "@/lib/utils/helpers";

const JobListingsPage = async () => {
  const token = (await getCookiesToken()) ?? "";
  const queryClient = createServerQueryClient();
  const user = await queryClient.fetchQuery(userQueries.detail(token));
  const isCreditExpired =
    new Date(formatFirestoreDate(user?.expiryTime)) < new Date();
  return (
    <div className="p-4 sm:p-8">
      <Overview isCreditExpired={isCreditExpired} />
    </div>
  );
};

export default JobListingsPage;
