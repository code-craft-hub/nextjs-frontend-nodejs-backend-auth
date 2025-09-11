import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from './usePermissions';

interface UseProtectedRouteOptions {
  redirectTo?: string;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  requireAuth?: boolean;
}

export function useProtectedRoute(options: UseProtectedRouteOptions = {}) {
  const {
    redirectTo = '/login',
    requiredPermissions = [],
    requiredRoles = [],
    requireAuth = true
  } = options;

  const { user, loading } = useAuth();
  const { hasAllPermissions, hasAnyRole } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Check authentication
    if (requireAuth && !user) {
      router.replace(redirectTo);
      return;
    }

    // Check permissions
    if (requiredPermissions.length > 0 && !hasAllPermissions(requiredPermissions)) {
      router.replace('/unauthorized');
      return;
    }

    // Check roles
    if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
      router.replace('/unauthorized');
      return;
    }
  }, [user, loading, hasAllPermissions, hasAnyRole, requiredPermissions, requiredRoles, requireAuth, redirectTo, router]);

  return {
    user,
    loading,
    isAuthorized: user && 
      (requiredPermissions.length === 0 || hasAllPermissions(requiredPermissions)) &&
      (requiredRoles.length === 0 || hasAnyRole(requiredRoles))
  };
}

