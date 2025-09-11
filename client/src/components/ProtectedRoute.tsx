
'use client';

import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  requiredPermissions,
  requiredRoles,
  fallback
}: ProtectedRouteProps) {
  const { user, loading, isAuthorized } = useProtectedRoute({
    requiredPermissions,
    requiredRoles
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to access this page.</div>;
  }

  if (!isAuthorized) {
    return fallback || <div>You don't have permission to access this page.</div>;
  }

  return <>{children}</>;
}





