// components/dependent/user-documents.tsx - Dependent queries pattern
'use client';

import { useQuery } from '@tanstack/react-query';
import { authQueries } from '@/lib/queries/auth.queries';
import { coverLetterQueries } from '@/lib/queries/cover-letter.queries';
import { resumeQueries } from '@/lib/queries/resume.queries';

export function UserDocuments() {
  // First query: Get user profile
  const { data: profile, isLoading: isProfileLoading } = useQuery(authQueries.profile());

  // Dependent queries: Only run when we have user ID
  const { data: coverLetters } = useQuery({
    ...coverLetterQueries.all({}),
    enabled: !!profile?.id, // Only fetch when user is loaded
  });

  const { data: resumes } = useQuery({
    ...resumeQueries.all({}),
    enabled: !!profile?.id,
  });

  if (isProfileLoading) {
    return <div>Loading profile...</div>;
  }

  if (!profile) {
    return <div>Please log in to view your documents</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        {profile.name} Documents
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Cover Letters</h3>
          <p className="text-3xl font-bold text-blue-600">
            {coverLetters?.total || 0}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Resumes</h3>
          <p className="text-3xl font-bold text-green-600">
            {resumes?.total || 0}
          </p>
        </div>
      </div>
    </div>
  );
}