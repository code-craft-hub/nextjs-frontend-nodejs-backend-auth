// components/jobs/jobs-manager.tsx - Enterprise-grade jobs management
'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { jobsQueries } from '@/lib/queries/jobs.queries';
import {
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
  useBulkDeleteJobsMutation,
  useBulkChangeStatusMutation,
  useDuplicateJobMutation,
} from '@/lib/mutations/jobs.mutations';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Job, JobFilters } from '@/lib/types/jobs';
import { JobCard } from './job-card';
import { JobForm } from './job-form';
import { JobStats } from './job-stats';

interface JobsManagerProps {
  initialFilters: JobFilters;
}

export function JobsManager({ initialFilters }: JobsManagerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // State
  const [filters, setFilters] = useState<JobFilters>(initialFilters);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Queries - all instantly load from SSR cache
  const { data: jobs, isLoading } = useQuery(jobsQueries.all(filters));
  const { data: stats } = useQuery(jobsQueries.stats());
  // const { data: filterOptions } = useQuery(jobsQueries.filters());

  // Mutations
  const createMutation = useCreateJobMutation();
  const updateMutation = useUpdateJobMutation();
  const deleteMutation = useDeleteJobMutation();
  const bulkDeleteMutation = useBulkDeleteJobsMutation();
  const bulkStatusMutation = useBulkChangeStatusMutation();
  const duplicateMutation = useDuplicateJobMutation();

  // Update URL when filters change (FAANG pattern)
  const updateFiltersInUrl = useCallback((newFilters: JobFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });
    router.push(`/jobs?${params.toString()}`, { scroll: false });
  }, [router]);

  // const handleFilterChange = useCallback((newFilters: Partial<JobFilters>) => {
  //   const updated = { ...filters, ...newFilters, page: 1 };
  //   setFilters(updated);
  //   updateFiltersInUrl(updated);
  // }, [filters, updateFiltersInUrl]);

  const handlePageChange = useCallback((page: number) => {
    const updated = { ...filters, page };
    setFilters(updated);
    updateFiltersInUrl(updated);
  }, [filters, updateFiltersInUrl]);

  // Selection handlers
  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedJobs);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedJobs(newSelection);
  };

  const selectAll = () => {
    if (jobs?.data) {
      // setSelectedJobs(new Set(jobs.data.map(j => j.id)));
    }
  };

  const clearSelection = () => setSelectedJobs(new Set());

  // CRUD operations
  const handleCreate = async (data: any) => {
    await createMutation.mutateAsync(data);
    setIsFormOpen(false);
  };

  const handleUpdate = async (data: any) => {
    if (editingJob) {
      await updateMutation.mutateAsync({ id: editingJob.id, data });
      setEditingJob(null);
      setIsFormOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this job?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Delete ${selectedJobs.size} jobs?`)) {
      await bulkDeleteMutation.mutateAsync(Array.from(selectedJobs));
      clearSelection();
    }
  };

  const handleBulkStatusChange = async (status: Job['status']) => {
    await bulkStatusMutation.mutateAsync({
      ids: Array.from(selectedJobs),
      status,
    });
    clearSelection();
  };

  const handleDuplicate = async (id: string) => {
    await duplicateMutation.mutateAsync(id);
  };

  const startEdit = (job: Job) => {
    setEditingJob(job);
    setIsFormOpen(true);
  };

  // Prefetch on hover (FAANG optimization)
  const prefetchJob = useCallback((id: string) => {
    queryClient.prefetchQuery(jobsQueries.detail(id));
    // queryClient.prefetchQuery(jobsQueries.similar(id));
  }, [queryClient]);

  const allSelected = jobs?.data && selectedJobs.size === jobs.data.length;
  const someSelected = selectedJobs.size > 0 && !allSelected;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
              <p className="text-sm text-gray-500 mt-1">
                {jobs?.total || 0} total jobs
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded ${
                    viewMode === 'list' ? 'bg-white shadow' : ''
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded ${
                    viewMode === 'grid' ? 'bg-white shadow' : ''
                  }`}
                >
                  Grid
                </button>
              </div>

              <button
                onClick={() => {
                  setEditingJob(null);
                  setIsFormOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                + New Job
              </button>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedJobs.size > 0 && (
            <div className="mt-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
              <span className="text-sm font-medium text-blue-900">
                {selectedJobs.size} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkStatusChange('active')}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Mark Active
                </button>
                <button
                  onClick={() => handleBulkStatusChange('closed')}
                  className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Mark Closed
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleteMutation.isPending}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Dashboard */}
        {stats && <JobStats stats={stats} />}

        <div className="mt-8 flex gap-6">
          {/* Filters Sidebar *
          <aside className="w-64 flex-shrink-0">
            <JobFiltersPanel
              filters={filters}
              filterOptions={filterOptions}
              onFilterChange={handleFilterChange}
            />
          </aside>/}

          {/* Jobs List/Grid */}
          <main className="flex-1">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
              </div>
            ) : jobs?.data.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500">No jobs found</p>
                <button
                  onClick={() => setFilters({})}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                {/* Select All Checkbox */}
                <div className="mb-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={(e) => {
                      if (e.target.checked) {
                        selectAll();
                      } else {
                        clearSelection();
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label className="text-sm text-gray-700">
                    Select all on this page
                  </label>
                </div>

                {/* Jobs Display */}
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
                      : 'space-y-4'
                  }
                >
                  {jobs?.data.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job as any}
                      isSelected={selectedJobs.has(job.id as any)}
                      onSelect={toggleSelection}
                      onEdit={startEdit}
                      onDelete={handleDelete}
                      onDuplicate={handleDuplicate}
                      onHover={prefetchJob}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {jobs && jobs.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between">
                    <button
                      onClick={() => handlePageChange(filters.page! - 1)}
                      disabled={filters.page === 1}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(jobs.totalPages, 7) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded ${
                              filters.page === page
                                ? 'bg-blue-600 text-white'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => handlePageChange(filters.page! + 1)}
                      disabled={filters.page === jobs.totalPages}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Job Form Modal */}
      {isFormOpen && (
        <JobForm
          job={editingJob}
          onSubmit={editingJob ? handleUpdate : handleCreate}
          onClose={() => {
            setIsFormOpen(false);
            setEditingJob(null);
          }}
          isPending={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}