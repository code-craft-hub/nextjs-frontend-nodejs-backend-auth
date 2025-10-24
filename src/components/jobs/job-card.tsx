// components/jobs/job-card.tsx
'use client';

import type { Job } from '@/lib/types/jobs';
import { JobType } from '@/types';

interface JobCardProps {
  job: JobType extends Job ? JobType : Job;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onHover: (id: string) => void;
  viewMode: 'list' | 'grid';
}

export function JobCard({
  job,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onHover,
  // viewMode,
}: JobCardProps) {
  // const statusColors = {
  //   draft: 'bg-gray-100 text-gray-800',
  //   active: 'bg-green-100 text-green-800',
  //   closed: 'bg-red-100 text-red-800',
  //   archived: 'bg-yellow-100 text-yellow-800',
  // };

  return (
    <div
      onMouseEnter={() => onHover(job.id)}
      className={`bg-white rounded-lg border p-6 transition ${
        isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:shadow-lg'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(job.id)}
            className="mt-1 h-4 w-4 rounded border-gray-300"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
            <p className="text-gray-600 font-medium">{job.company}</p>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <span>{job?.location}</span>
              <span>•</span>
              <span className="capitalize">{job?.locationType}</span>
              <span>•</span>
              <span className="capitalize">{job?.employmentType?.replace('-', ' ')}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold }`}>
            {job.status}
          </span>
        </div>
      </div>

      <p className="text-gray-700 line-clamp-2 mb-4">{job?.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
            {job.experienceLevel}
          </span>
          {job.salary && (
            <span className="text-sm font-semibold text-gray-900">
              {job?.salary.currency} {job?.salary.min.toLocaleString()} - {job?.salary.max.toLocaleString()}
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(job)}
            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
          >
            Edit
          </button>
          <button
            onClick={() => onDuplicate(job.id)}
            className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded"
          >
            Duplicate
          </button>
          <button
            onClick={() => onDelete(job.id)}
            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
          >
            Delete
          </button>
        </div>
      </div>

      {job?.tags?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {job?.tags.slice(0, 5).map((tag: any) => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              {tag}
            </span>
          ))}
          {job?.tags?.length > 5 && (
            <span className="px-2 py-1 text-gray-500 text-xs">
              +{job.tags.length - 5} more
            </span>
          )}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        Posted {new Date(job?.postedAt).toLocaleDateString()} • Updated {new Date(job?.updatedAt).toLocaleDateString()}
      </div>
    </div>
  );
}