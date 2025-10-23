// components/search/smart-search.tsx - Debounced search with instant results
'use client';

import { useQuery } from '@tanstack/react-query';
import { coverLetterApi } from '@/lib/api/cover-letter.api';
import { queryKeys } from '@/lib/query/keys';
import { useState, useEffect } from 'react';

export function SmartSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Query updates automatically when debouncedSearch changes
  const { data, isLoading } = useQuery({
    queryKey: [...queryKeys.coverLetters.lists(), { search: debouncedSearch }],
    queryFn: () => coverLetterApi.getCoverLetters({ search: debouncedSearch }),
    enabled: debouncedSearch.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search cover letters..."
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {isLoading && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {debouncedSearch && (
        <div className="mt-4 bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {data?.data.length === 0 ? (
            <div className="p-4 text-gray-500 text-center">No results found</div>
          ) : (
            <ul>
              {data?.data.map((coverLetter) => (
                <li
                  key={coverLetter.id}
                  className="p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition"
                >
                  <h3 className="font-semibold">{coverLetter.title}</h3>
                  <p className="text-sm text-gray-600">
                    {coverLetter.company && `${coverLetter.company} - `}
                    {coverLetter.jobTitle}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}