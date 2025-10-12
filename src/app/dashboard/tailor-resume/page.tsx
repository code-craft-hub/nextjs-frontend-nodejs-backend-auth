import React from 'react'
import { TailorResume } from './TailorResume'
import { getQueryClient } from '@/lib/query-client';
import { apiService } from '@/hooks/use-auth';
import { COLLECTIONS } from '@/lib/utils/constants';

const TailorResumePage =  async ({ searchParams }: any) => {
  const { jobDescription, documentId } = await searchParams;

  const queryClient = getQueryClient();

  queryClient.prefetchQuery({
    queryKey: ["auth", "careerDoc"],
    queryFn: () =>
      apiService.getCareerDoc(
        documentId,
        COLLECTIONS.RESUME
      ),
  });

  return (
    <div>
      <TailorResume jobDescription={jobDescription}
            documentId={documentId} />
    </div>
  )
}

export default TailorResumePage
