// components/resume/resume-editor.tsx - Editor with auto-save
'use client';

import { useQuery } from '@tanstack/react-query';
import { resumeQueries } from '@/lib/queries/resume.queries';
import { useUpdateResumeMutation } from '@/lib/mutations/resume.mutations';
import { useState, useEffect, useCallback } from 'react';
import { debounce } from '@/lib/utils/debounce';

interface ResumeEditorProps {
  id: string;
}

export function ResumeEditor({ id }: ResumeEditorProps) {
  const { data: resume } = useQuery(resumeQueries.detail(id));
  const updateMutation = useUpdateResumeMutation();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState<any>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Initialize state from query data
  useEffect(() => {
    if (resume) {
      setTitle(resume.title);
      setContent(resume.content);
    }
  }, [resume]);

  // Debounced auto-save function
  const autoSave = useCallback(
    debounce(async (newTitle: string, newContent: any) => {
      await updateMutation.mutateAsync({
        id,
        data: { title: newTitle, content: newContent },
      });
      setLastSaved(new Date());
    }, 1000),
    [id, updateMutation]
  );

  // Trigger auto-save on changes
  useEffect(() => {
    if (resume && (title !== resume.title || JSON.stringify(content) !== JSON.stringify(resume.content))) {
      autoSave(title, content);
    }
  }, [title, content, resume, autoSave]);

  if (!resume) return null;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header with save status */}
      <div className="flex items-center justify-between mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-3xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
          placeholder="Resume Title"
        />
        <div className="flex items-center gap-4">
          {updateMutation.isPending && (
            <span className="text-sm text-gray-500 flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
              Saving...
            </span>
          )}
          {lastSaved && !updateMutation.isPending && (
            <span className="text-sm text-green-600">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={content.name || ''}
                onChange={(e) => setContent({ ...content, name: e.target.value })}
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={content.email || ''}
                onChange={(e) => setContent({ ...content, email: e.target.value })}
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={content.phone || ''}
                onChange={(e) => setContent({ ...content, phone: e.target.value })}
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Professional Summary</h3>
            <textarea
              placeholder="Write your professional summary..."
              value={content.summary || ''}
              onChange={(e) => setContent({ ...content, summary: e.target.value })}
              rows={5}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Skills</h3>
            <input
              type="text"
              placeholder="Add skills (comma separated)"
              value={content.skills?.join(', ') || ''}
              onChange={(e) =>
                setContent({
                  ...content,
                  skills: e.target.value.split(',').map((s) => s.trim()),
                })
              }
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="bg-white rounded-lg shadow p-8 sticky top-6">
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold mb-2">{content.name || 'Your Name'}</h1>
            <p className="text-gray-600 mb-4">
              {content.email || 'email@example.com'} | {content.phone || '(123) 456-7890'}
            </p>

            {content.summary && (
              <>
                <h2 className="text-xl font-semibold mt-6 mb-2">Professional Summary</h2>
                <p className="text-gray-700">{content.summary}</p>
              </>
            )}

            {content.skills && content.skills.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mt-6 mb-2">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {content.skills.map((skill: string, index: number) => (
                    skill && (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    )
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}