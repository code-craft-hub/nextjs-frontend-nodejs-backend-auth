'use client';

import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showWhenAuthenticated?: boolean;
}

export default function AuthGuard({ 
  children, 
  fallback,
  showWhenAuthenticated = true 
}: AuthGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  const shouldShow = showWhenAuthenticated ? !!user : !user;

  if (!shouldShow) {
    return fallback || null;
  }

  return <>{children}</>;
}
