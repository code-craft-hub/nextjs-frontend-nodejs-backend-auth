// components/realtime/live-updates.tsx - Real-time updates with polling
'use client';

import { useQuery } from '@tanstack/react-query';
import { authQueries } from '@/lib/queries/auth.queries';
import { useState } from 'react';

export function LiveUserStatus() {
  const [isPollingEnabled, setIsPollingEnabled] = useState(true);

  // Query with automatic polling for real-time updates
  const { data: session, dataUpdatedAt } = useQuery({
    ...authQueries.session(),
    refetchInterval: isPollingEnabled ? 30000 : false, // Poll every 30 seconds
    refetchIntervalInBackground: true, // Continue polling in background
  });

  return (
    <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Session Status</h3>
        <button
          onClick={() => setIsPollingEnabled(!isPollingEnabled)}
          className={`px-2 py-1 text-xs rounded ${
            isPollingEnabled
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {isPollingEnabled ? 'Live' : 'Paused'}
        </button>
      </div>

      {session && (
        <div className="space-y-2">
          <p className="text-sm">
          </p>
          <p className="text-sm">
            <span className="font-medium">Expires:</span>{' '}
            {new Date(session.expiresAt).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            Last updated: {new Date(dataUpdatedAt).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}