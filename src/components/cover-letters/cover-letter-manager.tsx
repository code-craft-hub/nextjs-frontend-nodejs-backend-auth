// components/cover-letters/cover-letter-manager.tsx - Complete CRUD with all features
'use client';

import { useQuery } from '@tanstack/react-query';
import { coverLetterQueries } from '@/lib/queries/cover-letter.queries';
import {
  useCreateCoverLetterMutation,
  useUpdateCoverLetterMutation,
  useDeleteCoverLetterMutation,
  useDuplicateCoverLetterMutation,
} from '@/lib/mutations/cover-letter.mutations';
import { useState } from 'react';

export function CoverLetterManager() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    company: '',
    jobTitle: '',
  });

  // Query with pagination and search
  const { data, isLoading } = useQuery(
    coverLetterQueries.all({ page, limit: 10, search })
  );

  // Mutations
  const createMutation = useCreateCoverLetterMutation();
  const updateMutation = useUpdateCoverLetterMutation();
  const deleteMutation = useDeleteCoverLetterMutation();
  const duplicateMutation = useDuplicateCoverLetterMutation();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(formData);
    setFormData({ title: '', content: '', company: '', jobTitle: '' });
    // List updates instantly via optimistic update
  };

  const handleUpdate = async (id: string) => {
    await updateMutation.mutateAsync({ id, data: formData });
    setEditingId(null);
    setFormData({ title: '', content: '', company: '', jobTitle: '' });
    // Updates appear instantly
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this cover letter?')) {
      await deleteMutation.mutateAsync(id);
      // Item disappears instantly from list
    }
  };

  const handleDuplicate = async (id: string) => {
    await duplicateMutation.mutateAsync(id);
    // Duplicate appears instantly in list
  };

  const startEdit = (coverLetter: any) => {
    setEditingId(coverLetter.id);
    setFormData({
      title: coverLetter.title,
      content: coverLetter.content,
      company: coverLetter.company || '',
      jobTitle: coverLetter.jobTitle || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', content: '', company: '', jobTitle: '' });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Cover Letters</h1>
        <div className="text-sm text-gray-600">
          {data?.total || 0} total
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search cover letters..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // Reset to first page on search
          }}
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Edit Cover Letter' : 'New Cover Letter'}
            </h2>
            <form onSubmit={editingId ? (e) => { e.preventDefault(); handleUpdate(editingId); } : handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Job Title</label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={8}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right: List */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : data?.data.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {search ? 'No cover letters found' : 'No cover letters yet. Create your first one!'}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {data?.data.map((coverLetter: any) => (
                  <div
                    key={coverLetter.id}
                    className={`bg-white rounded-lg shadow p-6 transition ${
                      editingId === coverLetter.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold">{coverLetter.title}</h3>
                        {(coverLetter.company || coverLetter.jobTitle) && (
                          <p className="text-sm text-gray-600 mt-1">
                            {coverLetter.jobTitle}
                            {coverLetter.company && ` at ${coverLetter.company}`}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(coverLetter)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDuplicate(coverLetter.id)}
                          disabled={duplicateMutation.isPending}
                          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Duplicate
                        </button>
                        <button
                          onClick={() => handleDelete(coverLetter.id)}
                          disabled={deleteMutation.isPending}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-700 line-clamp-3">{coverLetter.content}</p>

                    <div className="mt-3 text-xs text-gray-500">
                      Last updated: {new Date(coverLetter.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {page} of {data.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                    disabled={page === data.totalPages}
                    className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}