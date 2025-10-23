// components/blogs/blog-detail.tsx - Client component with mutations
'use client';

import { useQuery } from '@tanstack/react-query';
import { blogQueries } from '@/lib/queries/blog.queries';
import { useUpdateBlogMutation, useDeleteBlogMutation, useTogglePublishBlogMutation } from '@/lib/mutations/blog.mutations';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface BlogDetailProps {
  id: string;
}

export function BlogDetail({ id }: BlogDetailProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', content: '' });

  // Data loads instantly from SSR cache
  const { data: blog } = useQuery(blogQueries.detail(id));

  // Mutations with optimistic updates
  const updateMutation = useUpdateBlogMutation();
  const deleteMutation = useDeleteBlogMutation();
  const togglePublishMutation = useTogglePublishBlogMutation();

  if (!blog) return null;

  const handleUpdate = async () => {
    await updateMutation.mutateAsync({
      id,
      data: editData,
    });
    setIsEditing(false);
    // UI updates instantly via optimistic update, no spinner needed
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(id);
    router.push('/blogs');
    // Optimistic update removes blog from lists instantly
  };

  const handleTogglePublish = async () => {
    await togglePublishMutation.mutateAsync(id);
    // Toggle happens instantly in UI before server confirms
  };

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <input
          type="text"
          value={editData.title || blog.title}
          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
          className="w-full text-3xl font-bold mb-4 p-2 border rounded"
        />
        <textarea
          value={editData.content || blog.content}
          onChange={(e) => setEditData({ ...editData, content: e.target.value })}
          className="w-full h-64 p-2 border rounded mb-4"
        />
        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            disabled={updateMutation.isPending}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-4xl font-bold">{blog.title}</h1>
        <div className="flex gap-2">
          <button
            onClick={handleTogglePublish}
            className={`px-4 py-2 rounded ${
              blog.published ? 'bg-yellow-500' : 'bg-green-500'
            } text-white hover:opacity-90`}
          >
            {blog.published ? 'Unpublish' : 'Publish'}
          </button>
          <button
            onClick={() => {
              setEditData({ title: blog.title, content: blog.content });
              setIsEditing(true);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="prose max-w-none">
        <p className="text-gray-600 mb-4">
          {new Date(blog.createdAt).toLocaleDateString()}
        </p>
        <div dangerouslySetInnerHTML={{ __html: blog.content }} />
      </div>

      {blog.tags && blog.tags.length > 0 && (
        <div className="mt-6 flex gap-2">
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-200 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}