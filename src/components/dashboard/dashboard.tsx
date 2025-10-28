
'use client';

import { useQuery } from '@tanstack/react-query';
import { authQueries } from '@/lib/queries/auth.queries';
import { coverLetterQueries } from '@/lib/queries/cover-letter.queries';
import { resumeQueries } from '@/lib/queries/resume.queries';
import { interviewQuestionQueries } from '@/lib/queries/interview.queries';
import { useCreateCoverLetterMutation } from '@/lib/mutations/cover-letter.mutations';
import { useCreateResumeMutation } from '@/lib/mutations/resume.mutations';

export function Dashboard() {
  // All queries load instantly from SSR cache
  const { data: profile } = useQuery(authQueries.profile());
  const { data: coverLetters } = useQuery(coverLetterQueries.all({ limit: 5 }));
  const { data: resumes } = useQuery(resumeQueries.all({ limit: 5 }));
  const { data: questions } = useQuery(interviewQuestionQueries.all({ limit: 10 }));

  // Mutations for quick actions
  const createCoverLetter = useCreateCoverLetterMutation();
  const createResume = useCreateResumeMutation();

  const handleQuickCoverLetter = async () => {
    await createCoverLetter.mutateAsync({
      title: 'New Cover Letter',
      content: '',
    });
    // Optimistic update shows new cover letter instantly
  };

  const handleQuickResume = async () => {
    await createResume.mutateAsync({
      title: 'New Resume',
      content: {},
    });
    // Optimistic update shows new resume instantly
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {profile?.name}!</h1>
        <p className="text-gray-600">{profile?.email}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={handleQuickCoverLetter}
          disabled={createCoverLetter.isPending}
          className="p-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          <h3 className="text-xl font-semibold mb-2">Create Cover Letter</h3>
          <p>Start a new cover letter</p>
        </button>
        <button
          onClick={handleQuickResume}
          disabled={createResume.isPending}
          className="p-6 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          <h3 className="text-xl font-semibold mb-2">Create Resume</h3>
          <p>Build your resume</p>
        </button>
      </div>

      {/* Recent Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cover Letters */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Cover Letters</h2>
          {coverLetters?.data.length === 0 ? (
            <p className="text-gray-500">No cover letters yet</p>
          ) : (
            <ul className="space-y-2">
              {coverLetters?.data.map((cl: any) => (
                <li
                  key={cl.id}
                  className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
                >
                  <h3 className="font-semibold">{cl.title}</h3>
                  <p className="text-sm text-gray-600">
                    {cl.company && `${cl.company} - `}
                    {new Date(cl.updatedAt).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Resumes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Resumes</h2>
          {resumes?.data.length === 0 ? (
            <p className="text-gray-500">No resumes yet</p>
          ) : (
            <ul className="space-y-2">
              {resumes?.data.map((resume:any) => (
                <li
                  key={resume.id}
                  className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
                >
                  <h3 className="font-semibold">{resume.title}</h3>
                  <p className="text-sm text-gray-600">
                    {resume.template && `${resume.template} - `}
                    {new Date(resume.updatedAt).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Interview Prep Section */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Practice Questions</h2>
        {questions?.data.length === 0 ? (
          <p className="text-gray-500">No questions available</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions?.data.slice(0, 4).map((q) => (
              <div
                key={q.id}
                className="p-4 border rounded hover:border-blue-500 cursor-pointer transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase text-gray-600">
                    {q.category}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      q.difficulty === 'easy'
                        ? 'bg-green-100 text-green-800'
                        : q.difficulty === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {q.difficulty}
                  </span>
                </div>
                <p className="font-medium">{q.question}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}