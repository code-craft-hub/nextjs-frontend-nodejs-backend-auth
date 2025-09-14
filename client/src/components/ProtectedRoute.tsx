"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { RouteProtection, Permission } from "../types/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  protection: RouteProtection;
  fallbackComponent?: ReactNode;
  loadingComponent?: ReactNode;
}

/**
 * Enterprise-grade Protected Route Component
 * Handles authentication and authorization with granular permission checking
 */
export function ProtectedRoute({
  children,
  protection,
  fallbackComponent,
  loadingComponent,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated, hasRole, hasPermission } =
    useAuth();

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  // Check authorization when auth state changes
  useEffect(() => {
    const checkAuthorization = () => {
      // Still loading auth state
      if (isLoading) {
        setIsAuthorized(null);
        return;
      }

      // Not authenticated but authentication required
      if (protection.requireAuth && !isAuthenticated) {
        setIsAuthorized(false);
        handleUnauthorizedAccess();
        return;
      }

      // Authentication not required
      if (!protection.requireAuth) {
        setIsAuthorized(true);
        return;
      }

      // User is authenticated, check roles and permissions
      if (isAuthenticated && user) {
        const hasRequiredRole = protection.requiredRoles
          ? protection.requiredRoles.some((role) => hasRole(role))
          : true;

        const hasRequiredPermissions = protection.requiredPermissions
          ? protection.requiredPermissions.every((perm) =>
              hasPermission(perm.resource, perm.action, perm.scope)
            )
          : true;

        const authorized = hasRequiredRole && hasRequiredPermissions;
        setIsAuthorized(authorized);

        if (!authorized) {
          handleUnauthorizedAccess();
        }
      } else {
        setIsAuthorized(false);
        handleUnauthorizedAccess();
      }
    };

    checkAuthorization();
  }, [user, isLoading, isAuthenticated, protection, hasRole, hasPermission]);

  const handleUnauthorizedAccess = () => {
    if (redirecting) return;

    setRedirecting(true);

    // Determine redirect URL
    const fallbackUrl = protection.fallbackUrl || "/auth/signin";
    const redirectUrl = !isAuthenticated
      ? `${fallbackUrl}?redirect=${encodeURIComponent(pathname)}`
      : "/unauthorized";

    // Add small delay to prevent flash
    setTimeout(() => {
      router.push(redirectUrl);
    }, 100);
  };

  // Show loading component while checking authorization
  if (isLoading || isAuthorized === null) {
    return (
      <>
        {loadingComponent || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </>
    );
  }

  // Show fallback component or redirect for unauthorized access
  if (!isAuthorized) {
    return (
      <>
        {fallbackComponent || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Access Denied
              </h2>
              <p className="text-gray-600 mb-4">
                You don't have permission to access this page.
              </p>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Go Back
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // User is authorized, render protected content
  return <>{children}</>;
}

/**
 * Higher-order component for route protection
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  protection: RouteProtection
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute protection={protection}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * Utility component for role-based content rendering
 */
interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
  requireAll?: boolean;
}

export function RoleGuard({
  children,
  allowedRoles,
  fallback = null,
  requireAll = false,
}: RoleGuardProps) {
  const { hasRole } = useAuth();

  const hasAccess = requireAll
    ? allowedRoles.every((role) => hasRole(role))
    : allowedRoles.some((role) => hasRole(role));

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

/**
 * Utility component for permission-based content rendering
 */
interface PermissionGuardProps {
  children: ReactNode;
  requiredPermissions: Array<{
    resource: string;
    action: Permission["action"];
    scope?: Permission["scope"];
  }>;
  fallback?: ReactNode;
  requireAll?: boolean;
}

export function PermissionGuard({
  children,
  requiredPermissions,
  fallback = null,
  requireAll = true,
}: PermissionGuardProps) {
  const { hasPermission } = useAuth();

  const hasAccess = requireAll
    ? requiredPermissions.every((perm) =>
        hasPermission(perm.resource, perm.action, perm.scope)
      )
    : requiredPermissions.some((perm) =>
        hasPermission(perm.resource, perm.action, perm.scope)
      );

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

/**
 * Combined guard for both roles and permissions
 */
interface AccessGuardProps {
  children: ReactNode;
  allowedRoles?: string[];
  requiredPermissions?: Array<{
    resource: string;
    action: Permission["action"];
    scope?: Permission["scope"];
  }>;
  fallback?: ReactNode;
  requireAllRoles?: boolean;
  requireAllPermissions?: boolean;
  operator?: "AND" | "OR"; // How to combine role and permission checks
}

export function AccessGuard({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  fallback = null,
  requireAllRoles = false,
  requireAllPermissions = true,
  operator = "AND",
}: AccessGuardProps) {
  const { hasRole, hasPermission } = useAuth();

  const roleAccess =
    allowedRoles.length === 0
      ? true
      : requireAllRoles
      ? allowedRoles.every((role) => hasRole(role))
      : allowedRoles.some((role) => hasRole(role));

  const permissionAccess =
    requiredPermissions.length === 0
      ? true
      : requireAllPermissions
      ? requiredPermissions.every((perm) =>
          hasPermission(perm.resource, perm.action, perm.scope)
        )
      : requiredPermissions.some((perm) =>
          hasPermission(perm.resource, perm.action, perm.scope)
        );

  const hasAccess =
    operator === "AND"
      ? roleAccess && permissionAccess
      : roleAccess || permissionAccess;

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
