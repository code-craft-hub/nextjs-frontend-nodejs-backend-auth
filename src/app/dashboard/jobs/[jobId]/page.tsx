import { JobIdClient } from "./JobIdClient";
const JobIdPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ referrer: string }>;
}) => {
  const { jobId } = await params;
  const { referrer } = await searchParams;
  return <JobIdClient jobId={jobId} referrer={referrer} />;
};

export default JobIdPage;
