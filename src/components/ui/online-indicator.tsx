// components/ui/online-indicator.tsx - Show online/offline status
'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';

export function OnlineIndicator() {
  const isOnline = useOnlineStatus();
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 right-4 px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg flex items-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full" />
        <span className="text-sm font-medium">Offline</span>
      </div>
    );
  }

  if (isFetching > 0 || isMutating > 0) {
    return (
      <div className="fixed bottom-4 right-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg flex items-center gap-2">
        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
        <span className="text-sm font-medium">
          {isMutating > 0 ? 'Saving...' : 'Loading...'}
        </span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
      <div className="w-2 h-2 bg-white rounded-full" />
      <span className="text-sm font-medium">Online</span>
    </div>
  );
}