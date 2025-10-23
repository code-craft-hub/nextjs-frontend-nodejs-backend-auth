// components/jobs/job-filters-panel.tsx
'use client';

import type { JobFilters } from '@/lib/types/jobs';
import { useState, useEffect } from 'react';

interface JobFiltersPanelProps {
  filters: JobFilters;
  filterOptions?: {
    companies: string[];
    locations: string[];
    departments: string[];
    tags: string[];
  };
  onFilterChange: (filters: Partial<JobFilters>) => void;
}

export function JobFiltersPanel({
  filters,
  filterOptions,
  onFilterChange,
}: JobFiltersPanelProps) {
  const [search, setSearch] = useState(filters.search || '');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== filters.search) {
        onFilterChange({ search: search || undefined });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filters.search, onFilterChange]);

  return (
    <div className="bg-white rounded-lg border p-4 sticky top-24">
      <h3 className="font-semibold text-lg mb-4">Filters</h3>

      {/* Search */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search jobs..."
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Status */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          value={filters.status || ''}
          onChange={(e) => onFilterChange({ status: e.target.value as any || undefined })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Location Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location Type
        </label>
        <select
          value={filters.locationType || ''}
          onChange={(e) => onFilterChange({ locationType: e.target.value as any || undefined })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">Onsite</option>
        </select>
      </div>

      {/* Employment Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Employment Type
        </label>
        <select
          value={filters.employmentType || ''}
          onChange={(e) => onFilterChange({ employmentType: e.target.value as any || undefined })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
        </select>
      </div>

      {/* Experience Level */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Experience Level
        </label>
        <select
          value={filters.experienceLevel || ''}
          onChange={(e) => onFilterChange({ experienceLevel: e.target.value as any || undefined })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="entry">Entry</option>
          <option value="mid">Mid</option>
          <option value="senior">Senior</option>
          <option value="lead">Lead</option>
          <option value="executive">Executive</option>
        </select>
      </div>

      {/* Company */}
      {filterOptions?.companies && filterOptions.companies.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company
          </label>
          <select
            value={filters.company || ''}
            onChange={(e) => onFilterChange({ company: e.target.value || undefined })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Companies</option>
            {filterOptions.companies.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Salary Range */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Min Salary
        </label>
        <input
          type="number"
          value={filters.salaryMin || ''}
          onChange={(e) => onFilterChange({ salaryMin: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="e.g., 50000"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Max Salary
        </label>
        <input
          type="number"
          value={filters.salaryMax || ''}
          onChange={(e) => onFilterChange({ salaryMax: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="e.g., 150000"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => {
          setSearch('');
          onFilterChange({
            search: undefined,
            status: undefined,
            locationType: undefined,
            employmentType: undefined,
            experienceLevel: undefined,
            company: undefined,
            salaryMin: undefined,
            salaryMax: undefined,
          });
        }}
        className="w-full px-4 py-2 text-sm text-gray-700 border rounded-lg hover:bg-gray-50"
      >
        Clear All Filters
      </button>
    </div>
  );
}